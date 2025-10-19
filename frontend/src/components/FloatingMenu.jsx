import { useContext } from "react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import ImageSearchIcon from "@mui/icons-material/ImageSearch";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { CategoriesContext } from "../context/CategoriesContext";


import "../styles/Navbar.css";

const FloatingMenu = () => {
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();
  const { categories } = useContext(CategoriesContext);
  const [showDropdown, setShowDropdown] = useState(false);
  const closeMobileMenu = () => {
    setShowDropdown(false);
  };

  const isActive = (path) => {
    return window.location.pathname.startsWith(path);
  };


  return (
    <div className="floating-menu">
      <button
        className="float-btn"
        onClick={() => setShowMenu((prev) => !prev)}
      >
        <AddIcon fontSize="large" aria-label="add"/>
      </button>

      {showMenu && (
        <div className="float-options">
          <button
            onClick={() => navigate("/subir")}
            className="float-option"
          >
            <AddAPhotoIcon /> Subir Foto
          </button>
          <button
            onMouseEnter={() => setShowDropdown(true)}
            onMouseLeave={() => setShowDropdown(false)}
            onClick={() => setShowDropdown(!showDropdown)}
          >
            
            <ImageSearchIcon /><span className={showDropdown ? 'active' : ''}>Categorías</span>
            
            {showDropdown && (
              <ul className="dropdown-menu">    

                {categories.map(cat => (
                  <li key={cat.id}>
                    <Link 
                      to={`/explorar/${cat.slug}`}
                      className={isActive(`/explorar/${cat.slug}`) ? 'active' : ''}
                      onClick={closeMobileMenu} 
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul> 
            )}
          </button>
          

        </div>
  )
}
    </div >
  );
};

export default FloatingMenu;
