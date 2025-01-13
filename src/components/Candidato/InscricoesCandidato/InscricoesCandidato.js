import React, { useEffect, useState } from "react";
import api from '../../../services/axiosConfig';
import HeaderCandidato from "../HeaderCandidato/HeaderCandidato";
import { Container, Row, Col, Card, Spinner, InputGroup, Form, Button, Pagination } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBriefcase, faBuilding, faHome, faLaptopHouse, faLocationDot, faMoneyBillWave, faSearch, faWheelchair } from "@fortawesome/free-solid-svg-icons";

const InscricoesCandidato = () => {
    const [loading, setLoading] = useState(true);
    const [applications, setApplications] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const itemsPerPage = 9;

    useEffect(() => {
        document.title = "ACI Empregos | Inscrições";
        const fetchUserApplications = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await api.get(`${process.env.REACT_APP_API_URL}/api/user/applications`, {
                    headers: { Authorization: `Bearer ${token}` },
                    params: {
                        page: currentPage,
                        limit: itemsPerPage,
                        searchTerm
                    }
                });
                setApplications(response.data.applications);
                setTotalPages(response.data.totalPages || 1);
            } catch (error) {
                console.error('Erro ao buscar as candidaturas:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserApplications();
    }, [currentPage, searchTerm]);

    const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    return (
        <>
            <HeaderCandidato />
            <Container fluid style={{ backgroundColor: '#f9f9f9f9', minHeight: "100vh" }}>
                <Row className="m-md-2 mt-2">
                    <Col>
                        <h1>Minhas Inscrições</h1>
                    </Col>
                    <Col xs={12} md={12} className="mt-2">
                        <Row className="align-items-center">
                            <InputGroup style={{ maxWidth: '800px' }}>
                                <Form.Control
                                    type="text"
                                    className='input-buscar-vagas shadow border-primary'
                                    placeholder="Buscar por cargo ou empresa"
                                    aria-label="Pesquisar"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <Button className="btn-buscar-vagas" variant="outline-primary" onClick={() => setCurrentPage(1)}>
                                    <FontAwesomeIcon icon={faSearch} />
                                </Button>
                            </InputGroup>
                        </Row>
                        <Row className="mt-4">
                            {loading ? (
                                <div className="d-flex justify-content-center">
                                    <Spinner animation='border' variant='primary' />
                                </div>
                            ) : applications.length === 0 ? (
                                <p className="text-center">Você ainda não tem candidaturas.</p>
                            ) : (
                                applications.map((application) => (
                                    <Col md={6} xl={4} key={application._id} className="mb-4 d-flex">
                                        <Card className={`w-100 border-0 shadow-sm rounded p-2 d-flex flex-column candidate-card ${application.job && !application.job.status ? 'bg-light text-muted' : ''}`}>
                                            <Card.Body>
                                                {application.job ? (
                                                    <>
                                                        <Card.Title className="text-truncate">{application.job.title}</Card.Title>
                                                        <Card.Text>
                                                            {/* Verifica se identifyCompany está false para exibir "Empresa confidencial" */}
                                                            {application.job.identifyCompany ? (
                                                                'Empresa confidencial'
                                                            ) : (
                                                                application.job.company ? application.job.company.nome : 'Empresa não especificada'
                                                            )}
                                                        </Card.Text>
                                                        <Card.Text className="bg-light rounded text-center text-primary p-2 text-truncate">
                                                            <FontAwesomeIcon className="me-2" icon={faLocationDot} title="Localização" />
                                                            {application.job.location}
                                                        </Card.Text>
                                                        <Row className="mb-2">
                                                            <Col>
                                                                <Card.Text className="bg-light rounded text-center text-primary p-2 text-truncate">
                                                                    <FontAwesomeIcon
                                                                        className="me-2"
                                                                        icon={application.job.modality === 'Remoto' ? faHome : application.job.modality === 'Presencial' ? faBuilding : faLaptopHouse}
                                                                        title="Modelo"
                                                                    />
                                                                    {application.job.modality}
                                                                </Card.Text>
                                                            </Col>
                                                            <Col>
                                                                <Card.Text className="bg-light rounded text-center text-primary p-2 text-truncate">
                                                                    <FontAwesomeIcon className="me-2" icon={faBriefcase} title="Tipo" />
                                                                    {application.job.type}
                                                                </Card.Text>
                                                            </Col>
                                                        </Row>
                                                        <Row>
                                                            <Col>
                                                                <Card.Text className="bg-light rounded text-center text-primary p-2 text-truncate">
                                                                    <FontAwesomeIcon className="me-2" icon={faMoneyBillWave} title="Salário" />
                                                                    {application.job.salary ? application.job.salary : 'A combinar'}
                                                                </Card.Text>
                                                            </Col>
                                                            <Col>
                                                                {application.job.pcd && (
                                                                    <Card.Text className="bg-light rounded text-center text-primary p-2">
                                                                        <FontAwesomeIcon className="me-2" icon={faWheelchair} title="PcD" />
                                                                        PcD
                                                                    </Card.Text>
                                                                )}
                                                            </Col>
                                                        </Row>
                                                    </>
                                                ) : (
                                                    <Card.Text>Informações da vaga não disponíveis</Card.Text>
                                                )}

                                                {/* Linha com data de inscrição e data de encerramento */}
                                                <div className="d-flex justify-content-between mt-3">
                                                    <small className="text-muted text-truncate">
                                                        Inscrito em: {new Date(application.submissionDate).toLocaleDateString()}
                                                    </small>
                                                    {application.job && !application.job.status && application.job.closingDate && (
                                                        <small className="text-muted text-truncate">
                                                            Encerrada em: {new Date(application.job.closingDate).toLocaleDateString()}
                                                        </small>
                                                    )}
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                ))
                            )}
                        </Row>

                        {/* Paginação com botões de próximo e anterior */}
                        {totalPages > 1 && (
                            <div className="d-flex justify-content-center">
                                <Pagination>
                                    <Pagination.Prev onClick={handlePreviousPage} disabled={currentPage === 1}>
                                    </Pagination.Prev>
                                    {[...Array(totalPages).keys()].map((pageNumber) => (
                                        <Pagination.Item
                                            key={pageNumber + 1}
                                            active={currentPage === pageNumber + 1}
                                            onClick={() => handlePageChange(pageNumber + 1)}
                                        >
                                            {pageNumber + 1}
                                        </Pagination.Item>
                                    ))}
                                    <Pagination.Next onClick={handleNextPage} disabled={currentPage === totalPages}>
                                    </Pagination.Next>
                                </Pagination>
                            </div>
                        )}
                    </Col>
                </Row>
            </Container>
        </>
    );
};

export default InscricoesCandidato;
