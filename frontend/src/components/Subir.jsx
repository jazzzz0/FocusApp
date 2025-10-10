import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";


const getDescriptionSuggestions = async (imageFile, navigate) => {
  const token = localStorage.getItem("access");
  if (!token) {
    alert("Debes iniciar sesión para continuar.");
    navigate("/Login");
    return;
  }

  try {
    const formData = new FormData();
    if (imageFile) {
      formData.append("image", imageFile);
    }

    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}posts/description-suggestions/`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    const data = await response.json();
    if (response.ok) {
      console.log("✅ Sugerencias recibidas:", data);
      return data;
    } else {
      console.error("❌ Error en sugerencias:", data);
      alert("Error: " + (data.detail || "No se pudo obtener sugerencias"));
      return null;
    }
  } catch (err) {
    console.error("🚨 Error de conexión:", err);
    return null;
  }
};




const PostForm = ({ existingPost }) => {
  const [formData, setFormData] = useState({
    image: null,
    title: "",
    description: "",
    category: "",
    allows_ratings: true,
  });

  const [descriptionSuggestions, setDescriptionSuggestions] = useState(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false); // Para mostrar carga al pedir sugerencias
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
        category: existingPost.category?.id || existingPost.category || "",
        allows_ratings: existingPost.allows_ratings ?? true,
      });
      setPreview(existingPost.image);
    }
    // Limpiar sugerencias al cargar un post existente
    setDescriptionSuggestions(null);
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

  const handleSuggestionSelection = (description) => {
    setFormData((prev) => ({
      ...prev,
      description: description,
    }));
    // Opcional: Puedes dejar las sugerencias visibles o ocultarlas aquí. 
    // Las mantendremos visibles para que pueda cambiar de opinión.
    // setDescriptionSuggestions(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "file" ? files[0] : type === "checkbox" ? checked : value,
    }));

    if (type === "file" && files[0]) {
      // Iniciar carga de sugerencias
      setLoadingSuggestions(true);
      setDescriptionSuggestions(null); // Limpiar sugerencias previas

      getDescriptionSuggestions(files[0], navigate).then((data) => {
        setLoadingSuggestions(false);

        if (data?.data?.contenido_generado) {
          // Convertir valores del objeto en array de sugerencias
          const suggestions = Object.values(data.data.contenido_generado);

          setDescriptionSuggestions(suggestions.slice(0, 3)); // máximo 3
          setFormData((prev) => ({
            ...prev,
            description: suggestions[0] || "",
          }));
        } else {
          setDescriptionSuggestions(null);
        }
      });

    }
    if (name === "description" && type !== "file") {
      setDescriptionSuggestions(null);
    }
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
      console.log("📸 Nueva imagen seleccionada:", formData.image);
      formDataToSend.append("image", formData.image);
    } else if (!existingPost) {
      // Solo obligamos en nuevo post
      alert("Debes seleccionar una imagen para subir.");
      return;
    }
    if (!formData.description.trim()) {
      alert("La descripción es obligatoria.");
      return;
    }

    formDataToSend.append("title", formData.title || "");
    formDataToSend.append("description", formData.description || "");
    formDataToSend.append("category", formData.category);
    formDataToSend.append("allows_ratings", formData.allows_ratings);

    // 👇 Debug: mostrar qué viaja
    for (let [key, value] of formDataToSend.entries()) {
      console.log("🔎 FormData =>", key, value);
    }

    const postId = existingPost?.id;
    const url = existingPost
      ? `${import.meta.env.VITE_API_BASE_URL}posts/${postId}/`
      : `${import.meta.env.VITE_API_BASE_URL}posts/`;


    const method = existingPost ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: formDataToSend,
      });

      let data;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (response.ok) {
        alert(existingPost ? "✅ Post actualizado correctamente" : "✅ Foto subida correctamente");
        navigate("/Homepage");
      } else {
        console.error("❌ Error de validación:", data);
        alert("❌ Error: " + (data?.detail || "No se pudo procesar la solicitud."));
      }
    } catch (error) {
      console.error("🚨 Error en fetch:", error);
      alert("Error de conexión");
    }
  };


  return (
    <div className="register-form-center">
      <form className="register-form" onSubmit={handleSubmit}>
        <h2>{existingPost ? "Editar Post" : "Subir Foto"}</h2>

        <label>Imagen *{existingPost ? "(opcional)" : "*"}</label>
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
        {/* --- Sección de Sugerencias de Descripción --- */}
        {loadingSuggestions && (
          <p style={{ textAlign: 'center', margin: '15px 0' }}>
            Cargando sugerencias de descripción por IA... 🧠
          </p>
        )}

        {descriptionSuggestions && descriptionSuggestions.length > 0 && (
          <div style={{
            marginTop: "15px",
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            backgroundColor: '#f9f9f9'
          }}>
            <p style={{ fontWeight: 'bold', marginBottom: '10px', textAlign: "center" }}>
              💡 Sugerencias de descripción por IA
            </p>

            <div style={{ display: 'flex', gap: '15px', justifyContent: "center", flexWrap: "wrap" }}>
              {descriptionSuggestions.slice(0, 3).map((desc, index) => (
                <div key={index} style={{
                  flex: "1 1 30%",
                  minWidth: "200px",
                  border: "1px solid #ddd",
                  borderRadius: "10px",
                  padding: "15px",
                  backgroundColor: "#fff",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                  textAlign: "center"
                }}>
                  <p style={{ fontSize: "14px", marginBottom: "10px" }}>{desc}</p>
                  <button
                    type="button"
                    onClick={() => handleSuggestionSelection(desc)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "6px",
                      border: "none",
                      background: formData.description === desc ? "#007bff" : "#6c757d",
                      color: "#fff",
                      cursor: "pointer",
                    }}
                  >
                    {formData.description === desc ? "Seleccionado" : "Usar esta"}
                  </button>
                </div>
              ))}
            </div>
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
          placeholder="Escribe tu propia descripción aquí si no quieres usar la IA."

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

        <button type="submit" disabled={loading || loadingSuggestions}>
          {existingPost ? "Actualizar" : "Subir"}
        </button>
      </form>
    </div>
  );
};

export default PostForm;
