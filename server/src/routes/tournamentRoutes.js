const express = require('express');
const router = express.Router();
const tournamentController = require('../controllers/tournamentController');
const leaderboardController = require('../controllers/leaderboardController');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');

router.get('/', tournamentController.getAllTournaments);
router.get('/:id', tournamentController.getTournamentById);
router.post('/', authenticateToken, requireRole('ADMIN'), tournamentController.createTournament);
router.put('/:id', authenticateToken, requireRole('ADMIN'), tournamentController.updateTournament);
router.delete('/:id', authenticateToken, requireRole('ADMIN'), tournamentController.deleteTournament);

// Team participation in tournament
router.post('/:id/teams', authenticateToken, requireRole('ADMIN'), tournamentController.addTeamToTournament);
router.delete('/:id/teams/:teamId', authenticateToken, requireRole('ADMIN'), tournamentController.removeTeamFromTournament);

// Leaderboard for tournament
router.get('/:id/leaderboard', leaderboardController.getTournamentLeaderboard);
router.post('/:id/leaderboard/recalculate', authenticateToken, requireRole('ADMIN', 'SCORER'), leaderboardController.triggerRecalculate);

module.exports = router;
