const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const auth = require('../middleware/auth');

// Tüm analitik route'ları authentication gerektirir
router.use(auth);

// Toplam harcama analizi
router.get('/total-spending', analyticsController.getTotalSpending);

// Kategori bazında harcama analizi
router.get('/category-analysis', analyticsController.getCategoryAnalysis);

// Aylık harcama tahmini
router.get('/monthly-forecast', analyticsController.getMonthlyForecast);

// Optimizasyon önerileri
router.get('/optimization-suggestions', analyticsController.getOptimizationSuggestions);

module.exports = router; 