import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/editar-perfil.css";
import Navbar from "./Navbar";
import Footer from "./Footer";

const EditarPerfil = () => {
  const [userData, setUserData] = useState({
    first_name: "",
    last_name: "",
    bio: "",
    profile_pic: "",
  });
  const [preview, setPreview] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("access");

      if (!token) {
        alert("Debes iniciar sesión para editar tu perfil.");
        navigate("/login");
        return;
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}users/me/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await response.json();
        if (response.ok && data) {
          const data = data.data
          setUserData({
            first_name: data.data.first_name || "",
            last_name: data.data.last_name || "",
            bio: data.data.bio || "",
            profile_pic: data.data.profile_pic || "",
          });
          setPreview(data.data.profile_pic);
        } else {
          alert("No se pudo cargar el perfil para editar.");
        }
      } catch (error) {
        console.error("Error al obtener datos del usuario:", error);
      }
    };

    fetchUser();
  }, [ navigate ]);

  const handleChange = (e) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUserData({ ...userData, profile_pic: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleRemovePhoto = () => {
    setUserData({ ...userData, profile_pic: "" });
    setPreview(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("access");
    if (!token) {
      alert("Debes iniciar sesión para guardar los cambios.");
      navigate("/login");
      return;
    }

    const formData = new FormData();
    formData.append("first_name", userData.first_name);
    formData.append("last_name", userData.last_name);
    formData.append("bio", userData.bio);
    // Si el usuario eliminó la foto
    if (userData.profile_pic === "") {
      formData.append("profile_pic", "");
    }
    // Si el usuario seleccionó una nueva foto
    else if (userData.profile_pic instanceof File) {
      formData.append("profile_pic", userData.profile_pic);
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}users/me/update/`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        alert("✅ Perfil actualizado con éxito");
        navigate("/perfil");
      } else {
        console.error("Error en la respuesta del servidor:", data);
        alert("⚠️ Error al guardar los cambios.");
      }
    } catch (error) {
      console.error("Error al guardar perfil:", error);
    }
  };

  return (
    <>
      <div className="perfil-wrapper">
        {/* 🔹 Navbar minimalista igual que Perfil */}
        <Navbar />

        {/* 🔹 Contenedor de edición */}
        <div className="editar-perfil">
          <h2>Editar Perfil</h2>

          <form className="editar-form" onSubmit={handleSave}>
            <div className="profile-pic-section">
              <img
                src={preview || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                alt="Vista previa"
                className="profile-pic-preview"
              />
              <div className="file-actions">
                <label className="file-input-label">
                  Cambiar foto de perfil
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: "none" }}
                  />
                </label>
                {preview && (
                  <button
                    type="button"
                    className="btn-eliminar-foto"
                    onClick={handleRemovePhoto}
                  >
                    🗑️ Quitar foto
                  </button>
                )}
              </div>
            </div>


            <div className="form-group">
              <label>Nombre</label>
              <input
                type="text"
                name="first_name"
                value={userData.first_name}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Apellido</label>
              <input
                type="text"
                name="last_name"
                value={userData.last_name}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Biografía</label>
              <textarea
                name="bio"
                value={userData.bio}
                onChange={handleChange}
                rows="3"
              />
            </div>

            <button type="submit" className="btn-guardar">
              💾 Guardar cambios
            </button>
          </form>
        </div >
      </div >
      <Footer />
    </>
  );
};

export default EditarPerfil;
