import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Globe } from 'lucide-react';
import walletApi from '../../api/walletApi';
import { toast } from '../notification/toast';
import FormWalletCategory from './FormWalletCategory';
import './wallet.css';

const WalletCategoryManagement = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingCat, setEditingCat] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const result = await walletApi.getAllWalletCategories();
            setCategories(Array.isArray(result) ? result : (result.data || []));
        } catch (error) {
            toast.error("Lỗi khi tải danh mục.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa? Tất cả wallet liên quan có thể gặp lỗi.")) return;
        try {
            const res = await walletApi.deleteCategory(id);
            if (!res.error) {
                toast.success("Xóa thành công!");
                loadData();
            } else {
                toast.error("Lỗi: " + res.error);
            }
        } catch (error) {
            toast.error("Có lỗi xảy ra.");
        }
    };

    const handleSave = async (formData) => {
        try {
            let res;
            if (editingCat) {
                res = await walletApi.updateCategory(editingCat._id, formData);
                if (!res.error) toast.success("Cập nhật thành công!");
            } else {
                res = await walletApi.createWalletCategory(formData);
                if (!res.error) toast.success("Thêm thành công!");
            }
            
            if (res.error) {
                toast.error("Lỗi: " + res.error);
            } else {
                setShowForm(false);
                setEditingCat(null);
                loadData();
            }
        } catch (error) {
            toast.error("Lỗi hệ thống.");
        }
    };

    return (
        <div className="wallet-mgmt-container">
            <div className="mgmt-header">
                <h1 className="mgmt-title">QUẢN LÝ VÙNG WALLET (REGION)</h1>
                <button className="add-wallet-btn" onClick={() => { setEditingCat(null); setShowForm(true); }}>
                    <Plus size={20} /> THÊM VÙNG MỚI
                </button>
            </div>

            {loading ? (
                <div className="loading-state">ĐANG TẢI...</div>
            ) : (
                <div className="category-grid">
                    {categories.length > 0 ? (
                        categories.map((cat) => (
                            <div key={cat._id} className="category-admin-card">
                                <div className="card-top">
                                    <Globe size={40} className="cat-icon" />
                                    <div className="cat-id-badge">{cat.idWalletCategory}</div>
                                </div>
                                <h3 className="cat-name">{cat.name}</h3>
                                <div className="card-actions-row">
                                    <button className="edit-btn" onClick={() => { setEditingCat(cat); setShowForm(true); }}><Edit size={16} /> Sửa</button>
                                    <button className="delete-btn" onClick={() => handleDelete(cat._id)}><Trash2 size={16} /> Xóa</button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="empty-message">CHƯA CÓ VÙNG NÀO ĐƯỢC TẠO.</div>
                    )}
                </div>
            )}

            {showForm && (
                <FormWalletCategory 
                    onSave={handleSave} 
                    onClose={() => { setShowForm(false); setEditingCat(null); }}
                    initialData={editingCat}
                />
            )}
        </div>
    );
};

export default WalletCategoryManagement;
