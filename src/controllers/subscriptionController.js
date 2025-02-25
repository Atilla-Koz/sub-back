const Subscription = require('../models/Subscription');

// Tüm abonelikleri getir
exports.getAllSubscriptions = async (req, res) => {
    try {
        const subscriptions = await Subscription.find({ userId: req.user._id });
        res.json(subscriptions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Tek bir abonelik getir
exports.getSubscription = async (req, res) => {
    try {
        const subscription = await Subscription.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!subscription) {
            return res.status(404).json({ error: 'Abonelik bulunamadı' });
        }

        res.json(subscription);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Yeni abonelik oluştur
exports.createSubscription = async (req, res) => {
    try {
        const subscription = new Subscription({
            ...req.body,
            userId: req.user._id
        });

        await subscription.save();
        res.status(201).json(subscription);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Abonelik güncelle
exports.updateSubscription = async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = [
        'name', 'description', 'category', 'amount', 'currency',
        'billingCycle', 'nextBillingDate', 'paymentMethod', 'status',
        'autoRenewal', 'notificationSettings'
    ];
    
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));
    
    if (!isValidOperation) {
        return res.status(400).json({ error: 'Geçersiz güncelleme alanları' });
    }
    
    try {
        const subscription = await Subscription.findOne({
            _id: req.params.id,
            userId: req.user._id
        });
        
        if (!subscription) {
            return res.status(404).json({ error: 'Abonelik bulunamadı' });
        }
        
        updates.forEach(update => subscription[update] = req.body[update]);
        await subscription.save();
        
        res.json(subscription);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Abonelik sil
exports.deleteSubscription = async (req, res) => {
    try {
        const subscription = await Subscription.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id
        });
        
        if (!subscription) {
            return res.status(404).json({ error: 'Abonelik bulunamadı' });
        }
        
        res.json({ message: 'Abonelik başarıyla silindi' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Kategoriye göre abonelikleri getir
exports.getSubscriptionsByCategory = async (req, res) => {
    try {
        const subscriptions = await Subscription.find({
            userId: req.user._id,
            category: req.params.category
        });
        
        res.json(subscriptions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Yaklaşan ödemeleri getir
exports.getUpcomingPayments = async (req, res) => {
    try {
        const today = new Date();
        const thirtyDaysLater = new Date();
        thirtyDaysLater.setDate(today.getDate() + 30);
        
        const subscriptions = await Subscription.find({
            userId: req.user._id,
            nextBillingDate: { $gte: today, $lte: thirtyDaysLater },
            status: 'active'
        }).sort({ nextBillingDate: 1 });
        
        res.json(subscriptions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}; 