import React, { useState, useEffect, useCallback } from "react";
import api from "../../../services/axiosConfig";
import HeaderEmpresa from "../HeaderEmpresa";
import { Row, Col, Card, Button, Form, InputGroup, Container } from "react-bootstrap";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import './CurriculosEmpresa.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight, faCircleUser, faSearch, faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import Skeleton from "react-loading-skeleton";
import VisualizarCurriculo from "../../Candidato/Curriculo/VisualizarCurriculo";

const CurriculosEmpresa = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { jobId } = useParams();
    const [loading, setLoading] = useState(false);
    const [applications, setApplications] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const currentPage = parseInt(new URLSearchParams(location.search).get('page')) || 1;
    const [totalApplications, setTotalApplications] = useState(0);
    const itemsPerPage = 9;
    const [searchTerm, setSearchTerm] = useState("");

    //Curriculo
    const [viewCurriculo, setViewCurriculo] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);

    useEffect(() => {
        document.title = "ACI Empregos | Candidatos";
    }, []);

    useEffect(() => {
        const params = new URLSearchParams(location.search);

        if (!params.has("page")) {
            navigate(`${location.pathname}?page=1`, { replace: true });
        }
    }, [location.search, location.pathname, navigate]);

    const handlePageChange = (direction) => {
        const params = new URLSearchParams(location.search);
        let newPage = parseInt(params.get("page")) || 1;

        if (direction === 'next' && newPage < totalPages) {
            newPage += 1;
        } else if (direction === 'prev' && newPage > 1) {
            newPage -= 1;
        }

        if (newPage === 1) {
            params.delete('page');
        } else {
            params.set('page', newPage);
        }
        navigate(`${location.pathname}?${params.toString()}`);
    };

    useEffect(() => {
        document.body.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentPage]);

    const buildFilters = (searchTerm, currentPage) => {
        const params = new URLSearchParams();

        if (searchTerm.trim()) params.append('keyword', searchTerm);

        if (currentPage > 1) {
            params.set('page', currentPage);
        }

        return params;
    };

    const updateURLWithFilters = useCallback(
        (searchTerm, currentPage) => {
            const params = buildFilters(searchTerm, currentPage);
            navigate(`${location.pathname}?${params.toString()}`, { replace: true });
        },
        [navigate, location.pathname]
    );

    const fetchCandidates = useCallback(async () => {
        const params = new URLSearchParams(location.search);

        const apiParams = new URLSearchParams();
        params.forEach((value, key) => {
            if (key !== 'page') {
                apiParams.append(key, value);
            }
        });
        apiParams.append('page', params.get('page') || 1);
        apiParams.append('limit', itemsPerPage);

        try {
            const token = localStorage.getItem("token");
            const response = await api.get(`${process.env.REACT_APP_API_URL}/api/jobs/applications/${jobId}?${apiParams.toString()}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setApplications(response.data.applications);
            setTotalPages(response.data.totalPages);
            setTotalApplications(response.data.totalApplications);
        } catch (error) {
            console.error("Erro ao obter os candidatos:", error);
        } finally {
            setLoading(false);
        }
    }, [jobId, location.search, itemsPerPage]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const currentPage = parseInt(params.get('page')) || 1;

        updateURLWithFilters(searchTerm, currentPage);
    }, [searchTerm, location.search, updateURLWithFilters]);

    useEffect(() => {
        fetchCandidates();
    }, [location.search, fetchCandidates]);

    const SkeletonCard = () => (
        <Row className="mt-2">
            {Array.from({ length: 9 }).map((_, index) => (
                <Col key={index} className="mb-4 d-flex" md={6} xxl={4}>
                    <Card className="w-100 border-0 shadow-sm rounded d-flex flex-column">
                        <Card.Body>
                            <Row>
                                <Col md={5} lg={4} xl={2}>
                                    <Skeleton height={80} width={80} className="mb-3" style={{ borderRadius: "50%" }} />
                                </Col>
                                <Col className="mt-md-2 m-2">
                                    <Skeleton height={25} width="50%" className="mb-2" />
                                    <Skeleton height={20} width="60%" />
                                </Col>
                            </Row>
                            <Row className="mb-4">
                                <Col>
                                    <Skeleton height={25} width="40%" className="mb-2" />
                                    <Skeleton height={20} width="60%" className="mb-4" />
                                    <Skeleton height={30} width="40%" className="mb-2" />
                                    <Skeleton height={25} width="60%" className="mb-5" />
                                </Col>
                            </Row>
                            <Row>
                                <Skeleton height={20} width="35%" />
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            ))}
        </Row>
    );

    useEffect(() => {
        setLoading(true);
        const timeoutId = setTimeout(() => {
            fetchCandidates();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, fetchCandidates]);

    const handleClearSearch = () => {
        setLoading(true);
        setSearchTerm("");
    };

    const handleViewCurriculum = (userId) => {
        setSelectedUserId(userId); // Define o ID do usuário selecionado
        setViewCurriculo(true); // Ativa a visualização do currículo
    };

    return (
        <>
            <HeaderEmpresa />
            <Container fluid>
                <Row className="mt-3">
                    <h1>Recrutamento</h1>
                    <Col xs={12} className='mt-2'>
                        <Row>
                            <Col xs={12} lg={8}>
                                <InputGroup>
                                    <Form.Control
                                        type="text"
                                        className='border-primary'
                                        placeholder="Pesquisar por vagas, cidade, modelo..."
                                        aria-label="Pesquisar"
                                        value={searchTerm}
                                        onChange={e => {
                                            setSearchTerm(e.target.value);
                                            updateURLWithFilters(e.target.value, 1);
                                        }}
                                    />

                                    {searchTerm && (
                                        <FontAwesomeIcon
                                            icon={faTimesCircle}
                                            className="icon-remove-tag position-absolute"
                                            onClick={() => handleClearSearch()}
                                            style={{
                                                right: '80px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                            }}
                                        />
                                    )}
                                    <Button className="btn-outline-primary rounded-end w-auto px-4" variant="light">
                                        <FontAwesomeIcon icon={faSearch} />
                                    </Button>
                                </InputGroup>
                            </Col>
                            <Col lg={4} className="d-flex align-items-center">
                                {searchTerm && (
                                    <span className="p-2 mt-2">
                                        A busca "{searchTerm}" retornou {totalApplications} resultado(s).
                                    </span>
                                )}
                            </Col>
                        </Row>
                        {loading ? (
                            <SkeletonCard />
                        ) : applications.length > 0 ? (
                            <>
                                <Row className="mt-3">
                                    {applications.map((application) => {
                                        const user = application.user || {};
                                        const experiences = user.experiences || [];
                                        const formacao = user.formacao || [];

                                        return (
                                            <Col md={6} xxl={4} key={application._id} className="mb-4 d-flex">
                                                <Card
                                                    key={application._id}
                                                    className="w-100 border-0 shadow-sm rounded p-3 d-flex flex-column card-hover">
                                                    <div className="d-flex align-items-center mb-3">
                                                        {user.profilePicture ? (
                                                            <img
                                                                src={`${process.env.REACT_APP_API_URL}${user.profilePicture}`}
                                                                width={80}
                                                                height={80}
                                                                className="rounded-circle"
                                                                alt="Foto de perfil"
                                                                style={{ objectFit: "cover", border: "2px solid #ddd" }}
                                                            />
                                                        ) : (
                                                            <FontAwesomeIcon
                                                                icon={faCircleUser}
                                                                className="rounded-circle"
                                                                alt="Sem foto"
                                                                style={{ width: "80px", height: "80px", objectFit: "cover", border: "2px solid #ddd" }}
                                                            />
                                                        )}
                                                        <div className="m-2">
                                                            <h5 className="mb-1">{user.nome} {user.sobrenome}</h5>
                                                            <p className="mb-0 text-muted">{user.email}</p>
                                                        </div>
                                                    </div>
                                                    <div className="mb-2">
                                                        <h6>Experiências Profissionais:</h6>
                                                        {experiences.length > 0 ? (
                                                            <ul className="list-unstyled">
                                                                {experiences.map((experience, index) => (
                                                                    <p key={`${experience.empresa}-${index}`}>
                                                                        {experience.empresa} - {experience.funcao}
                                                                    </p>
                                                                ))}
                                                            </ul>
                                                        ) : (
                                                            <p className="text-muted">Nenhuma experiência profissional informada.</p>
                                                        )}
                                                    </div>
                                                    <div className="mb-2">
                                                        <h6>Experiência Acadêmica:</h6>
                                                        {formacao.length > 0 ? (
                                                            <ul className="list-unstyled">
                                                                {formacao.map((formacaoItem, index) => (
                                                                    <p key={`${formacaoItem.escolaridade}-${index}`}>
                                                                        {formacaoItem.escolaridade}
                                                                        {['Superior', 'Técnico'].includes(formacaoItem.escolaridade) && formacaoItem.curso ? (
                                                                            null
                                                                        ) : <> - {formacaoItem.curso}</>}
                                                                        {" - "}{formacaoItem.situacao}
                                                                    </p>
                                                                ))}
                                                            </ul>
                                                        ) : (
                                                            <p className="text-muted">Nenhuma experiência acadêmica informada.</p>
                                                        )}
                                                    </div>
                                                    <Button
                                                        variant="primary"
                                                        onClick={() => handleViewCurriculum(user._id)}
                                                        className="mt-auto"
                                                        disabled={!user._id}
                                                    >
                                                        Ver Currículo
                                                    </Button>
                                                    <div className="d-flex flex-wrap justify-content-between mt-2">
                                                        <span className="text-muted text-truncate">
                                                            Inscrito em: {new Date(application.submissionDate).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </Card>
                                            </Col>
                                        );
                                    })}
                                </Row>

                                {/* Paginação */}
                                {totalPages > 1 && (
                                    <div className="d-flex flex-row justify-content-center p-2">
                                        <Button
                                            className="btn-sm me-2 mb-2"
                                            onClick={() => handlePageChange('prev')}
                                            disabled={currentPage === 1}
                                            variant="outline-primary"
                                            aria-label="Página anterior"
                                        >
                                            <FontAwesomeIcon icon={faChevronLeft} />
                                        </Button>
                                        {currentPage > 1 && (
                                            <Button
                                                className="btn-sm me-2 mb-2"
                                                onClick={() => handlePageChange('prev')}
                                                variant="outline-primary"
                                            >
                                                {currentPage - 1}
                                            </Button>
                                        )}
                                        <Button className="btn-sm me-2 mb-2" variant="outline-primary" disabled>
                                            {currentPage}
                                        </Button>
                                        {currentPage < totalPages && (
                                            <Button
                                                className="btn-sm me-2 mb-2"
                                                onClick={() => handlePageChange('next')}
                                                variant="outline-primary"
                                            >
                                                {currentPage + 1}
                                            </Button>
                                        )}
                                        <Button
                                            className="btn-sm me-2 mb-2"
                                            onClick={() => handlePageChange('next')}
                                            disabled={currentPage === totalPages}
                                            variant="outline-primary"
                                            aria-label="Próxima página"
                                        >
                                            <FontAwesomeIcon icon={faChevronRight} />
                                        </Button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <p className="text-center text-muted mt-4">Nenhuma inscrição encontrada.</p>
                        )}
                    </Col>
                </Row>
            </Container>

            {viewCurriculo && <VisualizarCurriculo
                userId={selectedUserId}
                onClose={() => setViewCurriculo(false)}
            />}
        </>
    );
};

export default CurriculosEmpresa;