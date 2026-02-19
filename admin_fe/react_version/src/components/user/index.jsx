import React, { useEffect, useState } from 'react';
import userApi from '../../api/userApi';
import './index.css';
import { ShieldAlert, ShieldCheck, UserX, UserCheck, Search, Crown, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from '../../components/notification/toast';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const response = await userApi.getAllUsers();
            const data = Array.isArray(response) ? response : (response?.data || response?.users || []);

            const enrichedData = data.map(user => ({
                ...user,
                isOnline: Math.random() > 0.7,
                joinedAt: user.createdAt || new Date(Date.now() - Math.random() * 10000000000).toISOString()
            }));

            setUsers(enrichedData);
        } catch (error) {
            console.error("Failed to load users:", error);
            toast.error("Không thể tải danh sách người dùng.");
        } finally {
            setLoading(false);
        }
    };

    const checkisBlock = (response) => {
        // Trả về giá trị boolean từ response (tùy thuộc vào cấu trúc backend)
        return response?.isBlock || response?.data?.isBlock || false;
    };

    const handleToggleBlock = async (user) => {
        if (!window.confirm(`Bạn có chắc chắn muốn chặn người dùng này?`)) return;

        try {
            const result = await userApi.toggleBlockUser(user._id);
            const isBlock = checkisBlock(result);
            setUsers(prev => prev.map(u =>
                u._id === user._id ? { ...u, isBlock: isBlock } : u
            ));
            console.log("result :", result);
            if (result.message === 'block nguoi dung thanh cong') {
                loadUsers();
                toast.success("Chặn người dùng thành công!");
            }
        } catch (error) {
            toast.error("Có lỗi xảy ra!");
        }
    };

    const handleToggleUnBlock = async (user) => {
        if (!window.confirm(`Bạn có chắc chắn muốn bỏ chặn người dùng này?`)) return;

        try {
            const result = await userApi.toggleUnBlockUser(user._id);
            const isBlock = checkisBlock(result);

            setUsers(prev => prev.map(u =>
                u._id === user._id ? { ...u, isBlock: isBlock } : u
            ));

            if (result.message === 'bo block nguoi dung thanh cong') {
                loadUsers();
                toast.success("Bỏ chặn người dùng thành công!");
            }
        } catch (error) {
            toast.error("Có lỗi xảy ra!");
        }
    };

    const filteredUsers = users.filter(u =>
        u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="user-mgmt-container">
            <h1 className="login-title" style={{ textAlign: 'center', marginTop: '5rem' }}>ĐANG TẢI NGƯỜI DÙNG...</h1>
        </div>
    );

    return (
        <div className="user-mgmt-container">
            <header className="user-header-section">
                <motion.h1
                    className="page-title"
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                >
                    QUẢN LÝ NGƯỜI DÙNG
                </motion.h1>

                <div className="search-box-wrapper" style={{ position: 'relative' }}>
                    <Search style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} size={20} />
                    <input
                        type="text"
                        placeholder="Tìm theo tên, email..."
                        className="neo-input"
                        style={{ paddingLeft: '45px', margin: 0, minWidth: '300px' }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </header>

            <div className="user-table-wrapper">
                <table className="user-table">
                    <thead>
                        <tr>
                            <th>Người dùng</th>
                            <th>Vai trò</th>
                            <th>Trạng thái</th>
                            <th>Ngày tham gia</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map((user, idx) => (
                                <motion.tr
                                    key={user._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                >
                                    <td>
                                        <div className="user-info-cell">
                                            <img
                                                src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                                                alt="avatar"
                                                className="user-avatar"
                                            />
                                            <div className="user-details">
                                                <span className="user-name">{user.username || "Chưa đặt tên"}</span>
                                                <span className="user-email">{user.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        {user.role === 'super_admin' ? (
                                            <span className="role-badge role-super_admin">
                                                <Crown size={14} /> SUPER ADMIN
                                            </span>
                                        ) : user.role === 'admin' ? (
                                            <span className="role-badge role-admin">
                                                <ShieldCheck size={14} /> ADMIN
                                            </span>
                                        ) : (
                                            <span className="role-badge role-user">
                                                <User size={14} /> USER
                                            </span>
                                        )}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                            {user.isBlock ? (
                                                <span className="status-badge status-blocked">ĐÃ CHẶN</span>
                                            ) : (
                                                <span className={`status-badge ${user.isOnline ? 'status-online' : 'status-offline'}`}>
                                                    {user.isOnline ? 'ONLINE' : 'OFFLINE'}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        {new Date(user.joinedAt).toLocaleDateString('vi-VN')}
                                    </td>
                                    <td>
                                        <button
                                            className={user.isBlock ? "btn-unblock" : "btn-block"}
                                            onClick={() => user.isBlock ? handleToggleUnBlock(user) : handleToggleBlock(user)}
                                            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                                        >
                                            {user.isBlock ? <UserCheck size={18} /> : <UserX size={18} />}
                                            {user.isBlock ? "BỎ CHẶN" : "CHẶN"}
                                        </button>
                                    </td>
                                </motion.tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '3rem' }}>
                                    <h3>Không tìm thấy người dùng nào</h3>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserManagement;