import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './components/RegisterForm'; 
import Homepage from './components/Homepage';
import Login from './components/LoginForm'; 
import Perfil from './components/Perfil';
import PostForm from './components/Subir';
import './styles/Home.css';
import EditarPerfil from "./components/EditarPerfil";
import './styles/concursos_puntuar.css';
import './styles/RegisterForm.css';
import './styles/Perfil.css';
import './styles/main.css'
import CategoryPage from './pages/CategoryPage';
import CategoriesProvider from "./context/CategoriesContext";
import PostDetail from './pages/PostDetail';
import AuthProvider from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';


function App() {
    return (
      <>
      <AuthProvider>
        <Router>
          <CategoriesProvider>
            <Routes>
              {/* Ruta principal */}
              <Route path="/" element={<Homepage />} />

              {/* Rutas de acceso público */}
              <Route path="/Login" element={<Login />} />
              <Route path="/RegisterForm" element={<Register />} />

              {/* Rutas protegidas */}
              <Route path="/Perfil" element={
                <PrivateRoute>
                  <Perfil />
                </PrivateRoute>
              } />
              <Route path="/Subir" element={
                <PrivateRoute>
                  <PostForm />
                </PrivateRoute>
              } />
              <Route path="/editar-perfil" element={
                <PrivateRoute>
                  <EditarPerfil />
                </PrivateRoute>
              } />
              <Route path="/explorar/:categorySlug" element={
                <PrivateRoute>
                  <CategoryPage />
                </PrivateRoute>
              } />
              <Route path="/posts/:id/" element={
                <PrivateRoute>
                  <PostDetail />
                </PrivateRoute>
              } />
              
            </Routes>
          </CategoriesProvider>

        </Router>
    </AuthProvider>
    </>
  );
}
export default App;
