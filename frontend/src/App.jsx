import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './components/RegisterForm'; 
import Bienvenida from './components/Bienvenida';
import Homepage from './components/Homepage';
import Login from './components/LoginForm'; 
import Concursos from './components/Concursos';
import Perfil from './components/Perfil';
import Subir from './components/Subir';
import './styles/Home.css';



function App() {
    return (
    <Router>
      <Routes>
        {/* Ruta principal */}
        <Route path="/" element={<Bienvenida />} />

        {/* Otras rutas */}
        <Route path="/Homepage" element={<Homepage />} />
        <Route path="/Concursos" element={<Concursos />} />
        <Route path="/Perfil" element={<Perfil />} />
        <Route path="/Subir" element={<Subir />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/RegisterForm" element={<Register />} />
      </Routes>
    </Router>
  );
}
export default App;
