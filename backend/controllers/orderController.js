const Order = require('../models/Order');

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private
const getOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const search = req.query.search || '';
        const status = req.query.status; // 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'

        // Build query
        let query = {};

        if (search) {
            query.$or = [
                { orderId: { $regex: search, $options: 'i' } },
                { 'user.name': { $regex: search, $options: 'i' } },
                { 'user.email': { $regex: search, $options: 'i' } }
            ];
        }

        if (status) {
            query.status = status;
        }

        const total = await Order.countDocuments(query);
        const orders = await Order.find(query)
            .sort({ bookingDate: -1 })
            .skip(skip)
            .limit(limit);

        res.json({
            orders,
            page,
            pages: Math.ceil(total / limit),
            total
        });
    } catch (error) {
        console.error('Get Orders Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            res.json(order);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        console.error('Get Order Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update order status
// @route   PATCH /api/orders/:id/status
// @access  Private
const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        order.status = status;

        // Set delivery date if delivered
        if (status === 'Delivered') {
            order.deliveryDate = new Date();
            order.paymentStatus = 'Paid';
        }

        await order.save();

        res.json({
            message: `Order status updated to ${status}`,
            order
        });
    } catch (error) {
        console.error('Update Order Status Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Create new order (for testing/seeding)
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
    try {
        const { user, medicines, totalAmount, paymentMethod, notes } = req.body;

        const order = await Order.create({
            user,
            medicines,
            totalAmount,
            paymentMethod,
            notes
        });

        res.status(201).json(order);
    } catch (error) {
        console.error('Create Order Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { getOrders, getOrderById, updateOrderStatus, createOrder };
