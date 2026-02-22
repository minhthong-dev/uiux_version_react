import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import gameApi from '../../api/gameApi';
import categoryApi from '../../api/categoryApi';
import useGenreNav from '../../hooks/useGenreNav';
import { formatCurrency } from '../../utils/formatCurrency';
import './game.css';

const Game = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [game, setGame] = useState(null);
    const [loading, setLoading] = useState(true);
    const [genres, setGenres] = useState([]);
    const [inWishlist, setInWishlist] = useState(false);
    const { goToGenre } = useGenreNav();

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
                alert('Đã xóa khỏi danh sách ước!');
            } else {
                await gameApi.addWishlist(game._id);
                setInWishlist(true);
                alert('Đã thêm vào danh sách ước!');
            }
        } catch (error) {
            console.error('Lỗi khi cập nhật danh sách ước:', error);
            alert('Thao tác thất bại!');
        }
    };

    useEffect(() => {
        const fetchGameDetail = async () => {
            try {
                const [data, wishData] = await Promise.all([
                    gameApi.getGameById(id),
                    gameApi.isWishlist(id)
                ]);

                if (wishData === true) {
                    setInWishlist(true);
                }

                // Vì API trả về data hoặc [] nếu lỗi, nên check kỹ
                if (data && data.data) {
                    setGame(data.data);
                    // Fetch genre names
                    if (data.data.genre && data.data.genre.length > 0) {
                        const genrePromises = data.data.genre.map(gId => categoryApi.getCategoryById(gId));
                        const genreResults = await Promise.all(genrePromises);
                        setGenres(genreResults.filter(Boolean));
                    }
                } else if (data && !data.data && data._id) {
                    setGame(data);
                    if (data.genre && data.genre.length > 0) {
                        const genrePromises = data.genre.map(gId => categoryApi.getCategoryById(gId));
                        const genreResults = await Promise.all(genrePromises);
                        setGenres(genreResults.filter(Boolean));
                    }
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '2rem' }}>👍</span>
                            <span className="info-value" style={{ fontSize: '1.5rem' }}>{game.like} LƯỢT THÍCH</span>
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
                    <span className="buy-price">
                        {formatCurrency(game.price)}
                    </span>
                </div>
                <button className="add-to-cart-btn">MUA NGAY</button>
            </section>
        </div>
    );
};

export default Game;
