import { useState, useEffect } from 'react';
import {
    FiSearch,
    FiShoppingCart,
    FiUser,
    FiPackage,
    FiCalendar,
    FiMapPin,
    FiMail,
    FiPhone,
    FiEye
} from 'react-icons/fi';
import { orderService } from '../services/orderService';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import './Orders.css';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    const statuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

    useEffect(() => {
        fetchOrders();
    }, [page, statusFilter]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(1);
            fetchOrders();
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const data = await orderService.getOrders(page, 10, search, statusFilter);
            setOrders(data.orders);
            setTotalPages(data.pages);
        } catch (error) {
            toast.error('Failed to load orders');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await orderService.updateOrderStatus(orderId, newStatus);
            toast.success(`Order status updated to ${newStatus}`);
            fetchOrders();
            if (selectedOrder && selectedOrder._id === orderId) {
                setSelectedOrder(prev => ({ ...prev, status: newStatus }));
            }
        } catch (error) {
            toast.error('Failed to update order status');
        }
    };

    const viewOrderDetails = (order) => {
        setSelectedOrder(order);
        setShowDetailModal(true);
    };

    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusClass = (status) => {
        const statusMap = {
            'Pending': 'status-pending',
            'Processing': 'status-processing',
            'Shipped': 'status-shipped',
            'Delivered': 'status-delivered',
            'Cancelled': 'status-cancelled'
        };
        return statusMap[status] || 'status-pending';
    };

    return (
        <div className="page-content">
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Orders</h1>
                    <p className="page-subtitle">Manage customer orders</p>
                </div>
            </div>

            {/* Filters */}
            <div className="filters-bar">
                <div className="search-input">
                    <FiSearch className="search-input-icon" />
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Search by order ID, customer name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <select
                    className="form-select filter-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="">All Status</option>
                    {statuses.map(status => (
                        <option key={status} value={status}>{status}</option>
                    ))}
                </select>
            </div>

            {/* Orders Table */}
            {loading ? (
                <LoadingSpinner size="lg" text="Loading orders..." />
            ) : (
                <>
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Customer</th>
                                    <th>Items</th>
                                    <th>Total</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.length > 0 ? (
                                    orders.map((order) => (
                                        <tr key={order._id}>
                                            <td>
                                                <span className="order-id-cell">{order.orderId}</span>
                                            </td>
                                            <td>
                                                <div className="customer-cell">
                                                    <span className="customer-name">{order.user?.name}</span>
                                                    <span className="customer-email">{order.user?.email}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="items-count">
                                                    {order.medicines?.length || 0} items
                                                </span>
                                            </td>
                                            <td>
                                                <span className="total-amount">₹{order.totalAmount}</span>
                                            </td>
                                            <td>
                                                <span className="order-date">{formatDate(order.bookingDate)}</span>
                                            </td>
                                            <td>
                                                <select
                                                    className={`status-select ${getStatusClass(order.status)}`}
                                                    value={order.status}
                                                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                                >
                                                    {statuses.map(status => (
                                                        <option key={status} value={status}>{status}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td>
                                                <button
                                                    className="btn btn-ghost btn-icon"
                                                    onClick={() => viewOrderDetails(order)}
                                                    title="View Details"
                                                >
                                                    <FiEye />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7">
                                            <div className="empty-state">
                                                <FiShoppingCart className="empty-state-icon" />
                                                <h3 className="empty-state-title">No orders found</h3>
                                                <p className="empty-state-text">Try adjusting your search or filter</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="pagination">
                            <button
                                className="pagination-btn"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                            >
                                ←
                            </button>
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i + 1}
                                    className={`pagination-btn ${page === i + 1 ? 'active' : ''}`}
                                    onClick={() => setPage(i + 1)}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                className="pagination-btn"
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                            >
                                →
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Order Details Modal */}
            <Modal
                isOpen={showDetailModal}
                onClose={() => setShowDetailModal(false)}
                title="Order Details"
                size="lg"
            >
                {selectedOrder && (
                    <div className="order-details">
                        {/* Order Header */}
                        <div className="order-details-header">
                            <div className="order-id-lg">{selectedOrder.orderId}</div>
                            <span className={`badge ${getStatusClass(selectedOrder.status)}`}>
                                {selectedOrder.status}
                            </span>
                        </div>

                        {/* Order Info Grid */}
                        <div className="order-info-grid">
                            <div className="order-info-section">
                                <h4><FiCalendar /> Order Information</h4>
                                <div className="info-list">
                                    <div className="info-item">
                                        <span className="info-label">Booking Date</span>
                                        <span className="info-value">{formatDate(selectedOrder.bookingDate)}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Payment Method</span>
                                        <span className="info-value">{selectedOrder.paymentMethod}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Payment Status</span>
                                        <span className={`badge ${selectedOrder.paymentStatus === 'Paid' ? 'badge-success' : 'badge-warning'}`}>
                                            {selectedOrder.paymentStatus}
                                        </span>
                                    </div>
                                    {selectedOrder.deliveryDate && (
                                        <div className="info-item">
                                            <span className="info-label">Delivery Date</span>
                                            <span className="info-value">{formatDate(selectedOrder.deliveryDate)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="order-info-section">
                                <h4><FiUser /> Customer Details</h4>
                                <div className="info-list">
                                    <div className="info-item">
                                        <FiUser className="info-icon" />
                                        <span className="info-value">{selectedOrder.user?.name}</span>
                                    </div>
                                    <div className="info-item">
                                        <FiMail className="info-icon" />
                                        <span className="info-value">{selectedOrder.user?.email}</span>
                                    </div>
                                    {selectedOrder.user?.phone && (
                                        <div className="info-item">
                                            <FiPhone className="info-icon" />
                                            <span className="info-value">{selectedOrder.user.phone}</span>
                                        </div>
                                    )}
                                    <div className="info-item">
                                        <FiMapPin className="info-icon" />
                                        <span className="info-value">{selectedOrder.user?.address}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Ordered Items */}
                        <div className="order-items-section">
                            <h4><FiPackage /> Ordered Items</h4>
                            <div className="ordered-items-list">
                                {selectedOrder.medicines?.map((item, index) => (
                                    <div key={index} className="ordered-item">
                                        <div className="ordered-item-info">
                                            <span className="ordered-item-name">{item.name}</span>
                                            <span className="ordered-item-qty">Qty: {item.quantity}</span>
                                        </div>
                                        <span className="ordered-item-price">₹{item.price * item.quantity}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="order-total">
                                <span>Total Amount</span>
                                <span className="total-value">₹{selectedOrder.totalAmount}</span>
                            </div>
                        </div>

                        {/* Update Status */}
                        <div className="order-status-update">
                            <h4>Update Status</h4>
                            <div className="status-buttons">
                                {statuses.map(status => (
                                    <button
                                        key={status}
                                        className={`btn btn-sm ${selectedOrder.status === status ? 'btn-primary' : 'btn-outline'}`}
                                        onClick={() => handleStatusChange(selectedOrder._id, status)}
                                        disabled={selectedOrder.status === status}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Orders;
