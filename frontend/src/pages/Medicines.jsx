import { useState, useEffect } from 'react';
import {
    FiSearch,
    FiPlus,
    FiEdit2,
    FiTrash2,
    FiPackage,
    FiEye,
    FiStar,
    FiAlertCircle
} from 'react-icons/fi';
import { medicineService } from '../services/medicineService';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import './Medicines.css';

const Medicines = () => {
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [categoryFilter, setCategoryFilter] = useState('');
    const [stockFilter, setStockFilter] = useState('');

    // Modal states
    const [showFormModal, setShowFormModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedMedicine, setSelectedMedicine] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        manufacturer: '',
        manufacturingDate: '',
        expiryDate: '',
        quantity: '',
        price: '',
        category: 'Tablet'
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [formLoading, setFormLoading] = useState(false);

    const categories = ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Cream', 'Drops', 'Powder', 'Other'];

    useEffect(() => {
        fetchMedicines();
    }, [page, categoryFilter, stockFilter]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(1);
            fetchMedicines();
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const fetchMedicines = async () => {
        try {
            setLoading(true);
            const data = await medicineService.getMedicines(page, 10, search, categoryFilter, stockFilter);
            setMedicines(data.medicines);
            setTotalPages(data.pages);
        } catch (error) {
            toast.error('Failed to load medicines');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            manufacturer: '',
            manufacturingDate: '',
            expiryDate: '',
            quantity: '',
            price: '',
            category: 'Tablet'
        });
        setImageFile(null);
        setImagePreview('');
        setIsEditing(false);
        setSelectedMedicine(null);
    };

    const openAddModal = () => {
        resetForm();
        setShowFormModal(true);
    };

    const openEditModal = (medicine) => {
        setSelectedMedicine(medicine);
        setIsEditing(true);
        setFormData({
            name: medicine.name,
            description: medicine.description || '',
            manufacturer: medicine.manufacturer || '',
            manufacturingDate: medicine.manufacturingDate ? medicine.manufacturingDate.split('T')[0] : '',
            expiryDate: medicine.expiryDate ? medicine.expiryDate.split('T')[0] : '',
            quantity: medicine.quantity.toString(),
            price: medicine.price.toString(),
            category: medicine.category || 'Tablet'
        });
        if (medicine.image) {
            setImagePreview(medicineService.getImageUrl(medicine.image));
        }
        setShowFormModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.expiryDate || !formData.quantity || !formData.price) {
            toast.error('Please fill in all required fields');
            return;
        }

        setFormLoading(true);
        try {
            const submitData = new FormData();
            Object.keys(formData).forEach(key => {
                submitData.append(key, formData[key]);
            });
            if (imageFile) {
                submitData.append('image', imageFile);
            }

            if (isEditing) {
                await medicineService.updateMedicine(selectedMedicine._id, submitData);
                toast.success('Medicine updated successfully');
            } else {
                await medicineService.createMedicine(submitData);
                toast.success('Medicine added successfully');
            }

            setShowFormModal(false);
            resetForm();
            fetchMedicines();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save medicine');
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            await medicineService.deleteMedicine(selectedMedicine._id);
            toast.success('Medicine deleted successfully');
            setShowDeleteModal(false);
            setSelectedMedicine(null);
            fetchMedicines();
        } catch (error) {
            toast.error('Failed to delete medicine');
        }
    };

    const viewMedicineDetails = (medicine) => {
        setSelectedMedicine(medicine);
        setShowDetailModal(true);
    };

    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStockClass = (quantity) => {
        if (quantity === 0) return 'stock-out';
        if (quantity <= 10) return 'stock-low';
        return 'stock-in';
    };

    const getStockLabel = (quantity) => {
        if (quantity === 0) return 'Out of Stock';
        if (quantity <= 10) return 'Low Stock';
        return 'In Stock';
    };

    return (
        <div className="page-content">
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Medicines</h1>
                    <p className="page-subtitle">Manage your medicine inventory</p>
                </div>
                <button className="btn btn-primary" onClick={openAddModal}>
                    <FiPlus />
                    Add Medicine
                </button>
            </div>

            {/* Filters */}
            <div className="filters-bar">
                <div className="search-input">
                    <FiSearch className="search-input-icon" />
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Search medicines..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <select
                    className="form-select filter-select"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                >
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
                <select
                    className="form-select filter-select"
                    value={stockFilter}
                    onChange={(e) => setStockFilter(e.target.value)}
                >
                    <option value="">All Stock</option>
                    <option value="inStock">In Stock</option>
                    <option value="lowStock">Low Stock</option>
                    <option value="outOfStock">Out of Stock</option>
                </select>
            </div>

            {/* Medicines Table */}
            {loading ? (
                <LoadingSpinner size="lg" text="Loading medicines..." />
            ) : (
                <>
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Medicine</th>
                                    <th>Category</th>
                                    <th>Price</th>
                                    <th>Stock</th>
                                    <th>Expiry</th>
                                    <th>Rating</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {medicines.length > 0 ? (
                                    medicines.map((medicine) => (
                                        <tr key={medicine._id}>
                                            <td>
                                                <div className="medicine-cell">
                                                    <div className="medicine-image">
                                                        {medicine.image ? (
                                                            <img
                                                                src={medicineService.getImageUrl(medicine.image)}
                                                                alt={medicine.name}
                                                            />
                                                        ) : (
                                                            <FiPackage />
                                                        )}
                                                    </div>
                                                    <div className="medicine-info">
                                                        <span className="medicine-name">{medicine.name}</span>
                                                        <span className="medicine-manufacturer">{medicine.manufacturer || 'N/A'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="badge badge-secondary">{medicine.category}</span>
                                            </td>
                                            <td>
                                                <span className="price">₹{medicine.price}</span>
                                            </td>
                                            <td>
                                                <div className={`stock-indicator ${getStockClass(medicine.quantity)}`}>
                                                    <span className="stock-qty">{medicine.quantity}</span>
                                                    <span className="stock-label">{getStockLabel(medicine.quantity)}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={medicine.isExpired ? 'text-error' : 'text-muted'}>
                                                    {formatDate(medicine.expiryDate)}
                                                    {medicine.isExpired && <FiAlertCircle className="expired-icon" />}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="rating">
                                                    <FiStar className="rating-icon" />
                                                    <span>{medicine.averageRating || '0'}</span>
                                                    <span className="rating-count">({medicine.reviews?.length || 0})</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button
                                                        className="btn btn-ghost btn-icon"
                                                        onClick={() => viewMedicineDetails(medicine)}
                                                        title="View Details"
                                                    >
                                                        <FiEye />
                                                    </button>
                                                    <button
                                                        className="btn btn-ghost btn-icon"
                                                        onClick={() => openEditModal(medicine)}
                                                        title="Edit"
                                                    >
                                                        <FiEdit2 />
                                                    </button>
                                                    <button
                                                        className="btn btn-ghost btn-icon text-error"
                                                        onClick={() => {
                                                            setSelectedMedicine(medicine);
                                                            setShowDeleteModal(true);
                                                        }}
                                                        title="Delete"
                                                    >
                                                        <FiTrash2 />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7">
                                            <div className="empty-state">
                                                <FiPackage className="empty-state-icon" />
                                                <h3 className="empty-state-title">No medicines found</h3>
                                                <p className="empty-state-text">Try adjusting your search or filter, or add a new medicine</p>
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

            {/* Add/Edit Medicine Modal */}
            <Modal
                isOpen={showFormModal}
                onClose={() => {
                    setShowFormModal(false);
                    resetForm();
                }}
                title={isEditing ? 'Edit Medicine' : 'Add New Medicine'}
                size="lg"
            >
                <form onSubmit={handleSubmit} className="medicine-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Medicine Name *</label>
                            <input
                                type="text"
                                name="name"
                                className="form-input"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="Enter medicine name"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Category</label>
                            <select
                                name="category"
                                className="form-select"
                                value={formData.category}
                                onChange={handleInputChange}
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea
                            name="description"
                            className="form-textarea"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Enter medicine description"
                            rows="3"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Manufacturer</label>
                            <input
                                type="text"
                                name="manufacturer"
                                className="form-input"
                                value={formData.manufacturer}
                                onChange={handleInputChange}
                                placeholder="Enter manufacturer"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Price (₹) *</label>
                            <input
                                type="number"
                                name="price"
                                className="form-input"
                                value={formData.price}
                                onChange={handleInputChange}
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Manufacturing Date</label>
                            <input
                                type="date"
                                name="manufacturingDate"
                                className="form-input"
                                value={formData.manufacturingDate}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Expiry Date *</label>
                            <input
                                type="date"
                                name="expiryDate"
                                className="form-input"
                                value={formData.expiryDate}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Quantity *</label>
                            <input
                                type="number"
                                name="quantity"
                                className="form-input"
                                value={formData.quantity}
                                onChange={handleInputChange}
                                placeholder="0"
                                min="0"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Medicine Image</label>
                            <input
                                type="file"
                                className="form-input"
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                        </div>
                    </div>

                    {imagePreview && (
                        <div className="image-preview">
                            <img src={imagePreview} alt="Preview" />
                        </div>
                    )}

                    <div className="modal-footer" style={{ padding: 0, marginTop: '1.5rem', borderTop: 'none' }}>
                        <button
                            type="button"
                            className="btn btn-outline"
                            onClick={() => {
                                setShowFormModal(false);
                                resetForm();
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={formLoading}
                        >
                            {formLoading ? (
                                <div className="spinner" style={{ width: 20, height: 20 }}></div>
                            ) : (
                                isEditing ? 'Update Medicine' : 'Add Medicine'
                            )}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Delete Medicine"
                footer={
                    <>
                        <button className="btn btn-outline" onClick={() => setShowDeleteModal(false)}>
                            Cancel
                        </button>
                        <button className="btn btn-danger" onClick={handleDelete}>
                            Delete
                        </button>
                    </>
                }
            >
                <p>Are you sure you want to delete <strong>{selectedMedicine?.name}</strong>?</p>
                <p className="text-muted" style={{ marginTop: '0.5rem' }}>This action cannot be undone.</p>
            </Modal>

            {/* Medicine Details Modal */}
            <Modal
                isOpen={showDetailModal}
                onClose={() => setShowDetailModal(false)}
                title="Medicine Details"
                size="lg"
            >
                {selectedMedicine && (
                    <div className="medicine-details">
                        <div className="medicine-details-header">
                            <div className="medicine-image-lg">
                                {selectedMedicine.image ? (
                                    <img
                                        src={medicineService.getImageUrl(selectedMedicine.image)}
                                        alt={selectedMedicine.name}
                                    />
                                ) : (
                                    <FiPackage />
                                )}
                            </div>
                            <div className="medicine-header-info">
                                <h2>{selectedMedicine.name}</h2>
                                <span className="badge badge-secondary">{selectedMedicine.category}</span>
                                <p className="price-lg">₹{selectedMedicine.price}</p>
                            </div>
                        </div>

                        <div className="medicine-details-grid">
                            <div className="detail-box">
                                <span className="detail-label">Manufacturer</span>
                                <span className="detail-value">{selectedMedicine.manufacturer || 'N/A'}</span>
                            </div>
                            <div className="detail-box">
                                <span className="detail-label">Stock</span>
                                <span className={`detail-value ${getStockClass(selectedMedicine.quantity)}`}>
                                    {selectedMedicine.quantity} units
                                </span>
                            </div>
                            <div className="detail-box">
                                <span className="detail-label">MFG Date</span>
                                <span className="detail-value">{formatDate(selectedMedicine.manufacturingDate)}</span>
                            </div>
                            <div className="detail-box">
                                <span className="detail-label">Expiry Date</span>
                                <span className={`detail-value ${selectedMedicine.isExpired ? 'text-error' : ''}`}>
                                    {formatDate(selectedMedicine.expiryDate)}
                                </span>
                            </div>
                        </div>

                        {selectedMedicine.description && (
                            <div className="medicine-description">
                                <h4>Description</h4>
                                <p>{selectedMedicine.description}</p>
                            </div>
                        )}

                        {selectedMedicine.reviews && selectedMedicine.reviews.length > 0 && (
                            <div className="medicine-reviews">
                                <h4>Reviews ({selectedMedicine.reviews.length})</h4>
                                <div className="reviews-list">
                                    {selectedMedicine.reviews.map((review, index) => (
                                        <div key={index} className="review-item">
                                            <div className="review-header">
                                                <span className="review-user">{review.userName || 'Anonymous'}</span>
                                                <div className="review-rating">
                                                    {[...Array(5)].map((_, i) => (
                                                        <FiStar
                                                            key={i}
                                                            className={i < review.rating ? 'star-filled' : 'star-empty'}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="review-comment">{review.comment}</p>
                                            <span className="review-date">{formatDate(review.createdAt)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Medicines;
