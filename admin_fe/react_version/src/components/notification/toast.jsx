import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './toast.css';

// Singleton to trigger toasts from anywhere
let toastManager = null;

export const toast = {
    success: (message, title = 'THÀNH CÔNG') => toastManager?.add(message, title, 'success'),
    error: (message, title = 'LỖI') => toastManager?.add(message, title, 'error'),
    info: (message, title = 'THÔNG BÁO') => toastManager?.add(message, title, 'info'),
    warning: (message, title = 'CẢNH BÁO') => toastManager?.add(message, title, 'warning'),
};

const ToastItem = ({ id, message, title, type, onRemove }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onRemove(id);
        }, 4000);
        return () => clearTimeout(timer);
    }, [id, onRemove]);

    const icons = {
        success: <CheckCircle size={24} />,
        error: <AlertCircle size={24} />,
        info: <Info size={24} />,
        warning: <AlertTriangle size={24} />,
    };

    return (
        <motion.div
            className={`toast-item ${type}`}
            layout
            initial={{ opacity: 0, x: 50, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
        >
            <div className="toast-icon">
                {icons[type]}
            </div>
            <div className="toast-content">
                <span className="toast-title">{title}</span>
                <p className="toast-message">{message}</p>
            </div>
            <button className="toast-close" onClick={() => onRemove(id)}>
                <X size={18} />
            </button>
            <motion.div
                className="toast-progress"
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: 4, ease: "linear" }}
            />
        </motion.div>
    );
};

const ToastContainer = () => {
    const [toasts, setToasts] = useState([]);

    const add = useCallback((message, title, type) => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts((prev) => [...prev, { id, message, title, type }]);
    }, []);

    const remove = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    useEffect(() => {
        toastManager = { add };
        return () => { toastManager = null; };
    }, [add]);

    return (
        <div className="toast-container">
            <AnimatePresence>
                {toasts.map((t) => (
                    <ToastItem key={t.id} {...t} onRemove={remove} />
                ))}
            </AnimatePresence>
        </div>
    );
};

export default ToastContainer;
