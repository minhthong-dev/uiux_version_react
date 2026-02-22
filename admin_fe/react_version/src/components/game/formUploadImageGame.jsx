import React, { useState } from 'react';
import './game.css';
import { Upload, X, Save, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import gameApi from '../../api/gameApi';

const FormUploadImageGame = ({ gameId, gameName, initialMedia, onClose, onUploadSuccess }) => {
    const [coverFile, setCoverFile] = useState(null);
    const [screenshotFiles, setScreenshotFiles] = useState([]);
    const [previewCover, setPreviewCover] = useState(null);
    const [previewScreenshots, setPreviewScreenshots] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [existingMedia, setExistingMedia] = useState(initialMedia || {});

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
                // Cập nhật lại media hiện tại sau khi upload
                setExistingMedia(prev => ({
                    ...prev,
                    coverImage: result.data?.media?.coverImage || result.coverImage
                }));
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
                // Cập nhật lại list screenshots
                setExistingMedia(prev => ({
                    ...prev,
                    screenshots: result.data?.media?.screenshots || result.screenshots
                }));
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

    const handleDeleteImage = async (type, imageUrl) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa hình ảnh này?")) return;
        try {
            setIsUploading(true);
            console.log(gameId, type, imageUrl);
            const result = await gameApi.deleteImage(gameId, type, imageUrl);
            if (result.success) {
                alert("Xóa ảnh thành công!");
                // Cập nhật state UI
                if (type === 'cover') {
                    setExistingMedia(prev => ({ ...prev, coverImage: null }));
                } else {
                    setExistingMedia(prev => ({
                        ...prev,
                        screenshots: prev.screenshots.filter(url => url !== imageUrl)
                    }));
                }
                onUploadSuccess && onUploadSuccess();
            } else {
                alert("Xóa thất bại: " + (result.error || result.message));
            }
        } catch (error) {
            console.error(error);
            alert("Lỗi khi xóa ảnh");
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
                style={{ maxWidth: '900px' }}
            >
                <div className="form-header">
                    <div>
                        <h2>QUẢN LÝ HÌNH ẢNH</h2>
                        <p style={{ color: 'var(--blue-violet)', fontWeight: 900 }}>GAME: {gameName}</p>
                    </div>
                    <button className="close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className="game-form">
                    <div className="form-grid">
                        {/* Cover Section */}
                        <div className="form-section">
                            <h3>ẢNH BÌA (COVER)</h3>

                            {/* Hiện có */}
                            {existingMedia.coverImage && (
                                <div className="current-media-item" style={{ marginBottom: '15px' }}>
                                    <p className="small-label">ẢNH HIỆN TẠI:</p>
                                    <div className="preview-overlay" style={{ position: 'relative' }}>
                                        <img src={existingMedia.coverImage} alt="Current Cover" />
                                        <button
                                            type="button"
                                            className="delete-img-btn"
                                            onClick={() => handleDeleteImage('cover', existingMedia.coverImage)}
                                            disabled={isUploading}
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Upload mới */}
                            <div className="upload-box" style={{ minHeight: '120px' }}>
                                <label className="upload-label">
                                    <Upload size={20} />
                                    <span>THAY ĐỔI ẢNH</span>
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
                                style={{ marginTop: '10px', width: '100%', background: 'var(--blaze-orange)', fontSize: '0.8rem' }}
                                onClick={handleUploadCover}
                                disabled={isUploading || !coverFile}
                            >
                                <Save size={16} /> {isUploading ? 'ĐANG XỬ LÝ...' : 'LƯU ẢNH BÌA MỚI'}
                            </button>
                        </div>

                        {/* Screenshots Section */}
                        <div className="form-section">
                            <h3>SCREENSHOTS</h3>

                            {/* List ảnh hiện có */}
                            {existingMedia.screenshots && existingMedia.screenshots.length > 0 && (
                                <div className="current-media-list" style={{ marginBottom: '15px' }}>
                                    <p className="small-label">SCREENSHOTS HIỆN CÓ:</p>
                                    <div className="screenshots-grid-mini">
                                        {existingMedia.screenshots.map((url, idx) => (
                                            <div key={idx} className="screenshot-thumb-wrapper">
                                                <img src={url} alt={`Existing ${idx}`} />
                                                <button
                                                    type="button"
                                                    className="delete-img-btn-mini"
                                                    onClick={() => handleDeleteImage('screenshot', url)}
                                                    disabled={isUploading}
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="upload-box" style={{ minHeight: '120px' }}>
                                <label className="upload-label">
                                    <ImageIcon size={20} />
                                    <span>THÊM SCREENSHOTS</span>
                                    <input type="file" hidden multiple onChange={handleScreenshotsChange} accept="image/*" />
                                </label>
                            </div>

                            {/* Preview mới */}
                            {previewScreenshots.length > 0 && (
                                <div className="screenshots-grid" style={{ marginTop: '10px' }}>
                                    {previewScreenshots.map((src, i) => (
                                        <div key={i} className="screenshot-thumb">
                                            <img src={src} alt={`New Preview ${i}`} />
                                            <button type="button" onClick={() => {
                                                setPreviewScreenshots(prev => prev.filter((_, idx) => idx !== i));
                                                setScreenshotFiles(prev => prev.filter((_, idx) => idx !== i));
                                            }} className="remove-preview-btn">×</button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <button
                                className="btn-save shadow-hover"
                                style={{ marginTop: '10px', width: '100%', background: 'var(--azure-blue)', fontSize: '0.8rem' }}
                                onClick={handleUploadScreenshots}
                                disabled={isUploading || screenshotFiles.length === 0}
                            >
                                <Save size={16} /> {isUploading ? 'ĐANG XỬ LÝ...' : 'LƯU THÊM SCREENSHOTS'}
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
