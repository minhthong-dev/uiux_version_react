import React, { useState } from 'react';
import { LogOut, User, Bell } from 'lucide-react';
import './sidebar_header.css';
import { useNavigate } from 'react-router-dom';
import { manageToken } from '../../utils/manageToken'
const Header = () => {
    const [logout, setLogout] = useState(false);
    const navigate = useNavigate();
    const handleLogout = () => {
        setLogout(true);
        manageToken.removeToken();
        navigate('/login');
    }
    return (
        <header className="admin-header">
            <div className="header-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                <img src="/logo.png" alt="Logo" />
            </div>

            <div className="header-actions">
                <button className="nav-item" style={{ padding: '8px', background: 'var(--amber-gold)' }}>
                    <Bell size={20} />
                </button>

                <div className="user-profile">
                    <User size={20} />
                    <span>ADMINISTRATOR</span>
                </div>

                <button className="logout-btn nav-item" onClick={handleLogout}>
                    <LogOut size={18} />
                    <span>THOÁT</span>
                </button>
            </div>
        </header>
    );
};

export default Header;
