import React, { useEffect, useState } from 'react';
import gameApi from '../../api/gameApi';
import './index.css';
const Home = () => {
    return (
        <div className="dashboard-container">
            <h1 className="dashboard-title">DASHBOARD TRUNG TÂM</h1>

            <div className="stats-grid">
                <div className="stat-card orange">
                    <h3>TỔNG DOANH THU</h3>
                    <div className="value">128.5M đ</div>
                </div>
                <div className="stat-card pink">
                    <h3>NGƯỜI DÙNG MỚI</h3>
                    <div className="value">+152</div>
                </div>
                <div className="stat-card violet">
                    <h3>GAME ĐÃ BÁN</h3>
                    <div className="value">1,024</div>
                </div>
                <div className="stat-card blue">
                    <h3>ĐÁNH GIÁ TỐT</h3>
                    <div className="value">98%</div>
                </div>
            </div>

            <div className="recent-activities">
                <h2>CÁC HOẠT ĐỘNG GẦN ĐÂY</h2>
                <div className="activity-list">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="activity-item">
                            <div>
                                <span style={{ fontWeight: 900 }}>User_{i}00</span> vừa mua
                                <span style={{ color: 'var(--neon-pink)', fontWeight: 900 }}> Resident Evil 4</span>
                            </div>
                            <div className="status-badge success">HOÀN TẤT</div>
                        </div>
                    ))}
                    <div className="activity-item">
                        <div>
                            <span style={{ fontWeight: 900 }}>User_XYZ</span> yêu cầu hỗ trợ
                            <span style={{ fontWeight: 900 }}> Lỗi thanh toán</span>
                        </div>
                        <div className="status-badge pending">ĐANG XỬ LÝ</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;