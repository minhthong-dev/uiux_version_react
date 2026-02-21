import { useState } from 'react';
import './auth.css';
import authApi from '../../api/authApi';

const ForgotPass = ({ onBack }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        try {
            const result = await authApi.forgotPassword(email);
            if (result.success || result.message === 'gui mail thanh cong') {
                setMessage('MÃ KHÔI PHỤC ĐÃ ĐƯỢC GỬI VÀO EMAIL CỦA BẠN!');
            } else {
                setError(result.message || 'CÓ LỖI XẢY RA, VUI LÒNG THỬ LẠI!');
            }
        } catch (err) {
            setError('LỖI KẾT NỐI SERVER!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h1 className="login-title">QUÊN MẬT KHẨU</h1>

                {message && <div className="success-msg" style={{
                    background: 'var(--azure-blue)',
                    color: 'white',
                    padding: '15px',
                    border: '3px solid black',
                    fontWeight: '800',
                    marginBottom: '20px',
                    boxShadow: '4px 4px 0px black',
                    textAlign: 'center'
                }}>
                    {message}
                </div>}

                {error && <div className="error-msg" style={{ display: 'block' }}>
                    {error}
                </div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">NHẬP EMAIL KHÔI PHỤC</label>
                        <input
                            type="email"
                            className="form-input"
                            placeholder="your-email@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <p style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.4' }}>
                        * CHÚNG TÔI SẼ GỬI MỘT LIÊN KẾT ĐẾN EMAIL CỦA BẠN ĐỂ THIẾT LẬP LẠI MẬT KHẨU MỚI.
                    </p>

                    <button type="submit" className="login-btn" disabled={loading} style={{ background: 'var(--neon-pink)' }}>
                        {loading ? "ĐANG GỬI..." : "GỬI YÊU CẦU"}
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '20px' }}>
                        <a href="#" className="login-link" onClick={(e) => { e.preventDefault(); onBack && onBack(); }}>
                            ← QUAY LẠI ĐĂNG NHẬP
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ForgotPass;
