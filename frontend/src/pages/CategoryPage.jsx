import React, { useEffect, useState, useContext } from 'react'
import { useParams } from 'react-router-dom'
import { CategoriesContext } from '../context/CategoriesContext'
import { categoryImages } from '../utils/categoryImages'
import CategoryPhotos from '../components/CategoryPhotos'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import '../styles/CategoryPage.css'

const CategoryPage = () => {
  const { categorySlug: slug } = useParams()
  const { categories } = useContext(CategoriesContext)
  const [category, setCategory] = useState(null)

  useEffect(() => {
    if (!categories || categories.length === 0 || !slug) return

    const foundCategory = categories.find(
      c => c.slug?.toLowerCase() === slug?.toLowerCase()
    )

    setCategory(foundCategory)
  }, [slug, categories])

  if (!categories || categories.length === 0)
    return <p>Cargando categorías...</p>
  if (!category) return <p>Categoría no encontrada.</p>

  const imageUrl = categoryImages[category.slug]

  return (
    <>
      <Navbar />
      <div className="category-page">
        <div className="category-banner">
          <img src={imageUrl} alt={category.name} />
          <div className="category-banner-text">
            <h1>{category.name}</h1>
            <p>{category.description}</p>
          </div>
        </div>

        <CategoryPhotos categoryId={category.id} />
      </div>

      <Footer />
    </>
  )
}

export default CategoryPage
