const express = require('express');
const router = express.Router();
const { registerAdmin, loginAdmin, getProfile, verifyToken } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/register', registerAdmin);
router.post('/login', loginAdmin);

// Protected routes
router.get('/profile', protect, getProfile);
router.get('/verify', protect, verifyToken);

module.exports = router;
