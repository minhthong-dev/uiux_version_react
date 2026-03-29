import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gameApi from '../../api/gameApi';
import { formatCurrency } from '../../utils/formatCurrency';
import useGameDiscount from '../../hooks/gameDiscount';
import './trending.css';

const Trending = () => {
    const navigate = useNavigate();
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const { calculateDiscount } = useGameDiscount();

    useEffect(() => {
        const fetchTrending = async () => {
            try {

                const data = await gameApi.getAllGames();
                const gamesWithLikes = await Promise.all(data.map(async (game) => {
                    const count = await gameApi.getCountLike(game._id);
                    return { ...game, likeCount: count };
                }));

                let sortedGames = [...gamesWithLikes];

                // Sắp xếp: Ưu tiên Wishlist trước, sau đó đến Like
                sortedGames.sort((a, b) => {
                    const wishDiff = (b.wishlist?.length || 0) - (a.wishlist?.length || 0);
                    if (wishDiff !== 0) return wishDiff;
                    return (b.likeCount || 0) - (a.likeCount || 0);
                });

                // Kiểm tra nếu tất cả đều bằng nhau (để trộn ngẫu nhiên)
                const firstG = sortedGames[0];
                const allEqual = sortedGames.every(g =>
                    (g.wishlist?.length || 0) === (firstG?.wishlist?.length || 0) &&
                    (g.likeCount || 0) === (firstG?.likeCount || 0)
                );

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

    const PodiumItem = ({ game, rank }) => {
        const { finalDiscount, discountedPrice } = calculateDiscount(game);
        return (
            <div className={`podium-item rank-${rank}`} onClick={() => navigate(`/game/${game._id}`)}>
                <div className="rank-badge">{rank}</div>
                <div className="podium-card">
                    <div className="podium-img-wrapper">
                        <img src={game.media?.coverImage || 'https://via.placeholder.com/600x800'} alt={game.name} />
                        {game.price > 0 && finalDiscount > 0 && (
                            <div style={{ position: 'absolute', top: 5, left: 5, backgroundColor: '#e53935', color: 'white', padding: '2px 5px', borderRadius: '4px', fontWeight: 'bold' }}>-{finalDiscount}%</div>
                        )}
                    </div>
                    <div className="podium-info">
                        <h3 className="podium-name">{game.name}</h3>
                        <div className="podium-likes">🔥 {game.likeCount || 0} LƯỢT THÍCH</div>
                        <div style={{ fontWeight: 900, marginTop: '10px' }}>
                            {finalDiscount > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ textDecoration: 'line-through', color: '#888', fontSize: '0.8em' }}>{formatCurrency(game.price)}</span>
                                    <span style={{ color: '#90EE90' }}>{formatCurrency(discountedPrice)}</span>
                                </div>
                            ) : (
                                formatCurrency(game.price)
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

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
                            <span className="row-likes">{game.likeCount || 0} LIKE</span>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Trending;
