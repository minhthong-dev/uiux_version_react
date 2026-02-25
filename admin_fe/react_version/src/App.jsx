import Login from './components/auth/login';
import './App.css';
import { Routes, Route } from 'react-router-dom';
import Game from './components/game/index';
import Home from './components/home/index';
import Category from './components/category/index';
import User from './components/user/index'
import Layout from './components/layout/index';
import Discount from './components/discounts/discount';
import ToastContainer from './components/notification/toast';

function App() {
  return (
    <>
      <ToastContainer />
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Các route yêu cầu Layout Admin */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/game" element={<Game />} />
          <Route path="/category" element={<Category />} />
          <Route path="/users" element={<User />} />
          <Route path="/discount" element={<Discount />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
