import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../sidebar_header/header';
import Sidebar from '../sidebar_header/sidebar';
import '../sidebar_header/sidebar_header.css';

const Layout = () => {
    return (
        <div className="admin-layout-root">
            <Header />
            <div className="admin-layout">
                <Sidebar />
                <main className="admin-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
