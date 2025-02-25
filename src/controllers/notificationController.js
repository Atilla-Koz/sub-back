const notificationService = require('../utils/notificationService');
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const emailService = require('../utils/emailService');
const mongoose = require('mongoose');

// Kullanıcının yaklaşan ödemelerini getir
exports.getUpcomingReminders = async (req, res) => {
    try {
        const result = await notificationService.checkUserReminders(req.user._id);
        
        if (!result.success) {
            return res.status(400).json({ error: result.error });
        }
        
        res.json(result.reminders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Bildirim ayarlarını güncelle
exports.updateNotificationSettings = async (req, res) => {
    try {
        const updates = Object.keys(req.body);
        const allowedUpdates = ['emailNotifications', 'reminderDays'];
        const isValidOperation = updates.every(update => allowedUpdates.includes(update));

        if (!isValidOperation) {
            return res.status(400).json({ error: 'Geçersiz güncelleme!' });
        }

        updates.forEach(update => {
            req.user[update] = req.body[update];
        });

        await req.user.save();
        res.json({ message: 'Bildirim ayarları başarıyla güncellendi.', user: req.user });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Kullanıcıya ait yaklaşan abonelik ödemelerini kontrol et ve hatırlatıcı gönder
exports.checkUpcomingPayments = async (req, res) => {
    try {
        const today = new Date();
        const thresholdDate = new Date();
        thresholdDate.setDate(today.getDate() + 7); // 7 gün içindeki ödemeleri kontrol et

        // Kullanıcı sadece kendi aboneliklerini görebilir
        const subscriptions = await Subscription.find({
            user: req.user._id,
            nextPaymentDate: { $gte: today, $lte: thresholdDate }
        });

        if (subscriptions.length === 0) {
            return res.json({ message: 'Yaklaşan ödeme bulunmamaktadır.' });
        }

        const reminderResults = [];
        
        // Her abonelik için e-posta gönder
        for (const subscription of subscriptions) {
            const success = await emailService.sendSubscriptionReminderEmail(req.user, subscription);
            reminderResults.push({
                subscription: subscription.name,
                success
            });
        }

        res.json({
            message: 'Hatırlatıcılar kontrol edildi.',
            results: reminderResults
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Yaklaşan abonelik ödemeleri için manuel hatırlatıcı gönder
exports.sendManualReminder = async (req, res) => {
    try {
        const { subscriptionId } = req.params;

        // Kullanıcı sadece kendi aboneliklerini görebilir
        const subscription = await Subscription.findOne({
            _id: subscriptionId,
            user: req.user._id
        });

        if (!subscription) {
            return res.status(404).json({ error: 'Abonelik bulunamadı.' });
        }

        const success = await emailService.sendSubscriptionReminderEmail(req.user, subscription);

        if (success) {
            res.json({ message: 'Hatırlatıcı başarıyla gönderildi.' });
        } else {
            throw new Error('Hatırlatıcı gönderilemedi.');
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Bildirim tercihlerini güncelle
exports.updateNotificationPreferences = async (req, res) => {
    try {
        const { emailNotifications, daysBeforeReminder } = req.body;
        
        // Kullanıcının bildirim tercihlerini güncelle
        req.user.preferences = {
            ...req.user.preferences,
            emailNotifications,
            daysBeforeReminder
        };
        
        await req.user.save();
        
        res.json({ 
            message: 'Bildirim tercihleri güncellendi.',
            preferences: req.user.preferences
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Test bildirimi gönderme
exports.sendTestNotification = async (req, res) => {
    try {
        const result = await emailService.sendSubscriptionReminder(
            req.user,
            {
                name: 'Test Abonelik',
                amount: '9.99',
                currency: 'TL',
                nextPaymentDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 gün sonra
            }
        );

        if (result) {
            res.json({ message: 'Test bildirimi başarıyla gönderildi.' });
        } else {
            throw new Error('Bildirim gönderilemedi.');
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Yaklaşan ödemeler için bildirimleri kontrol etme ve gönderme (Bir cron job tarafından çağrılabilir)
exports.checkAndSendReminders = async (req, res) => {
    try {
        const today = new Date();
        const endDate = new Date();
        endDate.setDate(today.getDate() + 7); // Önümüzdeki 7 gün içindeki ödemeleri kontrol et

        // Aktif bildirim ayarları olan kullanıcıları bul
        const users = await User.find({ emailNotifications: true });

        let notificationCount = 0;

        for (const user of users) {
            // Kullanıcının aboneliklerini bul
            const subscriptions = await Subscription.find({
                user: user._id,
                nextPaymentDate: { $gte: today, $lte: endDate },
                isActive: true
            });

            // Her abonelik için bildirim gönder
            for (const subscription of subscriptions) {
                // Kullanıcının reminderDays ayarına göre kontrol et
                const daysUntilPayment = Math.ceil((subscription.nextPaymentDate - today) / (1000 * 60 * 60 * 24));
                
                if (user.reminderDays.includes(daysUntilPayment)) {
                    const result = await emailService.sendSubscriptionReminder(user, subscription);
                    if (result) notificationCount++;
                }
            }
        }

        res.json({ message: `${notificationCount} bildirim başarıyla gönderildi.` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Şifre sıfırlama e-postası gönderme
exports.sendPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ error: 'Bu e-posta adresiyle kayıtlı bir kullanıcı bulunamadı.' });
        }

        // Şifre sıfırlama tokeni oluştur
        const resetToken = await user.generatePasswordResetToken();
        await user.save();

        // E-posta gönder
        const result = await emailService.sendPasswordResetEmail(user.email, resetToken);

        if (result) {
            res.json({ message: 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.' });
        } else {
            throw new Error('E-posta gönderilemedi.');
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}; 