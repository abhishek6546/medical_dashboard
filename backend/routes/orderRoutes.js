const express = require('express');
const router = express.Router();
const { getOrders, getOrderById, updateOrderStatus, createOrder } = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.route('/')
    .get(getOrders)
    .post(createOrder);

router.route('/:id')
    .get(getOrderById);

router.patch('/:id/status', updateOrderStatus);

module.exports = router;
