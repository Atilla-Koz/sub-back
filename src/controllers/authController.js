const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const emailService = require('../utils/emailService');

// Kullanıcı Kaydı
exports.register = async (req, res) => {
    try {
        const { email, password, name } = req.body;

        // Email kontrolü
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Bu email adresi zaten kullanımda.' });
        }

        const user = new User({
            email,
            password,
            name
        });

        const token = await user.generateAuthToken();
        await user.save();

        // Hoş geldin e-postası gönder
        await emailService.sendWelcomeEmail(user);

        res.status(201).json({ user, token });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Kullanıcı Girişi
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            throw new Error('Giriş başarısız.');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error('Giriş başarısız.');
        }

        const token = await user.generateAuthToken();
        res.json({ user, token });
    } catch (error) {
        res.status(400).json({ error: 'Giriş bilgileri hatalı.' });
    }
};

// Çıkış Yapma
exports.logout = async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter(token => token.token !== req.token);
        await req.user.save();
        res.json({ message: 'Başarıyla çıkış yapıldı.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Kullanıcı Profili
exports.getProfile = async (req, res) => {
    res.json(req.user);
};

// Şifre sıfırlama isteği
exports.requestPasswordReset = async (req, res) => {
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

// Şifre sıfırlama
exports.resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;

        // Hash tokeni
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        // Geçerli ve süresi dolmamış tokenı olan kullanıcıyı bul
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ error: 'Şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş.' });
        }

        // Şifreyi güncelle ve tokenları temizle
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        user.tokens = [];

        await user.save();

        res.json({ message: 'Şifreniz başarıyla sıfırlandı. Şimdi giriş yapabilirsiniz.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}; 