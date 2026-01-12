import { NavLink, useLocation } from 'react-router-dom';
import {
    FiGrid,
    FiUsers,
    FiPackage,
    FiShoppingCart,
    FiLogOut,
    FiMenu,
    FiX
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import './Sidebar.css';

const Sidebar = () => {
    const { admin, logout } = useAuth();
    const location = useLocation();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const menuItems = [
        { path: '/', icon: FiGrid, label: 'Dashboard' },
        { path: '/users', icon: FiUsers, label: 'Users' },
        { path: '/medicines', icon: FiPackage, label: 'Medicines' },
        { path: '/orders', icon: FiShoppingCart, label: 'Orders' }
    ];

    const handleLogout = () => {
        logout();
    };

    return (
        <>
            {/* Mobile Menu Toggle */}
            <button
                className="mobile-menu-toggle"
                onClick={() => setIsMobileOpen(!isMobileOpen)}
            >
                {isMobileOpen ? <FiX /> : <FiMenu />}
            </button>

            {/* Overlay for mobile */}
            {isMobileOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
                {/* Logo */}
                <div className="sidebar-logo">
                    <div className="logo-icon">
                        <svg viewBox="0 0 40 40" fill="none">
                            <circle cx="20" cy="20" r="18" fill="url(#grad)" />
                            <path d="M14 20h12M20 14v12" stroke="white" strokeWidth="3" strokeLinecap="round" />
                            <defs>
                                <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#0ea5e9" />
                                    <stop offset="100%" stopColor="#10b981" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                    {!isCollapsed && <span className="logo-text">MedStore</span>}
                </div>

                {/* Navigation */}
                <nav className="sidebar-nav">
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `nav-item ${isActive ? 'active' : ''}`
                            }
                            onClick={() => setIsMobileOpen(false)}
                        >
                            <item.icon className="nav-icon" />
                            {!isCollapsed && <span className="nav-label">{item.label}</span>}
                        </NavLink>
                    ))}
                </nav>

                {/* Admin Info & Logout */}
                <div className="sidebar-footer">
                    <div className="admin-info">
                        <div className="admin-avatar">
                            {admin?.name?.charAt(0).toUpperCase() || 'A'}
                        </div>
                        {!isCollapsed && (
                            <div className="admin-details">
                                <span className="admin-name">{admin?.name || 'Admin'}</span>
                                <span className="admin-role">{admin?.role || 'Administrator'}</span>
                            </div>
                        )}
                    </div>
                    <button
                        className="logout-btn"
                        onClick={handleLogout}
                        title="Logout"
                    >
                        <FiLogOut />
                        {!isCollapsed && <span>Logout</span>}
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
