import React, { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import gameApi from '../../api/gameApi';
import './game.css';
import FormCreateGame from './formCreateGame';


const GameManagement = () => {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        loadGames();
    }, []);

    const loadGames = async () => {
        try {
            const data = await gameApi.getAllGames();
            setGames(data);
        } catch (error) {
            console.error("Failed to fetch games:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveGame = async (formData) => {
        try {
            await gameApi.createGame(formData);
            setShowForm(false);
            await loadGames();
            alert("Tạo game mới thành công!");
        } catch (error) {
            console.error("Error creating game:", error);
            alert("Có lỗi xảy ra khi tạo game.");
        }
    };

    if (loading) return (
        <div className="game-mgmt-container">
            <h2 className="login-title">LOADING GAMES...</h2>
        </div>
    );

    return (
        <div className="game-mgmt-container">
            <div className="header-section">
                <h1 className="page-title">KHO GAME ADMIN</h1>
                <button className="add-btn" onClick={() => setShowForm(true)}>+ TAO GAME MOI</button>
            </div>

            <AnimatePresence>
                {showForm && (
                    <FormCreateGame
                        onSave={handleSaveGame}
                        onClose={() => setShowForm(false)}
                    />
                )}
            </AnimatePresence>

            <div className="masonry-grid">
                {games.length > 0 ? (
                    games.map((game) => (
                        <div key={game._id} className="game-card">
                            <div className="card-image-wrapper">
                                <img
                                    src={game.media?.coverImage || `https://placehold.co/600x400/8338ec/ffffff?text=${game.name}`}
                                    alt={game.name}
                                    className="game-cover"
                                />
                                <div className="card-price-tag">${game.price}</div>
                            </div>

                            <div className="card-content">
                                <h3 className="card-title">{game.name}</h3>
                                <div className="card-description">
                                    {game.content || "No description available for this awesome game."}
                                </div>
                                <div className="genres-list">
                                    {(game.genere || []).map((g, index) => (
                                        <span key={index} className="genre-tag">{g}</span>
                                    ))}
                                </div>
                            </div>

                            <div className="card-footer">
                                <span className="game-id">{game._id.substring(0, 8)}...</span>
                                <div className="card-actions">
                                    <button className="mini-action-btn edit-btn-mini" title="Edit Game">
                                        ✎
                                    </button>
                                    <button className="mini-action-btn delete-btn-mini" title="Delete Game">
                                        🗑
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div style={{ textAlign: 'center', width: '100%', padding: '4rem', gridColumn: '1/-1' }}>
                        <h2 className="login-title">NO GAMES FOUND IN DATABASE</h2>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GameManagement;
