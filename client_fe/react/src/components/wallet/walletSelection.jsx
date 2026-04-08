import React, { useState, useEffect } from 'react';
import './walletSelection.css';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Info, Ticket, Zap, Globe, RefreshCcw } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';
import walletApi from '../../api/walletApi';

const WalletSelection = () => {
    const navigate = useNavigate();
    const [wallets, setWallets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchWallets = async () => {
            try {
                const res = await walletApi.getAllWallets();
                const actualData = Array.isArray(res) ? res : (res.data || []);
                setWallets(actualData);
            } catch (error) {
                console.error("Lỗi khi tải danh sách ví:", error);
                setWallets([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchWallets();
    }, []);

    const getAccentColor = (index) => {
        const colors = ["#3a86ffff", "#d62828ff", "#8338ecff", "#ff006eff", "#fb5607ff"];
        return colors[index % colors.length];
    };

    if (isLoading) {
        return (
            <div className="wallet-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <RefreshCcw className="spin" size={48} color="var(--sunflower-gold)" />
            </div>
        );
    }

    return (
        <div className="wallet-container">
            <div className="wallet-header">
                <h1 className="wallet-title">CỬA HÀNG THẺ WALLET</h1>
                <p className="wallet-subtitle">Chọn thẻ Wallet phù hợp để nạp vào cửa hàng game của bạn</p>
            </div>

            <div className="wallet-grid">
                {wallets.length > 0 ? (
                    wallets.map((card, index) => (
                        <div key={card._id} className="wallet-card" style={{ '--accent-color': getAccentColor(index) }}>
                            <div className="wallet-region-badge">
                                <Globe size={12} style={{ marginRight: '4px' }} />
                                {card.idWalletCategory?.name || 'GLOBAL'}
                            </div>
                            <div className="wallet-card-header">
                                <Ticket size={40} color={getAccentColor(index)} />
                            </div>
                            <h2 className="wallet-name">{card.name}</h2>
                            <div className="wallet-price-container">
                                <span className="price-main">{formatCurrency(card.price)}</span>
                            </div>
                            <div className="wallet-card-actions">

                                <button className="buy-btn" onClick={() => navigate(`/wallet/${card._id}`)}>
                                    <Plus size={16} /> MUA THẺ
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-data">Hiện không có thẻ nào được bán.</div>
                )}
            </div>

            <div className="wallet-footer">
                <div className="support-info">
                    <Zap size={20} />
                    <span>LƯU Ý: Vui lòng chọn đúng Region để tránh lỗi nạp thẻ!</span>
                </div>
            </div>
        </div>
    );
};

export default WalletSelection;

