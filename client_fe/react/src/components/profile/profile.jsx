// client_fe/react/src/components/profile/profile.jsx
import React, { useState, useEffect } from "react";
import authApi from "../../api/authApi";
import historyApi from "../../api/historyApi";
import { getInfor } from "../../utils/manageToken";
import "./profile.css";

const Profile = () => {
    const [userInfo, setUserInfo] = useState(null);
    const [historyList, setHistoryList] = useState([]);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [message, setMessage] = useState("");
    const [activeTab, setActiveTab] = useState("game");

    useEffect(() => {
        const info = getInfor();
        if (info) {
            setUserInfo(info);
            // Lấy lịch sử giao dịch
            historyApi.getHistory().then(res => {
                setHistoryList(Array.isArray(res) ? res : (res?.data || []));
            }).catch(err => {
                console.error("Lỗi khi lấy dữ liệu lịch sử:", err);
            });
        }
    }, []);

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setMessage("");
        try {
            const res = await authApi.updatePass(currentPassword, newPassword);
            if (res) {
                setMessage("✅ Đổi mật khẩu thành công!");
                setCurrentPassword("");
                setNewPassword("");
            } else {
                setMessage("❌ Đổi mật khẩu thất bại.");
            }
        } catch (error) {
            console.error(error);
            setMessage("❌ Có lỗi xảy ra, vui lòng kiểm tra lại mật khẩu cũ.");
        }
    };

    // Lọc lịch sử dựa trên tab (giả định có thuộc tính liên quan đến wallet hoặc game)
    // Nếu API không chia type rõ ràng, ta hiển thị tất cả nhưng dùng cờ an toàn tính chất tham khảo
    const filteredHistory = historyList.filter(item => {
        if (activeTab === "game") {
            return item.type === "game" || item.gameId || (!item.walletId && !item.type?.includes("wallet"));
        } else {
            return item.type === "wallet" || item.walletId || item.type?.includes("wallet");
        }
    });

    return (
        <div className="nb-profile-container">
            <h1 className="nb-title">Hồ Sơ Người Dùng</h1>

            <div className="nb-profile-layout">
                {/* Cột trái: Thông tin & Đổi mật khẩu */}
                <div className="nb-sidebar">
                    <div className="nb-card nb-info-card">
                        <h2 className="nb-card-title">Thông Tin Cá Nhân</h2>
                        <div className="nb-info-item">
                            <span className="nb-label">Tên:</span>
                            <span className="nb-value">{userInfo?.username || userInfo?.name || "Người Dùng"}</span>
                        </div>
                        <div className="nb-info-item">
                            <span className="nb-label">Email:</span>
                            <span className="nb-value">{userInfo?.sub || userInfo?.email || "Chưa cập nhật email"}</span>
                        </div>
                    </div>

                    <div className="nb-card nb-password-card">
                        <h2 className="nb-card-title">Đổi Mật Khẩu</h2>
                        <form className="nb-form" onSubmit={handleChangePassword}>
                            <input 
                                type="password" 
                                className="nb-input" 
                                placeholder="Mật khẩu hiện tại" 
                                value={currentPassword}
                                onChange={e => setCurrentPassword(e.target.value)}
                                required 
                            />
                            <input 
                                type="password" 
                                className="nb-input" 
                                placeholder="Mật khẩu mới" 
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                required 
                            />
                            <button type="submit" className="nb-btn nb-btn-orange">Cập Nhật</button>
                        </form>
                        {message && <div className="nb-message">{message}</div>}
                    </div>
                </div>

                {/* Cột phải: Lịch sử */}
                <div className="nb-main-content">
                    <div className="nb-card nb-history-card">
                        <div className="nb-tabs">
                            <button 
                                className={`nb-tab ${activeTab === "game" ? "nb-tab-active" : ""}`}
                                onClick={() => setActiveTab("game")}
                            >
                                Mua Game
                            </button>
                            <button 
                                className={`nb-tab ${activeTab === "wallet" ? "nb-tab-active" : ""}`}
                                onClick={() => setActiveTab("wallet")}
                            >
                                Mua Wallet
                            </button>
                        </div>
                        <div className="nb-history-list">
                            {filteredHistory.length === 0 ? (
                                <div className="nb-empty">Chưa có giao dịch ở mục này.</div>
                            ) : (
                                filteredHistory.map((item, index) => (
                                    <div key={index} className="nb-history-item">
                                        <div className="nb-history-info">
                                            <h3 className="nb-history-name">
                                                {item.gameName || item.walletName || item.name || item.title || item.description || `Giao dịch #${item.id || index + 1}`}
                                            </h3>
                                            <p className="nb-history-date">
                                                {item.createdAt || item.date ? new Date(item.createdAt || item.date).toLocaleDateString("vi-VN") : "Gần đây"}
                                            </p>
                                        </div>
                                        <div className="nb-history-amount">
                                            {item.amount || item.price || 0} VNĐ
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
