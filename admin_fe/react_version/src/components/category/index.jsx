import React, { useEffect, useState } from 'react';
import categoryApi from '../../api/categoryApi';
import './category.css';
import { Plus, Trash2, Edit3, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '../../components/notification/toast';

const CategoryManagement = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categoryName, setCategoryName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            setLoading(true);
            const data = await categoryApi.getAllCategories();
            console.log('du lieu category : ', data);
            setCategories(data);
        } catch (error) {
            console.error("Failed to fetch categories:", error);
            toast.error("Failed to fetch categories.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!categoryName.trim()) return;

        try {
            setIsSubmitting(true);
            if (editingCategory) {
                // Logic cập nhật
                const result = await categoryApi.updateCategory(editingCategory._id, { name: categoryName.trim() });
                if (result) {
                    toast.success("Cập nhật danh mục thành công!");
                    handleCancelEdit();
                    await loadCategories();
                } else {
                    toast.error("Lỗi: " + (result.message || "Không thể cập nhật"));
                }
            } else {
                // Logic tạo mới
                const result = await categoryApi.createCategory({ name: categoryName.trim() });
                if (result.data) {
                    setCategoryName('');
                    await loadCategories();
                    toast.success("Thêm danh mục thành công!");
                } else {
                    toast.error("Lỗi: " + (result.message || "Không thể tạo danh mục"));
                }
            }
        } catch (error) {
            console.error("Error submitting category:", error);
            toast.error("Có lỗi xảy ra.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteCategory = async (categoryId) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa danh mục này?")) return;
        try {
            const result = await categoryApi.deleteCategory(categoryId);
            if (result) {
                await loadCategories();
                toast.success("Xóa danh mục thành công!");
            } else {
                toast.error("Lỗi: " + (result.message || "Không thể xóa danh mục"));
            }
        } catch (error) {
            console.error("Lỗi xóa: ", error);
            toast.error("Có lỗi xảy ra khi xóa.");
        }
    }

    const handleEditClick = (category) => {
        setEditingCategory(category);
        setCategoryName(category.name);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingCategory(null);
        setCategoryName('');
    };

    return (
        <div className="category-container">
            <header className="category-header">
                <motion.h1
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                >
                    QUẢN LÝ DANH MỤC
                </motion.h1>
                <div className="stats-badge">
                    TỔNG SỐ: {categories.length}
                </div>
            </header>

            <div className="category-content-grid">
                {/* Form Section */}
                <motion.div
                    className="category-form-card"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                >
                    <h2>{editingCategory ? 'CHỈNH SỬA' : 'THÊM MỚI'}</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Tên danh mục</label>
                            <input
                                type="text"
                                value={categoryName}
                                onChange={(e) => setCategoryName(e.target.value)}
                                placeholder="VD: Hành động, Kinh dị..."
                                required
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                type="submit"
                                className="btn-save shadow-hover"
                                style={{ flex: 1, marginTop: '1rem', background: editingCategory ? 'var(--azure-blue)' : 'var(--blaze-orange)' }}
                                disabled={isSubmitting}
                            >
                                {editingCategory ? <Save size={20} /> : <Plus size={20} />}
                                {isSubmitting ? 'ĐANG LƯU...' : (editingCategory ? 'CẬP NHẬT' : 'THÊM DANH MỤC')}
                            </button>

                            {editingCategory && (
                                <button
                                    type="button"
                                    className="btn-cancel shadow-hover"
                                    style={{ marginTop: '1rem', padding: '0 15px' }}
                                    onClick={handleCancelEdit}
                                >
                                    HỦY
                                </button>
                            )}
                        </div>
                    </form>
                </motion.div>

                {/* List Section */}
                <motion.div
                    className="category-list-card"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <h2>DANH SÁCH HIỆN CÓ</h2>
                    {loading ? (
                        <div className="empty-state">Đang tải dữ liệu...</div>
                    ) : categories.length > 0 ? (
                        <table className="category-table">
                            <thead>
                                <tr>
                                    <th>Tên Danh Mục</th>
                                    <th>ID</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence mode="wait">
                                    {categories.map((cat) => (
                                        <motion.tr
                                            key={cat._id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                        >
                                            <td>
                                                <span className="category-tag">{cat.name}</span>
                                            </td>
                                            <td style={{ fontSize: '0.8rem', opacity: 0.6 }}>{cat._id}</td>
                                            <td>
                                                <div className="action-btns">
                                                    <button
                                                        className="mini-action-btn edit-btn-mini"
                                                        title="Sửa"
                                                        onClick={() => handleEditClick(cat)}
                                                    >
                                                        <Edit3 size={14} />
                                                    </button>
                                                    <button
                                                        className="mini-action-btn delete-btn-mini"
                                                        title="Xóa"
                                                        onClick={() => handleDeleteCategory(cat._id)}
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    ) : (
                        <div className="empty-state">
                            <h3>CHƯA CÓ DANH MỤC NÀO</h3>
                            <p>Hãy thêm danh mục đầu tiên ở bên trái.</p>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default CategoryManagement;