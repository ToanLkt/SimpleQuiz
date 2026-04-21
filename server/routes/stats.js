const express = require('express');
const statsController = require('../controllers/statsController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/admin-dashboard', verifyToken, requireAdmin, statsController.getAdminDashboard);

module.exports = router;
