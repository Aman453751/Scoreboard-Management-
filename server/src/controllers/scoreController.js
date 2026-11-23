const prisma = require('../prisma');
const { recalculateTournamentLeaderboard } = require('../services/leaderboardService');

// Helper to check if user has permission to score this match
const canUserScore = (match, user) => {
  if (user.role === 'ADMIN') return true;
  if (user.role === 'SCORER' && match.scorerId === user.id) return true;
  return false;
};

const getMatchScore = async (req, res, next) => {
  try {
    const { id } = req.params;
    const matchId = parseInt(id, 10);

    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        teamA: true,
        teamB: true,
        score: true,
        matchEvents: {
          orderBy: { createdAt: 'desc' },
          take: 30
        }
      }
    });

    if (!match) {
      return res.status(404).json({ success: false, message: 'Match not found.' });
    }

    return res.status(200).json({
      success: true,
      data: {
        match,
        score: match.score,
        events: match.matchEvents
      }
    });
  } catch (error) {
    next(error);
  }
};

const updateScore = async (req, res, next) => {
  try {
    const { id } = req.params;
    const matchId = parseInt(id, 10);

    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        score: true,
        teamA: true,
        teamB: true
      }
    });

    if (!match) {
      return res.status(404).json({ success: false, message: 'Match not found.' });
    }

    if (!canUserScore(match, req.user)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to score this match.'
      });
    }

    let score = match.score;
    if (!score) {
      score = await prisma.score.create({
        data: { matchId }
      });
    }

    // Save snapshot before modification for foolproof UNDO
    const snapshotBefore = JSON.stringify(score);

    const {
      sportType,
      // Cricket specific
      runs = 0,
      isWicket = false,
      extraType = 'NONE', // NONE, WIDE, NO_BALL, BYE, LEG_BYE
      extraRuns = 0,
      battingTeamId,
      currentInning,
      targetRuns,
      // Football specific
      action, // GOAL, CARD_YELLOW, CARD_RED, TIMER, HALF_CHANGE
      teamTarget, // 'A' or 'B'
      matchMinutes,
      currentHalf,
      // Basketball specific
      points = 0,
      isFoul = false,
      currentQuarter,
      quarterTimeLeft,
      // General
      description,
      customEvent
    } = req.body;

    let eventType = 'SCORE_UPDATE';
    let eventDescription = description || 'Score updated';
    let teamInEvent = null;
    let scoreUpdateData = {};

    const sport = match.sportType;

    if (sport === 'CRICKET') {
      const isTeamABatting = (score.battingTeamId || match.teamAId) === match.teamAId;
      teamInEvent = isTeamABatting ? match.teamAId : match.teamBId;
      const battingTeamName = isTeamABatting ? match.teamA.name : match.teamB.name;

      let runsScored = parseInt(runs, 10) || 0;
      let extraCount = parseInt(extraRuns, 10) || 0;
      let legalBall = true;

      if (extraType === 'WIDE' || extraType === 'NO_BALL') {
        legalBall = false;
        extraCount = Math.max(1, extraCount);
      }

      const totalRunsThisBall = runsScored + extraCount;

      let newARuns = score.teamARuns;
      let newAWickets = score.teamAWickets;
      let newABalls = score.teamABalls;
      let newAExtras = score.teamAExtras;

      let newBRuns = score.teamBRuns;
      let newBWickets = score.teamBWickets;
      let newBBalls = score.teamBBalls;
      let newBExtras = score.teamBExtras;

      if (isTeamABatting) {
        newARuns += totalRunsThisBall;
        newAExtras += extraCount;
        if (legalBall) newABalls += 1;
        if (isWicket) newAWickets = Math.min(10, newAWickets + 1);
      } else {
        newBRuns += totalRunsThisBall;
        newBExtras += extraCount;
        if (legalBall) newBBalls += 1;
        if (isWicket) newBWickets = Math.min(10, newBWickets + 1);
      }

      // Formatting ball count as overs.balls
      const ballsBowled = isTeamABatting ? newABalls : newBBalls;
      const oversText = `${Math.floor(ballsBowled / 6)}.${ballsBowled % 6}`;

      // Construct description if not provided
      if (!description) {
        if (isWicket) {
          eventDescription = `WICKET! ${battingTeamName} lost a wicket (${oversText} ov). Total: ${isTeamABatting ? newARuns : newBRuns}/${isTeamABatting ? newAWickets : newBWickets}`;
          eventType = 'WICKET';
        } else if (extraType !== 'NONE') {
          eventDescription = `EXTRA (${extraType}) +${totalRunsThisBall} runs for ${battingTeamName}`;
          eventType = 'EXTRA';
        } else if (runsScored === 4) {
          eventDescription = `FOUR! Boundary scored by ${battingTeamName} (${oversText} ov)`;
          eventType = 'RUN';
        } else if (runsScored === 6) {
          eventDescription = `SIX! Huge maximum for ${battingTeamName}! (${oversText} ov)`;
          eventType = 'RUN';
        } else {
          eventDescription = `${runsScored} run(s) scored by ${battingTeamName} (${oversText} ov)`;
          eventType = 'RUN';
        }
      }

      scoreUpdateData = {
        teamARuns: newARuns,
        teamAWickets: newAWickets,
        teamABalls: newABalls,
        teamAExtras: newAExtras,
        teamBRuns: newBRuns,
        teamBWickets: newBWickets,
        teamBBalls: newBBalls,
        teamBExtras: newBExtras,
        ...(battingTeamId && {
          battingTeamId: parseInt(battingTeamId, 10),
          bowlingTeamId: parseInt(battingTeamId, 10) === match.teamAId ? match.teamBId : match.teamAId
        }),
        ...(currentInning && { currentInning: parseInt(currentInning, 10) }),
        ...(targetRuns !== undefined && { targetRuns: targetRuns ? parseInt(targetRuns, 10) : null }),
        lastEventDescription: eventDescription
      };

    } else if (sport === 'FOOTBALL') {
      let newAGoals = score.teamAGoals;
      let newBGoals = score.teamBGoals;
      let currentMin = matchMinutes !== undefined ? parseInt(matchMinutes, 10) : score.matchMinutes;
      let half = currentHalf || score.currentHalf || '1st Half';

      if (action === 'GOAL') {
        eventType = 'GOAL';
        if (teamTarget === 'A') {
          newAGoals += 1;
          teamInEvent = match.teamAId;
          eventDescription = description || `GOAL! ${match.teamA.name} scores in the ${currentMin}' minute!`;
        } else {
          newBGoals += 1;
          teamInEvent = match.teamBId;
          eventDescription = description || `GOAL! ${match.teamB.name} scores in the ${currentMin}' minute!`;
        }
      } else if (action === 'CARD_YELLOW') {
        eventType = 'CARD_YELLOW';
        teamInEvent = teamTarget === 'A' ? match.teamAId : match.teamBId;
        eventDescription = description || `Yellow Card shown to ${teamTarget === 'A' ? match.teamA.name : match.teamB.name} player (${currentMin}').`;
      } else if (action === 'CARD_RED') {
        eventType = 'CARD_RED';
        teamInEvent = teamTarget === 'A' ? match.teamAId : match.teamBId;
        eventDescription = description || `RED CARD! Sent off from ${teamTarget === 'A' ? match.teamA.name : match.teamB.name} (${currentMin}').`;
      } else if (action === 'TIMER') {
        eventType = 'TIMER_UPDATE';
        eventDescription = `Match clock updated to ${currentMin}' (${half})`;
      } else if (action === 'HALF_CHANGE') {
        eventType = 'PERIOD_CHANGE';
        eventDescription = `Match period updated to ${half}`;
      }

      scoreUpdateData = {
        teamAGoals: newAGoals,
        teamBGoals: newBGoals,
        matchMinutes: currentMin,
        currentHalf: half,
        lastEventDescription: eventDescription
      };

    } else if (sport === 'BASKETBALL') {
      let newAPoints = score.teamAPoints;
      let newBPoints = score.teamBPoints;
      let newAFouls = score.teamAFouls;
      let newBFouls = score.teamBFouls;
      let quarter = currentQuarter || score.currentQuarter || 'Q1';
      let timeLeft = quarterTimeLeft || score.quarterTimeLeft || '10:00';

      const pts = parseInt(points, 10) || 0;

      if (pts > 0) {
        eventType = `POINT_${pts}`;
        if (teamTarget === 'A') {
          newAPoints += pts;
          teamInEvent = match.teamAId;
          eventDescription = description || `+${pts} Points for ${match.teamA.name}! (${quarter} - ${timeLeft})`;
        } else {
          newBPoints += pts;
          teamInEvent = match.teamBId;
          eventDescription = description || `+${pts} Points for ${match.teamB.name}! (${quarter} - ${timeLeft})`;
        }
      } else if (isFoul) {
        eventType = 'FOUL';
        if (teamTarget === 'A') {
          newAFouls += 1;
          teamInEvent = match.teamAId;
          eventDescription = description || `Team foul on ${match.teamA.name} (${quarter} - ${timeLeft})`;
        } else {
          newBFouls += 1;
          teamInEvent = match.teamBId;
          eventDescription = description || `Team foul on ${match.teamB.name} (${quarter} - ${timeLeft})`;
        }
      } else if (action === 'QUARTER_CHANGE') {
        eventType = 'PERIOD_CHANGE';
        eventDescription = `Quarter changed to ${quarter}`;
      }

      scoreUpdateData = {
        teamAPoints: newAPoints,
        teamBPoints: newBPoints,
        teamAFouls: newAFouls,
        teamBFouls: newBFouls,
        currentQuarter: quarter,
        quarterTimeLeft: timeLeft,
        lastEventDescription: eventDescription
      };
    }

    // Direct overrides if provided
    if (req.body.override) {
      scoreUpdateData = {
        ...scoreUpdateData,
        ...req.body.override
      };
      eventDescription = description || 'Score manually adjusted';
      eventType = 'SCORE_OVERRIDE';
    }

    // Update Score record
    const updatedScore = await prisma.score.update({
      where: { matchId },
      data: scoreUpdateData
    });

    // Create MatchEvent with pre-modification snapshot
    const newEvent = await prisma.matchEvent.create({
      data: {
        matchId,
        period: match.currentPeriod,
        eventType: customEvent || eventType,
        teamId: teamInEvent,
        description: eventDescription,
        scoreSnapshot: snapshotBefore
      }
    });

    // Update match currentPeriod or auto-status if needed
    if (sport === 'FOOTBALL' && scoreUpdateData.currentHalf) {
      await prisma.match.update({
        where: { id: matchId },
        data: { currentPeriod: scoreUpdateData.currentHalf }
      });
    } else if (sport === 'BASKETBALL' && scoreUpdateData.currentQuarter) {
      await prisma.match.update({
        where: { id: matchId },
        data: { currentPeriod: scoreUpdateData.currentQuarter }
      });
    } else if (sport === 'CRICKET' && scoreUpdateData.currentInning) {
      await prisma.match.update({
        where: { id: matchId },
        data: { currentPeriod: `${scoreUpdateData.currentInning}${scoreUpdateData.currentInning === 1 ? 'st' : 'nd'} Inning` }
      });
    }

    // Broadcast to Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.to(`match_${matchId}`).emit('score_updated', {
        matchId,
        score: updatedScore,
        event: newEvent
      });

      io.emit('global_score_update', {
        matchId,
        score: updatedScore,
        lastEvent: eventDescription
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Score updated successfully.',
      data: {
        score: updatedScore,
        event: newEvent
      }
    });
  } catch (error) {
    next(error);
  }
};

const undoLastEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const matchId = parseInt(id, 10);

    const match = await prisma.match.findUnique({
      where: { id: matchId }
    });

    if (!match) {
      return res.status(404).json({ success: false, message: 'Match not found.' });
    }

    if (!canUserScore(match, req.user)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to undo score for this match.'
      });
    }

    // Find latest event for this match
    const latestEvent = await prisma.matchEvent.findFirst({
      where: { matchId },
      orderBy: { createdAt: 'desc' }
    });

    if (!latestEvent) {
      return res.status(400).json({
        success: false,
        message: 'No score events available to undo.'
      });
    }

    // Restore score from snapshot
    let snapshotData;
    try {
      snapshotData = JSON.parse(latestEvent.scoreSnapshot);
    } catch (e) {
      return res.status(500).json({ success: false, message: 'Corrupted event snapshot.' });
    }

    // Strip unmodifiable/auto fields
    const { id: sId, matchId: mId, updatedAt, ...cleanScoreData } = snapshotData;

    cleanScoreData.lastEventDescription = `Undone: ${latestEvent.description}`;

    const restoredScore = await prisma.score.update({
      where: { matchId },
      data: cleanScoreData
    });

    // Delete the undone event
    await prisma.matchEvent.delete({
      where: { id: latestEvent.id }
    });

    // Broadcast undo via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.to(`match_${matchId}`).emit('score_updated', {
        matchId,
        score: restoredScore,
        event: {
          id: latestEvent.id,
          undone: true,
          description: `Action undone: ${latestEvent.description}`
        }
      });

      io.to(`match_${matchId}`).emit('event_deleted', {
        eventId: latestEvent.id
      });

      io.emit('global_score_update', {
        matchId,
        score: restoredScore,
        lastEvent: `Undone: ${latestEvent.description}`
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Last action successfully undone.',
      data: {
        score: restoredScore,
        undoneEventId: latestEvent.id
      }
    });
  } catch (error) {
    next(error);
  }
};

const getMatchEvents = async (req, res, next) => {
  try {
    const { id } = req.params;
    const matchId = parseInt(id, 10);

    const events = await prisma.matchEvent.findMany({
      where: { matchId },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    return res.status(200).json({
      success: true,
      data: { events }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMatchScore,
  updateScore,
  undoLastEvent,
  getMatchEvents
};
