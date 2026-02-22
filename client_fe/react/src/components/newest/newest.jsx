import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gameApi from '../../api/gameApi';
import { formatCurrency } from '../../utils/formatCurrency';
import './newest.css';

const Newest = () => {
    const navigate = useNavigate();
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNewest = async () => {
            try {
                const data = await gameApi.getAllGames();

                // Sắp xếp theo ngày phát hành mới nhất
                const sortedGames = [...data].sort((a, b) => {
                    const dateA = new Date(a.releaseDate || 0);
                    const dateB = new Date(b.releaseDate || 0);
                    return dateB - dateA;
                });

                // Lấy tối đa 5 game
                setGames(sortedGames.slice(0, 5));
            } catch (error) {
                console.error("Lỗi khi tải danh sách game mới:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchNewest();
    }, []);

    if (loading) {
        return (
            <div style={{ height: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <h1 className="newest-title">ĐANG CẬP NHẬT SIÊU PHẨM MỚI...</h1>
            </div>
        );
    }

    // Class helper cho phong cách Metro
    const getTileClass = (index) => {
        if (index === 0) return 'metro-tile tile-big';
        if (index === 4) return 'metro-tile tile-wide';
        return 'metro-tile';
    };

    return (
        <div className="newest-container">
            <header className="newest-header">
                <h1 className="newest-title">SIÊU PHẨM MỚI RA MẮT</h1>
            </header>

            <div className="metro-grid">
                {games.map((game, index) => (
                    <div
                        key={game._id}
                        className={`${getTileClass(index)} tile-${index + 1}`}
                        onClick={() => navigate(`/game/${game._id}`)}
                    >
                        <img
                            src={game.media?.coverImage || 'https://via.placeholder.com/600x800'}
                            alt={game.name}
                        />
                        <div className="tile-price">
                            {formatCurrency(game.price)}
                        </div>
                        <div className="tile-overlay">
                            <span className="tile-date">
                                {game.releaseDate ? new Date(game.releaseDate).toLocaleDateString() : 'VỪA RA MẮT'}
                            </span>
                            <h3 className="tile-name">{game.name}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {games.length === 0 && (
                <div style={{ textAlign: 'center', marginTop: '100px' }}>
                    <h2 style={{ color: 'var(--flag-red)', fontWeight: 950 }}>
                        HIỆN TẠI CHƯA CÓ TRÒ CHƠI MỚI NÀO.
                    </h2>
                </div>
            )}
        </div>
    );
};

export default Newest;
