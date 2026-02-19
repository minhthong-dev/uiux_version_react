import React, { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import gameApi from '../../api/gameApi';
import './game.css';
import FormCreateGame from './formCreateGame';
import FormUploadImageGame from './formUploadImageGame';

const GameManagement = () => {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [showUploadForm, setShowUploadForm] = useState(false);
    const [selectedGameForUpload, setSelectedGameForUpload] = useState(null);
    const [editingGame, setEditingGame] = useState(null);

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
            let result;
            if (editingGame) {
                // Logic cập nhật game
                result = await gameApi.updateGame(editingGame._id, formData);
                if (result.error) {
                    alert("Lỗi cập nhật: " + result.error);
                    return;
                }
                alert("Cập nhật game thành công!");
                setEditingGame(null);
            } else {
                // Logic tạo mới game
                result = await gameApi.createGame(formData);
                if (result.error) {
                    alert("Lỗi: " + result.error);
                    return;
                }
                alert("Tạo game mới thành công! Bây giờ hãy upload hình ảnh cho game.");

                // Tự động mở form upload cho game vừa tạo
                const gameId = result._id || result.data?._id;
                if (gameId) {
                    setSelectedGameForUpload({ _id: gameId, name: formData.name });
                    setShowUploadForm(true);
                }
            }

            setShowForm(false);
            await loadGames();
        } catch (error) {
            console.error("Error saving game:", error);
            alert("Có lỗi xảy ra khi lưu game.");
        }
    };

    const handlerDeleteGame = async (gameID) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa game này?")) return;
        try {
            const result = await gameApi.deleteGame(gameID);
            if (result.error) {
                alert("Lỗi: " + result.error);
                return;
            }
            await loadGames();
            alert("Xóa game thành công!");
        } catch (error) {
            console.error("Error deleting game:", error);
            alert("Có lỗi xảy ra khi xóa game.");
        }
    }

    const openUploadForm = (game) => {
        setSelectedGameForUpload(game);
        setShowUploadForm(true);
    };

    const handleEditClick = (game) => {
        setEditingGame(game);
        setShowForm(true);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setEditingGame(null);
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
                        onClose={handleCloseForm}
                        initialData={editingGame}
                    />
                )}
                {showUploadForm && selectedGameForUpload && (
                    <FormUploadImageGame
                        gameId={selectedGameForUpload._id}
                        gameName={selectedGameForUpload.name}
                        onClose={() => setShowUploadForm(false)}
                        onUploadSuccess={loadGames}
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
                                <div className="card-price-tag">{game.price.toLocaleString()}đ</div>
                                <button
                                    className="add-btn"
                                    style={{ position: 'absolute', bottom: '10px', right: '10px', padding: '5px 10px', fontSize: '0.7rem' }}
                                    onClick={() => openUploadForm(game)}
                                >
                                    UPLOAD ẢNH
                                </button>
                            </div>

                            <div className="card-content">
                                <h3 className="card-title">{game.name}</h3>
                                <div className="card-description">
                                    {game.content || "No description available for this awesome game."}
                                </div>
                                <div className="genres-list">
                                    {(game.genre || []).map((g, index) => (
                                        <span key={index} className="genre-tag">{g}</span>
                                    ))}
                                </div>
                            </div>

                            <div className="card-footer">
                                <span className="game-id">{game._id.substring(0, 8)}...</span>
                                <div className="card-actions">
                                    <button
                                        className="mini-action-btn edit-btn-mini"
                                        title="Edit Game"
                                        onClick={() => handleEditClick(game)}
                                    >
                                        ✎
                                    </button>
                                    <button className="mini-action-btn delete-btn-mini" title="Delete Game" onClick={() => handlerDeleteGame(game._id)}>
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
