const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');

router.get('/', teamController.getAllTeams);
router.get('/:id', teamController.getTeamById);
router.post('/', authenticateToken, requireRole('ADMIN'), teamController.createTeam);
router.put('/:id', authenticateToken, requireRole('ADMIN'), teamController.updateTeam);
router.delete('/:id', authenticateToken, requireRole('ADMIN'), teamController.deleteTeam);

// Player roster routes
router.post('/:id/players', authenticateToken, requireRole('ADMIN'), teamController.addPlayer);
router.put('/players/:playerId', authenticateToken, requireRole('ADMIN'), teamController.updatePlayer);
router.delete('/players/:playerId', authenticateToken, requireRole('ADMIN'), teamController.deletePlayer);

module.exports = router;
