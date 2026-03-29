import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../sidebar_header/header';
import Sidebar from '../sidebar_header/sidebar';
import '../sidebar_header/sidebar_header.css';

const Layout = () => {
    return (
        <div className="layout-root">
            <Header />
            <div className="client-layout">
                <Sidebar />
                <main className="client-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
