const express = require('express');
const router = express.Router();
const {
    getMedicines,
    getMedicineById,
    createMedicine,
    updateMedicine,
    deleteMedicine
} = require('../controllers/medicineController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// All routes are protected
router.use(protect);

router.route('/')
    .get(getMedicines)
    .post(upload.single('image'), createMedicine);

router.route('/:id')
    .get(getMedicineById)
    .put(upload.single('image'), updateMedicine)
    .delete(deleteMedicine);

module.exports = router;
