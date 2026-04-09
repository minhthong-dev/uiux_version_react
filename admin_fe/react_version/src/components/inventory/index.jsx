import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Package, Plus, Search, RefreshCw, X, Save,
    Gamepad2, TrendingDown, CheckCircle, AlertTriangle,
    PackageX, PlusCircle, RotateCcw, Clock
} from 'lucide-react';
import inventoryApi from '../../api/inventoryApi';
import { toast } from '../notification/toast';
import './inventory.css';

/* ─── helpers ─── */
const formatPrice = (price) =>
    price != null ? price.toLocaleString('vi-VN') + ' ₫' : '—';

const formatDate = (str) => {
    if (!str) return '—';
    const d = new Date(str);
    return d.toLocaleString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
};

const getStockStatus = (available, stock) => {
    if (stock === 0 && available === 0) return { label: 'HẾT HÀNG', cls: 'inv-pill-empty', avail: 'inv-avail-empty' };
    if (available <= 0)  return { label: 'ĐẶT TRƯỚC', cls: 'inv-pill-low',   avail: 'inv-avail-low' };
    if (available <= 5)  return { label: 'SẮP HẾT',   cls: 'inv-pill-low',   avail: 'inv-avail-low' };
    return { label: 'CÒN HÀNG', cls: 'inv-pill-ok', avail: 'inv-avail-ok' };
};

const getCoverUrl = (game) => {
    if (!game) return null;
    if (game.media?.coverImage) return game.media.coverImage;
    if (game.media?.screenshots?.length) return game.media.screenshots[0];
    return null;
};

