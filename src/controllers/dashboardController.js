const Subscription = require('../models/Subscription');
const mongoose = require('mongoose');

// Dashboard özet verileri
exports.getDashboardSummary = async (req, res) => {
    try {
        const userId = req.user._id;
        const today = new Date();
        
        // Aktif abonelikler
        const activeSubscriptions = await Subscription.find({
            userId: userId,
            status: 'active'
        });
        
        // Yaklaşan ödemeler (30 gün içinde)
        const nextMonth = new Date(today);
        nextMonth.setDate(today.getDate() + 30);
        
        const upcomingPayments = await Subscription.find({
            userId: userId,
            status: 'active',
            nextBillingDate: {
                $gte: today,
                $lte: nextMonth
            }
        }).sort({ nextBillingDate: 1 });
        
        // Para birimine göre toplam aylık harcama
        const monthlyCostByCurrency = {};
        
        activeSubscriptions.forEach(subscription => {
            const { currency, amount, billingCycle } = subscription;
            
            // Aylık eşdeğer tutarı hesapla
            let monthlyEquivalent = amount;
            
            switch(billingCycle) {
                case 'weekly':
                    monthlyEquivalent = amount * 4.33; // Ortalama hafta sayısı
                    break;
                case 'yearly':
                    monthlyEquivalent = amount / 12;
                    break;
                case 'quarterly':
                    monthlyEquivalent = amount / 3;
                    break;
                case 'biannually':
                    monthlyEquivalent = amount / 6;
                    break;
                // monthly için değişiklik yok
            }
            
            if (!monthlyCostByCurrency[currency]) {
                monthlyCostByCurrency[currency] = 0;
            }
            
            monthlyCostByCurrency[currency] += monthlyEquivalent;
        });
        
        // Kategori dağılımı
        const categoryDistribution = await Subscription.aggregate([
            { $match: { userId: mongoose.Types.ObjectId(userId), status: 'active' } },
            { $group: {
                _id: '$category',
                count: { $sum: 1 },
                totalAmount: { $sum: '$amount' }
            }},
            { $sort: { count: -1 } }
        ]);
        
        // Ödeme yöntemi dağılımı
        const paymentMethodDistribution = await Subscription.aggregate([
            { $match: { userId: mongoose.Types.ObjectId(userId), status: 'active' } },
            { $group: {
                _id: '$paymentMethod',
                count: { $sum: 1 },
                totalAmount: { $sum: '$amount' }
            }},
            { $sort: { count: -1 } }
        ]);
        
        // Sonuçları döndür
        res.json({
            totalActiveSubscriptions: activeSubscriptions.length,
            monthlyCostByCurrency,
            upcomingPayments: upcomingPayments.map(payment => ({
                id: payment._id,
                name: payment.name,
                amount: payment.amount,
                currency: payment.currency,
                nextBillingDate: payment.nextBillingDate,
                daysLeft: Math.ceil((new Date(payment.nextBillingDate) - today) / (1000 * 60 * 60 * 24))
            })),
            categoryDistribution,
            paymentMethodDistribution,
            recentlyAdded: activeSubscriptions
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 5)
                .map(sub => ({
                    id: sub._id,
                    name: sub.name,
                    amount: sub.amount,
                    currency: sub.currency,
                    category: sub.category,
                    createdAt: sub.createdAt
                }))
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Abonelik istatistikleri
exports.getSubscriptionStats = async (req, res) => {
    try {
        const userId = req.user._id;
        
        // Abonelik sayısı zaman içinde (son 6 ay)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        
        const subscriptionsByMonth = await Subscription.aggregate([
            { $match: { 
                userId: mongoose.Types.ObjectId(userId),
                createdAt: { $gte: sixMonthsAgo }
            }},
            { $group: {
                _id: { 
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' }
                },
                count: { $sum: 1 }
            }},
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);
        
        // Abonelik durumu dağılımı
        const statusDistribution = await Subscription.aggregate([
            { $match: { userId: mongoose.Types.ObjectId(userId) } },
            { $group: {
                _id: '$status',
                count: { $sum: 1 }
            }}
        ]);
        
        // Faturalama döngüsü dağılımı
        const billingCycleDistribution = await Subscription.aggregate([
            { $match: { userId: mongoose.Types.ObjectId(userId), status: 'active' } },
            { $group: {
                _id: '$billingCycle',
                count: { $sum: 1 },
                totalAmount: { $sum: '$amount' }
            }}
        ]);
        
        res.json({
            subscriptionsByMonth: subscriptionsByMonth.map(item => ({
                year: item._id.year,
                month: item._id.month,
                count: item.count
            })),
            statusDistribution,
            billingCycleDistribution
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}; 