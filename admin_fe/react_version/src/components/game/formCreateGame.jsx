import React, { useState } from 'react';
import './game.css';
import { Save, X, Plus, Trash2, Upload, Film } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FormCreateGame = ({ onSave, onClose }) => {
    const [formData, setFormData] = useState({
        name: '',
        releaseDate: '',
        content: '',
        downloadKey: '',
        genre: [],
        price: 0,
        media: {
            coverImage: '',
            screenshots: [],
            trailer: ''
        }
    });

    const [genreInput, setGenreInput] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            if (type === 'coverImage') {
                setFormData(prev => ({
                    ...prev,
                    media: { ...prev.media, coverImage: url }
                }));
            }
        }
    };

    const handleScreenshotUpload = (e) => {
        const files = Array.from(e.target.files);
        const urls = files.map(file => URL.createObjectURL(file));
        setFormData(prev => ({
            ...prev,
            media: {
                ...prev.media,
                screenshots: [...prev.media.screenshots, ...urls]
            }
        }));
    };

    const handleAddGenre = () => {
        if (genreInput.trim() && !formData.genre.includes(genreInput.trim())) {
            setFormData(prev => ({
                ...prev,
                genre: [...prev.genre, genreInput.trim()]
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

    const handleRemoveScreenshot = (index) => {
        setFormData(prev => ({
            ...prev,
            media: {
                ...prev.media,
                screenshots: prev.media.screenshots.filter((_, i) => i !== index)
            }
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave && onSave(formData);
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
                    <h2>THÊM GAME MỚI</h2>
                    <button className="close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="game-form">
                    <div className="form-grid">
                        {/* Basic Info */}
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
                        </div>

                        {/* Stats & Metadata */}
                        <div className="form-section">
                            <h3>THÔNG SỐ & THỂ LOẠI</h3>

                            <div className="form-row">
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
                            </div>

                            <div className="form-group">
                                <label>Thể loại</label>
                                <div className="input-with-button">
                                    <input
                                        type="text"
                                        value={genreInput}
                                        onChange={(e) => setGenreInput(e.target.value)}
                                        placeholder="Hành động, Phiêu lưu..."
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddGenre())}
                                    />
                                    <button type="button" onClick={handleAddGenre} className="add-mini">
                                        <Plus size={18} />
                                    </button>
                                </div>
                                <div className="tag-container">
                                    {formData.genre.map((g, i) => (
                                        <span key={i} className="neo-tag">
                                            {g}
                                            <button type="button" onClick={() => handleRemoveGenre(i)}>
                                                <X size={12} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Trailer (Youtube Link)</label>
                                <div className="input-with-icon">
                                    <Film size={20} className="input-icon" />
                                    <input
                                        type="text"
                                        name="media.trailer"
                                        value={formData.media.trailer}
                                        onChange={handleChange}
                                        required
                                        placeholder="https://youtube.com/watch?v=..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Media Section */}
                        <div className="form-section full-width">
                            <h3>HÌNH ẢNH (UPLOAD)</h3>
                            <div className="media-upload-grid">
                                <div className="upload-box main-cover">
                                    <label className="upload-label">
                                        <Upload size={32} />
                                        <span>CHỌN ẢNH BÌA</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleFileChange(e, 'coverImage')}
                                            hidden
                                        />
                                    </label>
                                    {formData.media.coverImage && (
                                        <div className="preview-overlay">
                                            <img src={formData.media.coverImage} alt="Cover" />
                                            <button type="button" onClick={() => setFormData(prev => ({ ...prev, media: { ...prev.media, coverImage: '' } }))}>
                                                XÓA
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="upload-box multi-screenshots">
                                    <label className="upload-label">
                                        <Plus size={32} />
                                        <span>THÊM ẢNH CHỤP MÀN HÌNH</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handleScreenshotUpload}
                                            hidden
                                        />
                                    </label>
                                    <div className="screenshots-grid">
                                        {formData.media.screenshots.map((s, i) => (
                                            <div key={i} className="screenshot-thumb">
                                                <img src={s} alt={`Screenshot ${i}`} />
                                                <button type="button" onClick={() => handleRemoveScreenshot(i)}>
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
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
                            XÁC NHẬN TẠO GAME
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default FormCreateGame;