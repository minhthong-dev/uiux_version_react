import { useState } from 'react';
import './auth.css';
import authApi from '../../api/authApi';
import { toast } from '../notification/toast';

const ForgotPass = ({ onBack }) => {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const result = await authApi.forgotPassword(email, username);
            if (result) {
                toast.success('Mã OTP đã "hạ cánh" an toàn trong email!');
                setStep(2);
            } else {
                toast.error(result.message || 'Hệ thống bận, hãy thử lại sau!');
            }
        } catch (err) {
            toast.error('Mất kết nối với căn cứ!');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.warning('Mật khẩu nhập lại bị "lệch pha" rồi!');
            return;
        }

        setLoading(true);
        try {
            const result = await authApi.resetPassword(otp, newPassword);
            if (result.success || result.message === 'doi mat khau thanh cong' || result.status === 200) {
                toast.success('Reset thành công! Đang quay lại trang đăng nhập...');
                setTimeout(() => onBack(), 2000);
            } else {
                toast.error(result.message || 'Mã OTP này có vẻ đã "hết đát"!');
            }
        } catch (err) {
            toast.error('Lỗi server, vui lòng thử lại!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="auth-left-panel">
                <div className="panel-noise" />
                <div className="web-header">
                    <div className="web-title-wrapper">
                        <span className="web-icon">🔓</span>
                        <h1 className="web-title">
                            <span className="title-word t-poor">RESET</span>
                            <span className="title-dash">-</span>
                            <span className="title-word t-gamer">SAFE</span>
                        </h1>
                    </div>
                    <span className="web-slogan">KHÔI PHỤC QUYỀN TRUY CẬP</span>
                </div>
                <div className="hero-deco-grid" style={{ marginTop: '50px' }}>
                    {['🔑', '🧤', '🛡️', '🛰️', '💾', '⚙️', '🧪', '🧬'].map((icon, i) => (
                        <span key={i} className="deco-icon" style={{ animationDelay: `${i * 0.1}s` }}>{icon}</span>
                    ))}
                </div>
            </div>

            <div className="auth-right-panel">
                <div className="login-card">
                    {/* Progress Bar */}
                    <div className="forgot-progress-wrapper" style={{ marginBottom: '30px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <span style={{ fontWeight: 900, fontSize: '0.8rem', color: step === 1 ? 'var(--flag-red)' : '#888' }}>1. GỬI MÃ</span>
                            <span style={{ fontWeight: 900, fontSize: '0.8rem', color: step === 2 ? 'var(--flag-red)' : '#888' }}>2. ĐỔI MẬT KHẨU</span>
                        </div>
                        <div style={{ height: '10px', background: '#ddd', border: '2px solid black', position: 'relative' }}>
                            <div style={{
                                position: 'absolute',
                                left: 0,
                                top: 0,
                                bottom: 0,
                                width: step === 1 ? '50%' : '100%',
                                background: 'var(--sunflower-gold)',
                                transition: 'width 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                            }} />
                        </div>
                    </div>

                    <h1 className="login-title" style={{ fontSize: '1.8rem' }}>
                        {step === 1 ? "QUÊN MẬT KHẨU?" : "XÁC NHẬN OTP"}
                    </h1>

                    {step === 1 ? (
                        <form onSubmit={handleSendOTP}>
                            <div className="form-group">
                                <label className="form-label">USERNAME CỦA BẠN</label>
                                <div style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', fontSize: '1.2rem', zIndex: 1 }}>👤</span>
                                    <input
                                        type="text"
                                        className="form-input"
                                        style={{ paddingLeft: '45px' }}
                                        placeholder="Tên tài khoản..."
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">EMAIL ĐÃ ĐĂNG KÝ</label>
                                <div style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', fontSize: '1.2rem', zIndex: 1 }}>📧</span>
                                    <input
                                        type="email"
                                        className="form-input"
                                        style={{ paddingLeft: '45px' }}
                                        placeholder="example@gmail.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <p style={{ fontWeight: '600', fontSize: '0.85rem', marginBottom: '1.5rem', opacity: 0.8 }}>
                                * Hệ thống sẽ gửi một mã xác thực 6 số đến email của bạn để thực hiện đặt lại mật khẩu.
                            </p>

                            <button type="submit" className="login-btn" disabled={loading} style={{ background: 'var(--neon-pink)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                                {loading ? "ĐANG GỬI..." : <>GỬI MÃ OTP <span style={{ fontSize: '1.5rem' }}>🚀</span></>}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleResetPassword}>
                            <div className="form-group">
                                <label className="form-label">MÃ OTP XÁC THỰC</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Nhập 6 chữ số..."
                                    style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '5px', fontWeight: 900 }}
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    maxLength={6}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">MẬT KHẨU MỚI</label>
                                <input
                                    type="password"
                                    className="form-input"
                                    placeholder="••••••••"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group" style={{ marginBottom: '25px' }}>
                                <label className="form-label">NHẬP LẠI MẬT KHẨU</label>
                                <input
                                    type="password"
                                    className="form-input"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <button type="submit" className="login-btn" disabled={loading} style={{ background: 'var(--sunflower-gold)', color: 'black' }}>
                                {loading ? "ĐANG XỬ LÝ..." : "CẬP NHẬT MẬT KHẨU"}
                            </button>

                            <div style={{ textAlign: 'center', marginTop: '15px' }}>
                                <button
                                    type="button"
                                    className="login-link"
                                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', textDecoration: 'underline' }}
                                    onClick={() => setStep(1)}
                                >
                                    Gửi lại mã OTP?
                                </button>
                            </div>
                        </form>
                    )}

                    <div style={{ textAlign: 'center', marginTop: '25px', paddingTop: '20px', borderTop: '2px dashed #ddd' }}>
                        <a href="#" className="login-link" onClick={(e) => { e.preventDefault(); onBack && onBack(); }} style={{ fontSize: '0.9rem', fontWeight: 900 }}>
                            <span style={{ marginRight: '5px' }}>⬅</span> QUAY LẠI ĐĂNG NHẬP
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPass;
