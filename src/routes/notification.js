const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const auth = require('../middleware/auth');

// Tüm notification route'ları authentication gerektirir
router.use(auth);

// Yaklaşan abonelik ödemelerini kontrol et ve hatırlatıcılar gönder
router.get('/check-upcoming', notificationController.checkUpcomingPayments);

// Belirli bir abonelik için manuel hatırlatıcı gönder
router.post('/manual-reminder/:subscriptionId', notificationController.sendManualReminder);

// Bildirim tercihlerini güncelle
router.patch('/preferences', notificationController.updateNotificationPreferences);

// Bildirim ayarlarını güncelleme
router.patch('/settings', notificationController.updateNotificationSettings);

// Test bildirimi gönderme
router.post('/test', notificationController.sendTestNotification);

// Şifre sıfırlama e-postası gönderme (public route)
router.post('/password-reset', notificationController.sendPasswordReset);

// Admin route - Tüm bildirimleri kontrol et ve gönder (normalde bir CRON job tarafından çağrılır)
router.post('/check-reminders', notificationController.checkAndSendReminders);

module.exports = router; 