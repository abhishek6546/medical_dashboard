const express = require('express');
const router = express.Router();
const { getStats, getLowStockMedicines, getExpiringMedicines } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.get('/stats', getStats);
router.get('/low-stock', getLowStockMedicines);
router.get('/expiring', getExpiringMedicines);

module.exports = router;
