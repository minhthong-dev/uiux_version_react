import React, { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import gameApi from '../../api/gameApi';
import './game.css';
import FormCreateGame from './formCreateGame';
import FormUploadImageGame from './formUploadImageGame';
import { toast } from '../notification/toast';
import categoryApi from '../../api/categoryApi';

const CategoryTag = ({ id }) => {
    const [name, setName] = React.useState('Loading...');

    React.useEffect(() => {
        const fetchName = async () => {
            try {
                const result = await categoryApi.getCategoryById(id);
                // Backend trả về object category { _id, name }
                setName(result.name || result.data?.name || id);
            } catch (error) {
                console.error("Error fetching category:", error);
                setName(id);
            }
        };
        if (id) fetchName();
    }, [id]);

    return <span className="genre-tag">{name}</span>;
};

const GameManagement = () => {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [showUploadForm, setShowUploadForm] = useState(false);
    const [selectedGameForUpload, setSelectedGameForUpload] = useState(null);
    const [editingGame, setEditingGame] = useState(null);
    const [isSeeding, setIsSeeding] = useState(false);

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
                    toast.error("Lỗi cập nhật: " + result.error);
                    return;
                }
                toast.success("Cập nhật game thành công!");
                setEditingGame(null);
            } else {
                // Logic tạo mới game
                result = await gameApi.createGame(formData);
                if (result.error) {
                    toast.error("Lỗi: " + result.error);
                    return;
                }
                toast.success("Tạo game mới thành công!");

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
            toast.error("Có lỗi xảy ra khi lưu game.");
        }
    };

    const handlerDeleteGame = async (gameID) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa game này?")) return;
        try {
            const result = await gameApi.deleteGame(gameID);
            if (result.error) {
                toast.error("Lỗi: " + result.error);
                return;
            }
            await loadGames();
            toast.success("Xóa game thành công!");
        } catch (error) {
            console.error("Error deleting game:", error);
            toast.error("Có lỗi xảy ra khi xóa game.");
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

    const handleSeedAAA = async () => {
        if (isSeeding) return;
        setIsSeeding(true);
        const loadingToast = toast.info("Đang upload 20 game AAA cực phẩm...");

        const aaaGames = [
            // {
            //     name: "Elden Ring",
            //     releaseDate: "2022-02-25",
            //     content: "Sống sót và trở thành Elden Lord trong vùng đất Lands Between. Một siêu phẩm từ FromSoftware và George R. R. Martin.",
            //     downloadKey: "https://store.steampowered.com/app/1245620/ELDEN_RING/",
            //     genre: ["69995bc51bbd5d88bd8ae5c2", "69995bca1bbd5d88bd8ae60c", "69995bc71bbd5d88bd8ae5e4"],
            //     price: 1200000
            // },
            // {
            //     name: "Cyberpunk 2077",
            //     releaseDate: "2020-12-10",
            //     content: "Khám phá thành phố Night City rực rỡ nhưng thối nát. Một trải nghiệm nhập vai hành động thế giới mở đầy kịch tính.",
            //     downloadKey: "https://store.steampowered.com/app/1091500/Cyberpunk_2077/",
            //     genre: ["69995bc51bbd5d88bd8ae5c2", "69995bc81bbd5d88bd8ae5f4", "69995bc71bbd5d88bd8ae5e4"],
            //     price: 990000
            // },
            // {
            //     name: "The Witcher 3: Wild Hunt",
            //     releaseDate: "2015-05-19",
            //     content: "Hành trình tìm kiếm Ciri của Geralt of Rivia qua một thế giới mang đậm màu sắc thần thoại và chính trị.",
            //     downloadKey: "https://store.steampowered.com/app/292030/The_Witcher_3_Wild_Hunt/",
            //     genre: ["69995bc51bbd5d88bd8ae5c5", "69995bc71bbd5d88bd8ae5e4", "69995bce1bbd5d88bd8ae64c"],
            //     price: 500000
            // },
            {
                name: "Red Dead Redemption 2",
                releaseDate: "2018-10-26",
                content: "Câu chuyện sử thi về cuộc sống ngoài vòng pháp luật tại Mỹ vào giai đoạn cuối của kỷ nguyên cao bồi.",
                downloadKey: "https://store.steampowered.com/app/1174180/Red_Dead_Redemption_2/",
                genre: ["69995bc51bbd5d88bd8ae5c2", "69995bc51bbd5d88bd8ae5c5", "69995bc71bbd5d88bd8ae5e4"],
                price: 1000000
            }
            // {
            //     name: "Ghost of Tsushima",
            //     releaseDate: "2020-07-17",
            //     content: "Trận chiến bảo vệ hòn đảo Tsushima của chiến binh Samurai Jin Sakai trước sự xâm lược của quân Mông Cổ.",
            //     downloadKey: "https://store.steampowered.com/app/2215430/Ghost_of_Tsushima_DIRECTORS_CUT/",
            //     genre: ["69995bc51bbd5d88bd8ae5c2", "69995bc71bbd5d88bd8ae5e4", "69995bcd1bbd5d88bd8ae649"],
            //     price: 1100000
            // },
            // {
            //     name: "Resident Evil 4 Remake",
            //     releaseDate: "2023-03-24",
            //     content: "Leon S. Kennedy dấn thân vào một ngôi làng tăm tối tại Tây Ban Nha để giải cứu con gái Tổng thống.",
            //     downloadKey: "https://store.steampowered.com/app/2050650/Resident_Evil_4/",
            //     genre: ["69995bc71bbd5d88bd8ae5de", "69995bc71bbd5d88bd8ae5e1", "69995bc51bbd5d88bd8ae5c2"],
            //     price: 900000
            // },
            // {
            //     name: "Black Myth: Wukong",
            //     releaseDate: "2024-08-20",
            //     content: "Hành trình của Thiên Mệnh Nhân dựa trên nguyên tác Tây Du Ký với đồ họa đỉnh cao và lối chơi cuốn hút.",
            //     downloadKey: "https://store.steampowered.com/app/2358720/Black_Myth_Wukong/",
            //     genre: ["69995bc51bbd5d88bd8ae5c2", "69995bce1bbd5d88bd8ae64c", "69995bcd1bbd5d88bd8ae640"],
            //     price: 1300000
            // },
            // {
            //     name: "God of War Ragnarök",
            //     releaseDate: "2022-11-09",
            //     content: "Kratos và Atreus đối mặt với ngày tận thế Ragnarök trong thần thoại Bắc Âu.",
            //     downloadKey: "https://store.steampowered.com/app/2322010/God_of_War_Ragnark/",
            //     genre: ["69995bc51bbd5d88bd8ae5c2", "69995bc51bbd5d88bd8ae5c5", "69995bce1bbd5d88bd8ae64c"],
            //     price: 1250000
            // },
            // {
            //     name: "Forza Horizon 5",
            //     releaseDate: "2021-11-09",
            //     content: "Lễ hội đua xe tại Mexico với những cung đường tuyệt đẹp và hàng trăm siêu xe.",
            //     downloadKey: "https://store.steampowered.com/app/1551360/Forza_Horizon_5/",
            //     genre: ["69995bc61bbd5d88bd8ae5d1", "69995bc71bbd5d88bd8ae5d8", "69995bc71bbd5d88bd8ae5e4"],
            //     price: 800000
            // },
            // {
            //     name: "Street Fighter 6",
            //     releaseDate: "2023-06-02",
            //     content: "Kỷ nguyên mới của dòng game đối kháng huyền thoại với chế độ World Tour đầy mới lạ.",
            //     downloadKey: "https://store.steampowered.com/app/1364780/Street_Fighter_6/",
            //     genre: ["69995bcc1bbd5d88bd8ae631", "69995bc71bbd5d88bd8ae5d8"],
            //     price: 1150000
            // },
            // {
            //     name: "God of War (2018)",
            //     releaseDate: "2018-04-20",
            //     content: "Kratos đã để lại quá khứ của mình đằng sau và sống trong vùng đất của các vị thần Bắc Âu cùng con trai Atreus.",
            //     downloadKey: "https://store.steampowered.com/app/1593500/God_of_War/",
            //     genre: ["69995bc51bbd5d88bd8ae5c2", "69995bc51bbd5d88bd8ae5c5", "69995bce1bbd5d88bd8ae64c"],
            //     price: 800000
            // },
            // {
            //     name: "Sekiro: Shadows Die Twice",
            //     releaseDate: "2019-03-22",
            //     content: "Chống lại kẻ thù trong một thế giới Sengoku Nhật Bản huyền bí và nguy hiểm. Trải nghiệm hệ thống chiến đấu đỉnh cao.",
            //     downloadKey: "https://store.steampowered.com/app/814380/Sekiro_Shadows_Die_Twice__GOTY_Edition/",
            //     genre: ["69995bc51bbd5d88bd8ae5c2", "69995bca1bbd5d88bd8ae60c", "69995bcd1bbd5d88bd8ae63d"],
            //     price: 750000
            // },
            // {
            //     name: "Marvel's Spider-Man Remastered",
            //     releaseDate: "2022-08-12",
            //     content: "Trở thành người nhện và bảo vệ thành phố New York khỏi những siêu tội phạm với khả năng bay lướt mượt mà.",
            //     downloadKey: "https://store.steampowered.com/app/1817070/Marvels_SpiderMan_Remastered/",
            //     genre: ["69995bc51bbd5d88bd8ae5c2", "69995bc51bbd5d88bd8ae5c5", "69995bc71bbd5d88bd8ae5e4"],
            //     price: 1100000
            // },
            // {
            //     name: "Horizon Zero Dawn",
            //     releaseDate: "2020-08-07",
            //     content: "Khám phá thế giới bị thống trị bởi những cỗ máy khổng lồ thông qua đôi mắt của Aloy và bí ẩn về nền văn minh cũ.",
            //     downloadKey: "https://store.steampowered.com/app/1151640/Horizon_Zero_Dawn_Complete_Edition/",
            //     genre: ["69995bc51bbd5d88bd8ae5c2", "69995bc51bbd5d88bd8ae5c5", "69995bc71bbd5d88bd8ae5e4"],
            //     price: 400000
            // },
            // {
            //     name: "Monster Hunter: World",
            //     releaseDate: "2018-08-09",
            //     content: "Săn lùng những quái vật khổng lồ trong hệ sinh thái đa dạng và chế tạo trang bị từ chúng cùng bạn bè.",
            //     downloadKey: "https://store.steampowered.com/app/582010/Monster_Hunter_World/",
            //     genre: ["69995bc51bbd5d88bd8ae5c2", "69995bc51bbd5d88bd8ae5c5", "69995bc71bbd5d88bd8ae5d5"],
            //     price: 600000
            // },
            // {
            //     name: "Devil May Cry 5",
            //     releaseDate: "2019-03-08",
            //     content: "Dante, Nero và V trở lại trong trận chiến chống lại quỷ dữ với phong cách cực ngầu và nhạc nền sôi động.",
            //     downloadKey: "https://store.steampowered.com/app/601150/Devil_May_Cry_5/",
            //     genre: ["69995bc51bbd5d88bd8ae5c2", "69995bcd1bbd5d88bd8ae640", "69995bc91bbd5d88bd8ae600"],
            //     price: 550000
            // },
            // {
            //     name: "Dying Light 2 Stay Human",
            //     releaseDate: "2022-02-04",
            //     content: "Parkour và chiến đấu để sinh tồn trong một thế giới hậu tận thế đầy rẫy thây ma, nơi mọi lựa chọn đều có hậu quả.",
            //     downloadKey: "https://store.steampowered.com/app/534380/Dying_Light_2_Stay_Human/",
            //     genre: ["69995bc51bbd5d88bd8ae5c2", "69995bc71bbd5d88bd8ae5e1", "69995bc81bbd5d88bd8ae5f7"],
            //     price: 900000
            // },
            // {
            //     name: "Final Fantasy VII Remake Intergrade",
            //     releaseDate: "2021-12-16",
            //     content: "Bản làm lại tuyệt đẹp của huyền thoại Cloud Strife chống lại tập đoàn Shinra tại thành phố Midgar.",
            //     downloadKey: "https://store.steampowered.com/app/1462040/FINAL_FANTASY_VII_REMAKE_INTERGRADE/",
            //     genre: ["69995bc51bbd5d88bd8ae5c2", "69995bc51bbd5d88bd8ae5c5", "69995bce1bbd5d88bd8ae64c"],
            //     price: 1200000
            // },
            // {
            //     name: "Baldur's Gate 3",
            //     releaseDate: "2023-08-03",
            //     content: "Tập hợp tổ đội và quay trở lại Forgotten Realms trong câu chuyện về tình bạn và sự phản bội, sự hy sinh và sinh tồn.",
            //     downloadKey: "https://store.steampowered.com/app/1086940/Baldurs_Gate_3/",
            //     genre: ["69995bc51bbd5d88bd8ae5c5", "69995bc71bbd5d88bd8ae5db", "69995bca1bbd5d88bd8ae61b"],
            //     price: 1000000
            // },
            // {
            //     name: "Hades",
            //     releaseDate: "2020-09-17",
            //     content: "Thách thức vị thần chết chóc khi bạn chiến đấu để thoát khỏi thế giới ngầm trong trò chơi roguelike dungeon crawler này.",
            //     downloadKey: "https://store.steampowered.com/app/1145360/Hades/",
            //     genre: ["69995bc51bbd5d88bd8ae5c2", "69995bc91bbd5d88bd8ae603", "69995bc91bbd5d88bd8ae606"],
            //     price: 300000
            // }
        ];

        try {
            for (const game of aaaGames) {
                await gameApi.createGame(game);
            }
            toast.success("Đã upload thành công thêm 20 game AAA cực phẩm!");
            loadGames();
        } catch (error) {
            console.error("Seed failed:", error);
            toast.error("Lỗi khi seed game AAA.");
        } finally {
            setIsSeeding(false);
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
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        className="add-btn"
                        style={{ background: 'var(--amber-gold)', color: 'var(--black)' }}
                        onClick={handleSeedAAA}
                        disabled={isSeeding}
                    >
                        {isSeeding ? 'ĐANG UPLOAD...' : '🚀 UPLOAD 10 GAME AAA'}
                    </button>
                    <button className="add-btn" onClick={() => setShowForm(true)}>+ TAO GAME MOI</button>
                </div>
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
                        initialMedia={selectedGameForUpload.media}
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
                                    {(game.categoryId || game.genre || []).map((id, index) => (
                                        <CategoryTag key={index} id={id} />
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
