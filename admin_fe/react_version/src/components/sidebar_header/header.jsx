import React from 'react';
import { LogOut, User, Bell } from 'lucide-react';
import './sidebar_header.css';

const Header = () => {
    return (
        <header className="admin-header">
            <div className="header-logo">
                GAME SHOP ADMIN
            </div>

            <div className="header-actions">
                <button className="nav-item" style={{ padding: '8px', background: 'var(--amber-gold)' }}>
                    <Bell size={20} />
                </button>

                <div className="user-profile">
                    <User size={20} />
                    <span>ADMINISTRATOR</span>
                </div>

                <button className="logout-btn nav-item">
                    <LogOut size={18} />
                    <span>THOÁT</span>
                </button>
            </div>
        </header>
    );
};

export default Header;
