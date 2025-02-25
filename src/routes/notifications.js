const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const auth = require('../middleware/auth');

// Tüm route'lar authentication gerektirir
router.use(auth);

// Bildirim route'ları
router.get('/upcoming', notificationController.getUpcomingReminders);
router.patch('/settings/:subscriptionId', notificationController.updateNotificationSettings);
router.post('/send/:subscriptionId', notificationController.sendManualReminder);

module.exports = router; 