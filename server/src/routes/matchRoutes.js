const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController');
const scoreController = require('../controllers/scoreController');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');

router.get('/', matchController.getAllMatches);
router.get('/:id', matchController.getMatchById);
router.post('/', authenticateToken, requireRole('ADMIN'), matchController.createMatch);
router.put('/:id', authenticateToken, requireRole('ADMIN', 'SCORER'), matchController.updateMatch);
router.delete('/:id', authenticateToken, requireRole('ADMIN'), matchController.deleteMatch);

// Sub-routes for score and events
router.get('/:id/score', scoreController.getMatchScore);
router.post('/:id/score', authenticateToken, requireRole('ADMIN', 'SCORER'), scoreController.updateScore);
router.post('/:id/score/undo', authenticateToken, requireRole('ADMIN', 'SCORER'), scoreController.undoLastEvent);
router.get('/:id/events', scoreController.getMatchEvents);

module.exports = router;
