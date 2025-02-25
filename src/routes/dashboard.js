const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const auth = require('../middleware/auth');

// Tüm dashboard route'ları authentication gerektirir
router.use(auth);

// Dashboard özet verileri
router.get('/summary', dashboardController.getDashboardSummary);

// Abonelik istatistikleri
router.get('/subscription-stats', dashboardController.getSubscriptionStats);

module.exports = router; 