const nodemailer = require('nodemailer');
const config = require('../config/config');

// Transporter oluştur
const transporter = nodemailer.createTransport({
    host: config.EMAIL_HOST,
    port: config.EMAIL_PORT,
    secure: config.EMAIL_SECURE, // true for 465, false for other ports
    auth: {
        user: config.EMAIL_USER,
        pass: config.EMAIL_PASSWORD
    }
});

// Hoş geldin e-postası
exports.sendWelcomeEmail = async (user) => {
    try {
        const info = await transporter.sendMail({
            from: `"${config.APP_NAME}" <${config.EMAIL_FROM}>`,
            to: user.email,
            subject: `${config.APP_NAME}'e Hoş Geldiniz!`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Merhaba ${user.name || 'Değerli Kullanıcımız'},</h2>
                    <p>${config.APP_NAME}'e hoş geldiniz! Dijital aboneliklerinizi yönetmek artık çok daha kolay olacak.</p>
                    <p>Hesabınızı başarıyla oluşturdunuz. Artık aboneliklerinizi ekleyebilir, düzenleyebilir ve yaklaşan ödemeler için hatırlatıcılar alabilirsiniz.</p>
                    <p>Başlamak için yapmanız gerekenler:</p>
                    <ol>
                        <li>İlk aboneliğinizi ekleyin</li>
                        <li>Ödeme tarihlerini ve tutarlarını belirtin</li>
                        <li>Hatırlatıcıları ayarlayın</li>
                    </ol>
                    <p>Herhangi bir sorunuz olursa, lütfen bizimle iletişime geçmekten çekinmeyin.</p>
                    <p>Saygılarımızla,<br>${config.APP_NAME} Ekibi</p>
                </div>
            `
        });

        console.log("Welcome email sent: %s", info.messageId);
        return true;
    } catch (error) {
        console.error("Error sending welcome email:", error);
        return false;
    }
};

// Şifre sıfırlama e-postası
exports.sendPasswordResetEmail = async (email, token) => {
    try {
        const resetUrl = `${config.FRONTEND_URL}/reset-password?token=${token}`;

        const info = await transporter.sendMail({
            from: `"${config.APP_NAME}" <${config.EMAIL_FROM}>`,
            to: email,
            subject: 'Şifre Sıfırlama İsteği',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Şifre Sıfırlama</h2>
                    <p>Şifrenizi sıfırlamak için bir istek aldık. Eğer bu isteği siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.</p>
                    <p>Şifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın:</p>
                    <p>
                        <a href="${resetUrl}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Şifremi Sıfırla</a>
                    </p>
                    <p>Bu bağlantı 1 saat sonra geçerliliğini yitirecektir.</p>
                    <p>İşlemi siz yapmadıysanız, lütfen bizimle iletişime geçin.</p>
                    <p>Saygılarımızla,<br>${config.APP_NAME} Ekibi</p>
                </div>
            `
        });

        console.log("Password reset email sent: %s", info.messageId);
        return true;
    } catch (error) {
        console.error("Error sending password reset email:", error);
        return false;
    }
};

// Abonelik hatırlatma e-postası
exports.sendSubscriptionReminderEmail = async (user, subscription) => {
    try {
        const paymentDate = new Date(subscription.nextPaymentDate).toLocaleDateString('tr-TR');
        
        const info = await transporter.sendMail({
            from: `"${config.APP_NAME}" <${config.EMAIL_FROM}>`,
            to: user.email,
            subject: `Yaklaşan Abonelik Ödemesi: ${subscription.name}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Abonelik Ödeme Hatırlatması</h2>
                    <p>Merhaba ${user.name || 'Değerli Kullanıcımız'},</p>
                    <p>Bu bir hatırlatmadır: <strong>${subscription.name}</strong> aboneliğinizin ödemesi <strong>${paymentDate}</strong> tarihinde gerçekleşecektir.</p>
                    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">Abonelik Detayları:</h3>
                        <p><strong>Servis:</strong> ${subscription.name}</p>
                        <p><strong>Tutar:</strong> ${subscription.amount} ${subscription.currency}</p>
                        <p><strong>Ödeme Tarihi:</strong> ${paymentDate}</p>
                        <p><strong>Kategori:</strong> ${subscription.category}</p>
                    </div>
                    <p>Aboneliğinizi görüntülemek veya düzenlemek için <a href="${config.FRONTEND_URL}/subscriptions/${subscription._id}">hesabınıza giriş yapın</a>.</p>
                    <p>Saygılarımızla,<br>${config.APP_NAME} Ekibi</p>
                </div>
            `
        });

        console.log("Subscription reminder email sent: %s", info.messageId);
        return true;
    } catch (error) {
        console.error("Error sending subscription reminder email:", error);
        return false;
    }
};

module.exports = exports; 