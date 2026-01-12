import { useState, useEffect } from 'react';
import {
    FiUsers,
    FiPackage,
    FiShoppingCart,
    FiDollarSign,
    FiAlertTriangle,
    FiTrendingUp,
    FiClock
} from 'react-icons/fi';
import { dashboardService } from '../services/dashboardService';
import { medicineService } from '../services/medicineService';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import './Dashboard.css';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [lowStock, setLowStock] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [statsData, lowStockData] = await Promise.all([
                dashboardService.getStats(),
                dashboardService.getLowStockMedicines()
            ]);
            setStats(statsData);
            setLowStock(lowStockData);
        } catch (error) {
            toast.error('Failed to load dashboard data');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="page-content">
                <LoadingSpinner size="lg" text="Loading dashboard..." />
            </div>
        );
    }

    const orderStatusData = stats ? [
        { name: 'Pending', value: stats.orders.pending, color: '#f59e0b' },
        { name: 'Delivered', value: stats.orders.delivered, color: '#22c55e' },
        { name: 'Cancelled', value: stats.orders.cancelled, color: '#ef4444' }
    ] : [];

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const revenueChartData = stats?.revenue.monthly.map(item => ({
        month: monthNames[item._id.month - 1],
        revenue: item.revenue,
        orders: item.orders
    })) || [];

    return (
        <div className="page-content">
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Dashboard</h1>
                    <p className="page-subtitle">Welcome back! Here's what's happening with your store.</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-card-icon blue">
                        <FiUsers />
                    </div>
                    <div className="stat-card-value">{stats?.users.total || 0}</div>
                    <div className="stat-card-label">Total Users</div>
                    <div className="stat-card-meta">
                        <span className="text-success">{stats?.users.active || 0} active</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-icon green">
                        <FiPackage />
                    </div>
                    <div className="stat-card-value">{stats?.medicines.total || 0}</div>
                    <div className="stat-card-label">Total Medicines</div>
                    <div className="stat-card-meta">
                        <span className="text-warning">{stats?.medicines.lowStock || 0} low stock</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-icon purple">
                        <FiShoppingCart />
                    </div>
                    <div className="stat-card-value">{stats?.orders.total || 0}</div>
                    <div className="stat-card-label">Total Orders</div>
                    <div className="stat-card-meta">
                        <span className="text-info">{stats?.orders.pending || 0} pending</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-icon orange">
                        <FiDollarSign />
                    </div>
                    <div className="stat-card-value">₹{(stats?.revenue.total || 0).toLocaleString()}</div>
                    <div className="stat-card-label">Total Revenue</div>
                    <div className="stat-card-meta">
                        <FiTrendingUp className="text-success" />
                        <span className="text-success">From delivered orders</span>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="dashboard-row">
                {/* Revenue Chart */}
                <div className="card chart-card">
                    <div className="card-header">
                        <h3 className="card-title">Revenue Overview</h3>
                    </div>
                    <div className="chart-container">
                        {revenueChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={revenueChartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                                    <XAxis dataKey="month" stroke="#64748b" />
                                    <YAxis stroke="#64748b" />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#1e293b',
                                            border: '1px solid rgba(148, 163, 184, 0.2)',
                                            borderRadius: '8px'
                                        }}
                                        labelStyle={{ color: '#f8fafc' }}
                                    />
                                    <Bar dataKey="revenue" fill="url(#colorRevenue)" radius={[4, 4, 0, 0]} />
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#0ea5e9" />
                                            <stop offset="100%" stopColor="#10b981" />
                                        </linearGradient>
                                    </defs>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="empty-state">
                                <p className="empty-state-text">No revenue data available</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Order Status Pie Chart */}
                <div className="card chart-card chart-card-sm">
                    <div className="card-header">
                        <h3 className="card-title">Order Status</h3>
                    </div>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={orderStatusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {orderStatusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1e293b',
                                        border: '1px solid rgba(148, 163, 184, 0.2)',
                                        borderRadius: '8px'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="chart-legend">
                            {orderStatusData.map((item, index) => (
                                <div key={index} className="legend-item">
                                    <span className="legend-dot" style={{ backgroundColor: item.color }}></span>
                                    <span className="legend-label">{item.name}</span>
                                    <span className="legend-value">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="dashboard-row">
                {/* Low Stock Alert */}
                <div className="card alert-card">
                    <div className="card-header">
                        <h3 className="card-title">
                            <FiAlertTriangle className="title-icon warning" />
                            Low Stock Alert
                        </h3>
                    </div>
                    <div className="alert-list">
                        {lowStock.length > 0 ? (
                            lowStock.map((medicine) => (
                                <div key={medicine._id} className="alert-item">
                                    <div className="alert-item-image">
                                        {medicine.image ? (
                                            <img
                                                src={medicineService.getImageUrl(medicine.image)}
                                                alt={medicine.name}
                                            />
                                        ) : (
                                            <FiPackage />
                                        )}
                                    </div>
                                    <div className="alert-item-info">
                                        <span className="alert-item-name">{medicine.name}</span>
                                        <span className="alert-item-price">₹{medicine.price}</span>
                                    </div>
                                    <div className={`alert-item-qty ${medicine.quantity === 0 ? 'out' : 'low'}`}>
                                        {medicine.quantity === 0 ? 'Out of Stock' : `${medicine.quantity} left`}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-state">
                                <p className="empty-state-text">All medicines are well stocked!</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">
                            <FiClock className="title-icon" />
                            Recent Orders
                        </h3>
                    </div>
                    <div className="recent-orders">
                        {stats?.recentOrders?.length > 0 ? (
                            stats.recentOrders.map((order) => (
                                <div key={order._id} className="order-item">
                                    <div className="order-item-info">
                                        <span className="order-id">{order.orderId}</span>
                                        <span className="order-customer">{order.user?.name}</span>
                                    </div>
                                    <div className="order-item-right">
                                        <span className="order-amount">₹{order.totalAmount}</span>
                                        <span className={`badge status-${order.status.toLowerCase()}`}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-state">
                                <p className="empty-state-text">No recent orders</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
