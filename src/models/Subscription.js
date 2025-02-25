const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    category: {
        type: String,
        required: true,
        enum: ['entertainment', 'productivity', 'utilities', 'other']
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    currency: {
        type: String,
        required: true,
        default: 'USD'
    },
    billingCycle: {
        type: String,
        required: true,
        enum: ['monthly', 'yearly', 'quarterly']
    },
    nextBillingDate: {
        type: Date,
        required: true
    },
    paymentMethod: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'cancelled', 'paused'],
        default: 'active'
    },
    autoRenewal: {
        type: Boolean,
        default: true
    },
    notificationSettings: {
        reminderDays: {
            type: Number,
            default: 3
        },
        email: {
            type: Boolean,
            default: true
        },
        sms: {
            type: Boolean,
            default: false
        }
    }
}, {
    timestamps: true
});

// İndeksler
subscriptionSchema.index({ userId: 1, nextBillingDate: 1 });
subscriptionSchema.index({ status: 1 });

const Subscription = mongoose.model('Subscription', subscriptionSchema);

module.exports = Subscription; 