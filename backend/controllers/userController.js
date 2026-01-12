const User = require('../models/User');

// @desc    Get all users
// @route   GET /api/users
// @access  Private
const getUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const search = req.query.search || '';
        const status = req.query.status; // 'active', 'inactive', or undefined for all

        // Build query
        let query = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }

        if (status === 'active') {
            query.isActive = true;
        } else if (status === 'inactive') {
            query.isActive = false;
        }

        const total = await User.countDocuments(query);
        const users = await User.find(query)
            .sort({ registrationDate: -1 })
            .skip(skip)
            .limit(limit);

        res.json({
            users,
            page,
            pages: Math.ceil(total / limit),
            total
        });
    } catch (error) {
        console.error('Get Users Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Get User Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Toggle user active status
// @route   PATCH /api/users/:id/toggle
// @access  Private
const toggleUserStatus = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.isActive = !user.isActive;
        await user.save();

        res.json({
            message: `User ${user.isActive ? 'enabled' : 'disabled'} successfully`,
            user
        });
    } catch (error) {
        console.error('Toggle User Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Create a new user (for testing/seeding)
// @route   POST /api/users
// @access  Private
const createUser = async (req, res) => {
    try {
        const { name, email, phone, profileImage, address } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        const user = await User.create({
            name,
            email,
            phone,
            profileImage,
            address
        });

        res.status(201).json(user);
    } catch (error) {
        console.error('Create User Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private
const updateUser = async (req, res) => {
    try {
        const { name, email, phone, profileImage, address } = req.body;

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if email is being changed and if it already exists
        if (email && email !== user.email) {
            const emailExists = await User.findOne({ email });
            if (emailExists) {
                return res.status(400).json({ message: 'Email already in use' });
            }
        }

        user.name = name || user.name;
        user.email = email || user.email;
        user.phone = phone !== undefined ? phone : user.phone;
        user.profileImage = profileImage !== undefined ? profileImage : user.profileImage;
        if (address) {
            user.address = { ...user.address, ...address };
        }

        await user.save();
        res.json(user);
    } catch (error) {
        console.error('Update User Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { getUsers, getUserById, toggleUserStatus, createUser, updateUser };
