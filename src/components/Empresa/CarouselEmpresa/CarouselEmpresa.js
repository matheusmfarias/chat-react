import React, { useEffect, useState } from 'react';
import './CarouselEmpresa.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules'; // Importando o autoplay
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/scrollbar';
import api from '../../../services/axiosConfig';
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
                    const jobsResponse = await api.get(`${process.env.REACT_APP_API_URL}/api/jobs`, {
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

    return (
        <div className="text-center carousel-empresa-container">
            <h1 className="text-primary m-4">Vagas cadastradas</h1>
            {jobs.length > 0 ? (
                <Swiper
                    className="w-100 p-4"
                    modules={[Autoplay]}// Adicionando o módulo Autoplay
                    loop={true} // Faz o carrossel dar loop infinito
                    autoplay={{ delay: 0, disableOnInteraction: false }}
                    speed={3000}
                    freeMode={true}
                    allowTouchMove={false}
                    breakpoints={{
                        320: { slidesPerView: 1 },
                        640: { slidesPerView: 2 },
                        768: { slidesPerView: 3 },
                        1024: { slidesPerView: 4 },
                        1500: { slidesPerView: 5 },
                    }}
                >
                    {jobs.map((job, index) => (
                        <SwiperSlide key={index} className='carousel-slide'>
                            <Card className='shadow p-2 m-2 rounded border-0'>
                                <h2 className="card-title">{job.title}</h2>
                                <Card.Body className='d-flex flex-column justify-content-between'>
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
                                                    icon={job.modality === 'Remoto' ? faHome : job.modality === 'Presencial' ? faBuilding : faLaptopHouse}
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
