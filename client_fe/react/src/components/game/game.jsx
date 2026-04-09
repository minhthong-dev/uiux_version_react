import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import gameApi from '../../api/gameApi';
import categoryApi from '../../api/categoryApi';
import cartApi from '../../api/cartApi';
import useGenreNav from '../../hooks/useGenreNav';
import { formatCurrency } from '../../utils/formatCurrency';
import { manageToken, getInfor } from '../../utils/manageToken';
import useGameDiscount from '../../hooks/gameDiscount';
import { toast } from '../notification/toast';
import './game.css';

const Game = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [game, setGame] = useState(null);
    const [loading, setLoading] = useState(true);
    const [genres, setGenres] = useState([]);
    const [inWishlist, setInWishlist] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [isInCart, setIsInCart] = useState(false);
    const { goToGenre } = useGenreNav();
    const [coutLike, setCoutLike] = useState(0);
    const { calculateDiscount } = useGameDiscount();
    const { finalDiscount, discountedPrice } = game ? calculateDiscount(game) : { finalDiscount: 0, discountedPrice: 0 };

    // Hàm helper để chuyển đổi link YouTube thường sang link embed
    const getEmbedUrl = (url) => {
        if (!url) return null;
        if (url.includes('youtube.com/embed/')) return url;

        let videoId = '';
        if (url.includes('youtu.be/')) {
            videoId = url.split('youtu.be/')[1].split(/[?#]/)[0];
        } else if (url.includes('youtube.com/watch')) {
            videoId = new URLSearchParams(new URL(url).search).get('v');
        }

        return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    };

    const handleToggleWishlist = async () => {
        try {
            if (inWishlist) {

                await gameApi.removeWishlist(game._id);
                setInWishlist(false);
                toast.info('Đã xóa khỏi danh sách ước!');
            } else {
                await gameApi.addWishlist(game._id);
                setInWishlist(true);
                toast.success('Đã thêm vào danh sách ước!');
            }
        } catch (error) {
            console.error('Lỗi khi cập nhật danh sách ước:', error);
            toast.error('Thao tác thất bại!');
        }
    };
    const loadLikeCount = async () => {
        const count = await gameApi.getCountLike(id);

        setCoutLike(count);
    };
    const handleAddToCart = async () => {
        try {
            if (!manageToken.getToken()) {
                toast.warning('Vui lòng đăng nhập để thêm vào giỏ hàng!');
                navigate('/auth');
                return;
            }

            if (isInCart) {
                toast.info('Sản phẩm này đã có trong giỏ hàng!');
                return;
            }

            const result = await cartApi.addToCart(game._id);
            if (result.status === 200) {
                toast.success('Đã thêm vào giỏ hàng thành công!');
                setIsInCart(true);
            } else {
                toast.error(result?.error || result?.message || 'Thêm vào giỏ hàng thất bại!');
            }
            window.dispatchEvent(new Event('cartUpdated'));
        } catch (error) {
            console.error('Lỗi khi thêm vào giỏ hàng:', error);
            toast.error('Thêm vào giỏ hàng thất bại!');
        }
    };

    const handleToggleLike = async () => {
        try {
            if (isLiked) {
                await gameApi.unlike(game._id);
                setIsLiked(false);
                setCoutLike(coutLike - 1);
                setGame(prev => ({ ...prev, like: Math.max(0, (prev.like || 1) - 1) }));
            } else {
                await gameApi.like(game._id);
                setIsLiked(true);
                setCoutLike(coutLike + 1);
                setGame(prev => ({ ...prev, like: (prev.like || 0) + 1 }));
            }
        } catch (error) {
            console.error('Lỗi khi cập nhật lượt thích:', error);
            toast.error('Thao tác thất bại!');
        }
    };

    useEffect(() => {
        const fetchGameDetail = async () => {
            try {
                const userId = manageToken.getToken() ? getInfor()?.id : null;
                const [data, wishData, likeData, cartData] = await Promise.all([
                    gameApi.getGameDetail(id),
                    gameApi.isWishlist(id),
                    gameApi.isLike(id),
                    userId ? cartApi.inCart(userId, id) : Promise.resolve(false)
                ]);
                console.log(data);
                loadLikeCount();
                if (wishData === true) {
                    setInWishlist(true);
                }

                if (likeData === true) {
                    setIsLiked(true);
                }

                if (cartData === true || cartData?.isInCart === true) {
                    setIsInCart(true);
                }

                const gameObj = data?.data && typeof data.data === 'object' ? data.data : data;
                if (gameObj && gameObj._id) {
                    setGame(gameObj);
                    if (Array.isArray(gameObj.genre) && gameObj.genre.length > 0) {
                        const genrePromises = gameObj.genre.map(gId => categoryApi.getCategoryById(gId));
                        const genreResults = await Promise.all(genrePromises);
                        setGenres(genreResults.filter(Boolean));
                    }
                } else if (data?.error === 'invalid_json') {
                    toast.error('API chi tiết game trả về dữ liệu không hợp lệ. Kiểm tra BASE_API_URL/endpoint.');
                }
            } catch (error) {
                console.error("Lỗi khi tải chi tiết game:", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchGameDetail();
    }, [id]);

    if (loading) {
        return (
            <div style={{ height: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <h1 style={{ backgroundColor: 'var(--sunflower-gold)', padding: '20px', border: 'var(--border-thick)', boxShadow: 'var(--shadow-hard)' }}>
                    ĐANG TẢI CHI TIẾT GAME...
                </h1>
            </div>
        );
    }

    if (!game) {
        return (
            <div style={{ height: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <h1 style={{ backgroundColor: 'var(--flag-red)', color: 'white', padding: '20px', border: 'var(--border-thick)', boxShadow: 'var(--shadow-hard)' }}>
                    KHÔNG TÌM THẤY TRÒ CHƠI!
                </h1>
                <button
                    onClick={() => navigate('/')}
                    style={{ marginTop: '30px' }}
                >
                    QUAY LẠI TRANG CHỦ
                </button>
            </div>
        );
    }

    return (
        <div className="game-detail-container">
            <header className="game-header">
                <div className="game-main-info">
                    <h1 className="game-title">{game.name}</h1>
                    <div className="game-description">
                        <span className="info-label" style={{ marginBottom: '15px' }}>THÔNG TIN TRÒ CHƠI</span>
                        {game.content}
                    </div>

                    {game.media?.trailer && (
                        <>
                            <h2 className="section-title">ĐOẠN GIỚI THIỆU</h2>
                            <div className="trailer">
                                <iframe
                                    width="100%"
                                    height="450"
                                    src={getEmbedUrl(game.media.trailer)}
                                    title="YouTube video player"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    referrerPolicy="strict-origin-when-cross-origin"
                                    allowFullScreen
                                ></iframe>
                            </div>
                        </>
                    )}

                    <h2 className="section-title">HÌNH ẢNH TRONG GAME</h2>
                    <div className="screenshots-gallery">
                        {game.media?.screenshots?.map((screenshot, idx) => (
                            <img
                                key={idx}
                                src={screenshot}
                                alt={`${game.name} screenshot ${idx + 1}`}
                                className="screenshot-item"
                                onClick={() => window.open(screenshot, '_blank')}
                            />
                        ))}
                        {(!game.media?.screenshots || game.media.screenshots.length === 0) && (
                            <p style={{ fontStyle: 'italic', fontWeight: '800' }}>KHÔNG CÓ ẢNH CHỤP MÀN HÌNH NÀO.</p>
                        )}
                    </div>
                </div>

                <aside className="game-sidebar-info">
                    <img
                        src={game.media?.coverImage || 'https://via.placeholder.com/600x800'}
                        alt={game.name}
                        className="game-sidebar-cover"
                    />
                    <div className="info-item">
                        <span className="info-label">NHÀ PHÁT TRIỂN</span>
                        <span className="info-value">{game.developer || "ĐANG CẬP NHẬT"}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">NGÀY PHÁT HÀNH</span>
                        <span className="info-value">
                            {game.releaseDate ? new Date(game.releaseDate).toLocaleDateString() : "ĐANG CẬP NHẬT"}
                        </span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">THỂ LOẠI</span>
                        <div className="tag-list">
                            {genres.map(genre => (
                                <span
                                    key={genre._id}
                                    className="tag-item"
                                    onClick={() => goToGenre(genre._id)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    {genre.name}
                                </span>
                            ))}
                            {genres.length === 0 && <span className="info-value">ĐANG CẬP NHẬT</span>}
                        </div>
                    </div>
                    <div className="info-item">
                        <span className="info-label">PHẢN HỒI CỦA NGƯỜI CHƠI</span>
                        <div
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '10px',
                                cursor: 'pointer',
                                padding: '5px 15px',
                                backgroundColor: isLiked ? 'var(--sunflower-gold)' : 'transparent',
                                border: isLiked ? 'var(--border-thick)' : '2px dashed rgba(0,0,0,0.3)',
                                boxShadow: isLiked ? 'var(--shadow-small)' : 'none',
                                transition: 'all 0.2s',
                                marginTop: '5px'
                            }}
                            onClick={handleToggleLike}
                            title={isLiked ? "Bỏ thích" : "Thích trò chơi này"}
                        >
                            <span style={{ fontSize: '2rem', filter: isLiked ? 'none' : 'grayscale(100%) opacity(0.5)' }}>👍</span>
                            <span className="info-value" style={{ fontSize: '1.5rem', margin: 0, fontWeight: 900 }}>
                                {coutLike} LƯỢT THÍCH
                            </span>
                        </div>
                    </div>
                    <button
                        className={`user-btn ${inWishlist ? 'active' : ''}`}
                        style={{
                            width: '100%',
                            marginTop: '10px',
                            justifyContent: 'center',
                            backgroundColor: inWishlist ? 'var(--flag-red)' : 'var(--white)',
                            color: inWishlist ? 'var(--white)' : 'var(--black)'
                        }}
                        onClick={handleToggleWishlist}
                    >
                        {inWishlist ? '✓ TRONG DANH SÁCH ƯỚC' : 'THÊM VÀO DANH SÁCH ƯỚC'}
                    </button>
                </aside>
            </header>

            <section className="buy-section">
                <div className="price-box">
                    <span className="buy-subtitle">SỞ HỮU TRÒ CHƠI {game.name}</span>
                    <div className="buy-price" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        {game.price > 0 && finalDiscount > 0 && (
                            <span style={{ backgroundColor: '#e53935', color: 'white', padding: '5px 10px', borderRadius: '4px', fontSize: '1.2rem', fontWeight: '900' }}>-{finalDiscount}%</span>
                        )}
                        {finalDiscount > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                <span style={{ textDecoration: 'line-through', color: '#888', fontSize: '1.2rem' }}>{formatCurrency(game.price)}</span>
                                <span style={{ color: '#90EE90', fontSize: '2rem' }}>{formatCurrency(discountedPrice)}</span>
                            </div>
                        ) : (
                            <span style={{ fontSize: '2rem' }}>{formatCurrency(game.price)}</span>
                        )}
                    </div>
                </div>
                <button
                    className={`add-to-cart-btn ${isInCart ? 'in-cart' : ''}`}
                    onClick={isInCart ? () => navigate('/cart') : handleAddToCart}
                >
                    {isInCart ? '✓ ĐÃ TRONG GIỎ HÀNG' : 'THÊM VÀO GIỎ HÀNG'}
                </button>
            </section>
        </div>
    );
};

export default Game;
