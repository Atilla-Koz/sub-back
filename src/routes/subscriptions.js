const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const auth = require('../middleware/auth');

// Tüm route'lar authentication gerektirir
router.use(auth);

// Abonelik CRUD işlemleri
router.get('/', subscriptionController.getAllSubscriptions);
router.get('/:id', subscriptionController.getSubscription);
router.post('/', subscriptionController.createSubscription);
router.patch('/:id', subscriptionController.updateSubscription);
router.delete('/:id', subscriptionController.deleteSubscription);

// Özel route'lar
router.get('/category/:category', subscriptionController.getSubscriptionsByCategory);
router.get('/upcoming/payments', subscriptionController.getUpcomingPayments);

module.exports = router; 