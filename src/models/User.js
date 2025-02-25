const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../config/config');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    googleId: {
        type: String,
        sparse: true
    },
    emailNotifications: {
        type: Boolean,
        default: true
    },
    smsNotifications: {
        type: Boolean,
        default: false
    },
    reminderDays: {
        type: [Number],
        default: [1, 3, 7] // 1, 3 ve 7 gün önceden hatırlatma
    },
    phoneNumber: {
        type: String,
        sparse: true
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    resetPasswordToken: {
        type: String
    },
    resetPasswordExpires: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Şifre hashleme middleware
userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 8);
    }
    next();
});

// Şifre doğrulama metodu
userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Auth token oluşturma
userSchema.methods.generateAuthToken = async function() {
    const token = jwt.sign({ _id: this._id.toString() }, config.JWT_SECRET, { expiresIn: '7d' });
    
    this.tokens = this.tokens || [];
    this.tokens.push({ token });
    await this.save();
    
    return token;
};

// Şifre sıfırlama tokeni oluşturma
userSchema.methods.generatePasswordResetToken = async function() {
    const resetToken = crypto.randomBytes(20).toString('hex');
    
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
        
    this.resetPasswordExpires = Date.now() + 3600000; // 1 saat geçerli
    
    return resetToken;
};

// JSON dönüştürürken hassas verileri çıkart
userSchema.methods.toJSON = function() {
    const userObject = this.toObject();
    
    delete userObject.password;
    delete userObject.tokens;
    delete userObject.resetPasswordToken;
    delete userObject.resetPasswordExpires;
    
    return userObject;
};

const User = mongoose.model('User', userSchema);

module.exports = User; 