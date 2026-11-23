const prisma = require('../prisma');
const { recalculateTournamentLeaderboard } = require('../services/leaderboardService');

const getAllMatches = async (req, res, next) => {
  try {
    const { tournamentId, status, sportType, teamId, scorerId, search } = req.query;

    const where = {};
    if (tournamentId) {
      where.tournamentId = parseInt(tournamentId, 10);
    }
    if (status && status !== 'ALL') {
      where.status = status;
    }
    if (sportType && sportType !== 'ALL') {
      where.sportType = sportType;
    }
    if (scorerId) {
      where.scorerId = parseInt(scorerId, 10);
    }
    if (teamId) {
      const tid = parseInt(teamId, 10);
      where.OR = [{ teamAId: tid }, { teamBId: tid }];
    }
    if (search) {
      where.OR = [
        { venue: { contains: search } },
        { teamA: { name: { contains: search } } },
        { teamB: { name: { contains: search } } },
        { tournament: { name: { contains: search } } }
      ];
    }

    const matches = await prisma.match.findMany({
      where,
      include: {
        tournament: {
          select: { id: true, name: true, sportType: true, status: true }
        },
        teamA: true,
        teamB: true,
        scorer: {
          select: { id: true, name: true, email: true }
        },
        score: true
      },
      orderBy: [
        { status: 'asc' }, // LIVE, UPCOMING, COMPLETED etc
        { matchDate: 'desc' }
      ]
    });

    return res.status(200).json({
      success: true,
      data: { matches }
    });
  } catch (error) {
    next(error);
  }
};

const getMatchById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const matchId = parseInt(id, 10);

    if (isNaN(matchId)) {
      return res.status(400).json({ success: false, message: 'Invalid match ID.' });
    }

    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        tournament: true,
        teamA: {
          include: {
            players: {
              orderBy: [{ isCaptain: 'desc' }, { jerseyNumber: 'asc' }]
            }
          }
        },
        teamB: {
          include: {
            players: {
              orderBy: [{ isCaptain: 'desc' }, { jerseyNumber: 'asc' }]
            }
          }
        },
        scorer: {
          select: { id: true, name: true, email: true, phone: true }
        },
        score: true,
        matchEvents: {
          orderBy: { createdAt: 'desc' },
          take: 50
        }
      }
    });

    if (!match) {
      return res.status(404).json({ success: false, message: 'Match not found.' });
    }

    return res.status(200).json({
      success: true,
      data: { match }
    });
  } catch (error) {
    next(error);
  }
};

