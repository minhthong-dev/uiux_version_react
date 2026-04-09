import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import walletApi from '../../api/walletApi';
import { toast } from '../notification/toast';
import FormWallet from './FormWallet';
import './wallet.css';

const WalletManagement = () => {
    const [wallets, setWallets] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingWallet, setEditingWallet] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [walletData, catData] = await Promise.all([
                walletApi.getAllWallets(),
                walletApi.getAllWalletCategories()
            ]);
            setWallets(Array.isArray(walletData) ? walletData : (walletData.data || []));
            setCategories(Array.isArray(catData) ? catData : (catData.data || []));
        } catch (error) {
            toast.error("Lỗi khi tải dữ liệu.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa?")) return;
        try {
            const res = await walletApi.deleteWallet(id);
            if (!res.error) {
                toast.success("Xóa thành công!");
                loadData();
            } else {
                toast.error("Lỗi xóa: " + res.error);
            }
        } catch (error) {
            toast.error("Có lỗi xảy ra.");
        }
    };

    const handleSave = async (formData) => {
        try {
            let res;
            if (editingWallet) {
                res = await walletApi.updateWallet(editingWallet._id, formData);
                if (!res.error) toast.success("Cập nhật thành công!");
            } else {
                res = await walletApi.createWallet(formData);
                if (!res.error) toast.success("Thêm mới thành công!");
            }
            
            if (res.error) {
                toast.error("Lỗi: " + res.error);
            } else {
                setShowForm(false);
                setEditingWallet(null);
                loadData();
            }
        } catch (error) {
            toast.error("Lỗi hệ thống khi lưu.");
        }
    };

    return (
        <div className="wallet-mgmt-container">
            <div className="mgmt-header">
                <h1 className="mgmt-title">QUẢN LÝ WALLET</h1>
                <button className="add-wallet-btn" onClick={() => { setEditingWallet(null); setShowForm(true); }}>
                    <Plus size={20} /> THÊM WALLET MỚI
                </button>
            </div>

            {loading ? (
                <div className="loading-state">ĐANG TẢI DỮ LIỆU...</div>
            ) : (
                <div className="wallet-table-wrapper">
                    <table className="wallet-table">
                        <thead>
                            <tr>
                                <th>TÊN WALLET</th>
                                <th>REGION</th>
                                <th>GIÁ (VND)</th>
                                <th>STOCK</th>
                                <th>THAO TÁC</th>
                            </tr>
                        </thead>
                        <tbody>
                            {wallets.length > 0 ? (
                                wallets.map((wallet) => (
                                    <tr key={wallet._id}>
                                        <td className="bold-name">{wallet.name}</td>
                                        <td>
                                            <span className="region-tag">
                                                {wallet.idWalletCategory?.name || "N/A"}
                                            </span>
                                        </td>
                                        <td className="price-td">{Number(wallet.price).toLocaleString()}đ</td>
                                        <td>{wallet.stock}</td>
                                        <td>
                                            <div className="table-actions">
                                                <button className="edit-btn" onClick={() => { setEditingWallet(wallet); setShowForm(true); }}><Edit size={16} /> SỬA</button>
                                                <button className="delete-btn" onClick={() => handleDelete(wallet._id)}><Trash2 size={16} /> XÓA</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="5" className="empty-row">CHƯA CÓ DỮ LIỆU</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {showForm && (
                <FormWallet 
                    onSave={handleSave} 
                    onClose={() => { setShowForm(false); setEditingWallet(null); }}
                    initialData={editingWallet}
                    categories={categories}
                />
            )}
        </div>
    );
};

export default WalletManagement;
