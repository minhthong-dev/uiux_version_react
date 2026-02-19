import React, { useEffect, useState } from 'react';
import userApi from '../../api/userApi';
import './index.css';
import { ShieldAlert, ShieldCheck, UserX, UserCheck, Search } from 'lucide-react';
import { motion } from 'framer-motion';

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
            const data = await userApi.getAllUsers();

            // Thêm fake data online status và joined date nếu thiếu
            const enrichedData = data.map(user => ({
                ...user,
                isOnline: Math.random() > 0.7, // Fake status online
                joinedAt: user.createdAt || new Date(Date.now() - Math.random() * 10000000000).toISOString()
            }));

            setUsers(enrichedData);
        } catch (error) {
            console.error("Failed to load users:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleBlock = async (user) => {
        const action = user.isBlocked ? "bỏ chặn" : "chặn";
        if (!window.confirm(`Bạn có chắc chắn muốn ${action} người dùng này?`)) return;

        try {
            // Logic thật: gọi API block
            // result = await userApi.toggleBlockUser(user._id, !user.isBlocked);

            // Logic tạm thời update UI để demo
            setUsers(prev => prev.map(u =>
                u._id === user._id ? { ...u, isBlocked: !u.isBlocked } : u
            ));

            alert(`${user.isBlocked ? "Bỏ chặn" : "Chặn"} người dùng thành công!`);
        } catch (error) {
            alert("Có lỗi xảy ra!");
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
                                        <span className="role-tag">{user.role || 'USER'}</span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                            {user.isBlocked ? (
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
                                            className={user.isBlocked ? "btn-unblock" : "btn-block"}
                                            onClick={() => handleToggleBlock(user)}
                                            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                                        >
                                            {user.isBlocked ? <UserCheck size={18} /> : <UserX size={18} />}
                                            {user.isBlocked ? "BỎ CHẶN" : "CHẶN"}
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