# Medical Store Admin Panel

A comprehensive web-based Admin Panel for managing users, medicines, and orders for a Medical Store built using the MERN Stack (MongoDB, Express.js, React.js, Node.js).


Admin URL:
https://medical-dashboard-lemon.vercel.app/

Demo Video:
https://www.loom.com/share/72da875dd6d04a17827f090c8cd3617e


## 🚀 Features

### Authentication
- Admin Login with Email & Password
- JWT-based authentication
- Protected routes (Admin-only access)

### Dashboard
- Total Users, Medicines, Orders count
- Revenue statistics
- Low-stock medicine alerts
- Recent orders overview
- Charts for revenue and order status

### User Management
- View all registered users
- User details (Name, Profile Image, Email, Phone, Registration Date)
- Enable/Disable user functionality
- Search and filter users

### Medicine Management
- Add / View / Update / Delete medicines
- Image upload support
- Medicine details: Name, Image, Description, Manufacturer, MFG Date, Expiry Date, Quantity, Price
- Reviews display (rating & comment - read-only)
- Stock availability indicator
- Category filtering

### Order Management
- View all orders
- Order details: Order ID, Booking Date/Time, User Details, Ordered Medicines, Total Amount, Status
- Update order status (Pending / Processing / Shipped / Delivered / Cancelled)
- Search and filter orders

## 🛠️ Tech Stack

- **Frontend**: React.js (with Hooks & Context API)
- **Backend**: Node.js + Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Styling**: Custom CSS with CSS Variables
- **Charts**: Recharts

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with your configuration:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

4. Seed the database (optional):
```bash
npm run seed
```

5. Start the server:
```bash
npm run dev
```

The API will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

The app will be available at `https://medical-dashboard-lemon.vercel.app/`

## 🔐 Demo Credentials

After running the seed script, you can login with:
- **Email**: admin@medical.com
- **Password**: admin123

## 📁 Project Structure

```
medical_dashboard/
├── backend/
│   ├── config/          # Database & Cloudinary config
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Auth & upload middleware
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   ├── uploads/         # Uploaded files
│   ├── .env
│   ├── package.json
│   ├── seedData.js      # Database seeder
│   └── server.js        # Entry point
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/  # Reusable components
    │   ├── context/     # Auth context
    │   ├── pages/       # Page components
    │   ├── services/    # API services
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── .env
    ├── package.json
    └── vite.config.js
```

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register admin |
| POST | `/api/auth/login` | Admin login |
| GET | `/api/auth/profile` | Get profile |
| GET | `/api/auth/verify` | Verify token |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get all users |
| GET | `/api/users/:id` | Get user by ID |
| PATCH | `/api/users/:id/toggle` | Toggle user status |

### Medicines
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/medicines` | Get all medicines |
| GET | `/api/medicines/:id` | Get medicine by ID |
| POST | `/api/medicines` | Create medicine |
| PUT | `/api/medicines/:id` | Update medicine |
| DELETE | `/api/medicines/:id` | Delete medicine |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | Get all orders |
| GET | `/api/orders/:id` | Get order by ID |
| PATCH | `/api/orders/:id/status` | Update order status |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats` | Get statistics |
| GET | `/api/dashboard/low-stock` | Get low-stock items |
| GET | `/api/dashboard/expiring` | Get expiring items |

## 🎨 UI Features

- Dark theme with glassmorphism effects
- Responsive design for all screen sizes
- Animated stat cards
- Interactive data tables
- Modal dialogs for forms
- Toast notifications
- Charts and visualizations

## 📝 License

This project is licensed under the ISC License.
