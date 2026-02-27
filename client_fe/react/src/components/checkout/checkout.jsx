import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import createBuyGame from "../../api/buyApi";
import authApi from "../../api/authApi";
import { getInfor } from "../../utils/manageToken";
import { formatCurrency } from "../../utils/formatCurrency";
import { toast } from "../notification/toast";
import { ShoppingBag, CreditCard, Wallet } from "lucide-react";
import "./checkout.css";

const Checkout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [userBalance, setUserBalance] = useState(0);

    // Lấy danh sách game từ state truyền qua từ Cart
    const selectedGames = location.state?.selectedGames || [];
    const totalAmount = location.state?.totalAmount || 0;

    useEffect(() => {
        if (selectedGames.length === 0) {
            toast.error("Không có sản phẩm để thanh toán");
            navigate("/cart");
            return;
        }

        const fetchBalance = async () => {
            try {
                const response = await authApi.getAmoutById(getInfor().id);
                setUserBalance(response.amount || 0);
            } catch (error) {
                console.error("Lỗi lấy số dư:", error);
            }
        };
        fetchBalance();
    }, [selectedGames, navigate]);

    const handleConfirmPurchase = async () => {
        if (userBalance < totalAmount) {
            toast.error("Số dư không đủ! Vui lòng nạp thêm tiền.");
            navigate("/payment");
            return;
        }

        setIsLoading(true);
        try {
            // Chuẩn bị danh sách game IDs (có thể trùng lặp nếu người dùng chọn nhiều lần cùng 1 game)
            const gameIds = selectedGames.flatMap(item =>
                Array(item.quantity || 1).fill(item.gameId)
            );

            const response = await createBuyGame(
                getInfor().id,
                totalAmount,
                gameIds
            );

            if (response.status === "success" || response.message?.includes("thành công") || response.success) {
                toast.success("Thanh toán thành công! Chúc bạn chơi game vui vẻ.");
                // Dispatch sự kiện cập nhật giỏ hàng nếu cần
                window.dispatchEvent(new Event('cartUpdated'));
                navigate("/history");
            } else {
                toast.error(response.message || "Thanh toán thất bại");
            }
        } catch (error) {
            console.error("Lỗi khi thanh toán:", error);
            toast.error("Đã có lỗi xảy ra trong quá trình xử lý");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="checkout-container">
            <h1 className="checkout-title">Xác nhận thanh toán</h1>

            <div className="checkout-card">
                <div className="checkout-section">
                    <div className="checkout-section-title">
                        <ShoppingBag size={24} />
                        DANH SÁCH SẢN PHẨM
                    </div>
                    <div className="game-summary-list">
                        {selectedGames.map((item, idx) => (
                            <div key={idx} className="game-item-mini">
                                <span className="game-name-mini">
                                    {item.game?.name || "Game " + item.gameId}
                                    {item.quantity > 1 && ` (x${item.quantity})`}
                                </span>
                                <span className="game-price-mini">
                                    {formatCurrency((item.discountedPrice || item.game?.price || 0) * (item.quantity || 1))}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="checkout-section">
                    <div className="checkout-section-title">
                        <Wallet size={24} />
                        PHƯƠNG THỨC THANH TOÁN
                    </div>
                    <div className="balance-info">
                        <span>SỐ DƯ VÍ CỦA BẠN:</span>
                        <span>{formatCurrency(userBalance)}</span>
                    </div>
                </div>

                <div className="total-payment-box">
                    <div style={{ fontWeight: 900 }}>TỔNG THANH TOÁN:</div>
                    <div className="total-value-big">{formatCurrency(totalAmount)}</div>
                </div>

                {userBalance < totalAmount && (
                    <div className="error-message">
                        CẢNH BÁO: SỐ DƯ CỦA BẠN KHÔNG ĐỦ ĐỂ THỰC HIỆN GIAO DỊCH NÀY!
                    </div>
                )}

                <button
                    className="confirm-btn"
                    onClick={handleConfirmPurchase}
                    disabled={isLoading || userBalance < totalAmount}
                >
                    {isLoading ? "ĐANG XỬ LÝ..." : "XÁC NHẬN MUA NGAY"}
                </button>

                <button
                    style={{ background: 'none', border: 'none', fontWeight: 800, cursor: 'pointer', textDecoration: 'underline' }}
                    onClick={() => navigate("/cart")}
                >
                    Quay lại giỏ hàng
                </button>
            </div>
        </div>
    );
};

export default Checkout;