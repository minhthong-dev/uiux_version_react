import React, { useEffect, useState } from 'react';
import { Search, ShoppingCart, User, LogOut } from 'lucide-react';
import './sidebar_header.css';
import { useNavigate } from 'react-router-dom';
import { manageToken, getInfor } from '../utils/manageToken';
import cartApi from '../api/cartApi';
import { useSocket } from '../context/socketContext';

const Header = () => {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userInfo, setUserInfo] = useState(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [cartCount, setCartCount] = useState(0);
    const { socket } = useSocket();
    /* Tải số lượng items trong giỏ hàng */
    const loadCartCount = async () => {
        if (!manageToken.getToken()) return;
        try {
            const data = await cartApi.getCart();
            if (Array.isArray(data) && data.length > 0 && Array.isArray(data[0].games)) {
                setCartCount(data[0].games.length);
            } else {
                setCartCount(0);
            }
        } catch (error) {
            console.error("Lỗi khi tải số lượng giỏ hàng:", error);
        }
    };

    useEffect(() => {
        const token = manageToken.getToken();
        if (token) {
            setIsLoggedIn(true);
            try {
                setUserInfo(getInfor(token));
                loadCartCount();
            } catch (error) {
                console.error("Token invalid");
            }
        } else {
            setCartCount(0);
        }
    }, []);

    /* Lắng nghe sự kiện cập nhật giỏ hàng từ các component khác */
    useEffect(() => {
        const handleCartUpdated = () => {
            if (manageToken.getToken()) {
                loadCartCount();
            }
        };
        window.addEventListener('cartUpdated', handleCartUpdated);
        return () => window.removeEventListener('cartUpdated', handleCartUpdated);
    }, []);

    const handleLogout = () => {
        const dataUser = () => {
            return {
                data: getInfor()
            }
        }
        socket.emit('user_logout', dataUser());
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
                <button className="user-btn" onClick={() => navigate('/cart')} style={{ position: 'relative' }}>
                    <ShoppingCart size={20} />
                    {cartCount > 0 && (
                        <span style={{
                            position: 'absolute',
                            top: '-8px',
                            right: '-8px',
                            backgroundColor: 'var(--flag-red)',
                            color: 'white',
                            borderRadius: '50%',
                            padding: '2px 6px',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            border: '1px solid black'
                        }}>
                            {cartCount}
                        </span>
                    )}
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
