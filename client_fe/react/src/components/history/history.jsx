import React, { useEffect, useState } from "react";
import historyApi from "../../api/historyApi";
import gameApi from "../../api/gameApi";
import walletApi from "../../api/walletApi";
import "./history.css";

const History = () => {
    const [historyData, setHistoryData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [gamesCache, setGamesCache] = useState({});
    const [walletsCache, setWalletsCache] = useState({});
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [filterType, setFilterType] = useState("all");
    const itemsPerPage = 5;

    // Lấy dữ liệu lịch sử từ API
    useEffect(() => {
        const fetchHistoryAndGames = async () => {
            try {
                const response = await historyApi.getHistory();
                const data = response.data || response;
                if (Array.isArray(data)) {
                    const sortedData = [...data].sort((a, b) => {
                        const dateA = a.createdAt?.$date ? new Date(a.createdAt.$date) : new Date(a.createdAt);
                        const dateB = b.createdAt?.$date ? new Date(b.createdAt.$date) : new Date(b.createdAt);
                        return dateB - dateA;
                    });
                    setHistoryData(sortedData);
                    setFilteredData(sortedData);

                    // Thu thập tất cả gameId từ các giao dịch buying
                    const allGameIds = new Set();
                    const allWalletIds = new Set();
                    sortedData.forEach(item => {
                        if (item.type === "buying") {
                            if (item.gameIds && Array.isArray(item.gameIds)) {
                                item.gameIds.forEach(idObj => {
                                    const id = typeof idObj === 'string' ? idObj : (idObj.$oid || idObj);
                                    if (id) allGameIds.add(id);
                                });
                            }


                            const potentialWalletId = item.walletId || item.idWallet || item.wallet;
                            if (potentialWalletId) {
                                const wId = typeof potentialWalletId === 'string' ? potentialWalletId : (potentialWalletId.$oid || potentialWalletId);
                                if (wId) allWalletIds.add(wId);
                            }

                            if (item.gameIds && item.gameIds.length === 1 && !potentialWalletId) {
                                const gId = typeof item.gameIds[0] === 'string' ? item.gameIds[0] : (item.gameIds[0].$oid || item.gameIds[0]);
                                if (gId) allWalletIds.add(gId);
                            }
                        }
                    });

                    // Lấy chi tiết game (caching)
                    if (allGameIds.size > 0) {
                        const gamePromises = Array.from(allGameIds).map(id =>
                            gameApi.getGameById(id)
                                .then(res => ({ id, data: res ? (res.data || res) : null }))
                                .catch(() => ({ id, data: null }))
                        );
                        const gamesResults = await Promise.all(gamePromises);
                        const cache = {};
                        gamesResults.forEach(res => {
                            if (res.data) cache[res.id] = res.data;
                        });
                        setGamesCache(cache);
                    }

                    if (allWalletIds.size > 0) {
                        const walletPromises = Array.from(allWalletIds).map(id =>
                            walletApi.getWalletById(id)
                                .then(res => ({ id, data: res ? (res.data || res) : null }))
                                .catch(() => ({ id, data: null }))
                        );
                        const walletResults = await Promise.all(walletPromises);
                        const wCache = {};
                        walletResults.forEach(res => {
                            if (res.data) wCache[res.id] = res.data;
                        });
                        setWalletsCache(wCache);
                    }
                }

            } catch (error) {
                console.error("Lỗi khi tải lịch sử hoặc thông tin game:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistoryAndGames();
    }, []);

    // Xử lý lọc dữ liệu
    useEffect(() => {
        if (filterType === "all") {
            setFilteredData(historyData);
        } else if (filterType === "wallet") {
            setFilteredData(historyData.filter(item => {
                const wId = item.walletId || item.idWallet || item.wallet;
                const isStoredInGames = item.gameIds && item.gameIds.length === 1 && walletsCache[typeof item.gameIds[0] === 'string' ? item.gameIds[0] : (item.gameIds[0].$oid || item.gameIds[0])];
                return item.type === "buying" && (wId || isStoredInGames);
            }));
        } else if (filterType === "buying") {
            setFilteredData(historyData.filter(item => {
                const wId = item.walletId || item.idWallet || item.wallet;
                const isStoredInGames = item.gameIds && item.gameIds.length === 1 && walletsCache[typeof item.gameIds[0] === 'string' ? item.gameIds[0] : (item.gameIds[0].$oid || item.gameIds[0])];
                return item.type === "buying" && !wId && !isStoredInGames;
            }));
        } else {
            setFilteredData(historyData.filter(item => item.type === filterType));
        }
        setCurrentPage(1);
    }, [filterType, historyData, walletsCache]);


    // Tính toán phân trang
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Định dạng ngày tháng
    const formatDate = (dateInput) => {
        const dateString = dateInput?.$date || dateInput;
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    // Định dạng tiền tệ
    const formatCurrency = (value) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(value);
    };

    if (loading) {
        return (
            <div className="history-loading-container">
                <div className="status-card">Đang tải dữ liệu...</div>
            </div>
        );
    }

    return (
        <div className="history-container">
            <div className="history-title-box">
                <h1 className="history-title">Nhật ký giao dịch</h1>
                <div className="history-subtitle">Theo dõi mọi hoạt động tài chính của bạn</div>
            </div>

            <div className="history-filters">
                <button
                    className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
                    onClick={() => setFilterType('all')}
                >
                    Tất cả
                </button>
                <button
                    className={`filter-btn ${filterType === 'amount' ? 'active' : ''}`}
                    onClick={() => setFilterType('amount')}
                >
                    Nạp tiền
                </button>
                <button
                    className={`filter-btn ${filterType === 'wallet' ? 'active' : ''}`}
                    onClick={() => setFilterType('wallet')}
                >
                    Thẻ ví
                </button>
                <button
                    className={`filter-btn ${filterType === 'buying' ? 'active' : ''}`}
                    onClick={() => setFilterType('buying')}
                >
                    Mua game
                </button>

            </div>

            <div className="history-list">
                {currentItems.length === 0 ? (
                    <div className="history-empty-container">
                        <div className="status-card">Chưa có giao dịch phù hợp</div>
                    </div>
                ) : (
                    currentItems.map((item) => {
                        const wIdValue = item.walletId || item.idWallet || item.wallet;
                        const gIdValue = item.gameIds && item.gameIds.length === 1 ? (typeof item.gameIds[0] === 'string' ? item.gameIds[0] : (item.gameIds[0].$oid || item.gameIds[0])) : null;
                        const isWalletPurchase = item.type === "buying" && (wIdValue || (gIdValue && walletsCache[gIdValue]));
                        return (
                            <div key={item._id} className={`history-item ${item.type} ${isWalletPurchase ? 'wallet-type' : ''}`}>
                                <div className="item-icon-box">
                                    {item.type === "amount" ? "💰" : (isWalletPurchase ? "🎟️" : "🎮")}
                                </div>

                                <div className="item-main-area">
                                    <div className="item-header">
                                        <span className="item-type-badge">
                                            {item.type === "amount" ? "Nạp tiền" : (isWalletPurchase ? "Thẻ ví" : "Mua game")}
                                        </span>
                                        <span className="item-date">📅 {formatDate(item.createdAt)}</span>
                                    </div>

                                    <div className="item-content">
                                        <div className="item-main-info">
                                            {/* <span className="item-id">ID: {item._id}</span> */}
                                            <div className="item-value">
                                                {item.type === "amount" ? "+" : "-"} {formatCurrency(item.totalValue)}
                                            </div>
                                        </div>

                                        <div className="item-details">
                                            {isWalletPurchase && (
                                                <div className="purchased-games-list">
                                                    {(() => {
                                                        const finalWId = wIdValue ? (typeof wIdValue === 'string' ? wIdValue : (wIdValue.$oid || wIdValue)) : gIdValue;
                                                        const wallet = walletsCache[finalWId];
                                                        return (
                                                            <div className="mini-game-card">
                                                                <div className="mini-wallet-icon">🎟️</div>
                                                                <span className="mini-game-name">{wallet?.name || "Thẻ ví (Nạp tiền)"}</span>
                                                            </div>
                                                        );
                                                    })()}
                                                </div>
                                            )}
                                            {!isWalletPurchase && item.type === "buying" && item.gameIds && item.gameIds.length > 0 && (

                                                <div className="purchased-games-list">
                                                    {item.gameIds.map((idObj, idx) => {
                                                        const id = typeof idObj === 'string' ? idObj : (idObj.$oid || idObj);
                                                        const game = gamesCache[id];
                                                        return (
                                                            <div key={idx} className="mini-game-card">
                                                                {game?.media?.coverImage && (
                                                                    <img src={game.media.coverImage} alt={game.name} className="mini-game-img" />
                                                                )}
                                                                <span className="mini-game-name">{game?.name || "Đang tải..."}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                            <div className={`status-tag ${item.isHide ? 'hidden' : 'visible'}`}>
                                                {item.isHide ? "Đã ẩn" : "Công khai"}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })

                )}
            </div>

            {totalPages > 1 && (
                <div className="pagination">
                    <button
                        className="page-btn nav-btn"
                        onClick={() => paginate(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                    >
                        Trước
                    </button>

                    {[...Array(totalPages)].map((_, idx) => (
                        <button
                            key={idx + 1}
                            className={`page-btn ${currentPage === idx + 1 ? 'active' : ''}`}
                            onClick={() => paginate(idx + 1)}
                        >
                            {idx + 1}
                        </button>
                    ))}

                    <button
                        className="page-btn nav-btn"
                        onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                    >
                        Sau
                    </button>
                </div>
            )}
        </div>
    );
};

export default History;
