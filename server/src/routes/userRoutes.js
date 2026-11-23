const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');

router.get('/', authenticateToken, requireRole('ADMIN'), userController.getAllUsers);
router.get('/scorers', authenticateToken, userController.getScorers);
router.put('/:id/role', authenticateToken, requireRole('ADMIN'), userController.updateUserRole);
router.delete('/:id', authenticateToken, requireRole('ADMIN'), userController.deleteUser);

module.exports = router;
