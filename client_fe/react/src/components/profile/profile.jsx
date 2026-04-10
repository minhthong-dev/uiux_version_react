// client_fe/react/src/components/profile/profile.jsx
import React, { useState, useEffect } from "react";
import authApi from "../../api/authApi";
import historyApi from "../../api/historyApi";
import { getInfor } from "../../utils/manageToken";
import "./profile.css";

const Profile = () => {
    const [userInfo, setUserInfo] = useState(null);
    const [historyList, setHistoryList] = useState([]);
    const [activeTab, setActiveTab] = useState("game");

    // Đổi mật khẩu bằng OTP
    const [otpSent, setOtpSent] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [message, setMessage] = useState({ text: "", type: "" });

    useEffect(() => {
        const info = getInfor();
        if (info) {
            setUserInfo(info);
            historyApi.getHistory().then(res => {
                setHistoryList(Array.isArray(res) ? res : (res?.data || []));
            }).catch(err => {
                console.error("Lỗi khi lấy dữ liệu lịch sử:", err);
            });
        }
    }, []);

    // Bước 1: Yêu cầu BE gửi OTP
    const handleRequestOtp = async () => {
        setMessage({ text: "", type: "" });
        setOtpLoading(true);
        try {
            const res = await authApi.updatePassRes();
            if (res) {
                setOtpSent(true);
                setMessage({ text: "✅ OTP đã gửi về email của bạn!", type: "success" });
            } else {
                setMessage({ text: "❌ Không thể gửi OTP, vui lòng thử lại.", type: "error" });
            }
        } catch (error) {
            console.error(error);
            setMessage({ text: "❌ Có lỗi xảy ra khi gửi OTP.", type: "error" });
        } finally {
            setOtpLoading(false);
        }
    };

    // Bước 2: Xác nhận OTP + mật khẩu mới
    const handleChangePassword = async (e) => {
        e.preventDefault();
        setMessage({ text: "", type: "" });
        try {
            const res = await authApi.updatePass(otp, newPassword);
            if (res && !res.error) {
                setMessage({ text: "✅ Đổi mật khẩu thành công!", type: "success" });
                setOtp("");
                setNewPassword("");
                setOtpSent(false);
            } else {
                setMessage({ text: `❌ ${res?.message || "Đổi mật khẩu thất bại, kiểm tra lại OTP."}`, type: "error" });
            }
        } catch (error) {
            console.error(error);
            setMessage({ text: "❌ Có lỗi xảy ra, vui lòng thử lại.", type: "error" });
        }
    };

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

                        {/* Bước 1: Gửi OTP */}
                        {!otpSent && (
                            <button
                                className="nb-btn nb-btn-orange"
                                onClick={handleRequestOtp}
                                disabled={otpLoading}
                            >
                                {otpLoading ? "Đang gửi..." : "Gửi OTP Đổi Mật Khẩu"}
                            </button>
                        )}

                        {/* Bước 2: Nhập OTP + mật khẩu mới */}
                        {otpSent && (
                            <form className="nb-form" onSubmit={handleChangePassword}>
                                <input
                                    type="text"
                                    className="nb-input"
                                    placeholder="Nhập mã OTP"
                                    value={otp}
                                    onChange={e => setOtp(e.target.value)}
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
                                <div className="nb-btn-group">
                                    <button type="submit" className="nb-btn nb-btn-orange">
                                        Xác Nhận
                                    </button>
                                    <button
                                        type="button"
                                        className="nb-btn nb-btn-ghost"
                                        onClick={() => { setOtpSent(false); setOtp(""); setNewPassword(""); setMessage({ text: "", type: "" }); }}
                                    >
                                        Huỷ
                                    </button>
                                </div>
                            </form>
                        )}

                        {message.text && (
                            <div className={`nb-message ${message.type === "success" ? "nb-message-success" : "nb-message-error"}`}>
                                {message.text}
                            </div>
                        )}
                    </div>
                </div>

                {/* Cột phải: Lịch sử (tạm ẩn) */}
                {/* <div className="nb-main-content">...</div> */}
            </div>
        </div>
    );
};

export default Profile;
