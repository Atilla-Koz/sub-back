# Product Requirements Document (PRD) for Subscription Tracker

## **Proje Durumu**
**Son Güncelleme:** 28 Şubat 2024
**Durum:** Geliştirme Aşamasında 🚧

## **Proje Altyapısı (Tamamlanan)** ✅
- Express.js tabanlı API sunucusu kurulumu
- MongoDB Atlas bağlantısı
- Temel proje yapısı ve dizinleri
- Gerekli npm paketlerinin kurulumu
- Ortam değişkenleri yapılandırması
- Model şemalarının oluşturulması (User ve Subscription)
- Authentication sistemi (JWT)
- Subscription CRUD işlemleri

## **Project Overview**
**Subscription Tracker** is a web-based application designed to help users manage their digital subscriptions efficiently. The backend is built using **Node.js (Express.js) and MongoDB** and provides RESTful APIs for user authentication, subscription management, and notification services. The system allows users to add, edit, and delete subscriptions while receiving reminders for upcoming payments.

## **Problem Statement**
Many users subscribe to multiple digital services (Netflix, Spotify, Amazon Prime, etc.) but struggle to track their payment dates and avoid unnecessary charges. The lack of an effective reminder system leads to financial waste. Subscription Tracker aims to solve this problem by providing a **centralized subscription management system with timely reminders**.

## **Target Audience**
- Individuals with multiple digital subscriptions.
- Small businesses managing SaaS subscriptions.
- Budget-conscious users who want to monitor their expenses.

## **Key Features & Progress**

### **1. User Authentication & Management**
- [x] User ve Subscription modellerinin oluşturulması
- [x] Kullanıcı kaydı ve girişi (JWT tabanlı)
- [ ] Google OAuth entegrasyonu
- [ ] Şifre sıfırlama işlevi 🚧

### **2. Subscription Management**
- [x] Subscription model yapısı
- [x] Abonelik ekleme/düzenleme/silme API'leri
- [x] Farklı faturalama döngüleri desteği
- [x] Abonelik kategorilendirme
- [ ] Ödeme yöntemi takibi

### **3. Payment Reminders & Notifications**
- [ ] Otomatik e-posta bildirimleri 🚧
- [ ] SMS bildirimleri (Twilio API ile)
- [ ] Google Takvim entegrasyonu
- [ ] Kullanılmayan abonelikler için AI tabanlı öneriler

### **4. Dashboard & Reports**
- [ ] Aboneliklerin görsel özeti
- [ ] Harcama trendleri analizi
- [ ] Bütçe optimizasyon önerileri

## **Technology Stack**
- **Backend:** ✅ Node.js (Express.js), ✅ MongoDB, ✅ Mongoose
- **Frontend:** React (Next.js)
- **Authentication:** ✅ JWT, ✅ bcryptjs
- **Notifications:** 🚧 Nodemailer (email), 🚧 Twilio (SMS)
- **Cloud Hosting:** ✅ MongoDB Atlas

## **Revenue Model**
- **Freemium model:** Free version with limited features, premium for advanced analytics & unlimited reminders.
- **Affiliate partnerships:** Earn commissions for recommending budget-friendly alternatives.
- **Ad-supported model:** Monetization through non-intrusive ads.

## **Milestones & Timeline**
1. **MVP Development (4-6 Weeks)**
   - Backend API development ✅
   - Subscription CRUD operations ✅
   - Basic authentication system ✅

2. **Beta Testing (2 Weeks)**
   - Invite early adopters
   - Gather feedback & refine features

3. **Full Release (2-3 Months)**
   - Advanced analytics & reporting
   - Calendar & third-party integrations

## **Yapılacak İşler Öncelik Sırası**
1. **Authentication Sistemi** ✅
   - JWT middleware oluşturma ✅
   - Register/Login API'leri ✅
   - Password reset sistemi 🚧

2. **Subscription Yönetimi** ✅
   - CRUD operasyonları ✅
   - Filtreleme ve sıralama ✅
   - Kategorilendirme sistemi ✅

3. **Bildirim Sistemi** 🚧
   - Email servisi kurulumu 🚧
   - Hatırlatma mantığı
   - Bildirim tercihleri yönetimi

4. **Raporlama ve Analitik**
   - Dashboard verileri
   - Harcama analizleri
   - Optimizasyon önerileri

## **Success Metrics**
✅ Aktif kullanıcı tutma oranı
✅ Kaçırılan ödemelerde azalma
✅ Bildirim etkileşim oranı

🚀 **Mevcut Durum:** Authentication sistemi ve Subscription CRUD işlemleri tamamlandı, bildirim sistemine geçiliyor.

🚀 **Next Steps:** Bildirim sisteminin kurulması (email servisi), şifre sıfırlama işlevinin eklenmesi.

