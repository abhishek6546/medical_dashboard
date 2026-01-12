require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');
const User = require('./models/User');
const Medicine = require('./models/Medicine');
const Order = require('./models/Order');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

const seedData = async () => {
    try {
        await connectDB();

        // Clear existing data
        await Admin.deleteMany({});
        await User.deleteMany({});
        await Medicine.deleteMany({});
        await Order.deleteMany({});

        console.log('Data cleared');

        // Create admin
        const admin = await Admin.create({
            name: 'Admin User',
            email: 'admin@medical.com',
            password: 'admin123',
            role: 'admin'
        });
        console.log('Admin created:', admin.email);

        // Create users
        const users = await User.insertMany([
            {
                name: 'Rahul Sharma',
                email: 'rahul@example.com',
                phone: '+91 9876543210',
                profileImage: 'https://randomuser.me/api/portraits/men/1.jpg',
                address: {
                    street: '123 MG Road',
                    city: 'Mumbai',
                    state: 'Maharashtra',
                    zipCode: '400001',
                    country: 'India'
                },
                isActive: true
            },
            {
                name: 'Priya Patel',
                email: 'priya@example.com',
                phone: '+91 9876543211',
                profileImage: 'https://randomuser.me/api/portraits/women/2.jpg',
                address: {
                    street: '456 Brigade Road',
                    city: 'Bangalore',
                    state: 'Karnataka',
                    zipCode: '560001',
                    country: 'India'
                },
                isActive: true
            },
            {
                name: 'Amit Kumar',
                email: 'amit@example.com',
                phone: '+91 9876543212',
                profileImage: 'https://randomuser.me/api/portraits/men/3.jpg',
                address: {
                    street: '789 Park Street',
                    city: 'Kolkata',
                    state: 'West Bengal',
                    zipCode: '700016',
                    country: 'India'
                },
                isActive: true
            },
            {
                name: 'Sneha Gupta',
                email: 'sneha@example.com',
                phone: '+91 9876543213',
                profileImage: 'https://randomuser.me/api/portraits/women/4.jpg',
                address: {
                    street: '321 Connaught Place',
                    city: 'New Delhi',
                    state: 'Delhi',
                    zipCode: '110001',
                    country: 'India'
                },
                isActive: false
            },
            {
                name: 'Vikram Singh',
                email: 'vikram@example.com',
                phone: '+91 9876543214',
                profileImage: 'https://randomuser.me/api/portraits/men/5.jpg',
                address: {
                    street: '567 Anna Salai',
                    city: 'Chennai',
                    state: 'Tamil Nadu',
                    zipCode: '600002',
                    country: 'India'
                },
                isActive: true
            }
        ]);
        console.log('Users created:', users.length);

        // Create medicines
        const medicines = await Medicine.insertMany([
            {
                name: 'Paracetamol 500mg',
                description: 'Pain reliever and fever reducer. Used for headaches, muscle aches, and cold symptoms.',
                manufacturer: 'Cipla Ltd',
                manufacturingDate: new Date('2024-06-01'),
                expiryDate: new Date('2026-06-01'),
                quantity: 150,
                price: 25.00,
                category: 'Tablet',
                reviews: [
                    { userName: 'Rahul', rating: 5, comment: 'Very effective for fever' },
                    { userName: 'Priya', rating: 4, comment: 'Works well' }
                ]
            },
            {
                name: 'Amoxicillin 250mg',
                description: 'Antibiotic used to treat various bacterial infections.',
                manufacturer: 'Sun Pharma',
                manufacturingDate: new Date('2024-08-15'),
                expiryDate: new Date('2026-08-15'),
                quantity: 80,
                price: 120.00,
                category: 'Capsule',
                reviews: [
                    { userName: 'Amit', rating: 5, comment: 'Doctor recommended' }
                ]
            },
            {
                name: 'Cough Syrup',
                description: 'Provides relief from cough and cold symptoms. Sugar-free formula.',
                manufacturer: 'Dabur',
                manufacturingDate: new Date('2024-09-01'),
                expiryDate: new Date('2025-09-01'),
                quantity: 45,
                price: 85.00,
                category: 'Syrup',
                reviews: []
            },
            {
                name: 'Vitamin D3 Tablets',
                description: 'Dietary supplement for vitamin D deficiency. 60000 IU strength.',
                manufacturer: 'Abbott',
                manufacturingDate: new Date('2024-07-20'),
                expiryDate: new Date('2027-07-20'),
                quantity: 200,
                price: 180.00,
                category: 'Tablet',
                reviews: [
                    { userName: 'Sneha', rating: 4, comment: 'Good for bone health' }
                ]
            },
            {
                name: 'Insulin Injection',
                description: 'For diabetes management. Requires refrigeration.',
                manufacturer: 'Novo Nordisk',
                manufacturingDate: new Date('2024-10-01'),
                expiryDate: new Date('2025-04-01'),
                quantity: 8,
                price: 550.00,
                category: 'Injection',
                reviews: []
            },
            {
                name: 'Antacid Gel',
                description: 'Quick relief from acidity, heartburn, and indigestion.',
                manufacturer: 'GSK',
                manufacturingDate: new Date('2024-05-10'),
                expiryDate: new Date('2026-05-10'),
                quantity: 60,
                price: 95.00,
                category: 'Syrup',
                reviews: [
                    { userName: 'Vikram', rating: 5, comment: 'Instant relief!' }
                ]
            },
            {
                name: 'Antiseptic Cream',
                description: 'For minor cuts, burns, and skin infections. Contains silver sulfadiazine.',
                manufacturer: 'Dr. Reddy\'s',
                manufacturingDate: new Date('2024-04-01'),
                expiryDate: new Date('2026-04-01'),
                quantity: 35,
                price: 65.00,
                category: 'Cream',
                reviews: []
            },
            {
                name: 'Eye Drops',
                description: 'Lubricating eye drops for dry eyes. Preservative-free.',
                manufacturer: 'Alcon',
                manufacturingDate: new Date('2024-11-01'),
                expiryDate: new Date('2025-05-01'),
                quantity: 5,
                price: 120.00,
                category: 'Drops',
                reviews: [
                    { userName: 'Priya', rating: 4, comment: 'Very soothing' }
                ]
            },
            {
                name: 'Ibuprofen 400mg',
                description: 'Anti-inflammatory pain reliever. Use for headaches and body pain.',
                manufacturer: 'Mankind',
                manufacturingDate: new Date('2024-03-15'),
                expiryDate: new Date('2026-03-15'),
                quantity: 0,
                price: 35.00,
                category: 'Tablet',
                reviews: []
            },
            {
                name: 'Multivitamin Powder',
                description: 'Complete nutrition supplement with 23 essential vitamins and minerals.',
                manufacturer: 'Himalaya',
                manufacturingDate: new Date('2024-08-01'),
                expiryDate: new Date('2026-08-01'),
                quantity: 75,
                price: 320.00,
                category: 'Powder',
                reviews: [
                    { userName: 'Amit', rating: 5, comment: 'Great for daily health' },
                    { userName: 'Rahul', rating: 4, comment: 'Tastes good too' }
                ]
            }
        ]);
        console.log('Medicines created:', medicines.length);

        // Create orders with pre-generated IDs
        const ordersData = [
            {
                orderId: 'ORD000001',
                user: {
                    userId: users[0]._id,
                    name: users[0].name,
                    email: users[0].email,
                    phone: users[0].phone,
                    address: '123 MG Road, Mumbai, Maharashtra 400001, India'
                },
                medicines: [
                    { medicineId: medicines[0]._id, name: medicines[0].name, quantity: 2, price: medicines[0].price },
                    { medicineId: medicines[3]._id, name: medicines[3].name, quantity: 1, price: medicines[3].price }
                ],
                totalAmount: 230.00,
                status: 'Delivered',
                paymentMethod: 'Online',
                paymentStatus: 'Paid',
                bookingDate: new Date('2025-01-05'),
                deliveryDate: new Date('2025-01-08')
            },
            {
                orderId: 'ORD000002',
                user: {
                    userId: users[1]._id,
                    name: users[1].name,
                    email: users[1].email,
                    phone: users[1].phone,
                    address: '456 Brigade Road, Bangalore, Karnataka 560001, India'
                },
                medicines: [
                    { medicineId: medicines[1]._id, name: medicines[1].name, quantity: 1, price: medicines[1].price },
                    { medicineId: medicines[2]._id, name: medicines[2].name, quantity: 2, price: medicines[2].price }
                ],
                totalAmount: 290.00,
                status: 'Pending',
                paymentMethod: 'COD',
                paymentStatus: 'Pending',
                bookingDate: new Date('2025-01-10')
            },
            {
                orderId: 'ORD000003',
                user: {
                    userId: users[2]._id,
                    name: users[2].name,
                    email: users[2].email,
                    phone: users[2].phone,
                    address: '789 Park Street, Kolkata, West Bengal 700016, India'
                },
                medicines: [
                    { medicineId: medicines[4]._id, name: medicines[4].name, quantity: 3, price: medicines[4].price }
                ],
                totalAmount: 1650.00,
                status: 'Processing',
                paymentMethod: 'Card',
                paymentStatus: 'Paid',
                bookingDate: new Date('2025-01-11')
            },
            {
                orderId: 'ORD000004',
                user: {
                    userId: users[4]._id,
                    name: users[4].name,
                    email: users[4].email,
                    phone: users[4].phone,
                    address: '567 Anna Salai, Chennai, Tamil Nadu 600002, India'
                },
                medicines: [
                    { medicineId: medicines[5]._id, name: medicines[5].name, quantity: 1, price: medicines[5].price },
                    { medicineId: medicines[6]._id, name: medicines[6].name, quantity: 2, price: medicines[6].price },
                    { medicineId: medicines[9]._id, name: medicines[9].name, quantity: 1, price: medicines[9].price }
                ],
                totalAmount: 545.00,
                status: 'Shipped',
                paymentMethod: 'Online',
                paymentStatus: 'Paid',
                bookingDate: new Date('2025-01-09')
            },
            {
                orderId: 'ORD000005',
                user: {
                    userId: users[0]._id,
                    name: users[0].name,
                    email: users[0].email,
                    phone: users[0].phone,
                    address: '123 MG Road, Mumbai, Maharashtra 400001, India'
                },
                medicines: [
                    { medicineId: medicines[7]._id, name: medicines[7].name, quantity: 2, price: medicines[7].price }
                ],
                totalAmount: 240.00,
                status: 'Cancelled',
                paymentMethod: 'COD',
                paymentStatus: 'Pending',
                bookingDate: new Date('2025-01-02')
            }
        ];
        const orders = await Order.insertMany(ordersData);
        console.log('Orders created:', orders.length);

        console.log('\n✅ Seed data created successfully!');
        console.log('\n📝 Login credentials:');
        console.log('   Email: admin@medical.com');
        console.log('   Password: admin123');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