/* ─── Add / Set Stock Modal ─── */
const AddStockModal = ({ item, onClose, onSuccess }) => {
    const [quantity, setQuantity]   = useState('');
    const [mode, setMode]           = useState('increment');
    const [submitting, setSubmitting] = useState(false);

    const game   = item?.game;
    const thumb  = getCoverUrl(game);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const qty = Number(quantity);
        if (!Number.isFinite(qty) || !Number.isInteger(qty) || qty < 0) {
            toast.error('Số lượng phải là số nguyên ≥ 0!');
            return;
        }
        try {
            setSubmitting(true);
            const res = await inventoryApi.addStock({ gameId: item.game._id, quantity: qty, mode });
            if (res?.success) {
                toast.success(res.message || 'Cập nhật kho thành công!');
                onSuccess && onSuccess();
                onClose();
            } else {
                toast.error(res?.error || 'Cập nhật thất bại!');
            }
        } catch {
            toast.error('Có lỗi xảy ra!');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <motion.div
            className="inv-modal-overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div
                className="inv-modal-box"
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1,   opacity: 1, y: 0  }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="inv-modal-header">
                    <h2><PlusCircle size={18} /> CẬP NHẬT TỒN KHO</h2>
                    <button className="inv-modal-close" onClick={onClose} type="button">
                        <X size={20} />
                    </button>
                </div>

                {/* Game info */}
                <div className="inv-modal-body">
                    <div className="inv-modal-game-info">
                        {thumb ? (
                            <img src={thumb} alt={game?.name} className="inv-modal-game-thumb" />
                        ) : (
                            <div className="inv-modal-game-thumb-placeholder">
                                <Gamepad2 size={22} />
                            </div>
                        )}
                        <div>
                            <div className="inv-modal-game-name">{game?.name || '—'}</div>
                            <div className="inv-modal-game-stock">
                                Tồn kho hiện tại: <strong className="inv-modal-stock inv-modal-stock--stock">{item?.stock ?? 0}</strong>
                                {' · '}Đặt trước: <strong className="inv-modal-stock inv-modal-stock--reserved">{item?.reserved ?? 0}</strong>
                                {' · '}Khả dụng: <strong className="inv-modal-stock inv-modal-stock--available">{item?.available ?? 0}</strong>
                            </div>
                        </div>
                    </div>

                    <form id="add-stock-form" onSubmit={handleSubmit}>
                        {/* Mode */}
                        <div className="inv-form-group">
                            <label>Chế độ cập nhật</label>
                            <div className="inv-mode-tabs">
                                <button
                                    type="button"
                                    className={`inv-mode-tab ${mode === 'increment' ? 'active' : ''}`}
                                    onClick={() => setMode('increment')}
                                >
                                    <RotateCcw size={13} style={{ marginRight: 4 }} />
                                    CỘNG THÊM
                                </button>
                                <button
                                    type="button"
                                    className={`inv-mode-tab ${mode === 'set' ? 'active' : ''}`}
                                    onClick={() => setMode('set')}
                                >
                                    <Save size={13} style={{ marginRight: 4 }} />
                                    ĐẶT TỐI ĐA
                                </button>
                            </div>
                            <div className="inv-mode-hint">
                                {mode === 'increment'
                                    ? '➕ Cộng thêm số lượng vào tồn kho hiện tại.'
                                    : '📌 Ghi đè — đặt tồn kho thành con số tuyệt đối.'}
                            </div>
                        </div>

                        {/* Quantity */}
                        <div className="inv-form-group">
                            <label>Số lượng (≥ 0)</label>
                            <input
                                id="inv-quantity-input"
                                type="number"
                                min="0"
                                step="1"
                                value={quantity}
                                onChange={e => setQuantity(e.target.value)}
                                placeholder="Nhập số lượng..."
                                required
                                autoFocus
                            />
                        </div>
                    </form>
                </div>

                {/* Actions */}
                <div className="inv-modal-actions">
                    <button className="inv-btn-cancel" onClick={onClose} type="button">HỦY</button>
                    <button
                        className="inv-btn-submit"
                        form="add-stock-form"
                        type="submit"
                        disabled={submitting}
                    >
                        <Save size={16} />
                        {submitting ? 'ĐANG LƯU...' : 'LƯU KHO'}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

/* ─── Main Page ─── */
const InventoryManagement = () => {
    const [inventories, setInventories] = useState([]);
    const [loading,     setLoading]     = useState(true);
    const [refreshing,  setRefreshing]  = useState(false);
    const [search,      setSearch]      = useState('');
    const [filter,      setFilter]      = useState('all'); // all | ok | low | empty
    const [editItem,    setEditItem]    = useState(null);

    /* fetch */
    const fetchData = useCallback(async (isRefresh = false) => {
        try {
            isRefresh ? setRefreshing(true) : setLoading(true);
            const res = await inventoryApi.getAllStock();
            setInventories(Array.isArray(res?.data) ? res.data : []);
        } catch {
            toast.error('Không thể tải dữ liệu kho hàng!');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    /* derived */
    const stats = {
        total: inventories.length,
        ok:    inventories.filter(i => i.available > 5).length,
        low:   inventories.filter(i => i.available > 0 && i.available <= 5).length,
        empty: inventories.filter(i => i.available <= 0).length,
    };

    const filtered = inventories.filter(inv => {
        const name = inv.game?.name?.toLowerCase() || '';
        const matchSearch = name.includes(search.toLowerCase());
        if (!matchSearch) return false;
        if (filter === 'ok')    return inv.available > 5;
        if (filter === 'low')   return inv.available > 0 && inv.available <= 5;
        if (filter === 'empty') return inv.available <= 0;
        return true;
    });

    return (
        <div className="inv-container">

            {/* Header */}
            <motion.div
                className="inv-header"
                initial={{ y: -24, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
            >
                <div className="inv-header-left">
                    <Package size={36} />
                    <div>
                        <h1>QUẢN LÝ KHO HÀNG</h1>
                        <span className="inv-header-sub">Tổng cộng: {inventories.length} game trong kho</span>
                    </div>
                </div>
                <button className="inv-btn-add" onClick={() => toast.info('Chọn game trong bảng để cập nhật kho!')}>
                    <Plus size={18} /> CẬP NHẬT KHO
                </button>
            </motion.div>

            {/* Stat cards */}
            <motion.div
                className="inv-stats-bar"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 }}
            >
                {[
                    { label: 'Tổng Game',  value: stats.total, cls: 'inv-stat-total', Icon: Package },
                    { label: 'Còn hàng',   value: stats.ok,    cls: 'inv-stat-ok',    Icon: CheckCircle },
                    { label: 'Sắp hết',    value: stats.low,   cls: 'inv-stat-low',   Icon: AlertTriangle },
                    { label: 'Hết hàng',   value: stats.empty, cls: 'inv-stat-empty', Icon: PackageX },
                ].map((s, i) => (
                    <motion.div
                        key={s.label}
                        className={`inv-stat-card ${s.cls}`}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + i * 0.06 }}
                        onClick={() => setFilter(
                            s.cls === 'inv-stat-total' ? 'all' :
                            s.cls === 'inv-stat-ok'    ? 'ok' :
                            s.cls === 'inv-stat-low'   ? 'low' : 'empty'
                        )}
                        style={{ cursor: 'pointer' }}
                    >
                        <s.Icon size={20} style={{ color: 'inherit', opacity: 0.6, marginBottom: 4 }} />
                        <span className="inv-stat-value">{s.value}</span>
                        <span className="inv-stat-label">{s.label}</span>
                    </motion.div>
                ))}
            </motion.div>

            {/* Toolbar */}
            <motion.div
                className="inv-toolbar"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.18 }}
            >
                <div className="inv-search-wrap">
                    <Search size={15} />
                    <input
                        id="inv-search-input"
                        className="inv-search-input"
                        placeholder="Tìm kiếm theo tên game..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <select
                    id="inv-filter-select"
                    className="inv-filter-select"
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                >
                    <option value="all">Tất cả</option>
                    <option value="ok">Còn hàng</option>
                    <option value="low">Sắp hết (≤5)</option>
                    <option value="empty">Hết hàng</option>
                </select>
                <button
                    id="inv-refresh-btn"
                    className={`inv-btn-refresh ${refreshing ? 'spinning' : ''}`}
                    onClick={() => fetchData(true)}
                    disabled={refreshing}
                >
                    <RefreshCw size={14} />
                    {refreshing ? 'Đang tải...' : 'Làm mới'}
                </button>
            </motion.div>

            {/* Table */}
            <motion.div
                className="inv-table-wrap"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.22 }}
            >
                <table className="inv-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>GAME</th>
                            <th className="center">TỒN KHO</th>
                            <th className="center">ĐẶT TRƯỚC</th>
                            <th className="center">KHẢ DỤNG</th>
                            <th className="center">TRẠNG THÁI</th>
                            <th>GIÁ</th>
                            <th>CẬP NHẬT</th>
                            <th className="center">THAO TÁC</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr className="inv-loading-row">
                                <td colSpan={9}>
                                    <div className="inv-spinner" />
                                    <div>Đang tải dữ liệu kho hàng...</div>
                                </td>
                            </tr>
                        ) : filtered.length === 0 ? (
                            <tr>
                                <td colSpan={9}>
                                    <div className="inv-empty-state">
                                        <Package size={44} />
                                        <h3>KHÔNG CÓ DỮ LIỆU</h3>
                                        <p>
                                            {search || filter !== 'all'
                                                ? 'Không tìm thấy kết quả phù hợp.'
                                                : 'Chưa có dữ liệu kho nào được thêm.'}
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            <AnimatePresence>
                                {filtered.map((inv, idx) => {
                                    const game   = inv.game || {};
                                    const thumb  = getCoverUrl(game);
                                    const status = getStockStatus(inv.available, inv.stock);

                                    return (
                                        <motion.tr
                                            key={inv._id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ delay: idx * 0.03 }}
                                        >
                                            {/* # */}
                                            <td style={{ color: '#5a5a80', fontSize: '0.78rem' }}>
                                                {idx + 1}
                                            </td>

                                            {/* Game */}
                                            <td>
                                                <div className="inv-game-cell">
                                                    {thumb ? (
                                                        <img
                                                            src={thumb}
                                                            alt={game.name}
                                                            className="inv-game-thumb"
                                                        />
                                                    ) : (
                                                        <div className="inv-game-thumb-placeholder">
                                                            <Gamepad2 size={18} />
                                                        </div>
                                                    )}
                                                    <div className="inv-game-info">
                                                        <span className="inv-game-name">{game.name || '—'}</span>
                                                        {game.genre && (
                                                            <span className="inv-game-genre">{
                                                                Array.isArray(game.genre)
                                                                    ? game.genre.join(', ')
                                                                    : game.genre
                                                            }</span>
                                                        )}
                                                        <span className="inv-game-id">{game._id}</span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Stock */}
                                            <td className="center">
                                                <span className="inv-stock-num">{inv.stock ?? 0}</span>
                                            </td>

                                            {/* Reserved */}
                                            <td className="center">
                                                <span className="inv-reserved-num">{inv.reserved ?? 0}</span>
                                            </td>

                                            {/* Available */}
                                            <td className="center">
                                                <span className={`inv-avail-badge ${status.avail}`}>
                                                    {inv.available > 5 ? <CheckCircle size={13} /> :
                                                     inv.available > 0 ? <TrendingDown size={13} /> :
                                                     <PackageX size={13} />}
                                                    {inv.available}
                                                </span>
                                            </td>

                                            {/* Status */}
                                            <td className="center">
                                                <span className={`inv-status-pill ${status.cls}`}>
                                                    {status.label}
                                                </span>
                                            </td>

                                            {/* Price */}
                                            <td>
                                                <span className="inv-price">
                                                    {formatPrice(game.price)}
                                                </span>
                                            </td>

                                            {/* Updated at */}
                                            <td>
                                                <span className="inv-updated" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                    <Clock size={12} />
                                                    {formatDate(inv.updatedAt)}
                                                </span>
                                            </td>

                                            {/* Action */}
                                            <td className="center">
                                                <button
                                                    className="inv-action-btn"
                                                    title="Cập nhật tồn kho"
                                                    onClick={() => setEditItem(inv)}
                                                    id={`inv-edit-btn-${inv._id}`}
                                                >
                                                    <Plus size={15} />
                                                </button>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </AnimatePresence>
                        )}
                    </tbody>
                </table>
            </motion.div>

            {/* Footer count */}
            {!loading && filtered.length > 0 && (
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                    style={{ marginTop: 12, fontSize: '0.78rem', color: '#6060a0', textAlign: 'right' }}
                >
                    Hiển thị {filtered.length} / {inventories.length} mục
                </motion.div>
            )}

            {/* Add Stock Modal */}
            <AnimatePresence>
                {editItem && (
                    <AddStockModal
                        item={editItem}
                        onClose={() => setEditItem(null)}
                        onSuccess={() => fetchData(true)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default InventoryManagement;
