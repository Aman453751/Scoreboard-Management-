const prisma = require('../prisma');

const getAllTeams = async (req, res, next) => {
  try {
    const { search, college } = req.query;

    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { shortName: { contains: search } },
        { department: { contains: search } },
        { captainName: { contains: search } }
      ];
    }
    if (college) {
      where.college = { contains: college };
    }

    const teams = await prisma.team.findMany({
      where,
      include: {
        _count: {
          select: {
            players: true,
            tournaments: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    return res.status(200).json({
      success: true,
      data: { teams }
    });
  } catch (error) {
    next(error);
  }
};

const getTeamById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const teamId = parseInt(id, 10);

    if (isNaN(teamId)) {
      return res.status(400).json({ success: false, message: 'Invalid team ID.' });
    }

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        players: {
          orderBy: [
            { isCaptain: 'desc' },
            { jerseyNumber: 'asc' },
            { name: 'asc' }
          ]
        },
        tournaments: {
          include: {
            tournament: true
          }
        },
        matchesAsTeamA: {
          include: {
            teamB: true,
            tournament: true,
            score: true
          },
          orderBy: { matchDate: 'desc' }
        },
        matchesAsTeamB: {
          include: {
            teamA: true,
            tournament: true,
            score: true
          },
          orderBy: { matchDate: 'desc' }
        }
      }
    });

    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found.' });
    }

    return res.status(200).json({
      success: true,
      data: { team }
    });
  } catch (error) {
    next(error);
  }
};

const createTeam = async (req, res, next) => {
  try {
    const { name, shortName, college, department, captainName, contactEmail, logo, players } = req.body;

    if (!name || !college) {
      return res.status(400).json({ success: false, message: 'Team name and college are required.' });
    }

    const defaultLogo = `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(name.trim())}&backgroundColor=0f172a,1e293b`;

    const team = await prisma.team.create({
      data: {
        name: name.trim(),
        shortName: shortName ? shortName.trim().toUpperCase() : name.trim().slice(0, 3).toUpperCase(),
        college: college.trim(),
        department: department ? department.trim() : null,
        captainName: captainName ? captainName.trim() : null,
        contactEmail: contactEmail ? contactEmail.trim() : null,
        logo: logo || defaultLogo,
        players: players && Array.isArray(players) && players.length > 0 ? {
          create: players.map((p) => ({
            name: p.name.trim(),
            jerseyNumber: p.jerseyNumber ? parseInt(p.jerseyNumber, 10) : null,
            role: p.role ? p.role.trim() : null,
            isCaptain: Boolean(p.isCaptain)
          }))
        } : undefined
      },
      include: {
        players: true
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Team created successfully.',
      data: { team }
    });
  } catch (error) {
    next(error);
  }
};

const updateTeam = async (req, res, next) => {
  try {
    const { id } = req.params;
    const teamId = parseInt(id, 10);
    const { name, shortName, college, department, captainName, contactEmail, logo } = req.body;

    const existing = await prisma.team.findUnique({ where: { id: teamId } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Team not found.' });
    }

    const updated = await prisma.team.update({
      where: { id: teamId },
      data: {
        ...(name && { name: name.trim() }),
        ...(shortName && { shortName: shortName.trim().toUpperCase() }),
        ...(college && { college: college.trim() }),
        ...(department !== undefined && { department: department ? department.trim() : null }),
        ...(captainName !== undefined && { captainName: captainName ? captainName.trim() : null }),
        ...(contactEmail !== undefined && { contactEmail: contactEmail ? contactEmail.trim() : null }),
        ...(logo && { logo })
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Team updated successfully.',
      data: { team: updated }
    });
  } catch (error) {
    next(error);
  }
};

const deleteTeam = async (req, res, next) => {
  try {
    const { id } = req.params;
    const teamId = parseInt(id, 10);

    const existing = await prisma.team.findUnique({ where: { id: teamId } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Team not found.' });
    }

    await prisma.team.delete({ where: { id: teamId } });

    return res.status(200).json({
      success: true,
      message: 'Team deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

const addPlayer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const teamId = parseInt(id, 10);
    const { name, jerseyNumber, role, isCaptain } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Player name is required.' });
    }

    if (isCaptain) {
      // Unmark previous captain if marking this one as captain
      await prisma.player.updateMany({
        where: { teamId, isCaptain: true },
        data: { isCaptain: false }
      });
      await prisma.team.update({
        where: { id: teamId },
        data: { captainName: name.trim() }
      });
    }

    const player = await prisma.player.create({
      data: {
        teamId,
        name: name.trim(),
        jerseyNumber: jerseyNumber ? parseInt(jerseyNumber, 10) : null,
        role: role ? role.trim() : null,
        isCaptain: Boolean(isCaptain)
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Player added successfully.',
      data: { player }
    });
  } catch (error) {
    next(error);
  }
};

const updatePlayer = async (req, res, next) => {
  try {
    const { playerId } = req.params;
    const pid = parseInt(playerId, 10);
    const { name, jerseyNumber, role, isCaptain } = req.body;

    const existing = await prisma.player.findUnique({ where: { id: pid } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Player not found.' });
    }

    if (isCaptain) {
      await prisma.player.updateMany({
        where: { teamId: existing.teamId, isCaptain: true, NOT: { id: pid } },
        data: { isCaptain: false }
      });
      await prisma.team.update({
        where: { id: existing.teamId },
        data: { captainName: name ? name.trim() : existing.name }
      });
    }

    const updated = await prisma.player.update({
      where: { id: pid },
      data: {
        ...(name && { name: name.trim() }),
        ...(jerseyNumber !== undefined && { jerseyNumber: jerseyNumber ? parseInt(jerseyNumber, 10) : null }),
        ...(role !== undefined && { role: role ? role.trim() : null }),
        ...(isCaptain !== undefined && { isCaptain: Boolean(isCaptain) })
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Player updated successfully.',
      data: { player: updated }
    });
  } catch (error) {
    next(error);
  }
};

const deletePlayer = async (req, res, next) => {
  try {
    const { playerId } = req.params;
    const pid = parseInt(playerId, 10);

    await prisma.player.delete({ where: { id: pid } });

    return res.status(200).json({
      success: true,
      message: 'Player removed successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
  addPlayer,
  updatePlayer,
  deletePlayer
};
