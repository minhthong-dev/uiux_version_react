import React, { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './components/home./home'
import Login from './components/auth/auth'
import Search from './components/search/search'
import Game from './components/game/game'
import Trending from './components/trending/trending'
import Newest from './components/newest/newest'
import Wishlist from './components/wishlist/wishlist'
import Cart from './components/cart/cart'
import Support from './components/support/support'
import Layout from './layout/index'
import './App.css'
import { SocketProvider } from './context/socketContext'
import { useNavigate } from 'react-router-dom'
function App() {
  const navigate = useNavigate();
  useEffect(() => {
    const handleTokenExpired = () => {
      localStorage.removeItem("token");
      navigate("/auth");
    };
    window.addEventListener("token-expired", handleTokenExpired);
    return () => {
      window.removeEventListener("token-expired", handleTokenExpired);
    };
  }, [navigate]);
  return (
    <SocketProvider>
      <Routes>
        <Route path="/auth" element={<Login />} />
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/game/:id" element={<Game />} />
          <Route path="/trending" element={<Trending />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/new" element={<Newest />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/support" element={<Support />} />
        </Route>
        {/* Thêm các route khác ở đây */}
      </Routes>
    </SocketProvider>
  )
}

export default App
