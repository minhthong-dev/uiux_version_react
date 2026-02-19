import Login from './components/auth/login';
import './App.css';
import { Routes, Route } from 'react-router-dom';
import Game from './components/game/index';
import Home from './components/home/index';

import Layout from './components/layout/index';

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Các route yêu cầu Layout Admin */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/game" element={<Game />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
