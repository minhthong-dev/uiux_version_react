import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './home.css';
import gameApi from '../../api/gameApi';
import categoryApi from '../../api/categoryApi';
import useGenreNav from '../../hooks/useGenreNav';
import { formatCurrency } from '../../utils/formatCurrency';
import { Eye } from 'lucide-react';
const Home = () => {
    const navigate = useNavigate();
    const [games, setGames] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const { goToGenre } = useGenreNav();



    useEffect(() => {
        const fetchData = async () => {
            try {
                const [gamesData, catsData] = await Promise.all([
                    gameApi.getAllGames(),
                    categoryApi.getAllCategories()
                ]);
                setGames(gamesData);
                setCategories(catsData || []);

            } catch (error) {
                console.error("Lỗi khi tải dữ liệu:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-color)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <h1 style={{ color: 'var(--deep-space-blue)', fontWeight: 900 }}>ĐANG TẢI DỮ LIỆU...</h1>
            </div>
        );
    }

    const featuredGame = games.length > 0 ? games[0] : null;
    const trendingGames = [...games].sort((a, b) => b.like - a.like).slice(0, 4);
    const freeGames = games.filter(g => g.price === 0).slice(0, 4);

    return (
        <div className="steam-home">
            {/* 1. Hero Highlight */}
            {featuredGame && (
                <section className="featured-section">
                    <h2 className="section-title">NỔI BẬT NHẤT</h2>
                    <div className="featured-hero">
                        <img src={featuredGame.media?.coverImage || 'https://via.placeholder.com/600x800'} alt={featuredGame.name} />
                        <div className="hero-info">
                            <div className="hero-tag">HOT DEAL</div>
                            <h1>{featuredGame.name}</h1>
                            <p>{featuredGame.content?.substring(0, 150)}...</p>
                            <div className="hero-footer">
                                <span className="price-tag">
                                    {formatCurrency(featuredGame.price)}
                                </span>
                                <button className="play-btn" onClick={() => navigate(`/game/${featuredGame._id}`)}>CHI TIẾT NGAY</button>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* 2. Trending Games Grid */}
            <section className="games-list-section">
                <h2 className="section-title">XU HƯỚNG HIỆN TẠI</h2>
                <div className="game-grid-steam">
                    {trendingGames.map((game) => (
                        <GameCard key={game._id} game={game} />
                    ))}
                </div>
            </section>

            {/* 3. Categories Grid */}

            <section className="categories-section">
                <h2 className="section-title">KHÁM PHÁ THEO THỂ LOẠI</h2>
                <div className="category-grid-steam">
                    {categories.slice(0, 6).map((cat, index) => {
                        const colors = ['var(--vivid-tangerine)', 'var(--flag-red)', 'var(--deep-space-blue)', 'var(--sunflower-gold)'];
                        return (
                            <div
                                key={cat._id}
                                className="category-card"
                                style={{ backgroundColor: colors[index % colors.length] }}
                                onClick={() => goToGenre(cat._id)}
                            >
                                <span className="cat-name">{cat.name}</span>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* 4. Free Games Section */}
            {freeGames.length > 0 && (
                <section className="games-list-section">
                    <h2 className="section-title">MIỄN PHÍ DÀNH CHO BẠN</h2>
                    <div className="game-grid-steam">
                        {freeGames.map((game) => (
                            <div key={game._id}>
                                <GameCard game={game} />
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* 5. All Games Section */}
            <section className="games-list-section">
                <h2 className="section-title">TẤT CẢ TRÒ CHƠI</h2>
                <div className="game-grid-steam">
                    {games.map((game) => (
                        <GameCard key={game._id} game={game} />
                    ))}
                </div>
            </section>
        </div>
    );
};

const GenreTag = ({ categoryId }) => {
    const [categoryName, setCategoryName] = useState("...");
    const { goToGenre } = useGenreNav();

    useEffect(() => {
        const fetchCategoryName = async () => {
            try {
                const result = await categoryApi.getCategoryById(categoryId);
                if (result) {
                    setCategoryName(result.name);
                } else {
                    setCategoryName(categoryId);
                }
            } catch (error) {
                setCategoryName(categoryId);
            }
        };
        if (categoryId) fetchCategoryName();
    }, [categoryId]);

    return (
        <span
            className="tag"
            onClick={(e) => { e.stopPropagation(); goToGenre(categoryId); }}
            style={{ cursor: 'pointer' }}
        >
            {categoryName}
        </span>
    );
};

// Sub-component cho thẻ game để tái sử dụng
const GameCard = ({ game }) => {
    const [view, setView] = useState([]);
    const navigate = useNavigate();
    const randomView = () => {
        const random = Math.floor(Math.random() * 1000);
        setView(random);
    }
    useEffect(() => {
        randomView();
    }, []);

    return (
        <div className="game-card-steam" onClick={() => navigate(`/game/${game._id}`)}>
            <div className="card-media">
                <img src={game.media?.coverImage || 'https://via.placeholder.com/600x800'} alt={game.name} />
                {game.price === 0 && <span className="free-badge">FREE</span>}
            </div>
            <div className="card-details">
                <h3 className="game-name">{game.name}</h3>
                <div className="game-tags">
                    {game.genre && game.genre.slice(0, 2).map((genreId, i) => (
                        <GenreTag key={i} categoryId={genreId} />
                    ))}
                </div>
                {/* <div className="card-footer">
                    <div className="feedback">👍 {game.like}</div>
                    <div className="card-price">
                        {formatCurrency(game.price)}
                    </div>
                </div> */}
                <div className="card-footer">
                    <div className="view-btn"><Eye style={{ marginRight: '10px' }} size={20} />{view}</div>
                    <div className="card-price">
                        {formatCurrency(game.price)}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;

