import React from 'react';
import './Carousel.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules'; // Importando o autoplay
import 'swiper/css';
import 'swiper/css/autoplay';

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
    <div className="text-center carousel-container">
      <h1 className="p-2 text-primary">Empresas que publicam vagas na ACI</h1>
      <Swiper
      className="w-100 p-4 mb-4"
        modules={[Autoplay]} // Adicionando o módulo Autoplay
        loop={true} // Faz o carrossel dar loop infinito
        autoplay={{
          delay: 0, // Sem delay entre transições
          disableOnInteraction: false, // O autoplay não para em interações
          pauseOnMouseEnter: false, // O autoplay continua mesmo com o mouse sobre o carrossel
        }}
        speed={3000}
        freeMode={true}
        allowTouchMove={false}
        breakpoints={{
          320: {
            slidesPerView: 2,
            
          },
          640: {
            slidesPerView: 4,
          },
          768: {
            slidesPerView: 5,
          },
          1024: {
            slidesPerView: 6,
          },
          1500: {
            slidesPerView: 7,
          }
        }}
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
