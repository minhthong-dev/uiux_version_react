import React, { useState, useEffect } from 'react';
import { createDiscount } from '../../api/discountApi';
import gameApi from '../../api/gameApi';
import categoryApi from '../../api/categoryApi';
import { Plus, X, Gamepad2, Layers } from 'lucide-react';
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

const FormCreateDiscount = ({ onCreated, onClose }) => {
    const [formData, setFormData] = useState(INITIAL_FORM);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [games, setGames] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loadingData, setLoadingData] = useState(true);

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
        if (!formData.name.trim()) {
            toast.error('Vui lòng nhập tên discount!');
            return;
        }
        if (!formData.startDate || !formData.endDate) {
            toast.error('Vui lòng chọn ngày bắt đầu và kết thúc!');
            return;
        }
        if (new Date(formData.endDate) <= new Date(formData.startDate)) {
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
                    <h2>TẠO DISCOUNT MỚI</h2>
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
                                    placeholder="Mô tả..."
                                    rows={2}
                                />
                            </div>

                            <div className="dc-form-row">
                                <div className="dc-form-group">
                                    <label>Ngày bắt đầu</label>
                                    <input
                                        type="datetime-local"
                                        name="startDate"
                                        value={formData.startDate}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="dc-form-group">
                                    <label>Ngày kết thúc</label>
                                    <input
                                        type="datetime-local"
                                        name="endDate"
                                        value={formData.endDate}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
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
                                        {formData.isActive ? 'Đang hoạt động' : 'Tắt'}
                                    </span>
                                </label>
                            </div>
                        </div>

                        <div className="dc-form-right">
                            <div className="dc-selection-section">
                                <label><Layers size={16} /> Áp dụng cho Thể loại</label>
                                <div className="dc-selection-list">
                                    {loadingData ? "Đang tải..." : categories.map(cat => (
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
                                    {loadingData ? "Đang tải..." : games.map(game => (
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

                    <button
                        type="submit"
                        className="dc-btn-primary"
                        disabled={isSubmitting}
                    >
                        <Plus size={18} />
                        {isSubmitting ? 'ĐANG TẠO...' : 'TẠO DISCOUNT'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default FormCreateDiscount;
