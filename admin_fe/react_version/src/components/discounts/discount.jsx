import React, { useEffect, useState } from 'react';
import { getDiscounts, deleteDiscount, updateDiscount } from '../../api/discountApi';
import gameApi from '../../api/gameApi';
import categoryApi from '../../api/categoryApi';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Percent, Calendar, ToggleLeft, ToggleRight, Tag, Trash2, Edit3, Save, X, Gamepad2, Layers, Info } from 'lucide-react';
import { toast } from '../notification/toast';
import FormCreateDiscount from './formCreateDiscount';
import './discount.css';

const formatDateTime = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
};

const toLocalDatetimeValue = (isoStr) => {
    if (!isoStr) return '';
    const d = new Date(isoStr);
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const getStatus = (discount) => {
    const now = new Date();
    const start = new Date(discount.startDate);
    const end = new Date(discount.endDate);
    if (!discount.isActive) return { label: 'TẮT', color: 'status-off' };
    if (now < start) return { label: 'SẮP TỚI', color: 'status-upcoming' };
    if (now > end) return { label: 'HẾT HẠN', color: 'status-expired' };
    return { label: 'ĐANG CHẠY', color: 'status-active' };
};

const getCurrentDateTimeLocal = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    const localISOTime = new Date(now - offset).toISOString().slice(0, 16);
    return localISOTime;
};

