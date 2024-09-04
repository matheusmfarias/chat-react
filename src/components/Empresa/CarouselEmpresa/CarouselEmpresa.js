import React, { useEffect, useState } from 'react';
import './CarouselEmpresa.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Scrollbar } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/scrollbar';
import axios from 'axios';
import { Link } from 'react-router-dom';
import useFormattedDate from '../../../hooks/useFormattedDate';
import { Card, Col, Row } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBriefcase, faBuilding, faCircle, faHome, faLaptopHouse, faLocationDot, faWheelchair } from '@fortawesome/free-solid-svg-icons';

const CarouselEmpresa = () => {
    const { formatDate } = useFormattedDate();
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
                            <Card className='bg-light shadow p-4 rounded border-0'>
                                <h2 className="card-title">{job.title}</h2>
                                <Card.Body className='p-1'>
                                    <Row className="mb-2">
                                        <Col>
                                            <Card.Text className='text-primary'>
                                                <FontAwesomeIcon className="me-2" icon={faLocationDot} title="Localização" />
                                                {job.location}
                                            </Card.Text>
                                        </Col>
                                    </Row>
                                    <Row className="mb-2">
                                        <Col>
                                            <Card.Text className='text-primary'>
                                                <FontAwesomeIcon
                                                    className="me-2"
                                                    icon={
                                                        job.modality === 'Remoto' ? faHome :
                                                            job.modality === 'Presencial' ? faBuilding :
                                                                faLaptopHouse
                                                    }
                                                    title="Modelo"
                                                />
                                                {job.modality}
                                            </Card.Text>
                                        </Col>
                                        <Col>
                                            <Card.Text className='text-primary'>
                                                <FontAwesomeIcon className="me-2" icon={faBriefcase} title="Tipo" />
                                                {job.type}
                                            </Card.Text>
                                        </Col>
                                    </Row>
                                    <Row className="mb-2">
                                        <Col>
                                            <Card.Text className="text-primary">
                                                <FontAwesomeIcon
                                                    className="me-2"
                                                    icon={faCircle}
                                                    style={{ color: job.status ? "#008000" : "#ff0000" }}
                                                    title="Status"
                                                />
                                                {job.status ? "Ativa" : "Inativa"}
                                            </Card.Text>
                                        </Col>
                                        <Col>
                                            <Card.Text className='text-primary'>
                                                <FontAwesomeIcon className="me-2" icon={faWheelchair} title="PCD" />
                                                {job.pcd ? 'PcD' : 'Não PcD'}
                                            </Card.Text>
                                        </Col>
                                    </Row>
                                </Card.Body>
                                <Card.Text className='text-secondary'>
                                    Vaga publicada em {formatDate(job.publicationDate)}
                                </Card.Text>
                            </Card>
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
