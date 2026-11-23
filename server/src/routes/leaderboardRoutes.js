const express = require('express');
const router = express.Router();
const leaderboardController = require('../controllers/leaderboardController');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');

router.get('/:id', leaderboardController.getTournamentLeaderboard);
router.post('/:id/recalculate', authenticateToken, requireRole('ADMIN', 'SCORER'), leaderboardController.triggerRecalculate);

module.exports = router;
