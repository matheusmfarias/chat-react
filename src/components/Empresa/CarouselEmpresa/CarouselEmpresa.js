import React, { useCallback, useEffect, useState } from 'react';
import api from '../../../services/axiosConfig';
import useFormattedDate from '../../../hooks/useFormattedDate';
import { Card, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBriefcase, faBuilding, faLocationDot, faEdit, faHome, faLaptopHouse, faMoneyBillWave, faWheelchair } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import Slider from "react-slick";
import Skeleton from 'react-loading-skeleton';
import "./CarouselEmpresa.css";

const CarouselEmpresa = () => {
    const [slidesToShow, setSlidesToShow] = useState(3);
    const { formatDate } = useFormattedDate();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const navigate = useNavigate();

    const fetchJobs = useCallback(async (currentPage) => {
        const token = localStorage.getItem('token');
        if (token && hasMore) {
            try {
                const response = await api.get(`${process.env.REACT_APP_API_URL}/api/jobs`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    params: {
                        page: currentPage,
                        limit: 9,
                        status: 'true'
                    }
                });

                const newJobs = response.data.jobs;

                if (newJobs.length === 0) {
                    setHasMore(false);
                } else {
                    const jobsWithApplications = await Promise.all(
                        newJobs.map(async (job) => {
                            const applicationsResponse = await api.get(`${process.env.REACT_APP_API_URL}/api/jobs/applications/${job._id}`, {
                                headers: {
                                    Authorization: `Bearer ${token}`
                                }
                            });
                            return { ...job, totalApplications: applicationsResponse.data.totalApplications };
                        })
                    );

                    setJobs((prevJobs) => {
                        const mergedJobs = [...prevJobs, ...jobsWithApplications];
                        return Array.from(new Set(mergedJobs.map(job => job._id))).map(
                            id => mergedJobs.find(job => job._id === id)
                        );
                    });
                }
            } catch (error) {
                console.error('Error fetching jobs:', error);
            } finally {
                setLoading(false);
            }
        }
    }, [hasMore]);

    useEffect(() => {
        setLoading(true);
        fetchJobs(page);
    }, [page, fetchJobs]);

    const viewCandidates = (jobId) => {
        navigate(`/curriculos-empresa/${jobId}`);
    }

    const handleEditJob = (jobId) => {
        navigate('/vagas-empresa', { state: { jobId, openEditModal: true } });
    };

    const settings = {
        dots: true,
        infinite: false,
        speed: 500,
        slidesToShow: slidesToShow,
        slidesToScroll: slidesToShow,
        afterChange: (currentSlide) => {
            if (currentSlide >= jobs.length - slidesToShow * 2 && hasMore) {
                // Carrega antes de chegar à última página
                setPage((prevPage) => prevPage + 1);
            }
        },
        responsive: [
            {
                breakpoint: 1200,
                settings: {
                    slidesToShow: 2
                }
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1
                }
            }
        ]
    };

    useEffect(() => {
        const updateSlidesToShow = () => {
            const width = window.innerWidth;
            if (width < 768) setSlidesToShow(1);
            else if (width < 1200) setSlidesToShow(2);
            else setSlidesToShow(3);
        };

        updateSlidesToShow();
        window.addEventListener('resize', updateSlidesToShow);
        return () => window.removeEventListener('resize', updateSlidesToShow);
    }, []);

    const SkeletonCard = () => (
        <Row className="mt-3">
            {Array.from({ length: slidesToShow }).map((_, index) => (
                <Col key={index} className="mb-3 d-flex p-2" md={6} xl={4}>
                    <Card className="w-100 border-0 shadow-sm rounded p-2 d-flex flex-column">
                        <Card.Body>
                            <Skeleton height={30} width="60%" className="mb-3" />
                            <Skeleton height={20} width="50%" className="mb-3" />
                            <Skeleton height={20} width="80%" className="mb-3" />
                            <Skeleton height={20} width="80%" className="mb-3" />
                            <Skeleton height={20} width="40%" className="mb-4" />
                            <Skeleton height={30} width="30%" />
                        </Card.Body>
                    </Card>
                </Col>
            ))}
        </Row>
    );

    return (
        <div style={{ minHeight: '55vh', padding: '20px' }} className='m-3'>
            <h1 className="text-center text-primary">Acompanhe suas vagas ativas</h1>
            {loading && jobs.length === 0 ? (
                <SkeletonCard />
            ) : jobs.length === 0 ? (
                <p className="text-center mt-5">Ainda não há vagas ativas.</p>
            ) : (
                <Slider {...settings} className='mt-3 mb-3'>
                    {jobs.map((job) => (
                        <div key={job._id} className="p-2">
                            <Card className={`w-100 border-0 shadow-sm rounded p-2 d-flex flex-column card-hover ${job && !job.status ? 'bg-light text-muted' : ''}`}>
                                <Card.Body>
                                    <div className="d-flex flex-row align-items-center justify-content-between">
                                        <Card.Title className="mb-0 me-2 info-card">
                                            {job.title}
                                        </Card.Title>
                                        <FontAwesomeIcon
                                            icon={faEdit}
                                            className="text-primary edit-icon"
                                            title="Editar Vaga"
                                            onClick={() => handleEditJob(job._id)}
                                            style={{ cursor: 'pointer' }}
                                        />
                                    </div>
                                    <Card.Text className="bg-light rounded text-center text-primary p-2 info-card mt-3">
                                        <FontAwesomeIcon className="me-2" icon={faLocationDot} title="Localização" />
                                        {job.city}, {job.state}
                                    </Card.Text>
                                    <Row className="mb-2">
                                        <Col xs={6}>
                                            <Card.Text className="bg-light rounded text-center text-primary p-2 info-card">
                                                <FontAwesomeIcon
                                                    className="me-2"
                                                    icon={job.modality === 'Remoto' ? faHome : job.modality === 'Presencial' ? faBuilding : faLaptopHouse}
                                                    title="Modelo"
                                                />
                                                {job.modality}
                                            </Card.Text>
                                        </Col>
                                        <Col xs={6}>
                                            <Card.Text className="bg-light rounded text-center text-primary p-2 info-card">
                                                <FontAwesomeIcon className="me-2" icon={faBriefcase} title="Tipo" />
                                                {job.type}
                                            </Card.Text>
                                        </Col>
                                    </Row>
                                    <Row className="mb-2">
                                        <Col xs={6}>
                                            <Card.Text className="bg-light rounded text-center text-primary p-2 info-card">
                                                <FontAwesomeIcon className="me-2" icon={faMoneyBillWave} title="Salário" />
                                                {job.salary ? job.salary : 'A combinar'}
                                            </Card.Text>
                                        </Col>
                                        <Col xs={6}>
                                            {job.pcd && (
                                                <Card.Text className="bg-light rounded text-center text-primary p-2 info-card">
                                                    <FontAwesomeIcon className="me-2" icon={faWheelchair} title="PcD" />
                                                    PcD
                                                </Card.Text>
                                            )}
                                        </Col>
                                    </Row>
                                    <Row className="mb-2">
                                        <Col>
                                            <Card.Text
                                                className="bg-light rounded text-center text-secondary p-2 info-card"
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => viewCandidates(job._id)}>
                                                Total de inscrições: {job.totalApplications}
                                            </Card.Text>
                                        </Col>
                                    </Row>
                                    <hr className="my-3 rounded justify-content-center" />
                                    <div className="d-flex flex-wrap justify-content-between mt-3">
                                        <small className="text-muted text-truncated">
                                            Publicada em: {formatDate(job.publicationDate)}
                                        </small>
                                    </div>
                                </Card.Body>
                            </Card>
                        </div>
                    ))}
                </Slider>
            )}
        </div>
    );
};

export default CarouselEmpresa;
