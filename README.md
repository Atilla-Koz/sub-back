# Subscription Tracker API

Subscription Tracker, kullanıcıların dijital aboneliklerini takip etmelerine, ödeme tarihlerini hatırlamalarına ve abonelik harcamalarını analiz etmelerine yardımcı olan bir web uygulamasıdır.

## 🚀 Özellikler

- **Kullanıcı Yönetimi**: Kayıt, giriş ve şifre sıfırlama
- **Abonelik Yönetimi**: Abonelikleri ekleme, düzenleme, silme ve listeleme
- **Bildirim Sistemi**: Yaklaşan ödemeler için e-posta bildirimleri
- **Analitik ve Raporlama**: Harcama analizleri ve optimizasyon önerileri
- **Dashboard**: Abonelik özeti ve finansal görünüm

## 🛠️ Teknolojiler

- **Backend**: Node.js, Express.js
- **Veritabanı**: MongoDB, Mongoose
- **Authentication**: JWT
- **Bildirimler**: Nodemailer
- **Zamanlanmış Görevler**: node-cron

## 📋 Gereksinimler

- Node.js (v14 veya üzeri)
- MongoDB (yerel veya Atlas)
- npm veya yarn

## 🔧 Kurulum

1. Repoyu klonlayın:
   ```bash
   git clone https://github.com/kullanici-adi/subscription-tracker.git
   cd subscription-tracker
   ```

2. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```

3. `.env` dosyasını oluşturun:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/subscription-tracker
   JWT_SECRET=your-secret-key
   NODE_ENV=development

   # Uygulama Ayarları
   APP_NAME=Subscription Tracker
   API_BASE_URL=http://localhost:3000
   FRONTEND_URL=http://localhost:3001
   ADMIN_API_KEY=admin-api-key-for-cron-jobs

   # Email ayarları
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-email-password
   EMAIL_FROM=noreply@subscriptiontracker.com
   ```

4. Uygulamayı başlatın:
   ```bash
   # Geliştirme modu
   npm run dev

   # Üretim modu
   npm start
   ```

## 📚 API Dokümantasyonu

### Authentication API'leri

#### Kullanıcı Kaydı
- **Endpoint**: `POST /api/auth/register`
- **Body**:
  ```json
  {
    "name": "Kullanıcı Adı",
    "email": "kullanici@example.com",
    "password": "sifre123"
  }
  ```

#### Kullanıcı Girişi
- **Endpoint**: `POST /api/auth/login`
- **Body**:
  ```json
  {
    "email": "kullanici@example.com",
    "password": "sifre123"
  }
  ```

#### Şifre Sıfırlama İsteği
- **Endpoint**: `POST /api/auth/forgot-password`
- **Body**:
  ```json
  {
    "email": "kullanici@example.com"
  }
  ```

### Subscription API'leri

#### Abonelik Ekleme
- **Endpoint**: `POST /api/subscriptions`
- **Headers**: `Authorization: Bearer {token}`
- **Body**:
  ```json
  {
    "name": "Netflix",
    "amount": 99.90,
    "currency": "TRY",
    "billingCycle": "monthly",
    "category": "entertainment",
    "nextPaymentDate": "2023-03-25",
    "nextBillingDate": "2023-03-25",
    "paymentMethod": "credit_card",
    "description": "Netflix Premium aboneliği"
  }
  ```

#### Abonelikleri Listeleme
- **Endpoint**: `GET /api/subscriptions`
- **Headers**: `Authorization: Bearer {token}`

### Dashboard API'leri

#### Dashboard Özeti
- **Endpoint**: `GET /api/dashboard/summary`
- **Headers**: `Authorization: Bearer {token}`

### Analitik API'leri

#### Toplam Harcama Analizi
- **Endpoint**: `GET /api/analytics/total-spending`
- **Headers**: `Authorization: Bearer {token}`

#### Optimizasyon Önerileri
- **Endpoint**: `GET /api/analytics/optimization-suggestions`
- **Headers**: `Authorization: Bearer {token}`

## 📊 Veritabanı Şeması

### User Model
- `name`: Kullanıcı adı
- `email`: E-posta adresi (benzersiz)
- `password`: Şifrelenmiş parola
- `emailNotifications`: E-posta bildirimleri aktif mi?
- `smsNotifications`: SMS bildirimleri aktif mi?
- `reminderDays`: Hatırlatıcı günleri (ödeme tarihinden önce)
- `tokens`: JWT token'ları
- `resetPasswordToken`: Şifre sıfırlama token'ı
- `resetPasswordExpires`: Şifre sıfırlama token'ının son kullanma tarihi

### Subscription Model
- `userId`: Kullanıcı ID'si
- `name`: Abonelik adı
- `description`: Açıklama
- `category`: Kategori (entertainment, productivity, vb.)
- `amount`: Tutar
- `currency`: Para birimi
- `billingCycle`: Faturalama döngüsü (weekly, monthly, yearly, vb.)
- `nextBillingDate`: Bir sonraki fatura tarihi
- `paymentMethod`: Ödeme yöntemi
- `status`: Durum (active, cancelled, paused)
- `autoRenewal`: Otomatik yenileme aktif mi?
- `notificationSettings`: Bildirim ayarları

## 🤝 Katkıda Bulunma

1. Bu repoyu fork edin
2. Yeni bir branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📝 Lisans

Bu proje [MIT](LICENSE) lisansı altında lisanslanmıştır.

## 📞 İletişim

Proje Sahibi - [email@example.com](mailto:email@example.com)

Proje Linki: [https://github.com/kullanici-adi/subscription-tracker](https://github.com/kullanici-adi/subscription-tracker) 