const createMatch = async (req, res, next) => {
  try {
    const {
      tournamentId,
      teamAId,
      teamBId,
      sportType,
      matchDate,
      venue,
      scorerId,
      status
    } = req.body;

    if (!tournamentId || !teamAId || !teamBId || !sportType || !matchDate || !venue) {
      return res.status(400).json({
        success: false,
        message: 'tournamentId, teamAId, teamBId, sportType, matchDate, and venue are required.'
      });
    }

    const tA = parseInt(teamAId, 10);
    const tB = parseInt(teamBId, 10);
    const tourId = parseInt(tournamentId, 10);

    if (tA === tB) {
      return res.status(400).json({
        success: false,
        message: 'A team cannot play against itself. Please select two different teams.'
      });
    }

    // Ensure teams are linked to tournament
    await prisma.tournamentTeam.upsert({
      where: { tournamentId_teamId: { tournamentId: tourId, teamId: tA } },
      update: {},
      create: { tournamentId: tourId, teamId: tA }
    });
    await prisma.tournamentTeam.upsert({
      where: { tournamentId_teamId: { tournamentId: tourId, teamId: tB } },
      update: {},
      create: { tournamentId: tourId, teamId: tB }
    });

    const matchStatus = status || 'UPCOMING';
    let initialPeriod = 'Pre-Match';
    if (sportType === 'CRICKET') initialPeriod = '1st Inning';
    else if (sportType === 'FOOTBALL') initialPeriod = '1st Half';
    else if (sportType === 'BASKETBALL') initialPeriod = 'Q1';

    const newMatch = await prisma.match.create({
      data: {
        tournamentId: tourId,
        teamAId: tA,
        teamBId: tB,
        sportType: sportType.toUpperCase(),
        matchDate: new Date(matchDate),
        venue: venue.trim(),
        scorerId: scorerId ? parseInt(scorerId, 10) : null,
        status: matchStatus,
        currentPeriod: initialPeriod,
        score: {
          create: {
            battingTeamId: sportType === 'CRICKET' ? tA : null,
            bowlingTeamId: sportType === 'CRICKET' ? tB : null,
            currentInning: 1,
            currentHalf: sportType === 'FOOTBALL' ? '1st Half' : null,
            currentQuarter: sportType === 'BASKETBALL' ? 'Q1' : null,
            quarterTimeLeft: sportType === 'BASKETBALL' ? '10:00' : null,
            lastEventDescription: 'Match created and scheduled.'
          }
        }
      },
      include: {
        tournament: true,
        teamA: true,
        teamB: true,
        scorer: { select: { id: true, name: true, email: true } },
        score: true
      }
    });

    await prisma.notification.create({
      data: {
        title: 'New Match Scheduled',
        message: `${newMatch.teamA.name} vs ${newMatch.teamB.name} scheduled for ${new Date(matchDate).toLocaleDateString()}`,
        type: 'MATCH'
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Match created successfully.',
      data: { match: newMatch }
    });
  } catch (error) {
    next(error);
  }
};

const updateMatch = async (req, res, next) => {
  try {
    const { id } = req.params;
    const matchId = parseInt(id, 10);
    const {
      tournamentId,
      teamAId,
      teamBId,
      sportType,
      matchDate,
      venue,
      scorerId,
      status,
      currentPeriod,
      winnerTeamId,
      resultSummary
    } = req.body;

    const existingMatch = await prisma.match.findUnique({
      where: { id: matchId },
      include: { score: true }
    });

    if (!existingMatch) {
      return res.status(404).json({ success: false, message: 'Match not found.' });
    }

    // Role check: Scorer can only update assigned matches or match status/period
    if (req.user.role === 'SCORER' && existingMatch.scorerId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You are not the assigned scorer for this match.' });
    }

    const tA = teamAId ? parseInt(teamAId, 10) : existingMatch.teamAId;
    const tB = teamBId ? parseInt(teamBId, 10) : existingMatch.teamBId;
    if (tA === tB) {
      return res.status(400).json({ success: false, message: 'A team cannot play against itself.' });
    }

    const updatedMatch = await prisma.match.update({
      where: { id: matchId },
      data: {
        ...(tournamentId && { tournamentId: parseInt(tournamentId, 10) }),
        ...(teamAId && { teamAId: tA }),
        ...(teamBId && { teamBId: tB }),
        ...(sportType && { sportType: sportType.toUpperCase() }),
        ...(matchDate && { matchDate: new Date(matchDate) }),
        ...(venue && { venue: venue.trim() }),
        ...(scorerId !== undefined && { scorerId: scorerId ? parseInt(scorerId, 10) : null }),
        ...(status && { status }),
        ...(currentPeriod !== undefined && { currentPeriod }),
        ...(winnerTeamId !== undefined && { winnerTeamId: winnerTeamId ? parseInt(winnerTeamId, 10) : null }),
        ...(resultSummary !== undefined && { resultSummary })
      },
      include: {
        tournament: true,
        teamA: true,
        teamB: true,
        scorer: { select: { id: true, name: true, email: true } },
        score: true
      }
    });

    // If status transitioned to COMPLETED, recalculate tournament leaderboard!
    if (status === 'COMPLETED' || (existingMatch.status !== 'COMPLETED' && updatedMatch.status === 'COMPLETED')) {
      await recalculateTournamentLeaderboard(updatedMatch.tournamentId);
    }

    // Emit socket event if io is available
    const io = req.app.get('io');
    if (io) {
      io.to(`match_${matchId}`).emit('match_updated', updatedMatch);
      io.emit('live_matches_refresh');
    }

    return res.status(200).json({
      success: true,
      message: 'Match updated successfully.',
      data: { match: updatedMatch }
    });
  } catch (error) {
    next(error);
  }
};

const deleteMatch = async (req, res, next) => {
  try {
    const { id } = req.params;
    const matchId = parseInt(id, 10);

    const existing = await prisma.match.findUnique({ where: { id: matchId } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Match not found.' });
    }

    await prisma.match.delete({ where: { id: matchId } });

    // Recalculate leaderboard
    await recalculateTournamentLeaderboard(existing.tournamentId);

    const io = req.app.get('io');
    if (io) {
      io.emit('live_matches_refresh');
    }

    return res.status(200).json({
      success: true,
      message: 'Match deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllMatches,
  getMatchById,
  createMatch,
  updateMatch,
  deleteMatch
};
