import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const PostForm = ({ existingPost }) => {
  const [formData, setFormData] = useState({
    image: null,
    title: "",
    description: "",
    category: "",
    allows_ratings: true,
  });

  const [preview, setPreview] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (existingPost) {
      setFormData({
        image: null,
        title: existingPost.title || "",
        description: existingPost.description || "",
        category: existingPost.category || "",
        allows_ratings: existingPost.allows_ratings ?? true,
      });
      setPreview(existingPost.image);
    }
  }, [existingPost]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem("access");
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}posts/categories/`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );
        if (!response.ok) throw new Error(`Error al cargar categorías (${response.status})`);
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error("Error cargando categorías:", error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!formData.image) return;
    const objectUrl = URL.createObjectURL(formData.image);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [formData.image]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "file" ? files[0] : type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("access");
    if (!token) {
      alert("Debes iniciar sesión para continuar.");
      navigate("/Login");
      return;
    }

    const formDataToSend = new FormData();
    if (formData.image) {
      formDataToSend.append("image", formData.image);
    }
    formDataToSend.append("title", formData.title || "");
    formDataToSend.append("description", formData.description || "");
    formDataToSend.append("category", formData.category);
    formDataToSend.append("allows_ratings", formData.allows_ratings);

    const url = existingPost
      ? `${import.meta.env.VITE_API_BASE_URL}posts/${existingPost.id}/`
      : `${import.meta.env.VITE_API_BASE_URL}posts/`;

    const method = existingPost ? "PATCH" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: formDataToSend,
      });

      const data = await response.json();

      if (response.ok) {
        alert(existingPost ? "Post actualizado correctamente" : "Foto subida correctamente");
        navigate("/Homepage");
      } else {
        console.error("Error de validación:", data);
        alert("❌ Error: " + (data.detail || "No se pudo procesar la solicitud."));
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión");
    }
  };

  return (
    <div className="register-form-center">
      <form className="register-form" onSubmit={handleSubmit}>
        <h2>{existingPost ? "Editar Post" : "Subir Foto"}</h2>

        <label>Imagen *</label>
        <input
          type="file"
          name="image"
          accept="image/*"
          onChange={handleChange}
          {...(!existingPost && { required: true })}
        />

        {preview && (
          <div style={{ marginTop: "10px", textAlign: "center" }}>
            <p>Vista previa:</p>
            <img
              src={preview}
              alt="Vista previa"
              style={{
                maxWidth: "300px",
                maxHeight: "300px",
                borderRadius: "10px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
              }}
            />
          </div>
        )}

        <label>Título</label>
        <input
          type="text"
          name="title"
          maxLength={200}
          value={formData.title}
          onChange={handleChange}
        />

        <label>Descripción</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
        />

        <label>Categoría *</label>
        {loading ? (
          <p>Cargando categorías...</p>
        ) : (
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione una categoría</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        )}

        <label>
          <input
            type="checkbox"
            name="allows_ratings"
            checked={formData.allows_ratings}
            onChange={handleChange}
          />
          Permitir calificaciones
        </label>

        <button type="submit" disabled={loading}>
          {existingPost ? "Actualizar" : "Subir"}
        </button>
      </form>
    </div>
  );
};

export default PostForm;
