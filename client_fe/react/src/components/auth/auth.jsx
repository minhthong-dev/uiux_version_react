import { useState } from 'react';
import './auth.css';
import authApi from '../../api/authApi';
import { manageToken, getInfor } from '../../utils/manageToken';
import ForgotPass from './fomrForgotPass';

// Component Login chính
const Login = () => {
    const [view, setView] = useState('auth'); // 'auth' hoặc 'forgot'
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // Xử lý sự kiện submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isLogin) {
                const result = await authApi.login(email, password);
                if (result.message === 'dang nhap thanh cong') {
                    if (getInfor(result.token)) {
                        manageToken.setToken(result.token);
                        alert("Đăng nhập thành công!");
                        window.location.href = '/'; // Chuyển hướng và load lại trang để Header nhận token mới
                        return;
                    }
                } else {
                    alert(result.message || "Email hoặc mật khẩu không chính xác!");
                }
            } else {
                // Xử lý Đăng ký
                if (password !== confirmPassword) {
                    alert("Mật khẩu không khớp!");
                    setLoading(false);
                    return;
                }
                const result = await authApi.resgister(username, email, password);
                if (result.success || result.message === 'dang ky thanh cong, vui long kiem tra email de xac thuc tai khoan') {
                    alert("Đăng ký thành công! Hãy đăng nhập.");
                    // setIsLogin(true);
                } else {
                    alert(result.message || "Đăng ký thất bại");
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (view === 'forgot') {
        return <ForgotPass onBack={() => setView('auth')} />;
    }

    return (
        <div className="login-container">
            <div className="login-card">
                <h1 className="login-title">{isLogin ? "đăng nhập" : "đăng ký"}</h1>

                <div className="auth-tabs">
                    <button
                        className={`auth-tab ${isLogin ? 'active' : ''}`}
                        onClick={() => setIsLogin(true)}
                    >
                        LOGIN
                    </button>
                    <button
                        className={`auth-tab ${!isLogin ? 'active' : ''}`}
                        onClick={() => setIsLogin(false)}
                    >
                        SIGN UP
                    </button>
                </div>

                {/* Khu vực thông báo lỗi giả lập */}
                <div className="error-msg" style={{ display: 'none' }}>
                    WRONG CREDENTIALS!
                </div>

                <form onSubmit={handleSubmit}>
                    {!isLogin && (
                        <div className="form-group">
                            <label className="form-label">tên người dùng</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="nhập username..."
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required={!isLogin}
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label">email</label>
                        <input
                            type="email"
                            className="form-input"
                            placeholder="nhap_admin@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">mật khẩu</label>
                        <input
                            type="password"
                            className="form-input"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {!isLogin && (
                        <div className="form-group">
                            <label className="form-label">xác nhận mật khẩu</label>
                            <input
                                type="password"
                                className="form-input"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required={!isLogin}
                            />
                        </div>
                    )}

                    {isLogin && (
                        <div className="login-footer">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                                <input type="checkbox" style={{ accentColor: 'var(--black)', width: '20px', height: '20px', border: '2px solid black' }} />
                                REMEMBER ME
                            </label>
                            <a href="#" className="login-link" onClick={(e) => { e.preventDefault(); setView('forgot'); }}>FORGOT PASS?</a>
                        </div>
                    )}

                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? "ĐANG XỬ LÝ..." : (isLogin ? "Login Now" : "Register Now")}
                    </button>
                </form>
            </div >
        </div >
    );
};

export default Login;
