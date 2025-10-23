import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Snackbar, Alert, Tooltip } from "@mui/material";
import InfoIcon from '@mui/icons-material/Info';
import Navbar from "./Navbar";
import Footer from "./Footer";
import '../styles/Subir.css';


const getDescriptionSuggestions = async (imageFile, navigate, setSnackbar) => {
  const token = localStorage.getItem("access");
  if (!token) {
    setSnackbar({
      open: true,
      message: "Debes iniciar sesión para continuar.",
      severity: "warning"
    });
    setTimeout(() => navigate("/Login"), 2000);
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
      setSnackbar({
        open: true,
        message: "Error: " + (data.detail || "No se pudo obtener sugerencias"),
        severity: "error"
      });
      return null;
    }
  } catch (err) {
    console.error("🚨 Error de conexión:", err);
    return null;
  }
};




const PostForm = () => {
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
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });
  const navigate = useNavigate();

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

      getDescriptionSuggestions(files[0], navigate, setSnackbar).then((data) => {
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
      setSnackbar({
        open: true,
        message: "Debes iniciar sesión para continuar.",
        severity: "warning"
      });
      setTimeout(() => navigate("/Login"), 2000);
      return;
    }

    const formDataToSend = new FormData();

    if (!formData.image) {
      setSnackbar({
        open: true,
        message: "Debes seleccionar una imagen para subir.",
        severity: "warning"
      });
      return;
    }

    formDataToSend.append("image", formData.image);


    formDataToSend.append("title", formData.title || "");
    formDataToSend.append("description", formData.description || "");
    formDataToSend.append("category", formData.category);
    formDataToSend.append("allows_ratings", formData.allows_ratings);

    // 👇 Debug: mostrar qué viaja
    for (let [key, value] of formDataToSend.entries()) {
      console.log("🔎 FormData =>", key, value);
    }

    const url = `${import.meta.env.VITE_API_BASE_URL}posts/`;

    try {
      const response = await fetch(url, {
        method: "POST",
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
        setSnackbar({
          open: true,
          message: "✅ Foto subida correctamente",
          severity: "success"
        });
        // Debug: ver qué devuelve el backend
        console.log("🔍 Respuesta del backend:", data);
        // Redirigir a la nueva publicación creada
        const newPostId = data?.data?.id;
        console.log("🆔 ID de la nueva publicación:", newPostId);
        if (newPostId) {
          setTimeout(() => navigate(`/posts/${newPostId}/`), 1500);
        } else {
          console.log("⚠️ No se encontró ID, redirigiendo a /posts");
          setTimeout(() => navigate("/posts"), 1500);
        }
      } else {
        console.error("❌ Error de validación:", data);
        setSnackbar({
          open: true,
          message: "❌ Error: " + (data?.errors?.image || "No se pudo procesar la solicitud."),
          severity: "error"
        });
      }
    } catch (error) {
      console.error("🚨 Error en fetch:", error);
      setSnackbar({
        open: true,
        message: "Error de conexión",
        severity: "error"
      });
    }
  };
  
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };
  
  const showSuggestionsSection = loadingSuggestions || (descriptionSuggestions && descriptionSuggestions.length > 0);

  return (
    <>
      <Navbar />
      <div className="subir-form-center">
        <form className="subir-form" onSubmit={handleSubmit}>
        <h2>Subir Foto</h2>

        <div className="form-row">
          {/* Columna izquierda */}
          <div className="form-field left-column">
            <label>Imagen *</label>
            <div className="file-input-container">
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleChange}
                id="image_upload"
                className="file-input-hidden"
                required
              />
              <label htmlFor="image_upload" className="file-input-label">
                <span className="file-input-icon">📸</span>
                <span className="file-input-text">
                  {formData.image ? formData.image.name : 'Seleccionar imagen'}
                </span>
              </label>
            </div>

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

            <label>Título</label>
            <input
              type="text"
              name="title"
              maxLength={200}
              value={formData.title}
              onChange={handleChange}
            />

            <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                name="allows_ratings"
                checked={formData.allows_ratings}
                onChange={handleChange}
                style={{ margin: 0 }}
              />
              <span>Permitir valoraciones</span>
              <Tooltip 
                title="Permite que tu foto sea valorada en sus 5 aspectos clave (Composición, Iluminación, Adaptación técnica, Claridad y Enfoque, y Creatividad). El promedio de estas valoraciones influirá directamente en qué tan arriba aparece tu publicación en la sección 'Explorar' de su categoría."
                placement="top"
                arrow
                slotProps={{
                  popper: {
                    sx: { textAlign: 'justify' }
                  }
                }}
              >
                <InfoIcon style={{ cursor: 'help', fontSize: '18px' }} />
              </Tooltip>
            </label>
          </div>

          {/* Columna derecha */}
          <div className="image-preview">
            {preview ? (
              <>
                <p>Vista previa</p>
                <img
                  src={preview}
                  alt="Vista previa"
                />
              </>
            ) : (
              <div className="placeholder">
                <span>🖼️</span>
                <p>Sin imagen</p>
              </div>
            )}
          </div>
        </div>
        
          {showSuggestionsSection ? (
            /* --- 2 columnas: descripción + sugerencias --- */
            <div className={`description-suggestions-row ${showSuggestionsSection ? 'two-columns' : 'one-column'}`}>
              
              {/* Columna: Descripción */}
              <div className="description-box">
                <label>Descripción</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe tu fotografía."
                />
              </div>

              {/* Columna: Sugerencias (solo si se muestran) */}
              {showSuggestionsSection && (
                <div className="ai-suggestions">
                    {loadingSuggestions ? (
                      <p>Cargando sugerencias...</p>
                    ) : (
                      <>
                        <h3>Sugerencias de descripción</h3>
                        <div className="suggestions-row">
                          {descriptionSuggestions.slice(0, 3).map((desc, index) => {
                            const isSelected = formData.description === desc;
                            return (
                              <div
                                key={index}
                                className={`suggestion-card-with-check ${isSelected ? 'selected' : ''}`}
                                onClick={() => handleSuggestionSelection(desc)}
                              >
                                <p title={desc}>{desc}</p>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
                </div>
              )}
            </div>
          ): (
            // --- 1 columna (full width) ---
            <div className="description-suggestions-row one-column">
            <div className="description-box">
              <label>Descripción</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe tu fotografía."
              />
            </div>
          </div>
          )}



        <button type="submit" className="subir-btn" disabled={loading || loadingSuggestions}>
          {loading || loadingSuggestions ? "Procesando..." : "Subir"}
        </button>
      </form>
      
      {/* Snackbar para mensajes de éxito/error */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={snackbar.message.includes("Debes iniciar sesión") ? 2000 : 4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      </div>
      <Footer />
    </>
  );
};

export default PostForm;
