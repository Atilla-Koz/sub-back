const cron = require('node-cron');
const axios = require('axios');
const config = require('../config/config');

/**
 * Bildirim scheduler'ı
 * Her gün belirli bir saatte çalışarak yaklaşan abonelik ödemeleri için bildirimleri kontrol eder
 */
class NotificationScheduler {
    constructor() {
        this.isRunning = false;
        this.cronJob = null;
    }

    /**
     * Scheduler'ı başlat
     * @param {string} cronExpression - Cron ifadesi (varsayılan: her gün saat 09:00'da)
     */
    start(cronExpression = '0 9 * * *') {
        if (this.isRunning) {
            console.log('Bildirim scheduler zaten çalışıyor.');
            return;
        }

        this.cronJob = cron.schedule(cronExpression, async () => {
            console.log(`[${new Date().toISOString()}] Bildirim kontrolü başlatılıyor...`);
            
            try {
                // API'yi çağırarak bildirimleri kontrol et
                const response = await axios.post(
                    `${config.API_BASE_URL}/api/notifications/check-reminders`,
                    {},
                    {
                        headers: {
                            'Authorization': `Bearer ${config.ADMIN_API_KEY}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                
                console.log(`[${new Date().toISOString()}] Bildirim kontrolü tamamlandı:`, response.data.message);
            } catch (error) {
                console.error(`[${new Date().toISOString()}] Bildirim kontrolü sırasında hata:`, error.message);
            }
        });

        this.isRunning = true;
        console.log(`Bildirim scheduler başlatıldı. Çalışma zamanı: ${cronExpression}`);
    }

    /**
     * Scheduler'ı durdur
     */
    stop() {
        if (!this.isRunning) {
            console.log('Bildirim scheduler zaten durdurulmuş.');
            return;
        }

        this.cronJob.stop();
        this.isRunning = false;
        console.log('Bildirim scheduler durduruldu.');
    }

    /**
     * Manuel olarak bildirimleri kontrol et
     */
    async checkNow() {
        console.log(`[${new Date().toISOString()}] Manuel bildirim kontrolü başlatılıyor...`);
        
        try {
            // API'yi çağırarak bildirimleri kontrol et
            const response = await axios.post(
                `${config.API_BASE_URL}/api/notifications/check-reminders`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${config.ADMIN_API_KEY}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            console.log(`[${new Date().toISOString()}] Manuel bildirim kontrolü tamamlandı:`, response.data.message);
            return { success: true, message: response.data.message };
        } catch (error) {
            console.error(`[${new Date().toISOString()}] Manuel bildirim kontrolü sırasında hata:`, error.message);
            return { success: false, error: error.message };
        }
    }
}

module.exports = new NotificationScheduler(); 