import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import walletApi from '../../api/walletApi';
import { toast } from '../notification/toast';

const FormWallet = ({ onSave, onClose, initialData, categories }) => {
    const [formData, setFormData] = useState({
        name: '',
        price: 0,
        stock: 0,
        description: '',
        idWalletCategory: ''
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                price: initialData.price,
                stock: initialData.stock,
                description: initialData.description || '',
                idWalletCategory: initialData.idWalletCategory?._id || initialData.idWalletCategory || ''
            });
        }
    }, [initialData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2 className="modal-title">{initialData ? "CẬP NHẬT WALLET" : "THÊM WALLET MỚI"}</h2>
                    <button className="close-btn" onClick={onClose}><X size={24} /></button>
                </div>
                <form onSubmit={handleSubmit} className="wallet-form">
                    <div className="form-group">
                        <label>Tên Wallet</label>
                        <input 
                            type="text" 
                            value={formData.name} 
                            onChange={(e) => setFormData({...formData, name: e.target.value})} 
                            placeholder="VD: Steam Wallet $10" 
                            required 
                        />
                    </div>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Giá VNĐ</label>
                            <input 
                                type="number" 
                                value={formData.price} 
                                onChange={(e) => setFormData({...formData, price: e.target.value})} 
                                required 
                            />
                        </div>
                        <div className="form-group">
                            <label>Số lượng (Stock)</label>
                            <input 
                                type="number" 
                                value={formData.stock} 
                                onChange={(e) => setFormData({...formData, stock: e.target.value})} 
                                required 
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Vùng (Region)</label>
                        <select 
                            value={formData.idWalletCategory} 
                            onChange={(e) => setFormData({...formData, idWalletCategory: e.target.value})}
                            required
                        >
                            <option value="">Chọn Vùng nạp...</option>
                            {categories.map((cat) => (
                                <option key={cat._id} value={cat._id}>{cat.name} ({cat.idWalletCategory})</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Mô tả chi tiết</label>
                        <textarea 
                            value={formData.description} 
                            onChange={(e) => setFormData({...formData, description: e.target.value})} 
                            rows="3"
                        />
                    </div>
                    <div className="form-actions">
                        <button type="button" className="cancel-btn" onClick={onClose}>HỦY BỎ</button>
                        <button type="submit" className="save-btn">LƯU DỮ LIỆU</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FormWallet;
