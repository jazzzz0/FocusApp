import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './components/RegisterForm'; 
import Bienvenida from './components/Bienvenida';


function App() {
  return (
    <Router>
      <nav>
        <ul>
          <li><a href="/">Inicio</a></li>
          <li><a href="/RegisterForm">Registro</a></li>
        </ul>
    
      </nav>
      <Routes>
        <Route path="/" element={<Bienvenida />} />
        <Route path="/RegisterForm" element={<Register />} />
      </Routes>
    </Router>
  );
}
export default App;
