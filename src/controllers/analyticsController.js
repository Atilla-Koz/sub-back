const Subscription = require('../models/Subscription');
const mongoose = require('mongoose');

// Kullanıcının toplam abonelik harcamalarını hesapla
exports.getTotalSpending = async (req, res) => {
    try {
        const userId = req.user._id;

        // Aktif abonelikleri bul
        const subscriptions = await Subscription.find({ 
            userId: userId,
            status: 'active'
        });

        // Farklı para birimlerine göre toplam harcamaları hesapla
        const totalByCurrency = {};
        
        subscriptions.forEach(subscription => {
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
            
            if (!totalByCurrency[currency]) {
                totalByCurrency[currency] = {
                    monthly: 0,
                    yearly: 0,
                    subscriptionCount: 0
                };
            }
            
            totalByCurrency[currency].monthly += monthlyEquivalent;
            totalByCurrency[currency].yearly += monthlyEquivalent * 12;
            totalByCurrency[currency].subscriptionCount += 1;
        });
        
        res.json({
            totalSubscriptions: subscriptions.length,
            spending: totalByCurrency
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Kategori bazında harcama analizi
exports.getCategoryAnalysis = async (req, res) => {
    try {
        const userId = req.user._id;
        
        // Kategorilere göre gruplama ve toplam hesaplama
        const categoryAnalysis = await Subscription.aggregate([
            { $match: { userId: mongoose.Types.ObjectId(userId), status: 'active' } },
            { $group: {
                _id: '$category',
                totalAmount: { $sum: '$amount' },
                count: { $sum: 1 },
                subscriptions: { $push: { name: '$name', amount: '$amount', currency: '$currency' } }
            }},
            { $sort: { totalAmount: -1 } }
        ]);
        
        res.json(categoryAnalysis);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Aylık harcama tahmini
exports.getMonthlyForecast = async (req, res) => {
    try {
        const userId = req.user._id;
        const today = new Date();
        
        // Gelecek 6 ay için tahmin
        const months = 6;
        const forecast = [];
        
        for (let i = 0; i < months; i++) {
            const month = new Date(today);
            month.setMonth(month.getMonth() + i);
            const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
            const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);
            
            // Bu ay içinde ödemesi olan abonelikler
            const subscriptions = await Subscription.find({
                userId: userId,
                status: 'active',
                nextBillingDate: {
                    $gte: startOfMonth,
                    $lte: endOfMonth
                }
            });
            
            // Para birimine göre toplam
            const totalByCurrency = {};
            subscriptions.forEach(sub => {
                if (!totalByCurrency[sub.currency]) {
                    totalByCurrency[sub.currency] = 0;
                }
                totalByCurrency[sub.currency] += sub.amount;
            });
            
            forecast.push({
                month: `${month.getFullYear()}-${month.getMonth() + 1}`,
                monthName: month.toLocaleString('tr-TR', { month: 'long' }),
                totalByCurrency,
                subscriptions: subscriptions.map(sub => ({
                    id: sub._id,
                    name: sub.name,
                    amount: sub.amount,
                    currency: sub.currency,
                    billingDate: sub.nextBillingDate
                }))
            });
        }
        
        res.json(forecast);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Optimizasyon önerileri
exports.getOptimizationSuggestions = async (req, res) => {
    try {
        const userId = req.user._id;
        
        // Tüm aktif abonelikler
        const subscriptions = await Subscription.find({
            userId: userId,
            status: 'active'
        });
        
        const suggestions = [];
        
        // 1. Aynı kategoride birden fazla abonelik kontrolü
        const categoryCounts = {};
        subscriptions.forEach(sub => {
            if (!categoryCounts[sub.category]) {
                categoryCounts[sub.category] = [];
            }
            categoryCounts[sub.category].push(sub);
        });
        
        for (const [category, subs] of Object.entries(categoryCounts)) {
            if (subs.length > 1) {
                suggestions.push({
                    type: 'multiple_subscriptions',
                    category,
                    message: `${category} kategorisinde ${subs.length} adet aboneliğiniz var. Bunları birleştirmeyi veya bazılarını iptal etmeyi düşünebilirsiniz.`,
                    subscriptions: subs.map(sub => ({
                        id: sub._id,
                        name: sub.name,
                        amount: sub.amount,
                        currency: sub.currency
                    }))
                });
            }
        }
        
        // 2. Yüksek maliyetli abonelikler (kategori ortalamasının üzerinde olanlar)
        const categoryAverages = {};
        for (const [category, subs] of Object.entries(categoryCounts)) {
            const sameCurrency = subs.filter(sub => sub.currency === subs[0].currency);
            if (sameCurrency.length > 1) {
                const total = sameCurrency.reduce((sum, sub) => sum + sub.amount, 0);
                const average = total / sameCurrency.length;
                
                categoryAverages[category] = {
                    average,
                    currency: sameCurrency[0].currency
                };
                
                sameCurrency.forEach(sub => {
                    if (sub.amount > average * 1.5) { // %50 üzerinde olanlar
                        suggestions.push({
                            type: 'high_cost',
                            category,
                            message: `${sub.name} aboneliğiniz, ${category} kategorisindeki diğer aboneliklerinizden %${Math.round((sub.amount / average - 1) * 100)} daha pahalı. Daha uygun bir alternatif düşünebilirsiniz.`,
                            subscription: {
                                id: sub._id,
                                name: sub.name,
                                amount: sub.amount,
                                currency: sub.currency
                            },
                            average: {
                                amount: average,
                                currency: sub.currency
                            }
                        });
                    }
                });
            }
        }
        
        // 3. Uzun süredir kullanılmayan abonelikler
        // Bu özellik için kullanım verisi gerekiyor, şimdilik boş bırakıyoruz
        
        res.json({
            totalSubscriptions: subscriptions.length,
            totalSuggestions: suggestions.length,
            suggestions
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}; 