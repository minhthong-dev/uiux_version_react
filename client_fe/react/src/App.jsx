import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './components/home./home'
import Login from './components/auth/auth'
import Search from './components/search/search'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/auth" element={<Login />} />
      <Route path="/search" element={<Search />} />
      {/* Thêm các route khác ở đây */}
    </Routes>
  )
}

export default App
