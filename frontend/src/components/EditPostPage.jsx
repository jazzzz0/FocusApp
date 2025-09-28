// EditPost.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import UploadPhoto from "./Subir";

const EditPost = () => {
  const { id } = useParams(); // obtenemos el ID del post desde la URL
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const token = localStorage.getItem("access");
        if (!token) {
          alert("Debes iniciar sesión para editar una publicación.");
          navigate("/Login");
          return;
        }

        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}posts/${id}/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) {
          throw new Error(`Error al cargar post (${response.status})`);
        }

        const data = await response.json();
        setPost(data);
      } catch (error) {
        console.error("Error al cargar el post:", error);
        alert("❌ No se pudo cargar la publicación.");
        navigate("/Homepage");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!window.confirm("¿Seguro que deseas eliminar esta publicación?")) return;

    try {
      const token = localStorage.getItem("access");
      if (!token) {
        alert("Debes iniciar sesión para eliminar publicaciones.");
        navigate("/Login");
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}posts/${id}/`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        alert("✅ Publicación eliminada con éxito.");
        navigate("/Homepage");
      } else {
        const errorData = await response.json();
        console.error("Error al eliminar:", errorData);
        alert("❌ No se pudo eliminar la publicación.");
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión al eliminar.");
    }
  };

  if (loading) return <p>Cargando publicación...</p>;

  if (!post) return <p>No se encontró la publicación.</p>;

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      <UploadPhoto existingPost={post} />
      <button
        onClick={handleDelete}
        style={{
          marginTop: "20px",
          background: "red",
          color: "white",
          padding: "10px",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        🗑 Eliminar publicación
      </button>
    </div>
  );
};

export default EditPost;
