import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const EditPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    image: null, // archivo nuevo
    title: "",
    description: "",
    category: "",
    allows_ratings: true,
  });

  const [preview, setPreview] = useState(null); // preview de imagen
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("access");

  // Cargar post existente
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}posts/${id}/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) throw new Error("Error al cargar el post");
        const data = await res.json();

        // Rellenamos formData excepto imagen
        setFormData({
          image: null,
          title: data.title || "",
          description: data.description || "",
          category: data.category || "",
          allows_ratings: data.allows_ratings ?? true,
        });

        // Mostramos la imagen actual en preview
        setPreview(data.image || null);
      } catch (err) {
        console.error("Error cargando post:", err);
      }
    };

    fetchPost();
  }, [id, token]);

  // Cargar categorías
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}posts/categories/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) throw new Error("Error al cargar categorías");
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [token]);

  // Preview si sube nueva imagen
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
    const formDataToSend = new FormData();

    if (formData.image) formDataToSend.append("image", formData.image);
    formDataToSend.append("title", formData.title);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("category", formData.category);
    formDataToSend.append("allows_ratings", formData.allows_ratings);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}posts/${id}/`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
          body: formDataToSend,
        }
      );

      if (!res.ok) throw new Error("Error actualizando post");
      alert("✅ Post actualizado con éxito");
      navigate("/Homepage");
    } catch (err) {
      console.error(err);
      alert("❌ Error actualizando post");
    }
  };

  return (
    <div className="register-form-center">
      <form className="register-form" onSubmit={handleSubmit}>
        <h2>Editar Post</h2>

        {/* Imagen actual o nueva */}
        {preview && (
          <div style={{ marginBottom: "10px", textAlign: "center" }}>
            <p>Imagen actual:</p>
            <img
              src={preview}
              alt="Vista previa"
              style={{ maxWidth: "300px", borderRadius: "10px" }}
            />
          </div>
        )}

        <label>Imagen (opcional)</label>
        <input
          type="file"
          name="image"
          accept="image/*"
          onChange={handleChange}
        />

        <label>Título</label>
        <input
          type="text"
          name="title"
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

        <button type="submit">Actualizar</button>
      </form>
    </div>
  );
};

export default EditPost;
