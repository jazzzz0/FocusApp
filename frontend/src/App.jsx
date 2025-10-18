import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './components/RegisterForm'; 
import Bienvenida from './components/Bienvenida';
import Homepage from './components/Homepage';
import Login from './components/LoginForm'; 
import Perfil from './components/Perfil';
import PostForm from './components/Subir';
import './styles/Home.css';
import EditarPerfil from "./components/EditarPerfil";
import './styles/focusApp.css';
import './styles/Bienvenida.css'; 
import './styles/concursos_puntuar.css';
import './styles/RegisterForm.css';
import './styles/Perfil.css';
import CategoryPage from './pages/CategoryPage';
import { CategoriesProvider } from "./context/CategoriesContext";
import PostDetail from './pages/PostDetail';


function App() {
    return (
    <Router>
      <CategoriesProvider>
        <Routes>
          {/* Ruta principal */}
          <Route path="/" element={<Bienvenida />} />

          {/* Otras rutas */}
          <Route path="/Homepage" element={<Homepage />} />
          <Route path="/Perfil" element={<Perfil />} />
          <Route path="/Subir" element={<PostForm />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/RegisterForm" element={<Register />} />
          <Route path="/editar-perfil" element={<EditarPerfil />} />
          <Route path="/explorar/:categorySlug" element={< CategoryPage />} />
          <Route path="/posts/:id/" element={< PostDetail />}></Route>
          
        </Routes>
      </CategoriesProvider>

    </Router>
  );
}
export default App;
