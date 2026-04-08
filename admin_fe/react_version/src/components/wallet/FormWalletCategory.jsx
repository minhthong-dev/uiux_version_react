import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';

const FormWalletCategory = ({ onSave, onClose, initialData }) => {
    const [formData, setFormData] = useState({
        idWalletCategory: '',
        name: ''
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                idWalletCategory: initialData.idWalletCategory,
                name: initialData.name
            });
        }
    }, [initialData]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2 className="modal-title">{initialData ? "CẬP NHẬT VÙNG" : "THÊM VÙNG MỚI"}</h2>
                    <button className="close-btn" onClick={onClose}><X size={24} /></button>
                </div>
                <form onSubmit={handleSubmit} className="wallet-form">
                    <div className="form-group">
                        <label>Mã định danh (ID Region)</label>
                        <input 
                            type="text" 
                            value={formData.idWalletCategory} 
                            onChange={(e) => setFormData({...formData, idWalletCategory: e.target.value})} 
                            placeholder="VD: US, VN, EU..." 
                            required 
                        />
                        <small style={{color: '#666'}}>Dùng để phân biệt các khu vực nạp thẻ.</small>
                    </div>
                    <div className="form-group">
                        <label>Tên hiển thị (Region Name)</label>
                        <input 
                            type="text" 
                            value={formData.name} 
                            onChange={(e) => setFormData({...formData, name: e.target.value})} 
                            placeholder="VD: United States, Việt Nam..." 
                            required 
                        />
                    </div>
                    <div className="form-actions">
                        <button type="button" className="cancel-btn" onClick={onClose}>
                            <X size={18} /> HỦY
                        </button>
                        <button type="submit" className="save-btn">
                            <Check size={18} /> {initialData ? "LƯU THAY ĐỔI" : "LƯU VÙNG"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FormWalletCategory;
