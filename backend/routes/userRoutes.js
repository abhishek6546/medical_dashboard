const express = require('express');
const router = express.Router();
const { getUsers, getUserById, toggleUserStatus, createUser, updateUser } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

// All routes are protected
router.use(protect);

router.route('/')
    .get(getUsers)
    .post(createUser);

// Upload profile image
router.post('/upload-image', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image file provided' });
        }
        res.json({
            url: req.file.path,
            message: 'Image uploaded successfully'
        });
    } catch (error) {
        console.error('Image Upload Error:', error);
        res.status(500).json({ message: 'Failed to upload image', error: error.message });
    }
});

router.route('/:id')
    .get(getUserById)
    .put(updateUser);

router.patch('/:id/toggle', toggleUserStatus);

module.exports = router;
