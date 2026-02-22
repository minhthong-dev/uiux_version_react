import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
    Home,
    Flame,
    Clock,
    Gift,
    Compass,
    Heart,
    Gamepad2,
    Sword,
    Ghost,
    Trophy,
    Search
} from 'lucide-react';
import './sidebar_header.css';
import useGenreNav from '../hooks/useGenreNav';
import categoryApi from '../api/categoryApi';

const Sidebar = () => {
    const { goToGenre } = useGenreNav();
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await categoryApi.getAllCategories();
                setCategories(data || []);
            } catch (error) {
                console.error("Lỗi khi tải thể loại sidebar:", error);
            }
        };
        fetchCategories();
    }, []);

    const getIconForCategory = (name) => {
        const lowerName = name.toLowerCase();
        if (lowerName.includes('hành động')) return <Sword size={20} />;
        if (lowerName.includes('phiêu lưu')) return <Gamepad2 size={20} />;
        if (lowerName.includes('kinh dị')) return <Ghost size={20} />;
        return <Trophy size={20} />;
    };

    return (
        <aside className="client-sidebar">
            <div className="sidebar-section">
                <h3 className="sidebar-title">KHÁM PHÁ</h3>
                <nav className="sidebar-nav">
                    <NavLink to="/" className={({ isActive }) => isActive ? 'client-nav-item active' : 'client-nav-item'}>
                        <Home size={20} />
                        <span>Trang chủ</span>
                    </NavLink>
                    <NavLink to="/trending" className="client-nav-item">
                        <Flame size={20} />
                        <span>Xu hướng</span>
                    </NavLink>
                    <NavLink to="/new" className="client-nav-item">
                        <Clock size={20} />
                        <span>Mới nhất</span>
                    </NavLink>
                    <NavLink to="/deals" className="client-nav-item">
                        <Gift size={20} />
                        <span>Ưu đãi</span>
                    </NavLink>
                    <NavLink to="/search" className="client-nav-item">
                        <Search size={20} />
                        <span>Tìm kiếm</span>
                    </NavLink>
                </nav>
            </div>

            <div className="sidebar-section">
                <h3 className="sidebar-title">CỦA BẠN</h3>
                <nav className="sidebar-nav">
                    <NavLink to="/library" className="client-nav-item">
                        <Compass size={20} />
                        <span>Thư viện</span>
                    </NavLink>
                    <NavLink to="/wishlist" className="client-nav-item">
                        <Heart size={20} />
                        <span>DANH SÁCH ƯỚC</span>
                    </NavLink>
                </nav>
            </div>

            <div className="sidebar-section">
                <h3 className="sidebar-title">THỂ LOẠI</h3>
                <nav className="sidebar-nav">
                    {categories.slice(0, 5).map(cat => (
                        <div
                            key={cat._id}
                            className="client-nav-item"
                            onClick={() => goToGenre(cat._id)}
                            style={{ cursor: 'pointer' }}
                        >
                            {getIconForCategory(cat.name)}
                            <span>{cat.name}</span>
                        </div>
                    ))}
                    {categories.length === 0 && (
                        <div className="client-nav-item" style={{ opacity: 0.5 }}>
                            <span>... Đang tải thể loại ...</span>
                        </div>
                    )}
                </nav>
            </div>
        </aside>
    );
};

export default Sidebar;
