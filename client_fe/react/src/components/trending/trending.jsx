import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gameApi from '../../api/gameApi';
import { formatCurrency } from '../../utils/formatCurrency';
import './trending.css';

const Trending = () => {
    const navigate = useNavigate();
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTrending = async () => {
            try {
                const data = await gameApi.getAllGames();
                let sortedGames = [...data];

                // Sắp xếp: Ưu tiên Wishlist trước, sau đó đến Like
                sortedGames.sort((a, b) => {
                    const wishA = Array.isArray(a.wishlist) ? a.wishlist.length : (a.wishlist || 0);
                    const wishB = Array.isArray(b.wishlist) ? b.wishlist.length : (b.wishlist || 0);
                    const wishDiff = wishB - wishA;
                    if (wishDiff !== 0) return wishDiff;

                    const likeA = Array.isArray(a.like) ? a.like.length : (a.like || 0);
                    const likeB = Array.isArray(b.like) ? b.like.length : (b.like || 0);
                    return likeB - likeA;
                });

                // Kiểm tra nếu tất cả đều bằng nhau (để trộn ngẫu nhiên)
                const firstG = sortedGames[0];
                const firstWish = firstG ? (Array.isArray(firstG.wishlist) ? firstG.wishlist.length : (firstG.wishlist || 0)) : 0;
                const firstLike = firstG ? (Array.isArray(firstG.like) ? firstG.like.length : (firstG.like || 0)) : 0;

                const allEqual = sortedGames.every(g => {
                    const wishG = Array.isArray(g.wishlist) ? g.wishlist.length : (g.wishlist || 0);
                    const likeG = Array.isArray(g.like) ? g.like.length : (g.like || 0);
                    return wishG === firstWish && likeG === firstLike;
                });

                if (allEqual && sortedGames.length > 0) {
                    sortedGames = sortedGames.sort(() => Math.random() - 0.5);
                }

                setGames(sortedGames);
            } catch (error) {
                console.error("Lỗi khi tải bảng xếp hạng:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTrending();
    }, []);

    if (loading) {
        return (
            <div style={{ height: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <h1 className="trending-title">ĐANG TÍNH TOÁN BẢNG XẾP HẠNG...</h1>
            </div>
        );
    }

    const topGames = games.slice(0, 3);
    const otherGames = games.slice(3);

    const PodiumItem = ({ game, rank }) => (
        <div className={`podium-item rank-${rank}`} onClick={() => navigate(`/game/${game._id}`)}>
            <div className="rank-badge">{rank}</div>
            <div className="podium-card">
                <div className="podium-img-wrapper">
                    <img src={game.media?.coverImage || 'https://via.placeholder.com/600x800'} alt={game.name} />
                </div>
                <div className="podium-info">
                    <h3 className="podium-name">{game.name}</h3>
                    <div className="podium-likes">🔥 {Array.isArray(game.like) ? game.like.length : (game.like || 0)} LƯỢT THÍCH</div>
                    <div style={{ fontWeight: 900, marginTop: '10px' }}>{formatCurrency(game.price)}</div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="trending-container">
            <header className="trending-hero">
                <h1 className="trending-title">XU HƯỚNG BÙNG NỔ</h1>
                <p style={{ fontWeight: 900, fontSize: '1.2rem', textTransform: 'uppercase' }}>
                    Những trò chơi đang làm mưa làm gió trong cộng đồng
                </p>
            </header>

            <section className="podium">
                {topGames[1] && <PodiumItem game={topGames[1]} rank={2} />}
                {topGames[0] && <PodiumItem game={topGames[0]} rank={1} />}
                {topGames[2] && <PodiumItem game={topGames[2]} rank={3} />}
            </section>

            <section className="trending-list-section">
                <h2 className="section-title" style={{ marginBottom: '40px' }}>DANH SÁCH TIẾP THEO</h2>
                <div className="trending-list">
                    {otherGames.map((game, index) => (
                        <div
                            key={game._id}
                            className="trending-item-row"
                            onClick={() => navigate(`/game/${game._id}`)}
                        >
                            <span className="row-rank">#{index + 4}</span>
                            <img
                                src={game.media?.coverImage || 'https://via.placeholder.com/600x800'}
                                alt={game.name}
                                className="row-img"
                            />
                            <span className="row-name">{game.name}</span>
                            <span className="row-likes">{Array.isArray(game.like) ? game.like.length : (game.like || 0)} LIKE</span>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Trending;
