import React from 'react';
import { NavLink } from 'react-router-dom';
import { Package } from 'lucide-react';
import {
    LayoutDashboard,
    Gamepad2,
    Users,
    ShoppingCart,
    Settings,
    BarChart3,
    Tags,
    Percent,
    Wallet,
    Globe
} from 'lucide-react';
import './sidebar_header.css';
import { useSocket } from '../../context/socketContext';

const Sidebar = () => {
    const navItems = [
        { path: '/', icon: <LayoutDashboard />, label: 'Dashboard' },
        { path: '/game', icon: <Gamepad2 />, label: 'Quản lý Game' },
        { path: '/category', icon: <Tags />, label: 'Quản lý Danh mục' },
        { path: '/wallet', icon: <Wallet />, label: 'Quản lý Wallet' },
        { path: '/wallet-category', icon: <Globe />, label: 'Wallet Region' },
        { path: '/users', icon: <Users />, label: 'Người dùng' },
        { path: '/discount', icon: <Percent />, label: 'Khuyến mãi' },
        { path: '/inventory', icon: <Package />, label: 'Kho hàng' },
        { path: '/support', icon: <Settings />, label: 'Hỗ trợ' },
        { path: '/orders', icon: <ShoppingCart />, label: 'Đơn hàng' },
        { path: '/stats', icon: <BarChart3 />, label: 'Thống kê' },
    ];

    const { pendingCount } = useSocket();

    return (
        <aside className="admin-sidebar">
            <nav className="sidebar-nav">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            isActive ? 'nav-item active' : 'nav-item'
                        }
                    >
                        {item.icon}
                        <span>{item.label}</span>
                        {item.path === '/support' && pendingCount > 0 && (
                            <span className="nav-badge">{pendingCount}</span>
                        )}
                    </NavLink>
                ))}
            </nav>

            <div style={{ marginTop: 'auto', paddingTop: '40px' }}>
                <div
                    className="nav-item"
                    style={{ background: 'var(--amber-gold)', textAlign: 'center', fontSize: '0.8rem' }}
                >
                    SYSTEM VERSION 1.0.0
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
