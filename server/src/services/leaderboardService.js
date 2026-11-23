const prisma = require('../prisma');

/**
 * Recalculate leaderboard for a specific tournament based on all COMPLETED matches
 */
const recalculateTournamentLeaderboard = async (tournamentId) => {
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: {
      teams: {
        include: {
          team: true
        }
      },
      matches: {
        where: { status: 'COMPLETED' },
        include: {
          score: true
        }
      }
    }
  });

  if (!tournament) return;

  const teamStats = {};

  // Initialize stats for each team in tournament
  tournament.teams.forEach((t) => {
    teamStats[t.teamId] = {
      teamId: t.teamId,
      played: 0,
      won: 0,
      lost: 0,
      drawn: 0,
      points: 0,
      diff: 0
    };
  });

  // Process completed matches
  tournament.matches.forEach((match) => {
    const { teamAId, teamBId, sportType, winnerTeamId, score } = match;

    if (!teamStats[teamAId]) {
      teamStats[teamAId] = { teamId: teamAId, played: 0, won: 0, lost: 0, drawn: 0, points: 0, diff: 0 };
    }
    if (!teamStats[teamBId]) {
      teamStats[teamBId] = { teamId: teamBId, played: 0, won: 0, lost: 0, drawn: 0, points: 0, diff: 0 };
    }

    teamStats[teamAId].played += 1;
    teamStats[teamBId].played += 1;

    if (sportType === 'CRICKET') {
      if (winnerTeamId === teamAId) {
        teamStats[teamAId].won += 1;
        teamStats[teamAId].points += 2;
        teamStats[teamBId].lost += 1;
      } else if (winnerTeamId === teamBId) {
        teamStats[teamBId].won += 1;
        teamStats[teamBId].points += 2;
        teamStats[teamAId].lost += 1;
      } else {
        // Draw / Tied
        teamStats[teamAId].drawn += 1;
        teamStats[teamAId].points += 1;
        teamStats[teamBId].drawn += 1;
        teamStats[teamBId].points += 1;
      }

      if (score) {
        const runDiff = score.teamARuns - score.teamBRuns;
        teamStats[teamAId].diff += runDiff;
        teamStats[teamBId].diff -= runDiff;
      }
    } else if (sportType === 'FOOTBALL') {
      const aGoals = score ? score.teamAGoals : 0;
      const bGoals = score ? score.teamBGoals : 0;
      const goalDiff = aGoals - bGoals;

      teamStats[teamAId].diff += goalDiff;
      teamStats[teamBId].diff -= goalDiff;

      if (aGoals > bGoals) {
        teamStats[teamAId].won += 1;
        teamStats[teamAId].points += 3;
        teamStats[teamBId].lost += 1;
      } else if (bGoals > aGoals) {
        teamStats[teamBId].won += 1;
        teamStats[teamBId].points += 3;
        teamStats[teamAId].lost += 1;
      } else {
        teamStats[teamAId].drawn += 1;
        teamStats[teamAId].points += 1;
        teamStats[teamBId].drawn += 1;
        teamStats[teamBId].points += 1;
      }
    } else if (sportType === 'BASKETBALL') {
      const aPts = score ? score.teamAPoints : 0;
      const bPts = score ? score.teamBPoints : 0;
      const ptDiff = aPts - bPts;

      teamStats[teamAId].diff += ptDiff;
      teamStats[teamBId].diff -= ptDiff;

      if (aPts > bPts) {
        teamStats[teamAId].won += 1;
        teamStats[teamAId].points += 2;
        teamStats[teamBId].lost += 1;
      } else if (bPts > aPts) {
        teamStats[teamBId].won += 1;
        teamStats[teamBId].points += 2;
        teamStats[teamAId].lost += 1;
      } else {
        teamStats[teamAId].drawn += 1;
        teamStats[teamAId].points += 1;
        teamStats[teamBId].drawn += 1;
        teamStats[teamBId].points += 1;
      }
    }
  });

  // Sort by points desc, then diff desc, then won desc
  const sorted = Object.values(teamStats).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.diff !== a.diff) return b.diff - a.diff;
    return b.won - a.won;
  });

  // Save / Update leaderboard records in DB
  for (let i = 0; i < sorted.length; i++) {
    const item = sorted[i];
    await prisma.leaderboard.upsert({
      where: {
        tournamentId_teamId: {
          tournamentId,
          teamId: item.teamId
        }
      },
      update: {
        played: item.played,
        won: item.won,
        lost: item.lost,
        drawn: item.drawn,
        points: item.points,
        rank: i + 1,
        goalDiffOrNRR: parseFloat(item.diff.toFixed(2))
      },
      create: {
        tournamentId,
        teamId: item.teamId,
        played: item.played,
        won: item.won,
        lost: item.lost,
        drawn: item.drawn,
        points: item.points,
        rank: i + 1,
        goalDiffOrNRR: parseFloat(item.diff.toFixed(2))
      }
    });
  }
};

module.exports = {
  recalculateTournamentLeaderboard
};
