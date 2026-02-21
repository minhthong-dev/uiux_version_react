import React, { useEffect, useState } from 'react';
import { Search, ShoppingCart, User, LogOut } from 'lucide-react';
import './sidebar_header.css';
import { useNavigate } from 'react-router-dom';
import { manageToken, getInfor } from '../utils/manageToken';

const Header = () => {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userInfo, setUserInfo] = useState(null);

    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const token = manageToken.getToken();
        if (token) {
            setIsLoggedIn(true);
            try {
                setUserInfo(getInfor(token));
            } catch (error) {
                console.error("Token invalid");
            }
        }
    }, []);

    const handleLogout = () => {
        manageToken.removeToken();
        setIsLoggedIn(false);
        setUserInfo(null);
        navigate('/auth');
    };

    const handleSearch = (e) => {
        if (e.key === 'Enter' || e.type === 'click') {
            if (searchQuery.trim()) {
                navigate(`/search?q=${searchQuery.trim()}`);
            }
        }
    };

    return (
        <header className="client-header">
            <div className="header-left">
                <div className="client-logo" onClick={() => navigate('/')}>
                    GAME STORE
                </div>

                <div className="search-container">
                    <Search
                        className="search-icon"
                        size={20}
                        onClick={handleSearch}
                        style={{ cursor: 'pointer' }}
                    />
                    <input
                        type="text"
                        className="header-search"
                        placeholder="Tìm kiếm trò chơi..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleSearch}
                    />
                </div>
            </div>

            <nav className="store-nav">
                <a href="#" className="store-nav-link">CỬA HÀNG</a>
                <a href="#" className="store-nav-link">THƯ VIỆN</a>
                <a href="#" className="store-nav-link">CỘNG ĐỒNG</a>
            </nav>

            <div className="header-right">
                <button className="user-btn">
                    <ShoppingCart size={20} />
                </button>

                {isLoggedIn ? (
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button className="user-btn">
                            <User size={20} />
                            <span>{userInfo?.username || 'USER'}</span>
                        </button>
                        <button className="user-btn" style={{ background: 'var(--flag-red)', color: 'white' }} onClick={handleLogout}>
                            <LogOut size={20} />
                            <span>ĐĂNG XUẤT</span>
                        </button>
                    </div>
                ) : (
                    <button className="user-btn" onClick={() => navigate('/auth')}>
                        <User size={20} />
                        <span>ĐĂNG NHẬP</span>
                    </button>
                )}
            </div>
        </header>
    );
};

export default Header;
