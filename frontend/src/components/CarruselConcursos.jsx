/* 
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import './CarruselConcursos.css';

const CarruselConcursos = () => {
  const concursos = [
    {
      imagen: '/img/concursos/uno.jpg',
      titulo: 'Concurso Retratos 2024',
      descripcion: 'Participá enviando tu mejor retrato y ganá premios exclusivos.',
    },
    {
      imagen: '/img/concursos/dos.jpg',
      titulo: 'Concurso Naturaleza',
      descripcion: 'Capturá la belleza natural y compartila con la comunidad.',
    },
    {
      imagen: '/img/concursos/tres.jpg',
      titulo: 'Desafío Blanco y Negro',
      descripcion: 'Mostrá el poder del blanco y negro con tu lente.',
    },
    {
      imagen: '/img/concursos/cuatro.jpg',
      titulo: 'Street Photography',
      descripcion: 'Contá historias urbanas con una imagen potente.',
    },
  ];

  return (
    <section className="carrusel-concursos">
      <h2 className="carrusel-titulo">Concursos Actuales</h2>
      <Swiper
        modules={[Pagination, Autoplay]}
        pagination={{ clickable: true }}
        loop={true}
        autoplay={{ delay: 3000 }}
        spaceBetween={30}
        breakpoints={{
          0: {
            slidesPerView: 1,
          },
          768: {
            slidesPerView: 2,
          },
        }}
      >
        {concursos.map((concurso, index) => (
          <SwiperSlide key={index}>
            <div className="tarjeta-concurso">
              <img src={concurso.imagen} alt={concurso.titulo} className="imagen-concurso" />
              <div className="contenido-concurso">
                <h3>{concurso.titulo}</h3>
                <p>{concurso.descripcion}</p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default CarruselConcursos;
 */