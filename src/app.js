const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const config = require('./config/config');
const notificationScheduler = require('./utils/scheduler');

// Express uygulamasını başlat
const app = express();

// Middleware'leri yapılandır
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB bağlantısı
mongoose.connect(config.MONGODB_URI)
    .then(() => {
        console.log('MongoDB\'ye başarıyla bağlanıldı');
    })
    .catch((error) => {
        console.error('MongoDB bağlantı hatası:', error);
        process.exit(1);
    });

// Ana route
app.get('/', (req, res) => {
    res.json({ message: 'Subscription Tracker API\'ye Hoş Geldiniz' });
});

// Route'ları yapılandır
app.use('/api/auth', require('./routes/auth'));
app.use('/api/subscriptions', require('./routes/subscriptions'));
app.use('/api/notifications', require('./routes/notification'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Hata yakalama middleware'i
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Bir şeyler ters gitti!',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

// Sunucuyu başlat
const PORT = config.PORT;
app.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda çalışıyor`);
    
    // Bildirim scheduler'ını başlat (sadece production ortamında)
    if (process.env.NODE_ENV === 'production') {
        notificationScheduler.start();
    } else {
        console.log('Geliştirme ortamında bildirim scheduler\'ı otomatik başlatılmadı.');
    }
});

module.exports = app; 