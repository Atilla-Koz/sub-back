const User = require('../models/User');
const Subscription = require('../models/Subscription');
const emailService = require('./emailService');

// Yaklaşan ödemeler için bildirimleri kontrol et ve gönder
exports.checkAndSendReminders = async () => {
    try {
        const today = new Date();
        const activeSubscriptions = await Subscription.find({
            status: 'active',
            autoRenewal: true
        });

        for (const subscription of activeSubscriptions) {
            const nextBillingDate = new Date(subscription.nextBillingDate);
            const daysDifference = Math.ceil((nextBillingDate - today) / (1000 * 60 * 60 * 24));
            
            // Kullanıcının bildirim tercihlerine göre kontrol et
            if (daysDifference === subscription.notificationSettings.reminderDays) {
                const user = await User.findById(subscription.userId);
                
                if (user) {
                    // Email bildirimi gönder
                    if (subscription.notificationSettings.email) {
                        await emailService.sendSubscriptionReminder(user, subscription);
                    }
                    
                    // SMS bildirimi gönder (ileride eklenecek)
                    if (subscription.notificationSettings.sms) {
                        // SMS gönderme işlevi burada eklenecek
                    }
                    
                    console.log(`Bildirim gönderildi: ${user.email} - ${subscription.name}`);
                }
            }
        }
        
        return { success: true, message: 'Bildirimler kontrol edildi ve gönderildi' };
    } catch (error) {
        console.error('Bildirim gönderme hatası:', error);
        return { success: false, error: error.message };
    }
};

// Belirli bir kullanıcı için bildirimleri kontrol et
exports.checkUserReminders = async (userId) => {
    try {
        const today = new Date();
        const user = await User.findById(userId);
        
        if (!user) {
            throw new Error('Kullanıcı bulunamadı');
        }
        
        const activeSubscriptions = await Subscription.find({
            userId,
            status: 'active',
            autoRenewal: true
        });
        
        const reminders = [];
        
        for (const subscription of activeSubscriptions) {
            const nextBillingDate = new Date(subscription.nextBillingDate);
            const daysDifference = Math.ceil((nextBillingDate - today) / (1000 * 60 * 60 * 24));
            
            if (daysDifference <= 7) {
                reminders.push({
                    subscription,
                    daysRemaining: daysDifference
                });
            }
        }
        
        return { success: true, reminders };
    } catch (error) {
        console.error('Kullanıcı bildirimleri kontrol hatası:', error);
        return { success: false, error: error.message };
    }
}; 