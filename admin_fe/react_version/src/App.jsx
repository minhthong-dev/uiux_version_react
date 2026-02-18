import Login from './components/auth/login';
import './App.css';
import { Routes, Route } from 'react-router-dom';
import Game from './components/game/index';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Game />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </>
  );
}

export default App;
