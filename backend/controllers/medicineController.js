const Medicine = require('../models/Medicine');
const fs = require('fs');
const path = require('path');

// @desc    Get all medicines
// @route   GET /api/medicines
// @access  Private
const getMedicines = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const search = req.query.search || '';
        const category = req.query.category;
        const stockStatus = req.query.stockStatus; // 'inStock', 'lowStock', 'outOfStock'

        // Build query
        let query = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { manufacturer: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        if (category) {
            query.category = category;
        }

        if (stockStatus === 'outOfStock') {
            query.quantity = 0;
        } else if (stockStatus === 'lowStock') {
            query.quantity = { $gt: 0, $lte: 10 };
        } else if (stockStatus === 'inStock') {
            query.quantity = { $gt: 10 };
        }

        const total = await Medicine.countDocuments(query);
        const medicines = await Medicine.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.json({
            medicines,
            page,
            pages: Math.ceil(total / limit),
            total
        });
    } catch (error) {
        console.error('Get Medicines Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get medicine by ID
// @route   GET /api/medicines/:id
// @access  Private
const getMedicineById = async (req, res) => {
    try {
        const medicine = await Medicine.findById(req.params.id);

        if (medicine) {
            res.json(medicine);
        } else {
            res.status(404).json({ message: 'Medicine not found' });
        }
    } catch (error) {
        console.error('Get Medicine Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Create new medicine
// @route   POST /api/medicines
// @access  Private
const createMedicine = async (req, res) => {
    try {
        const {
            name,
            description,
            manufacturer,
            manufacturingDate,
            expiryDate,
            quantity,
            price,
            category
        } = req.body;

        let image = '';
        if (req.file) {
            image = `/uploads/${req.file.filename}`;
        }

        const medicine = await Medicine.create({
            name,
            image,
            description,
            manufacturer,
            manufacturingDate,
            expiryDate,
            quantity: parseInt(quantity),
            price: parseFloat(price),
            category
        });

        res.status(201).json(medicine);
    } catch (error) {
        console.error('Create Medicine Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update medicine
// @route   PUT /api/medicines/:id
// @access  Private
const updateMedicine = async (req, res) => {
    try {
        const medicine = await Medicine.findById(req.params.id);

        if (!medicine) {
            return res.status(404).json({ message: 'Medicine not found' });
        }

        const {
            name,
            description,
            manufacturer,
            manufacturingDate,
            expiryDate,
            quantity,
            price,
            category
        } = req.body;

        // Update fields
        medicine.name = name || medicine.name;
        medicine.description = description !== undefined ? description : medicine.description;
        medicine.manufacturer = manufacturer !== undefined ? manufacturer : medicine.manufacturer;
        medicine.manufacturingDate = manufacturingDate || medicine.manufacturingDate;
        medicine.expiryDate = expiryDate || medicine.expiryDate;
        medicine.quantity = quantity !== undefined ? parseInt(quantity) : medicine.quantity;
        medicine.price = price !== undefined ? parseFloat(price) : medicine.price;
        medicine.category = category || medicine.category;

        // Handle new image upload
        if (req.file) {
            // Delete old image if exists
            if (medicine.image && medicine.image.startsWith('/uploads/')) {
                const oldImagePath = path.join(__dirname, '..', medicine.image);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
            medicine.image = `/uploads/${req.file.filename}`;
        }

        const updatedMedicine = await medicine.save();
        res.json(updatedMedicine);
    } catch (error) {
        console.error('Update Medicine Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Delete medicine
// @route   DELETE /api/medicines/:id
// @access  Private
const deleteMedicine = async (req, res) => {
    try {
        const medicine = await Medicine.findById(req.params.id);

        if (!medicine) {
            return res.status(404).json({ message: 'Medicine not found' });
        }

        // Delete image if exists
        if (medicine.image && medicine.image.startsWith('/uploads/')) {
            const imagePath = path.join(__dirname, '..', medicine.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await Medicine.findByIdAndDelete(req.params.id);
        res.json({ message: 'Medicine deleted successfully' });
    } catch (error) {
        console.error('Delete Medicine Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { getMedicines, getMedicineById, createMedicine, updateMedicine, deleteMedicine };
