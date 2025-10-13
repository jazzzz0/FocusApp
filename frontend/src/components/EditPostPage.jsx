import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PostForm from "./Subir";

const EditPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  

  

  // Cargar post existente
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const token = localStorage.getItem("access");
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}posts/${id}/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) throw new Error("Error al cargar el post");
        const data = await response.json();
        console.log(data);
        setPost(data.data);
      } catch (error) {
        console.error("Error al cargar el post:", error);
        alert("Error al cargar el post");
        navigate("/Homepage");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, navigate]);

  if (loading) return <p>Cargando...</p>;
  if (!post) return <p>No se encontró el post.</p>;

  return <PostForm existingPost={post} />;
};
export default EditPost;
