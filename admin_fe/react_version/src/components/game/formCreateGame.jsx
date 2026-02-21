import React, { useState, useEffect } from 'react';
import './game.css';
import { Save, X, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import categoryApi from '../../api/categoryApi';

const FormCreateGame = ({ onSave, onClose, initialData }) => {
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        releaseDate: initialData?.releaseDate ? new Date(initialData.releaseDate).toISOString().split('T')[0] : '',
        content: initialData?.content || '',
        downloadKey: initialData?.downloadKey || '',
        genre: initialData?.genre || initialData?.genre || [],
        price: initialData?.price || 0
    });

    const [categories, setCategories] = useState([]);
    const [genreInput, setGenreInput] = useState('');

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const result = await categoryApi.getAllCategories();
            if (result.error) {
                console.error("Lỗi:", result.error);
                return;
            }
            // Backend trả về config có field data
            setCategories(result.data || result || []);
        } catch (error) {
            console.error("Error loading categories:", error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddGenre = (id) => {
        const valueToAdd = id;
        if (valueToAdd && !formData.genre.includes(valueToAdd)) {
            setFormData(prev => ({
                ...prev,
                genre: [...prev.genre, valueToAdd]
            }));
            setGenreInput('');
        }
    };

    const handleRemoveGenre = (index) => {
        setFormData(prev => ({
            ...prev,
            genre: prev.genre.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave && onSave(formData);
        console.log("formData: ", formData);
    };

    return (
        <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div
                className="form-create-game modal-content"
                initial={{ scale: 0.8, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, y: 50 }}
            >
                <div className="form-header">
                    <h2>{initialData ? 'CHỈNH SỬA THÔNG TIN GAME' : 'THÊM GAME MỚI (CHƯA CÓ HÌNH)'}</h2>
                    <button className="close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="game-form">
                    <div className="form-grid">
                        <div className="form-section">
                            <h3>THÔNG TIN CƠ BẢN</h3>
                            <div className="form-group">
                                <label>Tên Game</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    placeholder="VD: Resident Evil 4 Remake"
                                />
                            </div>

                            <div className="form-group">
                                <label>Ngày Phát Hành</label>
                                <input
                                    type="date"
                                    name="releaseDate"
                                    value={formData.releaseDate}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Mô tả nội dung</label>
                                <textarea
                                    name="content"
                                    value={formData.content}
                                    onChange={handleChange}
                                    required
                                    placeholder="Mô tả chi tiết về game..."
                                    rows="5"
                                ></textarea>
                            </div>
                        </div>

                        <div className="form-section">
                            <h3>THÔNG SỐ & THỂ LOẠI</h3>

                            <div className="form-group">
                                <label>Giá (VNĐ)</label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    min="0"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Download Key / Link</label>
                                <input
                                    type="text"
                                    name="downloadKey"
                                    value={formData.downloadKey}
                                    onChange={handleChange}
                                    required
                                    placeholder="Link Google Drive hoặc Mega..."
                                />
                            </div>

                            <div className="form-group">
                                <label>Thể loại</label>
                                <div className="input-with-button">
                                    <input
                                        type="text"
                                        value={genreInput}
                                        onChange={(e) => setGenreInput(e.target.value)}
                                        placeholder="Chọn danh mục bên dưới..."
                                        readOnly
                                    />
                                </div>

                                {/* Gợi ý danh mục từ DB */}
                                {categories.length > 0 && (
                                    <div className="suggested-categories" style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                                        <span style={{ fontSize: '0.7rem', fontWeight: 900, width: '100%', marginBottom: '5px', opacity: 0.6 }}>GỢI Ý:</span>
                                        {categories.map((cat) => (
                                            <button
                                                key={cat._id}
                                                type="button"
                                                className={`mini-tag-btn ${formData.genre.includes(cat._id) ? 'selected' : ''}`}
                                                onClick={() => handleAddGenre(cat._id)}
                                                style={{
                                                    fontSize: '0.7rem',
                                                    padding: '2px 8px',
                                                    border: '2px solid var(--black)',
                                                    background: formData.genre.includes(cat._id) ? 'var(--amber-gold)' : 'var(--white)',
                                                    cursor: 'pointer',
                                                    fontWeight: 800
                                                }}
                                            >
                                                {cat.name}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                <div className="tag-container" style={{ marginTop: '15px', borderTop: '2px dashed #ddd', paddingTop: '10px' }}>
                                    {formData.genre.map((id, i) => (
                                        <span key={i} className="neo-tag">
                                            {categories.find(c => c._id === id)?.name || id}
                                            <button type="button" onClick={() => handleRemoveGenre(i)}>
                                                <X size={12} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn-cancel" onClick={onClose}>
                            HỦY BỎ
                        </button>
                        <button type="submit" className="btn-save shadow-hover">
                            <Save size={20} />
                            {initialData ? 'LƯU THAY ĐỔI' : 'TIẾP TỤC (TẠO GAME)'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default FormCreateGame;