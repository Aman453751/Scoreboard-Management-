const prisma = require('../prisma');

const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalTournaments,
      totalTeams,
      totalMatches,
      liveMatches,
      completedMatches,
      upcomingMatches,
      recentEvents,
      recentNotifications,
      liveMatchList
    ] = await Promise.all([
      prisma.tournament.count(),
      prisma.team.count(),
      prisma.match.count(),
      prisma.match.count({ where: { status: 'LIVE' } }),
      prisma.match.count({ where: { status: 'COMPLETED' } }),
      prisma.match.count({ where: { status: 'UPCOMING' } }),
      prisma.matchEvent.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: {
          match: {
            include: { teamA: true, teamB: true }
          }
        }
      }),
      prisma.notification.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.match.findMany({
        where: { status: 'LIVE' },
        include: {
          teamA: true,
          teamB: true,
          tournament: true,
          score: true
        }
      })
    ]);

    return res.status(200).json({
      success: true,
      data: {
        counts: {
          totalTournaments,
          totalTeams,
          totalMatches,
          liveMatches,
          completedMatches,
          upcomingMatches
        },
        recentEvents,
        recentNotifications,
        liveMatches: liveMatchList
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats
};
