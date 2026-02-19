import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Gamepad2, Users, ShoppingCart, Settings, BarChart3 } from 'lucide-react';
import './sidebar_header.css';

const Sidebar = () => {
    const navItems = [
        { path: '/', icon: <LayoutDashboard />, label: 'Dashboard' },
        { path: '/game', icon: <Gamepad2 />, label: 'Quản lý Game' },
        { path: '/users', icon: <Users />, label: 'Người dùng' },
        { path: '/orders', icon: <ShoppingCart />, label: 'Đơn hàng' },
        { path: '/stats', icon: <BarChart3 />, label: 'Thống kê' },
        { path: '/settings', icon: <Settings />, label: 'Cài đặt' },
    ];

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
