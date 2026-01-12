const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    userName: String,
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const medicineSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Medicine name is required'],
        trim: true
    },
    image: {
        type: String,
        default: ''
    },
    description: {
        type: String,
        trim: true
    },
    manufacturer: {
        type: String,
        trim: true
    },
    manufacturingDate: {
        type: Date
    },
    expiryDate: {
        type: Date,
        required: [true, 'Expiry date is required']
    },
    quantity: {
        type: Number,
        required: [true, 'Quantity is required'],
        min: 0,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: 0
    },
    category: {
        type: String,
        enum: ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Cream', 'Drops', 'Powder', 'Other'],
        default: 'Other'
    },
    reviews: [reviewSchema]
}, {
    timestamps: true
});

// Virtual for average rating
medicineSchema.virtual('averageRating').get(function () {
    if (!this.reviews || this.reviews.length === 0) return 0;
    const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / this.reviews.length).toFixed(1);
});

// Virtual for stock status
medicineSchema.virtual('stockStatus').get(function () {
    if (this.quantity === 0) return 'Out of Stock';
    if (this.quantity <= 10) return 'Low Stock';
    return 'In Stock';
});

// Virtual to check if expired
medicineSchema.virtual('isExpired').get(function () {
    return new Date() > this.expiryDate;
});

medicineSchema.set('toJSON', { virtuals: true });
medicineSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Medicine', medicineSchema);
