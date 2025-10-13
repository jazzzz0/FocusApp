import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const PostList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const token = localStorage.getItem("access");
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}posts/`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        const data = await response.json();

        if (response.ok) {
          // ✅ Si la API tiene paginación, usar data.results
          if (Array.isArray(data.results)) {
            setPosts(data.results);
          } else if (Array.isArray(data)) {
            setPosts(data);
          } else {
            console.warn("No se detectó array en la respuesta:", data);
            setPosts([]);
          }
        } else {
          console.error("Error al obtener posts:", data);
          setPosts([]);
        }
      } catch (error) {
        console.error("Error de conexión:", error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handleEdit = (post) => {
    navigate(`/editar-post/${post.id}`);
  };

  const handleDelete = async (id) => {
    const confirmDelete = confirm("¿Seguro que deseas eliminar este post?");
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("access");
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}posts/${id}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        alert("✅ Post eliminado correctamente");
        setPosts((prev) => prev.filter((p) => p.id !== id));
      } else {
        const errorData = await response.json();
        console.error("Error eliminando post:", errorData);
        alert("❌ Error eliminando post: " + (errorData.detail || "Intenta nuevamente"));
      }
    } catch (error) {
      console.error("Error al eliminar post:", error);
      alert("Error de conexión");
    }
  };

  if (loading) return <p>Cargando publicaciones...</p>;
  if (posts.length === 0) return <p>No hay publicaciones aún.</p>;

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "10px" }}>
      <h2>Lista de Publicaciones</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {posts.map((post) => (
          <li
            key={post.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: "8px",
              marginBottom: "15px",
              padding: "10px",
              boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
            }}
          >
            <img
              src={post.image || "https://via.placeholder.com/300x200?text=Sin+imagen"}
              alt={post.title || "Imagen"}
              style={{
                maxWidth: "100%",
                borderRadius: "6px",
                marginBottom: "10px",
              }}
            />
            <h3>{post.title || "Sin título"}</h3>
            <p>{post.description || "Sin descripción"}</p>
            <p>
              <strong>Categoría:</strong> {post.category?.name || post.category || "Sin categoría"}
            </p>

            <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
              <button
                onClick={() => handleEdit(post)}
                style={{
                  background: "#176AB9",
                  color: "#fff",
                  border: "none",
                  padding: "5px 10px",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                ✏️ Editar
              </button>
              <button
                onClick={() => handleDelete(post.id)}
                style={{
                  background: "#e63946",
                  color: "#fff",
                  border: "none",
                  padding: "5px 10px",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                🗑️ Eliminar
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PostList;
