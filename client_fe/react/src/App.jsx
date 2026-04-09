import React, { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './components/home/home'
import Login from './components/auth/auth'
import Search from './components/search/search'
import Game from './components/game/game'
import Trending from './components/trending/trending'
import Newest from './components/newest/newest'
import Wishlist from './components/wishlist/wishlist'
import Cart from './components/cart/cart'
import Discount from './components/discout/discount'
import Support from './components/support/support'
import Payment from './components/payment/payment'
import History from './components/history/history'
import Checkout from './components/checkout/checkout'
import AuthSuccess from './components/auth/authSuccess'
import WalletSelection from './components/wallet/walletSelection'
import WalletDetail from './components/wallet/walletDetail'
import Profile from './components/profile/profile'
import Layout from './layout/index'
import './App.css'
import { SocketProvider } from './context/socketContext'
import { DiscountProvider } from './context/discountContext'
import { InventoryProvider } from './context/inventoryContext'
import { useNavigate } from 'react-router-dom'
import ToastContainer from './components/notification/toast'
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
      <DiscountProvider>
        <InventoryProvider>
        <ToastContainer />
        <Routes>
          <Route path="/auth" element={<Login />} />
          <Route path="/auth-success" element={<AuthSuccess />} />
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/game/:id" element={<Game />} />
            <Route path="/trending" element={<Trending />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/new" element={<Newest />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/discount" element={<Discount />} />
            <Route path="/support" element={<Support />} />
            <Route path="/history" element={<History />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/wallets" element={<WalletSelection />} />
            <Route path="/wallet/:id" element={<WalletDetail />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
          {/* Thêm các route khác ở đây */}
        </Routes>
        </InventoryProvider>
      </DiscountProvider>
    </SocketProvider>
  )
}

export default App
