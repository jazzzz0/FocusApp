import React, { useEffect, useState } from "react";
import axios from "axios";
import { categoryImages } from "../utils/categoryImages";
import { Link } from "react-router-dom";
import '../styles/CategoryPhotos.css'

const CategoryPhotos = ({ categoryId, customUrl }) => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nextPageUrl, setNextPageUrl] = useState(null);
  const [prevPageUrl, setPrevPageUrl] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  const fetchPhotos = async (url, pageNumber = 1) => {
    try {
      setLoading(true);
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
      });

      const data = response.data;
      
      // Guardar solo resultados
      setPhotos(response.data.results || []);
      // Guardar los enlaces para la paginacion
      setNextPageUrl(data.next);
      setPrevPageUrl(data.previous);

      // Actualizar numero de pagina
      setCurrentPage(pageNumber);
    
    } catch (error) {
      console.error("Error al cargar fotos:", error);
      setPhotos([]);
      setNextPageUrl(null);
      setPrevPageUrl(null);
      setCurrentPage(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!categoryId && !customUrl) return;
    const firstPageUrl = customUrl
      ? customUrl
      : `${import.meta.env.VITE_API_BASE_URL}posts/?sort=rating&page_size=24&category=${categoryId}`;

    fetchPhotos(firstPageUrl);
  }, [categoryId , customUrl]);

  const handleNext = () => {
    if (nextPageUrl) fetchPhotos(nextPageUrl, currentPage + 1);
  }

  const handlePrev = () => {
    if (prevPageUrl) fetchPhotos(prevPageUrl, currentPage - 1);
  }

  if (loading) return <p>Cargando fotos...</p>;
  if (photos.length === 0) return <p style={{ color: '#555' }}>No hay fotos aún.</p>;

  return (
    <div className="category-photos">
      <div className="photos-grid">
        {Array.isArray(photos) ? (
          photos.map((photo) => {
            const imageUrl = photo.image || categoryImages[photo.categorySlug] || "../assets/imagenes/default-category.jpg";
  
            return (
              <div key={photo.id} className="photo-card">
                <Link to={`/posts/${photo.id}/`}>
                  <img src={imageUrl} alt={photo.title || `Foto de ${photo.author.username}`} />
                </Link>
                <h4>{photo.title || `Tomada por ${photo.author.username}`}</h4>
              </div>
            );
          })
        ): (
          <p>No hay fotos disponibles</p>
        )}
      </div>

      {/* Botones de paginacion */}
      <div className="pagination-buttons">
        {prevPageUrl && (
          <button onClick={handlePrev} disabled={!prevPageUrl}>&lt;</button>
        )}
        <div className="pagination-in">
          <p className="pagination-info">Página {currentPage}</p>
        </div>
        {nextPageUrl && (
          <button onClick={handleNext} disabled={!nextPageUrl}>&gt;</button>
        )}
      </div>


    </div>
  );
};

export default CategoryPhotos;
