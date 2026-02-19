import React, { useState } from 'react';
import './game.css';
import { Upload, X, Save, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import gameApi from '../../api/gameApi';

const FormUploadImageGame = ({ gameId, gameName, onClose, onUploadSuccess }) => {
    const [coverFile, setCoverFile] = useState(null);
    const [screenshotFiles, setScreenshotFiles] = useState([]);
    const [previewCover, setPreviewCover] = useState(null);
    const [previewScreenshots, setPreviewScreenshots] = useState([]);
    const [isUploading, setIsUploading] = useState(false);

    const handleCoverChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCoverFile(file);
            setPreviewCover(URL.createObjectURL(file));
        }
    };

    const handleScreenshotsChange = (e) => {
        const files = Array.from(e.target.files);
        setScreenshotFiles(prev => [...prev, ...files]);
        const urls = files.map(file => URL.createObjectURL(file));
        setPreviewScreenshots(prev => [...prev, ...urls]);
    };

    const handleUploadCover = async () => {
        if (!coverFile) return alert("Vui lòng chọn ảnh bìa!");
        try {
            setIsUploading(true);
            const result = await gameApi.uploadCoverImage(gameId, coverFile);
            if (result.success || result.data) {
                alert("Upload ảnh bìa thành công!");
                setCoverFile(null);
                setPreviewCover(null);
                onUploadSuccess && onUploadSuccess();
            } else {
                alert("Upload thất bại: " + (result.error || result.message));
            }
        } catch (error) {
            console.error(error);
            alert("Lỗi khi upload ảnh bìa");
        } finally {
            setIsUploading(false);
        }
    };

    const handleUploadScreenshots = async () => {
        if (screenshotFiles.length === 0) return alert("Vui lòng chọn ít nhất một ảnh screenshot!");
        try {
            setIsUploading(true);
            const result = await gameApi.uploadScreenshotImage(gameId, screenshotFiles);
            if (result.success || result.data) {
                alert("Upload screenshot thành công!");
                setScreenshotFiles([]);
                setPreviewScreenshots([]);
                onUploadSuccess && onUploadSuccess();
            } else {
                alert("Upload thất bại: " + (result.error || result.message));
            }
        } catch (error) {
            console.error(error);
            alert("Lỗi khi upload screenshots");
        } finally {
            setIsUploading(false);
        }
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
                style={{ maxWidth: '800px' }}
            >
                <div className="form-header">
                    <div>
                        <h2>UPLOAD HÌNH ẢNH</h2>
                        <p style={{ color: 'var(--blue-violet)', fontWeight: 900 }}>GAME: {gameName}</p>
                    </div>
                    <button className="close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className="game-form">
                    <div className="form-grid">
                        {/* Cover Upload */}
                        <div className="form-section">
                            <h3>ẢNH BÌA (COVER)</h3>
                            <div className="upload-box" style={{ minHeight: '150px' }}>
                                <label className="upload-label">
                                    <Upload size={24} />
                                    <span>CHỌN FILE</span>
                                    <input type="file" hidden onChange={handleCoverChange} accept="image/*" />
                                </label>
                                {previewCover && (
                                    <div className="preview-overlay">
                                        <img src={previewCover} alt="Cover Preview" />
                                        <button type="button" onClick={() => setPreviewCover(null)}>X</button>
                                    </div>
                                )}
                            </div>
                            <button
                                className="btn-save shadow-hover"
                                style={{ marginTop: '10px', width: '100%', background: 'var(--blaze-orange)' }}
                                onClick={handleUploadCover}
                                disabled={isUploading || !coverFile}
                            >
                                <Save size={18} /> {isUploading ? 'ĐANG LƯU...' : 'LƯU ẢNH BÌA'}
                            </button>
                        </div>

                        {/* Screenshots Upload */}
                        <div className="form-section">
                            <h3>SCREENSHOTS</h3>
                            <div className="upload-box" style={{ minHeight: '150px' }}>
                                <label className="upload-label">
                                    <ImageIcon size={24} />
                                    <span>CHỌN NHIỀU FILE</span>
                                    <input type="file" hidden multiple onChange={handleScreenshotsChange} accept="image/*" />
                                </label>
                            </div>
                            <div className="screenshots-grid" style={{ marginTop: '10px' }}>
                                {previewScreenshots.map((src, i) => (
                                    <div key={i} className="screenshot-thumb">
                                        <img src={src} alt={`Screenshot ${i}`} />
                                    </div>
                                ))}
                            </div>
                            <button
                                className="btn-save shadow-hover"
                                style={{ marginTop: '10px', width: '100%', background: 'var(--azure-blue)' }}
                                onClick={handleUploadScreenshots}
                                disabled={isUploading || screenshotFiles.length === 0}
                            >
                                <Save size={18} /> {isUploading ? 'ĐANG LƯU...' : 'LƯU SCREENSHOTS'}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="form-actions">
                    <button className="btn-cancel" onClick={onClose}>
                        ĐÓNG
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default FormUploadImageGame;
