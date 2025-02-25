require('dotenv').config();

module.exports = {
    // Temel Ayarlar
    PORT: process.env.PORT || 3000,
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/subscription-tracker',
    JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
    NODE_ENV: process.env.NODE_ENV || 'development',
    
    // Uygulama Ayarları
    APP_NAME: process.env.APP_NAME || 'Subscription Tracker',
    API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:3000',
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3001',
    ADMIN_API_KEY: process.env.ADMIN_API_KEY,
    
    // Email Ayarları
    EMAIL_HOST: process.env.EMAIL_HOST || 'smtp.gmail.com',
    EMAIL_PORT: process.env.EMAIL_PORT || 587,
    EMAIL_SECURE: process.env.EMAIL_SECURE === 'true',
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
    EMAIL_FROM: process.env.EMAIL_FROM || 'noreply@subscriptiontracker.com',
    
    // Bildirim Ayarları
    DEFAULT_REMINDER_DAYS: [1, 3, 7], // Varsayılan hatırlatma günleri (ödeme tarihinden önce)
}; 