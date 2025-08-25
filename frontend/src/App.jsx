import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './components/RegisterForm'; 
import Bienvenida from './components/Bienvenida';
import Homepage from './components/Homepage';
import './styles/Home.css';



function App() {
  return (
    <Router>
      <nav>
        <ul>
          <li><a href="/">Inicio</a></li>
          <li><a href="/RegisterForm">Registro</a></li>
          <li><a href="/Homepage">Homepage</a></li>
        </ul>
    
      </nav>
      <Routes>
        <Route path="/" element={<Bienvenida />} />
        <Route path="/RegisterForm" element={<Register />} />
        <Route path="/Homepage" element={<Homepage />} />
      </Routes>
    </Router>
  );
}
export default App;
