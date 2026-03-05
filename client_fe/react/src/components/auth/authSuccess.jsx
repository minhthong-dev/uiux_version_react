import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const GoogleAuthSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get('token');

        if (token) {
            localStorage.setItem('token', token);
            navigate('/');
        } else {
            navigate('/login');
        }
    }, [searchParams, navigate]);

    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h2>Đang xác thực tài khoản Google...</h2>
            <p>Vui lòng đợi trong giây lát.</p>
        </div>
    );
};

export default GoogleAuthSuccess;