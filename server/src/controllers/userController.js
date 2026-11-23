const prisma = require('../prisma');

const getAllUsers = async (req, res, next) => {
  try {
    const { role, search } = req.query;

    const where = {};
    if (role && role !== 'ALL') {
      where.role = role;
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { college: { contains: search } }
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        college: true,
        phone: true,
        avatar: true,
        createdAt: true,
        _count: {
          select: { assignedMatches: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json({
      success: true,
      data: { users }
    });
  } catch (error) {
    next(error);
  }
};

const getScorers = async (req, res, next) => {
  try {
    const scorers = await prisma.user.findMany({
      where: {
        role: { in: ['SCORER', 'ADMIN'] }
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        college: true
      },
      orderBy: { name: 'asc' }
    });

    return res.status(200).json({
      success: true,
      data: { scorers }
    });
  } catch (error) {
    next(error);
  }
};

const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id, 10);
    const { role } = req.body;

    const validRoles = ['ADMIN', 'SCORER', 'VIEWER'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role.' });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        updatedAt: true
      }
    });

    return res.status(200).json({
      success: true,
      message: `User role updated to ${role}.`,
      data: { user: updated }
    });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id, 10);

    if (req.user.id === userId) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own admin account.' });
    }

    await prisma.user.delete({ where: { id: userId } });

    return res.status(200).json({
      success: true,
      message: 'User deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getScorers,
  updateUserRole,
  deleteUser
};
