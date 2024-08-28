import React, { useEffect, useState } from 'react';
import './CarouselEmpresa.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Scrollbar } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/scrollbar';
import { FaMapMarkerAlt, FaBriefcase, FaLaptop, FaWheelchair } from 'react-icons/fa';
import axios from 'axios';
import { Link } from 'react-router-dom';

const CarouselEmpresa = () => {
    const [jobs, setJobs] = useState('');

    useEffect(() => {
        const fetchJobs = async () => {
            const token = localStorage.getItem('token'); // Certifique-se de que o token está definido
            if (token) {
                try {
                    const jobsResponse = await axios.get('http://localhost:5000/api/jobs', {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                    setJobs(jobsResponse.data);
                } catch (error) {
                    console.error('Error fetching jobs:', error);
                }
            }
        };

        fetchJobs();
    }, []);

    const swiperClass = jobs.length < 3 ? 'align-center' : 'align-start';

    return (
        <div className={`carousel-empresa-container ${swiperClass}`}>
            <h1>Vagas cadastradas</h1>
            {jobs.length > 0 ? (
                <Swiper
                    modules={[Navigation, Pagination, Scrollbar]}
                    navigation
                    pagination={{ clickable: true }}
                    loop={false}
                    scrollbar={{ draggable: true }}
                    breakpoints={{
                        320: {
                            slidesPerView: 1,
                            spaceBetween: 20,
                            navigation: {
                                enabled: true
                            },
                            scrollbar: {
                                enabled: true
                            }
                        },
                        640: {
                            slidesPerView: 2,
                            spaceBetween: 30,
                            navigation: {
                                enabled: true
                            },
                            scrollbar: {
                                enabled: true
                            }
                        },
                        768: {
                            slidesPerView: 2,
                            scrollbar: {
                                enabled: true
                            }
                        },
                        1024: {
                            slidesPerView: 3,
                        },
                        1500: {
                            slidesPerView: 4,
                            spaceBetween: 30
                        }
                    }}
                >
                    {jobs.map((job, index) => (
                        <SwiperSlide key={index}>
                            <div className="job-card">
                                <h4>{job.title}</h4>
                                <div className="job-details">
                                    <div className="detail-item"><FaMapMarkerAlt /> {job.location}</div>
                                    <div className="detail-item"><FaLaptop /> {job.modality}</div>
                                    <div className="detail-item"><FaBriefcase /> {job.type}</div>
                                    <div className="detail-item"><FaWheelchair /> {job.pcd ? 'PcD' : 'Não PcD'}</div>
                                </div>
                                <div className='linha-vaga' />
                                <p className="publish-date">Vaga publicada em {job.publishedDate}</p>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            ) : (
                <div className="no-jobs-message">
                    <p>Ainda não há vagas cadastradas. Clique<Link to="/vagas-empresa"> aqui </Link>para adicionar.</p>
                </div>
            )}
        </div>
    );
};

export default CarouselEmpresa;
