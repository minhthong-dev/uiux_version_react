import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './components/home./home'
import Login from './components/auth/auth'
import Search from './components/search/search'
import Game from './components/game/game'
import Trending from './components/trending/trending'
import Newest from './components/newest/newest'
import Wishlist from './components/wishlist/wishlist'
import Cart from './components/cart/cart'
import Layout from './layout/index'
import './App.css'

function App() {
  return (
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
      </Route>
      {/* Thêm các route khác ở đây */}
    </Routes>
  )
}

export default App
