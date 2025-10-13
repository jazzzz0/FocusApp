import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './components/RegisterForm'; 
import Bienvenida from './components/Bienvenida';
import Homepage from './components/Homepage';
import Login from './components/LoginForm'; 
import Concursos from './components/Concursos';
import Perfil from './components/Perfil';
import PostForm from './components/Subir';
import './styles/Home.css';
import PostList from "./components/PostList";
import EditPost from "./components/EditPostPage";
import PuntuarFoto from "./components/PuntuarFoto";
import ValorarFoto from "./components/ValorarFoto";
import EditarPerfil from "./components/EditarPerfil";
import CarruselConcursos from './components/CarruselConcursos';
import './styles/focusApp.css';
import './styles/Bienvenida.css'; 
import './styles/concursos_puntuar.css';
import './styles/RegisterForm.css';
import './styles/Perfil.css';
import CategoryPage from './pages/CategoryPage';
import { CategoriesProvider } from "./context/CategoriesContext";



function App() {
    return (
    <Router>
      <CategoriesProvider>
        <Routes>
          {/* Ruta principal */}
          <Route path="/" element={<Bienvenida />} />

        {/* Otras rutas */}
        <Route path="/posts" element={<PostList />} />
        <Route path="/Homepage" element={<Homepage />} />
        <Route path="/concursos" element={<Concursos />} />
        <Route path="/Perfil" element={<Perfil />} />
        <Route path="/Subir" element={<PostForm />} />
        <Route path="/editar-post/:id" element={<EditPost />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/RegisterForm" element={<Register />} />
        <Route path="/PuntuarFoto" element={<PuntuarFoto />} />
        <Route path="/valorar" element={<ValorarFoto />} />
        <Route path="/editar-perfil" element={<EditarPerfil />} />
        <Route path="/CarruselConcursos" element={<CarruselConcursos />} />
        <Route path="/Concursos" element={<Concursos />} />
        <Route path="/explorar/:categorySlug" element={< CategoryPage />} />
         
          
        </Routes>
      </CategoriesProvider>

    </Router>
  );
}
export default App;
