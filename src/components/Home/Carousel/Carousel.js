import React from 'react';
import './Carousel.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/autoplay';

import logoNadoLivre from '../../../assets/images/logo-nado-livre.jpg';
import logoCIME from '../../../assets/images/logo-cime.jpg';
import logoBanrisul from '../../../assets/images/logo-banrisul.png';
import logoAgrinova from '../../../assets/images/logo-agrinova.jpg';
import logoComag from '../../../assets/images/logo-comag.png';
import logoLider from '../../../assets/images/logo-lider.png';
import logoAfinato from '../../../assets/images/logo-afinato.png';
import logoZampronio from '../../../assets/images/logo-zampronio.png';

const companies = [
    { logo: logoNadoLivre, name: 'Nado Livre' },
    { logo: logoCIME, name: 'CIME' },
    { logo: logoBanrisul, name: 'Banrisul' },
    { logo: logoAgrinova, name: 'Agrinova' },
    { logo: logoComag, name: 'Comag' },
    { logo: logoLider, name: 'Líder' },
    { logo: logoAfinato, name: 'Afinato' },
    { logo: logoZampronio, name: 'Zampronio' },
];

const Carousel = () => (
    <div className="text-center carousel-container">
        <h1 className="p-2 text-primary">Empresas que publicam vagas na ACI</h1>
        <Swiper
            className="w-100 p-4 mb-4"
            modules={[Autoplay]}
            loop={true}
            autoplay={{ delay: 0, disableOnInteraction: false }}
            speed={3000}
            freeMode={true}
            allowTouchMove={false}
            breakpoints={{
                320: { slidesPerView: 2 },
                640: { slidesPerView: 4 },
                768: { slidesPerView: 5 },
                1024: { slidesPerView: 6 },
                1500: { slidesPerView: 7 },
            }}
        >
            {companies.map((company, index) => (
                <SwiperSlide key={index} className="carousel-slide">
                    <img src={company.logo} alt={`Logotipo da empresa ${company.name}`} loading="lazy" />
                    <p>{company.name}</p>
                </SwiperSlide>
            ))}
        </Swiper>
    </div>
);

export default Carousel;
