import React, { useContext, useState, useEffect, useRef } from "react";
import { CategoriesContext } from "../context/CategoriesContext";
import { Link } from "react-router-dom";
import { categoryImages } from "../utils/categoryImages";


const CategoryCarousel = () => {
  const { categories } = useContext(CategoriesContext);
  const [current, setCurrent] = useState(0);
  const timeoutRef = useRef(null);

  // Avanza automáticamente cada 8 segundos
  useEffect(() => {
    if (!categories || categories.length === 0) return;

    timeoutRef.current = setTimeout(() => {
      setCurrent((prev) => (prev + 1) % categories.length);
    }, 8000);

    return () => clearTimeout(timeoutRef.current);
  }, [current, categories]);

  // Maneja click en dots
  const goToSlide = (idx) => {
    setCurrent(idx);
    clearTimeout(timeoutRef.current);
  };

  if (!categories || categories.length === 0) {
    return <p>Cargando categorías...</p>;
  }

  const currentCategory = categories[current];
  const imageUrL = categoryImages[currentCategory.slug] || "../assets/imagenes/default-category.jpg";

  return (
    <section className="categories">
      <h1 className="heading">Categorías</h1>
      <div className="carousel-wrapper auto-carousel">
        <div className="carousel-slide">
          <Link to={`/explorar/${currentCategory.slug}`}>
            <img src={imageUrL} alt={currentCategory.name} className="carousel-image-large" />
            <h3>{currentCategory.name}</h3>
            <p>{currentCategory.description}</p>
          </Link>
        </div>
        <div className="carousel-pagination">
          {categories.map((_, idx) => (
            <button
              key={idx}
              className={`carousel-dot${current === idx ? " active" : ""}`}
              onClick={() => goToSlide(idx)}
              aria-label={`Ir a ${categories[idx].name}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryCarousel;
