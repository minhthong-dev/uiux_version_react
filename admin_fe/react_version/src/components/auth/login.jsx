import { useState } from 'react';
import './login.css';
import authApi from '../../api/authApi';
import { manageToken, getInfor } from '../../utils/manageToken';
import { useNavigate } from 'react-router-dom';
import { Routes, Route } from 'react-router-dom';
// Component Login chính
const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Xử lý sự kiện submit (chỉ để demo giao diện)
    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await authApi.login(email, password);
        if (result.message === 'dang nhap thanh cong') {
            if (getInfor(result.token)) {
                if (getInfor(result.token).role == 'admin') {
                    console.log("token dep qa: ", getInfor(result.token));
                    manageToken.setToken(result.token);
                    navigate('/');
                    return;
                }
            }
        } else {
            document.querySelector('.error-msg').style.display = 'block';
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h1 className="login-title">TRUY CAP ADMIN</h1>

                {/* Khu vực thông báo lỗi giả lập */}
                <div className="error-msg" style={{ display: 'none' }}>
                    WRONG CREDENTIALS!
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email NHAP THONG TIN ADMIN </label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="nhap_admin@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-input"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="login-footer">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                            <input type="checkbox" style={{ accentColor: 'var(--black)', width: '20px', height: '20px', border: '2px solid black' }} />
                            REMEMBER ME
                        </label>
                        <a href="#" className="login-link">FORGOT PASS?</a>
                    </div>

                    <button type="submit" className="login-btn">
                        Login Now
                    </button>
                </form>
            </div >
        </div >
    );
};

export default Login;