const FormEditDiscount = ({ discount, onUpdated, onClose }) => {
    const [formData, setFormData] = useState({
        name: discount.name || '',
        discount: discount.discount ?? '',
        description: discount.description || '',
        startDate: toLocalDatetimeValue(discount.startDate),
        endDate: toLocalDatetimeValue(discount.endDate),
        isActive: discount.isActive ?? true,
        categoriesId: discount.categoriesId || [],
        gamesId: discount.gamesId || [],
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [games, setGames] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loadingData, setLoadingData] = useState(true);
    const [now, setNow] = useState(getCurrentDateTimeLocal());

    useEffect(() => {
        const timer = setInterval(() => {
            setNow(getCurrentDateTimeLocal());
        }, 60000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoadingData(true);
                const [gamesData, categoriesData] = await Promise.all([
                    gameApi.getAllGames(),
                    categoryApi.getAllCategories()
                ]);
                setGames(gamesData);
                setCategories(categoriesData);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoadingData(false);
            }
        };
        fetchData();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleToggleId = (listName, id) => {
        setFormData(prev => {
            const currentList = prev[listName] || [];
            if (currentList.includes(id)) {
                return { ...prev, [listName]: currentList.filter(i => i !== id) };
            } else {
                return { ...prev, [listName]: [...currentList, id] };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);

        if (end <= start) {
            toast.error('Ngày kết thúc phải sau ngày bắt đầu!');
            return;
        }

        try {
            setIsSubmitting(true);
            const payload = {
                ...formData,
                discount: Number(formData.discount),
                startDate: new Date(formData.startDate).toISOString(),
                endDate: new Date(formData.endDate).toISOString(),
            };
            const result = await updateDiscount(discount._id, payload);
            if (result && (result._id || result.data || result.success)) {
                toast.success('Cập nhật discount thành công!');
                onUpdated && onUpdated();
                onClose && onClose();
            } else {
                toast.error('Lỗi: ' + (result?.message || 'Không thể cập nhật'));
            }
        } catch {
            toast.error('Có lỗi xảy ra!');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="dc-modal-overlay" onClick={onClose}>
            <div className="dc-modal-box dc-modal-box--large" onClick={e => e.stopPropagation()}>
                <div className="dc-modal-header dc-modal-header--edit">
                    <h2><Edit3 size={18} /> CHỈNH SỬA DISCOUNT</h2>
                    <button className="dc-modal-close" onClick={onClose} type="button">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="dc-form">
                    <div className="dc-form-main-grid">
                        <div className="dc-form-left">
                            <div className="dc-form-group">
                                <label>Tên Discount</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                            </div>
                            <div className="dc-form-group">
                                <label>Giảm giá (%)</label>
                                <input type="number" name="discount" value={formData.discount} onChange={handleChange} required />
                            </div>
                            <div className="dc-form-group">
                                <label>Mô tả</label>
                                <textarea name="description" value={formData.description} onChange={handleChange} rows={2} />
                            </div>

                            <div className="dc-time-selection-wrapper">
                                <div className="dc-time-header">
                                    <Calendar size={18} />
                                    <span>THỜI GIAN ÁP DỤNG</span>
                                </div>
                                <div className="dc-time-inputs-container">
                                    <div className="dc-time-field">
                                        <div className="dc-field-label">
                                            <div className="dot start-dot"></div>
                                            BẮT ĐẦU
                                        </div>
                                        <div className="dc-input-with-icon">
                                            <input
                                                type="datetime-local"
                                                name="startDate"
                                                value={formData.startDate}
                                                onChange={handleChange}
                                                min={toLocalDatetimeValue(discount.startDate) < now ? toLocalDatetimeValue(discount.startDate) : now}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="dc-time-divider"><div className="line"></div></div>
                                    <div className="dc-time-field">
                                        <div className="dc-field-label">
                                            <div className="dot end-dot"></div>
                                            KẾT THÚC
                                        </div>
                                        <div className="dc-input-with-icon">
                                            <input
                                                type="datetime-local"
                                                name="endDate"
                                                value={formData.endDate}
                                                onChange={handleChange}
                                                min={formData.startDate || now}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="dc-form-group dc-toggle-group">
                                <label>Trạng thái</label>
                                <label className="dc-toggle">
                                    <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} />
                                    <span className="dc-toggle-label">{formData.isActive ? 'Hoạt động' : 'Tạm tắt'}</span>
                                </label>
                            </div>
                        </div>

                        <div className="dc-form-right">
                            <div className="dc-selection-section">
                                <label><Layers size={16} /> Áp dụng cho Thể loại</label>
                                <div className="dc-selection-list">
                                    {loadingData ? (
                                        <div className="dc-loading-text">Đang tải danh mục...</div>
                                    ) : categories.map(cat => (
                                        <div
                                            key={cat._id}
                                            className={`dc-selection-item ${formData.categoriesId?.includes(cat._id) ? 'active' : ''}`}
                                            onClick={() => handleToggleId('categoriesId', cat._id)}
                                        >
                                            {cat.name}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="dc-selection-section">
                                <label><Gamepad2 size={16} /> Áp dụng cho Game</label>
                                <div className="dc-selection-list">
                                    {loadingData ? (
                                        <div className="dc-loading-text">Đang tải trò chơi...</div>
                                    ) : games.map(game => (
                                        <div
                                            key={game._id}
                                            className={`dc-selection-item ${formData.gamesId?.includes(game._id) ? 'active' : ''}`}
                                            onClick={() => handleToggleId('gamesId', game._id)}
                                        >
                                            {game.name}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="dc-form-actions">
                        <button type="button" className="dc-btn-secondary" onClick={onClose}>
                            ĐÓNG
                        </button>
                        <button type="submit" className="dc-btn-edit-submit" disabled={isSubmitting}>
                            <Save size={18} />
                            {isSubmitting ? 'ĐANG LƯU...' : 'LƯU THAY ĐỔI'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const DiscountManagement = () => {
    const [discounts, setDiscounts] = useState([]);
    const [games, setGames] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [editingDiscount, setEditingDiscount] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [discountsRes, gamesRes, categoriesRes] = await Promise.all([
                getDiscounts(),
                gameApi.getAllGames(),
                categoryApi.getAllCategories()
            ]);

            setDiscounts(Array.isArray(discountsRes) ? discountsRes : (discountsRes?.data || []));
            setGames(Array.isArray(gamesRes) ? gamesRes : []);
            setCategories(Array.isArray(categoriesRes) ? categoriesRes : []);
        } catch (error) {
            console.error("Error loading discounts management data:", error);
            toast.error('Không thể tải danh sách dữ liệu!');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc muốn xóa discount này?')) return;
        try {
            setDeletingId(id);
            await deleteDiscount(id);
            toast.success('Đã xóa discount!');
            await loadData();
        } catch {
            toast.error('Xóa thất bại!');
        } finally {
            setDeletingId(null);
        }
    };

    // Helper to get names by IDs
    const getNames = (ids, source) => {
        if (!ids || !Array.isArray(ids) || ids.length === 0) return null;
        if (!Array.isArray(source)) return null;
        return ids.map(id => {
            const item = source.find(s => s._id === id);
            return item ? item.name : null;
        }).filter(name => name !== null);
    };

    return (
        <div className="dc-container">
            <motion.header className="dc-header"
                initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                <div className="dc-header-left">
                    <Tag size={36} />
                    <div>
                        <h1>QUẢN LÝ DISCOUNT</h1>
                        <span className="dc-header-sub">Tổng số: {discounts.length} mã giảm giá</span>
                    </div>
                </div>
                <button className="dc-btn-create" onClick={() => setShowCreate(true)}>
                    <Plus size={20} /> TẠO DISCOUNT
                </button>
            </motion.header>

            <motion.div className="dc-stats-bar"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                {[
                    { label: 'Đang chạy', value: discounts.filter(d => getStatus(d).label === 'ĐANG CHẠY').length, cls: 'stat-active' },
                    { label: 'Sắp tới', value: discounts.filter(d => getStatus(d).label === 'SẮP TỚI').length, cls: 'stat-upcoming' },
                    { label: 'Hết hạn', value: discounts.filter(d => getStatus(d).label === 'HẾT HẠN').length, cls: 'stat-expired' },
                    { label: 'Đã tắt', value: discounts.filter(d => !d.isActive).length, cls: 'stat-off' },
                ].map((s, i) => (
                    <div key={i} className={`dc-stat-card ${s.cls}`}>
                        <span className="dc-stat-value">{s.value}</span>
                        <span className="dc-stat-label">{s.label}</span>
                    </div>
                ))}
            </motion.div>

            <motion.div className="dc-grid"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                {loading ? (
                    <div className="dc-empty-state"><span>⏳ Đang tải dữ liệu...</span></div>
                ) : discounts.length === 0 ? (
                    <div className="dc-empty-state">
                        <Percent size={48} />
                        <h3>CHƯA CÓ DISCOUNT NÀO</h3>
                        <p>Nhấn "Tạo Discount" để thêm mã giảm giá đầu tiên.</p>
                    </div>
                ) : (
                    <AnimatePresence>
                        {discounts.map((item, index) => {
                            const status = getStatus(item);
                            const isDeleting = deletingId === item._id;
                            const catNames = getNames(item.categoriesId, categories);
                            const gameNames = getNames(item.gamesId, games);

                            return (
                                <motion.div
                                    key={item._id}
                                    className="dc-card"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ delay: index * 0.04 }}
                                >
                                    <div className="dc-card-badge">
                                        <Percent size={14} />{item.discount}%
                                    </div>
                                    <span className={`dc-status-pill ${status.color}`}>{status.label}</span>
                                    <h3 className="dc-card-name">{item.name}</h3>
                                    {item.description && (
                                        <p className="dc-card-desc">{item.description}</p>
                                    )}

                                    {/* Hiển thị Game và Thể loại */}
                                    <div className="dc-card-applied">
                                        {catNames && catNames.length > 0 && (
                                            <div className="dc-applied-item">
                                                <Layers size={14} />
                                                <div className="dc-applied-list">
                                                    {catNames.map((name, i) => (
                                                        <span key={i} className="dc-applied-tag cat">{name}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {gameNames && gameNames.length > 0 && (
                                            <div className="dc-applied-item">
                                                <Gamepad2 size={14} />
                                                <div className="dc-applied-list">
                                                    {gameNames.map((name, i) => (
                                                        <span key={i} className="dc-applied-tag game">{name}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {(!catNames || catNames.length === 0) && (!gameNames || gameNames.length === 0) && (
                                            <div className="dc-applied-none">
                                                <Info size={14} /> Tất cả sản phẩm
                                            </div>
                                        )}
                                    </div>

                                    <div className="dc-card-dates">
                                        <div className="dc-date-row">
                                            <Calendar size={13} />
                                            <span>Bắt đầu: <strong>{formatDateTime(item.startDate)}</strong></span>
                                        </div>
                                        <div className="dc-date-row">
                                            <Calendar size={13} />
                                            <span>Kết thúc: <strong>{formatDateTime(item.endDate)}</strong></span>
                                        </div>
                                    </div>
                                    <div className="dc-card-footer">
                                        <div className="dc-card-toggle">
                                            {item.isActive
                                                ? <ToggleRight size={20} className="toggle-on" />
                                                : <ToggleLeft size={20} className="toggle-off" />}
                                            <span>{item.isActive ? 'Hoạt động' : 'Tắt'}</span>
                                        </div>
                                        <div className="dc-card-actions">
                                            <button
                                                className="dc-action-btn dc-btn--edit"
                                                title="Chỉnh sửa"
                                                onClick={() => setEditingDiscount(item)}
                                            >
                                                <Edit3 size={14} />
                                            </button>
                                            <button
                                                className="dc-action-btn dc-btn--delete"
                                                title="Xóa"
                                                onClick={() => handleDelete(item._id)}
                                                disabled={isDeleting}
                                            >
                                                {isDeleting ? '...' : <Trash2 size={14} />}
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                )}
            </motion.div>

            <AnimatePresence>
                {showCreate && (
                    <FormCreateDiscount
                        onCreated={loadData}
                        onClose={() => setShowCreate(false)}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {editingDiscount && (
                    <FormEditDiscount
                        discount={editingDiscount}
                        onUpdated={loadData}
                        onClose={() => setEditingDiscount(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default DiscountManagement;
