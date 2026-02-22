import React from 'react';
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

const Sidebar = () => {
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
                    <div className="client-nav-item"><Sword size={20} /><span>Hành động</span></div>
                    <div className="client-nav-item"><Gamepad2 size={20} /><span>Phiêu lưu</span></div>
                    <div className="client-nav-item"><Ghost size={20} /><span>Kinh dị</span></div>
                </nav>
            </div>
        </aside>
    );
};

export default Sidebar;
