import { useState, useEffect } from 'react';
import {
    FiSearch,
    FiUser,
    FiMail,
    FiPhone,
    FiCalendar,
    FiToggleLeft,
    FiToggleRight,
    FiEye,
    FiUserPlus,
    FiMapPin,
    FiEdit,
    FiImage
} from 'react-icons/fi';
import { userService } from '../services/userService';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import './Users.css';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [statusFilter, setStatusFilter] = useState('');

    // Create/Edit user state
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [creating, setCreating] = useState(false);
    const [editing, setEditing] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        profileImage: '',
        street: '',
        city: '',
        state: '',
        zipCode: ''
    });
    const [phoneError, setPhoneError] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, [page, statusFilter]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(1);
            fetchUsers();
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await userService.getUsers(page, 10, search, statusFilter);
            setUsers(data.users);
            setTotalPages(data.pages);
        } catch (error) {
            toast.error('Failed to load users');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (userId) => {
        try {
            await userService.toggleUserStatus(userId);
            toast.success('User status updated');
            fetchUsers();
        } catch (error) {
            toast.error('Failed to update user status');
        }
    };

    const viewUserDetails = (user) => {
        setSelectedUser(user);
        setShowModal(true);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // Phone validation - only allow digits and limit to 10
        if (name === 'phone') {
            const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
            setFormData(prev => ({ ...prev, [name]: digitsOnly }));
            if (digitsOnly.length > 0 && digitsOnly.length !== 10) {
                setPhoneError('Phone number must be exactly 10 digits');
            } else {
                setPhoneError('');
            }
            return;
        }

        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                toast.error('Please select an image file');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size must be less than 5MB');
                return;
            }
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const openCreateModal = () => {
        setFormData({
            name: '',
            email: '',
            phone: '',
            profileImage: '',
            street: '',
            city: '',
            state: '',
            zipCode: ''
        });
        setPhoneError('');
        setImageFile(null);
        setImagePreview('');
        setShowCreateModal(true);
    };

    const openEditModal = (user) => {
        setEditingUser(user);
        setFormData({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone?.replace(/\D/g, '').slice(-10) || '',
            profileImage: user.profileImage || '',
            street: user.address?.street || '',
            city: user.address?.city || '',
            state: user.address?.state || '',
            zipCode: user.address?.zipCode || ''
        });
        setPhoneError('');
        setImageFile(null);
        setImagePreview(user.profileImage || '');
        setShowEditModal(true);
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();

        if (!formData.name.trim() || !formData.email.trim()) {
            toast.error('Name and email are required');
            return;
        }

        if (formData.phone && formData.phone.length !== 10) {
            toast.error('Phone number must be exactly 10 digits');
            return;
        }

        try {
            setCreating(true);

            // Upload image if selected
            let profileImageUrl = formData.profileImage;
            if (imageFile) {
                setUploading(true);
                const uploadResult = await userService.uploadImage(imageFile);
                profileImageUrl = uploadResult.url;
                setUploading(false);
            }

            await userService.createUser({
                name: formData.name,
                email: formData.email,
                phone: formData.phone ? `+91 ${formData.phone}` : '',
                profileImage: profileImageUrl,
                address: {
                    street: formData.street,
                    city: formData.city,
                    state: formData.state,
                    zipCode: formData.zipCode,
                    country: 'India'
                }
            });
            toast.success('User created successfully');
            setShowCreateModal(false);
            fetchUsers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create user');
        } finally {
            setCreating(false);
            setUploading(false);
        }
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();

        if (!formData.name.trim() || !formData.email.trim()) {
            toast.error('Name and email are required');
            return;
        }

        if (formData.phone && formData.phone.length !== 10) {
            toast.error('Phone number must be exactly 10 digits');
            return;
        }

        try {
            setEditing(true);

            // Upload image if a new file is selected
            let profileImageUrl = formData.profileImage;
            if (imageFile) {
                setUploading(true);
                const uploadResult = await userService.uploadImage(imageFile);
                profileImageUrl = uploadResult.url;
                setUploading(false);
            }

            await userService.updateUser(editingUser._id, {
                name: formData.name,
                email: formData.email,
                phone: formData.phone ? `+91 ${formData.phone}` : '',
                profileImage: profileImageUrl,
                address: {
                    street: formData.street,
                    city: formData.city,
                    state: formData.state,
                    zipCode: formData.zipCode,
                    country: 'India'
                }
            });
            toast.success('User updated successfully');
            setShowEditModal(false);
            setEditingUser(null);
            fetchUsers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update user');
        } finally {
            setEditing(false);
            setUploading(false);
        }
    };

    return (
        <div className="page-content">
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Users</h1>
                    <p className="page-subtitle">Manage registered users</p>
                </div>
                <button className="btn btn-primary" onClick={openCreateModal}>
                    <FiUserPlus /> Add User
                </button>
            </div>

            {/* Filters */}
            <div className="filters-bar">
                <div className="search-input">
                    <FiSearch className="search-input-icon" />
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Search users by name, email, or phone..."
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
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
            </div>

            {/* Users Table */}
            {loading ? (
                <LoadingSpinner size="lg" text="Loading users..." />
            ) : (
                <>
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Registered</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length > 0 ? (
                                    users.map((user) => (
                                        <tr key={user._id}>
                                            <td>
                                                <div className="user-cell">
                                                    {user.profileImage ? (
                                                        <img
                                                            src={user.profileImage}
                                                            alt={user.name}
                                                            className="avatar"
                                                        />
                                                    ) : (
                                                        <div className="avatar avatar-placeholder">
                                                            {user.name.charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                    <span className="user-name">{user.name}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="text-muted">{user.email}</span>
                                            </td>
                                            <td>
                                                <span className="text-muted">{user.phone || '-'}</span>
                                            </td>
                                            <td>
                                                <span className="text-muted">{formatDate(user.registrationDate)}</span>
                                            </td>
                                            <td>
                                                <span className={`badge ${user.isActive ? 'badge-success' : 'badge-error'}`}>
                                                    {user.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button
                                                        className="btn btn-ghost btn-icon"
                                                        onClick={() => viewUserDetails(user)}
                                                        title="View Details"
                                                    >
                                                        <FiEye />
                                                    </button>
                                                    <button
                                                        className="btn btn-ghost btn-icon"
                                                        onClick={() => openEditModal(user)}
                                                        title="Edit User"
                                                    >
                                                        <FiEdit />
                                                    </button>
                                                    <button
                                                        className={`btn btn-ghost btn-icon ${user.isActive ? 'toggle-on' : 'toggle-off'}`}
                                                        onClick={() => handleToggleStatus(user._id)}
                                                        title={user.isActive ? 'Disable User' : 'Enable User'}
                                                    >
                                                        {user.isActive ? <FiToggleRight /> : <FiToggleLeft />}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6">
                                            <div className="empty-state">
                                                <FiUser className="empty-state-icon" />
                                                <h3 className="empty-state-title">No users found</h3>
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

            {/* User Details Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title="User Details"
                size="md"
            >
                {selectedUser && (
                    <div className="user-details">
                        <div className="user-details-header">
                            {selectedUser.profileImage ? (
                                <img
                                    src={selectedUser.profileImage}
                                    alt={selectedUser.name}
                                    className="avatar avatar-lg"
                                />
                            ) : (
                                <div className="avatar avatar-lg avatar-placeholder">
                                    {selectedUser.name.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div>
                                <h3>{selectedUser.name}</h3>
                                <span className={`badge ${selectedUser.isActive ? 'badge-success' : 'badge-error'}`}>
                                    {selectedUser.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>

                        <div className="user-details-list">
                            <div className="detail-item">
                                <FiMail className="detail-icon" />
                                <div>
                                    <span className="detail-label">Email</span>
                                    <span className="detail-value">{selectedUser.email}</span>
                                </div>
                            </div>

                            <div className="detail-item">
                                <FiPhone className="detail-icon" />
                                <div>
                                    <span className="detail-label">Phone</span>
                                    <span className="detail-value">{selectedUser.phone || 'Not provided'}</span>
                                </div>
                            </div>

                            <div className="detail-item">
                                <FiCalendar className="detail-icon" />
                                <div>
                                    <span className="detail-label">Registered</span>
                                    <span className="detail-value">{formatDate(selectedUser.registrationDate)}</span>
                                </div>
                            </div>

                            {selectedUser.fullAddress && (
                                <div className="detail-item">
                                    <FiUser className="detail-icon" />
                                    <div>
                                        <span className="detail-label">Address</span>
                                        <span className="detail-value">{selectedUser.fullAddress}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Modal>

            {/* Create User Modal */}
            <Modal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                title="Add New User"
                size="md"
            >
                <form onSubmit={handleCreateUser}>
                    <div className="form-group">
                        <label className="form-label">
                            <FiImage style={{ marginRight: '0.5rem' }} />
                            Profile Image
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            {imagePreview ? (
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    style={{
                                        width: '64px',
                                        height: '64px',
                                        borderRadius: '50%',
                                        objectFit: 'cover',
                                        border: '2px solid var(--border-color)'
                                    }}
                                />
                            ) : (
                                <div style={{
                                    width: '64px',
                                    height: '64px',
                                    borderRadius: '50%',
                                    background: 'var(--bg-tertiary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'var(--text-muted)'
                                }}>
                                    <FiUser size={24} />
                                </div>
                            )}
                            <div style={{ flex: 1 }}>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    id="create-profile-image"
                                    style={{ display: 'none' }}
                                />
                                <label
                                    htmlFor="create-profile-image"
                                    className="btn btn-outline btn-sm"
                                    style={{ cursor: 'pointer' }}
                                >
                                    {uploading ? 'Uploading...' : 'Choose Image'}
                                </label>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                    JPG, PNG or GIF. Max 5MB.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">
                            <FiUser style={{ marginRight: '0.5rem' }} />
                            Name *
                        </label>
                        <input
                            type="text"
                            name="name"
                            className="form-input"
                            placeholder="Enter user name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            <FiMail style={{ marginRight: '0.5rem' }} />
                            Email *
                        </label>
                        <input
                            type="email"
                            name="email"
                            className="form-input"
                            placeholder="Enter email address"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                        />
                    </div>



                    <div className="form-group">
                        <label className="form-label">
                            <FiPhone style={{ marginRight: '0.5rem' }} />
                            Phone (10 digits)
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            className="form-input"
                            placeholder="Enter 10-digit phone number"
                            value={formData.phone}
                            onChange={handleInputChange}
                            maxLength={10}
                        />
                        {phoneError && <span className="form-error">{phoneError}</span>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            <FiMapPin style={{ marginRight: '0.5rem' }} />
                            Address
                        </label>
                        <input
                            type="text"
                            name="street"
                            className="form-input"
                            placeholder="Street address"
                            value={formData.street}
                            onChange={handleInputChange}
                            style={{ marginBottom: '0.5rem' }}
                        />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                            <input
                                type="text"
                                name="city"
                                className="form-input"
                                placeholder="City"
                                value={formData.city}
                                onChange={handleInputChange}
                            />
                            <input
                                type="text"
                                name="state"
                                className="form-input"
                                placeholder="State"
                                value={formData.state}
                                onChange={handleInputChange}
                            />
                        </div>
                        <input
                            type="text"
                            name="zipCode"
                            className="form-input"
                            placeholder="ZIP Code"
                            value={formData.zipCode}
                            onChange={handleInputChange}
                            style={{ marginTop: '0.5rem' }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                        <button
                            type="button"
                            className="btn btn-outline"
                            onClick={() => setShowCreateModal(false)}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={creating}
                        >
                            {creating ? 'Creating...' : 'Create User'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Edit User Modal */}
            <Modal
                isOpen={showEditModal}
                onClose={() => { setShowEditModal(false); setEditingUser(null); }}
                title="Edit User"
                size="md"
            >
                <form onSubmit={handleUpdateUser}>
                    <div className="form-group">
                        <label className="form-label">
                            <FiImage style={{ marginRight: '0.5rem' }} />
                            Profile Image
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            {imagePreview ? (
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    style={{
                                        width: '64px',
                                        height: '64px',
                                        borderRadius: '50%',
                                        objectFit: 'cover',
                                        border: '2px solid var(--border-color)'
                                    }}
                                />
                            ) : (
                                <div style={{
                                    width: '64px',
                                    height: '64px',
                                    borderRadius: '50%',
                                    background: 'var(--bg-tertiary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'var(--text-muted)'
                                }}>
                                    <FiUser size={24} />
                                </div>
                            )}
                            <div style={{ flex: 1 }}>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    id="edit-profile-image"
                                    style={{ display: 'none' }}
                                />
                                <label
                                    htmlFor="edit-profile-image"
                                    className="btn btn-outline btn-sm"
                                    style={{ cursor: 'pointer' }}
                                >
                                    {uploading ? 'Uploading...' : 'Choose Image'}
                                </label>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                    JPG, PNG or GIF. Max 5MB.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">
                            <FiUser style={{ marginRight: '0.5rem' }} />
                            Name *
                        </label>
                        <input
                            type="text"
                            name="name"
                            className="form-input"
                            placeholder="Enter user name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            <FiMail style={{ marginRight: '0.5rem' }} />
                            Email *
                        </label>
                        <input
                            type="email"
                            name="email"
                            className="form-input"
                            placeholder="Enter email address"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                        />
                    </div>



                    <div className="form-group">
                        <label className="form-label">
                            <FiPhone style={{ marginRight: '0.5rem' }} />
                            Phone (10 digits)
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            className="form-input"
                            placeholder="Enter 10-digit phone number"
                            value={formData.phone}
                            onChange={handleInputChange}
                            maxLength={10}
                        />
                        {phoneError && <span className="form-error">{phoneError}</span>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            <FiMapPin style={{ marginRight: '0.5rem' }} />
                            Address
                        </label>
                        <input
                            type="text"
                            name="street"
                            className="form-input"
                            placeholder="Street address"
                            value={formData.street}
                            onChange={handleInputChange}
                            style={{ marginBottom: '0.5rem' }}
                        />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                            <input
                                type="text"
                                name="city"
                                className="form-input"
                                placeholder="City"
                                value={formData.city}
                                onChange={handleInputChange}
                            />
                            <input
                                type="text"
                                name="state"
                                className="form-input"
                                placeholder="State"
                                value={formData.state}
                                onChange={handleInputChange}
                            />
                        </div>
                        <input
                            type="text"
                            name="zipCode"
                            className="form-input"
                            placeholder="ZIP Code"
                            value={formData.zipCode}
                            onChange={handleInputChange}
                            style={{ marginTop: '0.5rem' }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                        <button
                            type="button"
                            className="btn btn-outline"
                            onClick={() => { setShowEditModal(false); setEditingUser(null); }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={editing}
                        >
                            {editing ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Users;
