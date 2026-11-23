const prisma = require('../prisma');
const { recalculateTournamentLeaderboard } = require('../services/leaderboardService');

const getTournamentLeaderboard = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tournamentId = parseInt(id, 10);

    if (isNaN(tournamentId)) {
      return res.status(400).json({ success: false, message: 'Invalid tournament ID.' });
    }

    let leaderboard = await prisma.leaderboard.findMany({
      where: { tournamentId },
      include: {
        team: true
      },
      orderBy: [
        { points: 'desc' },
        { goalDiffOrNRR: 'desc' },
        { won: 'desc' }
      ]
    });

    // If empty, auto-generate from tournament teams
    if (leaderboard.length === 0) {
      await recalculateTournamentLeaderboard(tournamentId);
      leaderboard = await prisma.leaderboard.findMany({
        where: { tournamentId },
        include: { team: true },
        orderBy: [
          { points: 'desc' },
          { goalDiffOrNRR: 'desc' },
          { won: 'desc' }
        ]
      });
    }

    return res.status(200).json({
      success: true,
      data: { leaderboard }
    });
  } catch (error) {
    next(error);
  }
};

const triggerRecalculate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tournamentId = parseInt(id, 10);

    await recalculateTournamentLeaderboard(tournamentId);

    const updatedLeaderboard = await prisma.leaderboard.findMany({
      where: { tournamentId },
      include: { team: true },
      orderBy: [
        { points: 'desc' },
        { goalDiffOrNRR: 'desc' },
        { won: 'desc' }
      ]
    });

    return res.status(200).json({
      success: true,
      message: 'Leaderboard recalculated successfully.',
      data: { leaderboard: updatedLeaderboard }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTournamentLeaderboard,
  triggerRecalculate
};
