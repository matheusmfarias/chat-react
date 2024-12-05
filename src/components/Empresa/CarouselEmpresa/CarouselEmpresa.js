import React, { useEffect, useState } from 'react';
import api from '../../../services/axiosConfig';
import useFormattedDate from '../../../hooks/useFormattedDate';
import { Card, Col, Container, Row, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBriefcase, faBuilding, faLocationDot, faWheelchair, faEdit, faHome, faLaptopHouse, faMoneyBillWave } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

const CarouselEmpresa = () => {
    const { formatDate } = useFormattedDate();
    const [jobs, setJobs] = useState([]);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchJobs = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const jobsResponse = await api.get(`${process.env.REACT_APP_API_URL}/api/jobs`, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                    const activeJobs = jobsResponse.data.filter((job) => job.status === true); // Apenas vagas ativas
                    setJobs(activeJobs);
                } catch (error) {
                    console.error('Error fetching jobs:', error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchJobs();
    }, []);

    const handleEditJob = (jobId) => {
        navigate('/vagas-empresa', { state: { jobId, openEditModal: true } });
    };

    return (
        <>
            <Container
                fluid
                style={{ backgroundColor: '#f9f9f9f9', minHeight: '60vh' }}
                className="d-flex flex-column align-items-center "
            >
                <Row className="m-md-2 mt-md-4 mt-2 text-center text-primary">
                    <Col>
                        <h1>Acompanhe suas vagas ativas</h1>
                    </Col>
                </Row>
                <Row className="mt-4 w-100 justify-content-center">
                    {loading ? (
                        <div className="d-flex justify-content-center">
                            <Spinner animation="border" variant="primary" />
                        </div>
                    ) : jobs.length === 0 ? (
                        <p className="text-center">Ainda não há vagas ativas.</p>
                    ) : (
                        jobs.map((job) => (
                            <Col
                                md={6}
                                xl={4}
                                key={job._id}
                                className="mb-4 d-flex justify-content-center"
                            >
                                <Card className="w-100 border-0 shadow-sm rounded p-2 d-flex flex-column">
                                    <Card.Body>
                                        <Card.Title className="text-truncate">{job.title}</Card.Title>
                                        <Card.Text className="bg-light rounded text-center text-primary p-2 text-truncate">
                                            <FontAwesomeIcon
                                                className="me-2"
                                                icon={faLocationDot}
                                                title="Localização"
                                            />
                                            {job.location}
                                        </Card.Text>
                                        <Row className="mb-2">
                                            <Col>
                                                <Card.Text className="bg-light rounded text-center text-primary p-2 text-truncate">
                                                    <FontAwesomeIcon
                                                        className="me-2"
                                                        icon={
                                                            job.modality === 'Remoto'
                                                                ? faHome
                                                                : job.modality === 'Presencial'
                                                                    ? faBuilding
                                                                    : faLaptopHouse
                                                        }
                                                        title="Modelo"
                                                    />
                                                    {job.modality}
                                                </Card.Text>
                                            </Col>
                                            <Col>
                                                <Card.Text className="bg-light rounded text-center text-primary p-2 text-truncate">
                                                    <FontAwesomeIcon
                                                        className="me-2"
                                                        icon={faBriefcase}
                                                        title="Tipo"
                                                    />
                                                    {job.type}
                                                </Card.Text>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col>
                                                <Card.Text className="bg-light rounded text-center text-primary p-2 text-truncate">
                                                    <FontAwesomeIcon
                                                        className="me-2"
                                                        icon={faMoneyBillWave}
                                                        title="Salário"
                                                    />
                                                    {job.salary ? job.salary : 'A combinar'}
                                                </Card.Text>
                                            </Col>
                                            <Col>
                                                {job.pcd && (
                                                    <Card.Text className="bg-light rounded text-center text-primary p-2 text-truncate">
                                                        <FontAwesomeIcon
                                                            className="me-2"
                                                            icon={faWheelchair}
                                                            title="PcD"
                                                        />
                                                        PcD
                                                    </Card.Text>
                                                )}
                                            </Col>
                                        </Row>
                                        <div className="d-flex justify-content-between mt-3">
                                            <small className="text-muted text-truncate">
                                                Publicada em: {formatDate(job.publicationDate)}
                                            </small>
                                            <FontAwesomeIcon
                                                icon={faEdit}
                                                className="text-primary edit-icon"
                                                title="Editar Vaga"
                                                onClick={() => handleEditJob(job._id)}
                                                style={{ cursor: 'pointer' }}
                                            />
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))
                    )}
                </Row>
            </Container>
        </>
    );
};

export default CarouselEmpresa;
