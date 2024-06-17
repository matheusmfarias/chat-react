import React from 'react';
import './Carousel.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Scrollbar } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/scrollbar';
import logoNadoLivre from '../../assets/images/logo-nado-livre.jpg'
import logoCIME from '../../assets/images/logo-cime.jpg'
import logoBanrisul from '../../assets/images/logo-banrisul.png'
import logoAgrinova from '../../assets/images/logo-agrinova.jpg'
import logoComag from '../../assets/images/logo-comag.png'
import logoLider from '../../assets/images/logo-lider.png'
import logoAfinato from '../../assets/images/logo-afinato.png'
import logoZampronio from '../../assets/images/logo-zampronio.png'

const Carousel = () => {
  return (
    <div className="carousel-container">
      <h1>Empresas que publicam vagas na ACI</h1>
      <Swiper
        modules={[Navigation, Pagination, Scrollbar]}
        navigation
        pagination={{ clickable: true }}
        loop={false}
        scrollbar
        breakpoints={{
          320: {
            slidesPerView: 3,
            spaceBetween: 20,
            navigation: {
              enabled: false
            },
            scrollbar: {
              enabled: true
            }
          },
          640: {
            slidesPerView: 4,
            spaceBetween: 30,
            navigation: {
              enabled: false
            },
            scrollbar: {
              enabled: true
            }
          },
          768: {
            slidesPerView: 4,
            scrollbar: {
              enabled: false
            }
          },
          1024: {
            slidesPerView: 5,
          },
          1500: {
            slidesPerView: 6,
            spaceBetween: -100
          }
        }
        }
      >
        {[logoNadoLivre, logoCIME, logoBanrisul, logoAgrinova, logoComag, logoLider, logoAfinato, logoZampronio].map((logo, index) => (
          <SwiperSlide key={index}>
            <img src={logo} alt={`Logo ${index}`} />
            <p>{['Nado Livre', 'CIME', 'Banrisul', 'Agrinova', 'Comag', 'Líder', 'Afinato', 'Zampronio'][index]}</p>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Carousel;
