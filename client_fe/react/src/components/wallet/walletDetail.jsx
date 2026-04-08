import React, { useState, useEffect } from 'react';
import './walletDetail.css';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Ticket,
    ArrowLeft,
    CheckCircle2,
    AlertCircle,
    Copy,
    RefreshCw,
    Globe
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';
import { toast } from '../notification/toast';
import walletApi from '../../api/walletApi';

const WalletDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [card, setCard] = useState(null);
    const [isPurchased, setIsPurchased] = useState(false);
    const [generatedKey, setGeneratedKey] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    useEffect(() => {
        const fetchWalletDetail = async () => {
            try {
                const data = await walletApi.getWalletById(id);
                setCard(data);
            } catch (error) {
                console.error("Lỗi khi tải chi tiết ví:", error);
                toast.error("Không tìm thấy thông tin thẻ.");
            } finally {
                setIsFetching(false);
            }
        };
        fetchWalletDetail();
    }, [id]);

    const handlePurchase = () => {
        setIsLoading(true);
        // Ở đây có thể gọi API mua thẻ thật nếu Backend đã hỗ trợ. 
        // Hiện tại giữ logic tạo key giả nhưng với dữ liệu card từ DB.
        setTimeout(() => {
            const randomKey = Array.from({ length: 4 }, () => Math.random().toString(36).substring(2, 6).toUpperCase()).join('-');
            setGeneratedKey(randomKey);
            setIsPurchased(true);
            setIsLoading(false);
            toast.success("Thanh toán thành công!");
        }, 1200);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedKey);
        toast.info("Đã sao chép mã.");
    };

    if (isFetching) {
        return (
            <div className="wallet-detail-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <RefreshCw className="spin" size={48} color="var(--sunflower-gold)" />
            </div>
        );
    }

    if (!card) return <div className="no-data">Không tìm thấy dữ liệu thẻ.</div>;

    const accentColor = "#3a86ffff"; // Màu mặc định hoặc tính toán từ id

    return (
        <div className="wallet-detail-container" style={{ '--accent-color': accentColor }}>
            <div className="detail-header">
                <button className="back-circle-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={24} />
                </button>
                <div className="badge-tag">MÃ THẺ NẠP</div>
            </div>

            <div className="detail-main">
                <div className="detail-visual">
                    <div className="big-card-icon">
                        <Ticket size={120} />
                    </div>
                </div>

                <div className="detail-content">
                    <span className="region-label">
                        <Globe size={16} style={{ verticalAlign: 'middle', marginRight: '5px' }} />
                        REGION: {card.idWalletCategory?.name || 'GLOBAL'}
                    </span>
                    <h1 className="detail-title">{card.name}</h1>

                    <div className="detail-price-box">
                        <div className="price-row">
                            <span className="price-label">GIÁ THANH TOÁN:</span>
                            <span className="price-val-main">{formatCurrency(card.price)}</span>
                        </div>
                    </div>

                    {!isPurchased ? (
                        <>
                            <div className="features-list">
                                <h3>HƯỚNG DẪN & ĐIỀU KHOẢN:</h3>
                                <ul>
                                    <li><CheckCircle2 size={18} color="#22c55e" /> Chỉ sử dụng được cho tài khoản vùng {card.idWalletCategory?.name || 'GLOBAL'}.</li>
                                    <li><CheckCircle2 size={18} color="#22c55e" /> Mã được gửi ngay lập tức dưới dạng văn bản.</li>
                                    <li><CheckCircle2 size={18} color="#22c55e" /> Cam kết mã sạch 100%, bảo hành trọn đời.</li>
                                </ul>
                            </div>

                            <div className="warning-note">
                                <AlertCircle size={20} />
                                <span>Thẻ đã mua không được hoàn lại.</span>
                            </div>

                            <button className="confirm-buy-btn" onClick={handlePurchase} disabled={isLoading}>
                                {isLoading ? <RefreshCw className="spin" /> : "XÁC NHẬN MUA THẺ"}
                            </button>
                        </>
                    ) : (
                        <div className="key-display-box">
                            <h3>MÃ THẺ CỦA BẠN:</h3>
                            <code className="generated-key">{generatedKey}</code>
                            <button className="copy-btn-full" onClick={copyToClipboard}>
                                <Copy size={20} /> SAO CHÉP MÃ
                            </button>
                            <button className="back-to-list-btn" onClick={() => navigate('/wallets')}>
                                QUAY LẠI CỬA HÀNG
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WalletDetail;

