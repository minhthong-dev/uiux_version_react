import React, { useState, useEffect } from 'react';
import { createDiscount } from '../../api/discountApi';
import gameApi from '../../api/gameApi';
import categoryApi from '../../api/categoryApi';
import { Plus, X, Gamepad2, Layers, Calendar, Clock, AlertCircle } from 'lucide-react';
import { toast } from '../notification/toast';

const INITIAL_FORM = {
    name: '',
    discount: '',
    description: '',
    startDate: '',
    endDate: '',
    isActive: true,
    categoriesId: [],
    gamesId: [],
};

// Helper để lấy chuỗi datetime-local hiện tại (YYYY-MM-DDTHH:mm)
const getCurrentDateTimeLocal = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    const localISOTime = new Date(now - offset).toISOString().slice(0, 16);
    return localISOTime;
};

const FormCreateDiscount = ({ onCreated, onClose }) => {
    const [formData, setFormData] = useState(INITIAL_FORM);
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
                console.error("Error fetching data for discount form:", error);
                toast.error("Không thể tải danh sách Game hoặc Thể loại");
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
            const currentList = prev[listName];
            if (currentList.includes(id)) {
                return { ...prev, [listName]: currentList.filter(i => i !== id) };
            } else {
                return { ...prev, [listName]: [...currentList, id] };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const currentNow = new Date();
        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);

        if (!formData.name.trim()) {
            toast.error('Vui lòng nhập tên discount!');
            return;
        }

        if (!formData.startDate || !formData.endDate) {
            toast.error('Vui lòng chọn thời gian!');
            return;
        }

        if (start < currentNow && formData.startDate < now) {
            toast.error('Ngày bắt đầu không được ở trong quá khứ!');
            return;
        }

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
            const result = await createDiscount(payload);
            if (result && (result._id || result.data || result.success)) {
                toast.success('Tạo discount thành công!');
                setFormData(INITIAL_FORM);
                onCreated && onCreated();
                onClose && onClose();
            } else {
                toast.error('Lỗi: ' + (result?.message || 'Không thể tạo discount'));
            }
        } catch (error) {
            toast.error('Có lỗi xảy ra!');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="dc-modal-overlay" onClick={onClose}>
            <div className="dc-modal-box dc-modal-box--large" onClick={e => e.stopPropagation()}>
                <div className="dc-modal-header">
                    <h2><Plus size={24} /> TẠO DISCOUNT MỚI</h2>
                    <button className="dc-modal-close" onClick={onClose} type="button">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="dc-form">
                    <div className="dc-form-main-grid">
                        <div className="dc-form-left">
                            <div className="dc-form-group">
                                <label>Tên Discount <span className="required">*</span></label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="VD: SUMMER_SALE..."
                                    required
                                />
                            </div>

                            <div className="dc-form-group">
                                <label>Giảm giá (%) <span className="required">*</span></label>
                                <input
                                    type="number"
                                    name="discount"
                                    value={formData.discount}
                                    onChange={handleChange}
                                    placeholder="0 - 100"
                                    min="0"
                                    max="100"
                                    required
                                />
                            </div>

                            <div className="dc-form-group">
                                <label>Mô tả</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Mô tả chiến dịch giảm giá..."
                                    rows={2}
                                />
                            </div>

                            {/* Section Thời gian trực quan */}
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
                                                min={now}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="dc-time-divider">
                                        <div className="line"></div>
                                    </div>

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

                                {(!formData.startDate || !formData.endDate) && (
                                    <div className="dc-time-hint">
                                        <AlertCircle size={14} />
                                        <span>Vui lòng chọn mốc thời gian diễn ra sự kiện</span>
                                    </div>
                                )}
                            </div>

                            <div className="dc-form-group dc-toggle-group">
                                <label>Trạng thái</label>
                                <label className="dc-toggle">
                                    <input
                                        type="checkbox"
                                        name="isActive"
                                        checked={formData.isActive}
                                        onChange={handleChange}
                                    />
                                    <span className="dc-toggle-label">
                                        {formData.isActive ? 'Đang hoạt động' : 'Tạm tắt'}
                                    </span>
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
                                            className={`dc-selection-item ${formData.categoriesId.includes(cat._id) ? 'active' : ''}`}
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
                                            className={`dc-selection-item ${formData.gamesId.includes(game._id) ? 'active' : ''}`}
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
                        <button
                            type="button"
                            className="dc-btn-secondary"
                            onClick={onClose}
                        >
                            HỦY BỎ
                        </button>
                        <button
                            type="submit"
                            className="dc-btn-primary"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>ĐANG XỬ LÝ...</>
                            ) : (
                                <>
                                    <Plus size={18} />
                                    XÁC NHẬN TẠO
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FormCreateDiscount;
