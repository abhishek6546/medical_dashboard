const User = require('../models/User');
const Medicine = require('../models/Medicine');
const Order = require('../models/Order');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
const getStats = async (req, res) => {
    try {
        // Get counts
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ isActive: true });
        const totalMedicines = await Medicine.countDocuments();
        const totalOrders = await Order.countDocuments();

        // Get order stats by status
        const pendingOrders = await Order.countDocuments({ status: 'Pending' });
        const deliveredOrders = await Order.countDocuments({ status: 'Delivered' });
        const cancelledOrders = await Order.countDocuments({ status: 'Cancelled' });

        // Get total revenue (from delivered orders)
        const revenueResult = await Order.aggregate([
            { $match: { status: 'Delivered' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

        // Get low stock medicines count
        const lowStockCount = await Medicine.countDocuments({
            quantity: { $gt: 0, $lte: 10 }
        });
        const outOfStockCount = await Medicine.countDocuments({ quantity: 0 });

        // Get expired medicines count
        const expiredCount = await Medicine.countDocuments({
            expiryDate: { $lt: new Date() }
        });

        // Recent orders (last 5)
        const recentOrders = await Order.find()
            .sort({ bookingDate: -1 })
            .limit(5)
            .select('orderId user.name totalAmount status bookingDate');

        // Revenue by month (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlyRevenue = await Order.aggregate([
            {
                $match: {
                    status: 'Delivered',
                    bookingDate: { $gte: sixMonthsAgo }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$bookingDate' },
                        month: { $month: '$bookingDate' }
                    },
                    revenue: { $sum: '$totalAmount' },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        res.json({
            users: {
                total: totalUsers,
                active: activeUsers,
                inactive: totalUsers - activeUsers
            },
            medicines: {
                total: totalMedicines,
                lowStock: lowStockCount,
                outOfStock: outOfStockCount,
                expired: expiredCount
            },
            orders: {
                total: totalOrders,
                pending: pendingOrders,
                delivered: deliveredOrders,
                cancelled: cancelledOrders
            },
            revenue: {
                total: totalRevenue,
                monthly: monthlyRevenue
            },
            recentOrders
        });
    } catch (error) {
        console.error('Get Stats Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get low stock medicines
// @route   GET /api/dashboard/low-stock
// @access  Private
const getLowStockMedicines = async (req, res) => {
    try {
        const lowStockMedicines = await Medicine.find({
            quantity: { $lte: 10 }
        })
            .sort({ quantity: 1 })
            .limit(10)
            .select('name image quantity price expiryDate');

        res.json(lowStockMedicines);
    } catch (error) {
        console.error('Get Low Stock Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get expiring medicines
// @route   GET /api/dashboard/expiring
// @access  Private
const getExpiringMedicines = async (req, res) => {
    try {
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        const expiringMedicines = await Medicine.find({
            expiryDate: { $lte: thirtyDaysFromNow }
        })
            .sort({ expiryDate: 1 })
            .limit(10)
            .select('name image quantity price expiryDate');

        res.json(expiringMedicines);
    } catch (error) {
        console.error('Get Expiring Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { getStats, getLowStockMedicines, getExpiringMedicines };
