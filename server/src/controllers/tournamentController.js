const prisma = require('../prisma');

const getAllTournaments = async (req, res, next) => {
  try {
    const { status, sportType, search } = req.query;

    const where = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }
    if (sportType && sportType !== 'ALL') {
      where.sportType = sportType;
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { location: { contains: search } },
        { description: { contains: search } }
      ];
    }

    const tournaments = await prisma.tournament.findMany({
      where,
      include: {
        _count: {
          select: {
            teams: true,
            matches: true
          }
        }
      },
      orderBy: { startDate: 'desc' }
    });

    return res.status(200).json({
      success: true,
      data: { tournaments }
    });
  } catch (error) {
    next(error);
  }
};

const getTournamentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tournamentId = parseInt(id, 10);

    if (isNaN(tournamentId)) {
      return res.status(400).json({ success: false, message: 'Invalid tournament ID.' });
    }

    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        teams: {
          include: {
            team: {
              include: {
                _count: {
                  select: { players: true }
                }
              }
            }
          }
        },
        matches: {
          include: {
            teamA: true,
            teamB: true,
            score: true,
            scorer: {
              select: { id: true, name: true, email: true }
            }
          },
          orderBy: { matchDate: 'asc' }
        },
        leaderboards: {
          include: {
            team: true
          },
          orderBy: [
            { points: 'desc' },
            { goalDiffOrNRR: 'desc' },
            { won: 'desc' }
          ]
        }
      }
    });

    if (!tournament) {
      return res.status(404).json({ success: false, message: 'Tournament not found.' });
    }

    return res.status(200).json({
      success: true,
      data: { tournament }
    });
  } catch (error) {
    next(error);
  }
};

const createTournament = async (req, res, next) => {
  try {
    const { name, sportType, startDate, endDate, location, description, bannerImage, teamIds } = req.body;

    if (!name || !sportType || !startDate || !endDate || !location) {
      return res.status(400).json({
        success: false,
        message: 'Name, sportType, startDate, endDate, and location are required.'
      });
    }

    const validSports = ['CRICKET', 'FOOTBALL', 'BASKETBALL'];
    if (!validSports.includes(sportType.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid sportType. Must be CRICKET, FOOTBALL, or BASKETBALL.'
      });
    }

    const newTournament = await prisma.tournament.create({
      data: {
        name: name.trim(),
        sportType: sportType.toUpperCase(),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        location: location.trim(),
        description: description ? description.trim() : null,
        bannerImage: bannerImage || 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800',
        status: new Date(startDate) > new Date() ? 'UPCOMING' : 'ONGOING',
        teams: teamIds && Array.isArray(teamIds) ? {
          create: teamIds.map((tid) => ({ teamId: parseInt(tid, 10) }))
        } : undefined
      },
      include: {
        teams: {
          include: { team: true }
        }
      }
    });

    // Create system notification
    await prisma.notification.create({
      data: {
        title: 'New Tournament Created',
        message: `${newTournament.name} (${newTournament.sportType}) has been scheduled.`,
        type: 'INFO'
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Tournament created successfully.',
      data: { tournament: newTournament }
    });
  } catch (error) {
    next(error);
  }
};

const updateTournament = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tournamentId = parseInt(id, 10);
    const { name, sportType, startDate, endDate, location, description, status, bannerImage } = req.body;

    const existing = await prisma.tournament.findUnique({ where: { id: tournamentId } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Tournament not found.' });
    }

    const updated = await prisma.tournament.update({
      where: { id: tournamentId },
      data: {
        ...(name && { name: name.trim() }),
        ...(sportType && { sportType: sportType.toUpperCase() }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(location && { location: location.trim() }),
        ...(description !== undefined && { description: description ? description.trim() : null }),
        ...(status && { status }),
        ...(bannerImage && { bannerImage })
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Tournament updated successfully.',
      data: { tournament: updated }
    });
  } catch (error) {
    next(error);
  }
};

const deleteTournament = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tournamentId = parseInt(id, 10);

    const existing = await prisma.tournament.findUnique({ where: { id: tournamentId } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Tournament not found.' });
    }

    await prisma.tournament.delete({ where: { id: tournamentId } });

    return res.status(200).json({
      success: true,
      message: 'Tournament deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

const addTeamToTournament = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tournamentId = parseInt(id, 10);
    const { teamId } = req.body;

    const tid = parseInt(teamId, 10);

    const existingRelation = await prisma.tournamentTeam.findUnique({
      where: {
        tournamentId_teamId: {
          tournamentId,
          teamId: tid
        }
      }
    });

    if (existingRelation) {
      return res.status(400).json({ success: false, message: 'Team is already in this tournament.' });
    }

    await prisma.tournamentTeam.create({
      data: {
        tournamentId,
        teamId: tid
      }
    });

    // Also initialize Leaderboard slot if not present
    await prisma.leaderboard.upsert({
      where: {
        tournamentId_teamId: {
          tournamentId,
          teamId: tid
        }
      },
      update: {},
      create: {
        tournamentId,
        teamId: tid
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Team added to tournament.'
    });
  } catch (error) {
    next(error);
  }
};

const removeTeamFromTournament = async (req, res, next) => {
  try {
    const { id, teamId } = req.params;
    const tournamentId = parseInt(id, 10);
    const tid = parseInt(teamId, 10);

    await prisma.tournamentTeam.deleteMany({
      where: {
        tournamentId,
        teamId: tid
      }
    });

    await prisma.leaderboard.deleteMany({
      where: {
        tournamentId,
        teamId: tid
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Team removed from tournament.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllTournaments,
  getTournamentById,
  createTournament,
  updateTournament,
  deleteTournament,
  addTeamToTournament,
  removeTeamFromTournament
};
