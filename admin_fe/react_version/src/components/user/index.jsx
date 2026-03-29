import React, { useEffect, useRef, useState } from 'react';
import userApi from '../../api/userApi';
import './index.css';
import { ShieldAlert, ShieldCheck, UserX, UserCheck, Search, Crown, User, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from '../../components/notification/toast';
import { useSocket } from '../../context/socketContext';
const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const { socket, isConnected } = useSocket();
    const listenerRegistered = useRef(false);

    useEffect(() => {
        loadUsers();
    }, [socket]);

    const loadUsers = async () => {
        try {
            setLoading(true);

            // Lấy toàn bộ danh sách user từ DB
            const allUsersRes = await userApi.getAllUsers();
            const allUsers = Array.isArray(allUsersRes)
                ? allUsersRes
                : (allUsersRes?.data || allUsersRes?.users || []);

            if (!socket) {
                // Không có socket: hiển thị toàn bộ user, tất cả offline
                setUsers(allUsers.map(u => ({ ...u, isOnline: false })));
                return;
            }

            // Chỉ đăng ký listener 1 lần
            if (!listenerRegistered.current) {
                listenerRegistered.current = true;
                socket.on('receive_user_online_list', (data) => {
                    console.log('Danh sách user online:', data);
                    // Tạo Set chứa ID các user đang online
                    const onlineIds = new Set(data.map(item => item.data.id));

                    // Merge isOnline vào toàn bộ danh sách user
                    setUsers(prev => prev.map(u => ({
                        ...u,
                        isOnline: onlineIds.has(u._id),
                    })));
                });
            }

            // Hiển thị tất cả user trước (mặc định offline), rồi socket sẽ cập nhật
            setUsers(allUsers.map(u => ({ ...u, isOnline: false })));
            socket.emit('user_online_list', 'toi can danh sach user');

        } catch (error) {
            console.error("Failed to load users:", error);
            toast.error("Không thể tải danh sách người dùng.");
        } finally {
            setLoading(false);
        }
    };

    /* Chỉ refresh trạng thái online, không reload toàn bộ */
    const handleRefreshOnline = () => {
        if (!socket) return;
        setRefreshing(true);
        socket.emit('user_online_list', 'toi can danh sach user');
        setTimeout(() => setRefreshing(false), 1000);
    };

    const checkisBlock = (response) => {
        console.log('response:', response);
        return response?.isBlock || response?.data?.isBlock || false;
    };

    const handleToggleBlock = async (user) => {
        if (!window.confirm(`Bạn có chắc chắn muốn chặn người dùng này?`)) return;

        try {
            const result = await userApi.toggleBlockUser(user._id, socket);
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
            const result = await userApi.toggleUnBlockUser(user._id, socket);
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

                <div className="user-header-controls">
                    {/* Search box */}
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

                    {/* Nút refresh online */}
                    <motion.button
                        className="btn-refresh-online"
                        onClick={handleRefreshOnline}
                        disabled={refreshing}
                        whileTap={{ scale: 0.95, x: 3, y: 3 }}
                        title="Cập nhật trạng thái online"
                    >
                        <RefreshCw
                            size={18}
                            style={{
                                animation: refreshing ? 'spin 0.8s linear infinite' : 'none',
                            }}
                        />
                        {refreshing ? 'ĐANG CẬP NHẬT...' : 'REFRESH ONLINE'}
                    </motion.button>
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
                                        {new Date(user.createdAt).toLocaleDateString('vi-VN')}
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