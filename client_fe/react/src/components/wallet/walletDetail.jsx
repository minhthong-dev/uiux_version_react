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
import walletApi from '../../api/walletApi';
import authApi from '../../api/authApi';
import { createBuyWallet } from '../../api/buyApi';
import { getInfor } from '../../utils/manageToken';

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

    const handlePurchase = async () => {
        const userInfo = getInfor();
        if (!userInfo || !userInfo.id) {
            toast.error("Vui lòng đăng nhập để thực hiện giao dịch!");
            navigate('/login');
            return;
        }

        setIsLoading(true);
        try {
            // 1. Kiểm tra số dư
            const resBalance = await authApi.getAmoutById(userInfo.id);
            const currentBalance = resBalance.amount || 0;

            if (currentBalance < card.price) {
                toast.error("Số dư tài khoản không đủ. Vui lòng nạp thêm tiền!");
                navigate('/payment');
                return;
            }

            // 2. Thực hiện mua thẻ
            const response = await createBuyWallet(userInfo.id, card.price, card._id);

            if (response.status === "success" || response.success) {
                setGeneratedKey(response.key || response.data?.key || "KEY-XXXX-XXXX");
                setIsPurchased(true);
                toast.success("Thanh toán thành công!");
                // Thông báo để header cập nhật lại số dư
                window.dispatchEvent(new Event('balanceUpdated'));
            } else {
                toast.error(response.message || "Giao dịch thất bại!");
            }
        } catch (error) {
            console.error("Lỗi khi mua thẻ:", error);
            toast.error("Đã có lỗi xảy ra trong quá trình thanh toán.");
        } finally {
            setIsLoading(false);
        }
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

