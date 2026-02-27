import cartApi from "../../api/cartApi";
import gameApi from "../../api/gameApi";
import { useState, useEffect } from "react";
import { formatCurrency } from "../../utils/formatCurrency";
import { manageToken } from "../../utils/manageToken";
import { useNavigate } from "react-router-dom";
import useGameDiscount from "../../hooks/gameDiscount";
import { toast } from "../notification/toast";

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]); // Theo dõi các item được chọn (gameId)
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const { calculateDiscount } = useGameDiscount();

    const fetchCart = async () => {
        if (!manageToken.getToken()) return;
        setIsLoading(true);
        try {
            const data = await cartApi.getCart();

            let items = [];
            if (Array.isArray(data) && data.length > 0 && Array.isArray(data[0].games)) {
                items = data[0].games; // Đây sẽ là mảng chứa các gameId string
            }

            if (!items || items.length === 0) {
                setCartItems([]);
                setIsLoading(false);
                return;
            }

            // Đếm số lượng của mỗi game
            const gameCounts = items.reduce((acc, gameId) => {
                acc[gameId] = (acc[gameId] || 0) + 1;
                return acc;
            }, {});

            const uniqueGameIds = Object.keys(gameCounts);

            // Lấy chi tiết từng game đồng thời
            const detailedItems = await Promise.all(
                uniqueGameIds.map(async (gameId) => {
                    try {
                        const gameRes = await gameApi.getGameById(gameId);
                        const gameData = gameRes.data ? gameRes.data : gameRes;
                        return { gameId: gameId, quantity: gameCounts[gameId], game: gameData };
                    } catch (err) {
                        console.error('Lỗi lấy thông tin game:', err);
                        return { gameId: gameId, quantity: gameCounts[gameId], game: { _id: gameId, name: 'Game lỗi hoặc đã xoá', price: 0 } };
                    }
                })
            );

            setCartItems(detailedItems);
            // Mặc định chọn tất cả khi mới load
            setSelectedItems(detailedItems.map(item => item.gameId));
        } catch (error) {
            console.error("Lỗi khi tải giỏ hàng:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!manageToken.getToken()) {
            navigate("/auth");
            return;
        }
        fetchCart();
    }, [navigate]);

    const handleRemoveFromCart = async (gameId) => {
        try {
            await cartApi.removeFromCart(gameId);
            setSelectedItems(prev => prev.filter(id => id !== gameId));
            fetchCart();
            window.dispatchEvent(new Event('cartUpdated'));
        } catch (error) {
            console.error("Lỗi khi xóa khỏi giỏ hàng:", error);
            toast.error("Xóa khỏi giỏ hàng thất bại");
        }
    };

    const toggleSelectItem = (gameId) => {
        setSelectedItems(prev =>
            prev.includes(gameId)
                ? prev.filter(id => id !== gameId)
                : [...prev, gameId]
        );
    };

    const toggleSelectAll = () => {
        if (selectedItems.length === cartItems.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(cartItems.map(item => item.gameId));
        }
    };

    const getSelectedCartItems = () => {
        return cartItems.filter(item => selectedItems.includes(item.gameId));
    };

    const calculateTotal = () => {
        const selectedProducts = getSelectedCartItems();
        return selectedProducts.reduce((total, item) => {
            const game = item.game || item;
            const { discountedPrice } = calculateDiscount(game);
            return total + (discountedPrice || 0) * (item.quantity || 1);
        }, 0);
    };

    const totalInCart = cartItems.reduce((total, item) => total + (item.quantity || 1), 0);
    const selectedTotalItems = getSelectedCartItems().reduce((total, item) => total + (item.quantity || 1), 0);

    return (
        <div style={{ padding: '40px', maxWidth: '1300px', margin: '0 auto', color: 'var(--black)', fontFamily: 'Inter, sans-serif' }}>
            <div style={{ marginBottom: '50px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
                <h1 style={{
                    fontSize: '4rem',
                    backgroundColor: 'var(--vivid-tangerine)',
                    display: 'inline-block',
                    padding: '10px 30px',
                    border: 'var(--border-thick, 4px solid #000)',
                    boxShadow: 'var(--shadow-hard, 8px 8px 0px #000)',
                    color: 'var(--black)',
                    textTransform: 'uppercase',
                    fontWeight: '950',
                    transform: 'rotate(-1deg)',
                    margin: 0
                }}>
                    GIỎ HÀNG
                </h1>
                {totalInCart > 0 && (
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                        <div
                            onClick={toggleSelectAll}
                            style={{
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                fontSize: '1.2rem',
                                fontWeight: '800',
                                backgroundColor: 'var(--white)',
                                padding: '10px 20px',
                                border: 'var(--border-thick, 4px solid #000)',
                                boxShadow: 'var(--shadow-small, 4px 4px 0px #000)',
                                userSelect: 'none'
                            }}
                        >
                            <div style={{
                                width: '24px',
                                height: '24px',
                                border: '3px solid #000',
                                backgroundColor: selectedItems.length === cartItems.length && cartItems.length > 0 ? 'var(--sunflower-gold)' : 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {selectedItems.length === cartItems.length && cartItems.length > 0 && (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                )}
                            </div>
                            CHỌN TẤT CẢ
                        </div>

                        <div style={{
                            fontSize: '1.5rem',
                            fontWeight: '900',
                            backgroundColor: 'var(--white)',
                            padding: '10px 20px',
                            border: 'var(--border-thick, 4px solid #000)',
                            boxShadow: 'var(--shadow-small, 4px 4px 0px #000)'
                        }}>
                            ĐÃ CHỌN: <span style={{ color: 'var(--flag-red)' }}>{selectedTotalItems}/{totalInCart} MÓN</span>
                        </div>
                    </div>
                )}
            </div>

            {isLoading ? (
                <div style={{ textAlign: 'center', padding: '50px', fontSize: '1.5rem', fontWeight: 'bold' }}>
                    ĐANG TẢI GIỎ HÀNG...
                </div>
            ) : cartItems.length === 0 ? (
                <div style={{ padding: '80px 50px', backgroundColor: 'var(--white)', border: '4px solid var(--black)', boxShadow: '8px 8px 0 var(--black)', textAlign: 'center', borderRadius: '12px' }}>
                    <h2 style={{ color: 'var(--flag-red)', fontSize: '2.5rem', fontWeight: '900', margin: '0 0 20px 0' }}>TRỐNG TRƠN!</h2>
                    <p style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '30px' }}>Bạn chưa có trò chơi nào trong giỏ hàng. Hãy khám phá thêm nhé!</p>
                    <button
                        onClick={() => navigate('/')}
                        style={{ padding: '15px 30px', backgroundColor: 'var(--sunflower-gold)', border: '3px solid var(--black)', fontWeight: 'bold', fontSize: '1.2rem', cursor: 'pointer', boxShadow: '4px 4px 0 var(--black)', borderRadius: '8px', transition: 'all 0.2s' }}
                        onMouseOver={(e) => { e.currentTarget.style.transform = 'translate(2px, 2px)'; e.currentTarget.style.boxShadow = '2px 2px 0 var(--black)'; }}
                        onMouseOut={(e) => { e.currentTarget.style.transform = 'translate(0, 0)'; e.currentTarget.style.boxShadow = '4px 4px 0 var(--black)'; }}
                    >
                        ĐI MUA SẮM NGAY
                    </button>
                </div>
            ) : (
                <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-start', flexWrap: 'wrap' }}>

                    <div style={{ flex: '1 1 65%', display: 'flex', flexDirection: 'column', gap: '25px' }}>
                        {cartItems.map((item, index) => {
                            const game = item.game || item;
                            const { finalDiscount, discountedPrice } = calculateDiscount(game);

                            const isSelected = selectedItems.includes(item.gameId);

                            return (
                                <div key={game._id || item.id || index} style={{
                                    display: 'flex',
                                    padding: '25px',
                                    backgroundColor: 'var(--white)',
                                    border: '4px solid var(--black)',
                                    boxShadow: isSelected ? '10px 10px 0 var(--sunflower-gold)' : '6px 6px 0 var(--black)',
                                    borderRadius: '0',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    transition: 'all 0.2s ease',
                                    position: 'relative',
                                    opacity: isSelected ? 1 : 0.7,
                                    transform: isSelected ? 'translate(-2px, -2px)' : 'none'
                                }}>
                                    {/* Checkbox */}
                                    <div
                                        onClick={() => toggleSelectItem(item.gameId)}
                                        style={{
                                            marginRight: '20px',
                                            cursor: 'pointer',
                                            width: '35px',
                                            height: '35px',
                                            border: '4px solid #000',
                                            backgroundColor: isSelected ? 'var(--sunflower-gold)' : 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0,
                                            boxShadow: '3px 3px 0 #000'
                                        }}
                                    >
                                        {isSelected && (
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                        )}
                                    </div>

                                    <div style={{ position: 'absolute', top: '-15px', left: '-15px', backgroundColor: 'var(--sunflower-gold)', border: '3px solid var(--black)', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontWeight: '900', fontSize: '1.2rem', zIndex: 2 }}>
                                        x{item.quantity}
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '30px', flex: 1 }}>
                                        <div style={{ width: '140px', height: '140px', flexShrink: 0, borderRadius: '8px', overflow: 'hidden', border: '3px solid var(--black)' }}>
                                            <img src={game.media?.coverImage || 'https://via.placeholder.com/150'} alt={game.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            {game.price > 0 && finalDiscount > 0 && (
                                                <div style={{ position: 'absolute', top: 5, left: 5, backgroundColor: '#e53935', color: 'white', padding: '2px 5px', borderRadius: '4px', fontWeight: 'bold' }}>-{finalDiscount}%</div>
                                            )}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <h2 style={{ margin: '0 0 15px 0', fontSize: '2rem', fontWeight: '900', lineHeight: '1.1' }}>{game.name || 'Trò chơi'}</h2>
                                            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                                {finalDiscount > 0 ? (
                                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                        <span style={{ textDecoration: 'line-through', color: '#888', fontSize: '1rem', fontWeight: 600 }}>
                                                            {game.price !== undefined ? formatCurrency(game.price * item.quantity) : '0 VNĐ'}
                                                        </span>
                                                        <span style={{ fontWeight: '900', fontSize: '1.4rem', color: 'var(--flag-red)' }}>
                                                            {game.price !== undefined ? formatCurrency(discountedPrice * item.quantity) : '0 VNĐ'}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span style={{ fontWeight: '900', fontSize: '1.4rem', color: 'var(--flag-red)' }}>
                                                        {game.price !== undefined ? formatCurrency(game.price * item.quantity) : '0 VNĐ'}
                                                    </span>
                                                )}

                                                {item.quantity > 1 && (
                                                    <span style={{ fontWeight: '600', fontSize: '1rem', color: '#666' }}>
                                                        ({formatCurrency(discountedPrice)} / món)
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleRemoveFromCart(item.gameId || game._id)}
                                        style={{ padding: '12px', backgroundColor: 'var(--white)', color: 'var(--flag-red)', border: '3px solid var(--flag-red)', borderRadius: '8px', cursor: 'pointer', fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                                        title="Xóa khỏi giỏ hàng"
                                        onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--flag-red)'; e.currentTarget.style.color = 'var(--white)'; }}
                                        onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'var(--white)'; e.currentTarget.style.color = 'var(--flag-red)'; }}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                    <div style={{ flex: '1 1 30%', minWidth: '320px', padding: '30px', backgroundColor: 'var(--white)', border: '4px solid var(--black)', boxShadow: '8px 8px 0 var(--black)', borderRadius: '0', position: 'sticky', top: '20px' }}>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: '900', margin: '0 0 25px 0', borderBottom: '3px solid var(--black)', paddingBottom: '15px' }}>TÓM TẮT ĐƠN HÀNG</h2>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '1.1rem', fontWeight: '600' }}>
                            <span>Số lượng đã chọn:</span>
                            <span>{selectedTotalItems} món</span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px', fontSize: '1.1rem', fontWeight: '600' }}>
                            <span>Tạm tính:</span>
                            <span>{formatCurrency(calculateTotal())}</span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '20px', borderTop: '3px dashed var(--black)' }}>
                            <span style={{ fontSize: '1.3rem', fontWeight: '900' }}>TỔNG CỘNG:</span>
                            <span style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--flag-red)' }}>{formatCurrency(calculateTotal())}</span>
                        </div>

                        <button
                            disabled={selectedItems.length === 0}
                            onClick={() => {
                                const products = getSelectedCartItems();
                                const total = calculateTotal();
                                // Chuẩn bị dữ liệu chi tiết cho checkout
                                const checkoutData = products.map(item => {
                                    const { discountedPrice } = calculateDiscount(item.game || item);
                                    return {
                                        gameId: item.gameId,
                                        quantity: item.quantity,
                                        game: item.game,
                                        discountedPrice: discountedPrice
                                    };
                                });
                                navigate("/checkout", { state: { selectedGames: checkoutData, totalAmount: total } });
                            }}
                            style={{
                                width: '100%',
                                marginTop: '30px',
                                padding: '18px',
                                backgroundColor: selectedItems.length === 0 ? '#ccc' : 'var(--sunflower-gold)',
                                color: 'var(--black)',
                                border: '3px solid var(--black)',
                                fontSize: '1.2rem',
                                fontWeight: '900',
                                cursor: selectedItems.length === 0 ? 'not-allowed' : 'pointer',
                                boxShadow: selectedItems.length === 0 ? 'none' : '4px 4px 0 var(--black)',
                                borderRadius: '8px',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => {
                                if (selectedItems.length > 0) {
                                    e.currentTarget.style.transform = 'translate(2px, 2px)';
                                    e.currentTarget.style.boxShadow = '2px 2px 0 var(--black)';
                                }
                            }}
                            onMouseOut={(e) => {
                                if (selectedItems.length > 0) {
                                    e.currentTarget.style.transform = 'translate(0, 0)';
                                    e.currentTarget.style.boxShadow = '4px 4px 0 var(--black)';
                                }
                            }}>
                            THANH TOÁN NGAY {selectedTotalItems > 0 && `(${formatCurrency(calculateTotal())})`}
                        </button>
                    </div>

                </div>
            )}
        </div>
    );
};

export default Cart;