import React, { useCallback, useEffect, useState } from "react";
import api from '../../../services/axiosConfig';
import HeaderCandidato from "../HeaderCandidato/HeaderCandidato";
import { Container, Row, Col, Card, InputGroup, Form, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBriefcase, faBuilding, faChevronLeft, faChevronRight, faFilter, faHome, faLaptopHouse, faLocationDot, faMoneyBillWave, faSearch, faTimesCircle, faWheelchair } from "@fortawesome/free-solid-svg-icons";
import Skeleton from "react-loading-skeleton";
import JobDetailsModal from "../../Modals/JobDetailsModal";
import Filters from "../../Filters/Filters";
import FiltersModal from "../../Modals/FiltersModal";
import { useLocation, useNavigate } from "react-router-dom";

const InscricoesCandidato = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('andamento');
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [totalPages, setTotalPages] = useState(1);
    const [totalApplications, setTotalApplications] = useState(0);
    const currentPage = parseInt(new URLSearchParams(location.search).get('page')) || 1;
    const itemsPerPage = 9;

    // Estados para busca e filtros
    const [showFilterModal, setShowFilterModal] = useState(false);
    const handleOpenFilterModal = () => setShowFilterModal(true);
    const handleCloseFilterModal = () => setShowFilterModal(false);

    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);

    const getInitialFilters = () => {
        const params = new URLSearchParams(window.location.search);
        return {
            modality: params.getAll('modality'),
            type: params.getAll('type'),
            pcd: params.get('pcd') || '',
            state: params.get('state') || '',
            city: params.get('city') || '',
        };
    };

    const [filters, setFilters] = useState(getInitialFilters);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStateFilter, setSelectedStateFilter] = useState(getInitialFilters().state);
    const [selectedCityFilter, setSelectedCityFilter] = useState(getInitialFilters().city);

    const [showApplicationModal, setShowApplicationModal] = useState(false);

    const fetchLocations = useCallback(async (stateCode = null) => {
        try {
            if (!stateCode) {
                // Buscar estados
                const response = await api.get('https://servicodados.ibge.gov.br/api/v1/localidades/estados');
                setStates(response.data);
            } else {
                // Buscar cidades de um estado
                const response = await api.get(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${stateCode}/municipios`);
                setCities(response.data);
            }
        } catch (error) {
            console.error('Erro ao buscar locais:', error);
        }
    }, []);

    useEffect(() => {
        document.title = "ACI Empregos | Inscrições";
        fetchLocations();
    }, [fetchLocations]);

    useEffect(() => {
        if (selectedStateFilter) {
            fetchLocations(selectedStateFilter);
        } else {
            setCities([]);
        }
    }, [selectedStateFilter, fetchLocations]);

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

    const buildFilters = (filters, selectedStateFilter, selectedCityFilter, searchTerm, currentPage) => {
        const params = new URLSearchParams();

        if (searchTerm.trim()) params.append('keyword', searchTerm);

        if (filters.modality.length > 0) {
            filters.modality.forEach((modality) => params.append('modality', modality));
        }

        if (filters.type.length > 0) {
            filters.type.forEach((type) => params.append('type', type));
        }

        if (filters.pcd) params.append('pcd', filters.pcd);
        if (selectedStateFilter) params.append('state', selectedStateFilter);
        if (selectedCityFilter) params.append('city', selectedCityFilter);

        if (currentPage > 1) {
            params.set('page', currentPage);
        }

        return params;
    };

    const updateURLWithFilters = useCallback(
        (filters, selectedStateFilter, selectedCityFilter, searchTerm, currentPage) => {
            const params = buildFilters(filters, selectedStateFilter, selectedCityFilter, searchTerm, currentPage);
            navigate(`${location.pathname}?${params.toString()}`, { replace: true });
        },
        [navigate, location.pathname]
    );

    const fetchUserApplications = useCallback(async () => {
        const params = new URLSearchParams(location.search);

        const apiParams = new URLSearchParams();
        params.forEach((value, key) => {
            if (key !== 'page') {
                apiParams.append(key, value);
            }
        });

        apiParams.append('page', params.get('page') || 1);
        apiParams.append('limit', itemsPerPage);

        if (activeTab === 'andamento') {
            apiParams.append('status', 'true');
        } else if (activeTab === 'encerrada') {
            apiParams.append('status', 'false');
        }

        try {
            const token = localStorage.getItem("token");
            const response = await api.get(`${process.env.REACT_APP_API_URL}/api/user/applications?${apiParams.toString()}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setApplications(response.data.applications);
            setTotalPages(response.data.totalPages);
            setTotalApplications(response.data.totalApplications);
        } catch (error) {
            console.error('Erro ao buscar as candidaturas:', error);
        } finally {
            setLoading(false);
        }

    }, [activeTab, location.search, itemsPerPage]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const currentPage = parseInt(params.get('page')) || 1;

        updateURLWithFilters(filters, selectedStateFilter, selectedCityFilter, searchTerm, currentPage);
    }, [filters, selectedStateFilter, selectedCityFilter, searchTerm, location.search, updateURLWithFilters]);

    useEffect(() => {
        fetchUserApplications();
    }, [location.search, fetchUserApplications]);

    const SkeletonCard = () => (
        <Row className="mt-2">
            {Array.from({ length: 9 }).map((_, index) => (
                <Col key={index} className="mb-4 d-flex" md={6} xl={4}>
                    <Card className="w-100 border-0 shadow-sm rounded p-2 d-flex flex-column">
                        <Card.Body>
                            <Skeleton height={30} width="60%" className="mb-3" />
                            <Skeleton height={25} width="40%" className="mb-3" />
                            <Skeleton height={20} width="50%" className="mb-3" />
                            <Skeleton height={20} width="80%" className="mb-3" />
                            <Skeleton height={20} width="80%" className="mb-3" />
                            <Skeleton height={25} width="30%" />
                        </Card.Body>
                    </Card>
                </Col>
            ))}
        </Row>
    );

    const updateFilters = (newFilters) => {
        setFilters(newFilters);
        updateURLWithFilters(
            newFilters,
            selectedStateFilter,
            selectedCityFilter,
            searchTerm,
            1
        );
    };

    const handleCloseApplicationModal = () => setShowApplicationModal(false);

    useEffect(() => {
        setLoading(true);
        const timeoutId = setTimeout(() => {
            fetchUserApplications();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, fetchUserApplications]);

    const handleResetFilter = () => {
        setLoading(true);
        setFilters({ modality: [], type: [], pcd: '', state: '', city: '' });
        setSelectedStateFilter('');
        setSelectedCityFilter('');
        setSearchTerm('');
        updateURLWithFilters({ modality: [], type: [], pcd: '', state: '', city: '' }, '', '', '', 1);
    };

    const handleCardClick = async (application) => {
        setShowApplicationModal(true);
        setLoadingDetails(true);
        try {
            const token = localStorage.getItem('token');
            const response = await api.get(`${process.env.REACT_APP_API_URL}/api/user/applications/${application._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setSelectedApplication(response.data);
        } catch (error) {
            console.error('Erro ao buscar detalhes da vaga:', error);
        } finally {
            setLoadingDetails(false);
        }
    };

    const handleClearSearch = () => {
        setLoading(true);
        setSearchTerm("");
    };

    const hasFiltersApplied = (filters, selectedStateFilter, selectedCityFilter) => {
        return (
            filters.modality.length > 0 ||
            filters.type.length > 0 ||
            filters.pcd === "true" ||
            !!selectedStateFilter ||
            !!selectedCityFilter
        );
    };

    return (
        <>
            <HeaderCandidato />
            <Container fluid>
                <Row className="mt-3">
                    <h1>Minhas Inscrições</h1>
                    <Filters
                        filters={filters}
                        selectedStateFilter={selectedStateFilter}
                        setSelectedStateFilter={setSelectedStateFilter}
                        selectedCityFilter={selectedCityFilter}
                        setSelectedCityFilter={setSelectedCityFilter}
                        states={states}
                        cities={cities}
                        hasFiltersApplied={hasFiltersApplied}
                        handleResetFilter={handleResetFilter}
                        updateFilters={updateFilters}
                        setLoading={setLoading}
                    />
                    <Col xs={12} lg={10} className="mt-2">
                        <Row>
                            <Col lg={8} className="mt-2">
                                <InputGroup>
                                    <Form.Control
                                        type="text"
                                        className="border-primary"
                                        placeholder="Pesquisar por cargo ou empresa"
                                        aria-label="Pesquisar"
                                        value={searchTerm}
                                        onChange={e => {
                                            setSearchTerm(e.target.value);
                                            updateURLWithFilters(filters, selectedStateFilter, selectedCityFilter, e.target.value, 1);
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
                            <Col>
                                <Button
                                    variant="primary"
                                    onClick={handleOpenFilterModal}
                                    className="mt-2 mobile-filter-btn"
                                    style={{ width: '100%' }}
                                >
                                    <FontAwesomeIcon icon={faFilter} style={{ marginRight: '4px' }} />
                                    Filtros
                                </Button>
                            </Col>
                        </Row>
                        {/* Tags para exibir os filtros selecionados */}
                        <div className="filter-tag-container">
                            {filters.type.length > 0 && filters.type.map((filter, index) => (
                                <div className="filter-tag" key={index}>
                                    {filter}
                                    <FontAwesomeIcon
                                        icon={faTimesCircle}
                                        className="icon-remove-tag"
                                        onClick={() => {
                                            // Remove o filtro de tipo específico ao clicar no "x"
                                            setLoading(true);
                                            const newTypes = filters.type.filter(t => t !== filter);
                                            setFilters({ ...filters, type: newTypes });
                                        }}
                                    />
                                </div>
                            ))}
                            {filters.modality.length > 0 && filters.modality.map((modality, index) => (
                                <div className="filter-tag" key={index}>
                                    {modality}
                                    <FontAwesomeIcon
                                        icon={faTimesCircle}
                                        className="icon-remove-tag"
                                        onClick={() => {
                                            // Remove o filtro de modalidade específico ao clicar no "x"
                                            setLoading(true);
                                            const newModalities = filters.modality.filter(m => m !== modality);
                                            setFilters({ ...filters, modality: newModalities });
                                        }}
                                    />
                                </div>
                            ))}
                            {selectedStateFilter && (
                                <div className="filter-tag">
                                    Estado: {selectedStateFilter}
                                    <FontAwesomeIcon
                                        icon={faTimesCircle}
                                        className="icon-remove-tag"
                                        onClick={() => {
                                            setLoading(true);
                                            setSelectedStateFilter('')
                                        }} // Remove o filtro de estado
                                    />
                                </div>
                            )}
                            {selectedCityFilter && (
                                <div className="filter-tag">
                                    Cidade: {selectedCityFilter}
                                    <FontAwesomeIcon
                                        icon={faTimesCircle}
                                        className="icon-remove-tag"
                                        onClick={() => {
                                            setLoading(true);
                                            setSelectedCityFilter('')
                                        }} // Remove o filtro de cidade
                                    />
                                </div>
                            )}
                            {filters.pcd === 'true' ? (
                                <div className="filter-tag">
                                    PCD
                                    <FontAwesomeIcon
                                        icon={faTimesCircle}
                                        className="icon-remove-tag"
                                        onClick={() => {
                                            setLoading(true);
                                            setFilters({ ...filters, pcd: '' })
                                        }}
                                    />
                                </div>
                            ) : null}
                        </div>
                        <Col>
                            <div className='tabs-curriculo'>
                                <button
                                    className={activeTab === 'andamento' ? 'active' : ''}
                                    style={{ width: '100%' }}
                                    onClick={() => {
                                        setActiveTab('andamento');
                                        updateURLWithFilters(filters, selectedStateFilter, selectedCityFilter, searchTerm, 1);
                                    }}
                                >
                                    Em andamento
                                </button>
                                <button
                                    className={activeTab === 'encerrada' ? 'active' : ''}
                                    style={{ width: '100%' }}
                                    onClick={() => {
                                        setActiveTab('encerrada');
                                        updateURLWithFilters(filters, selectedStateFilter, selectedCityFilter, searchTerm, 1);
                                    }}
                                >
                                    Encerradas
                                </button>
                            </div>
                        </Col>
                        {/* Modal para os filtros */}
                        <FiltersModal
                            show={showFilterModal}
                            onClose={handleCloseFilterModal}
                            filters={filters}
                            setFilters={setFilters}
                            selectedStateFilter={selectedStateFilter}
                            setSelectedStateFilter={setSelectedStateFilter}
                            selectedCityFilter={selectedCityFilter}
                            setSelectedCityFilter={setSelectedCityFilter}
                            states={states}
                            cities={cities}
                            updateFilters={updateFilters}
                            setLoading={setLoading}
                        />
                        {loading ? (
                            <SkeletonCard />
                        ) : applications.length > 0 ? (
                            <Row className="mt-2">
                                {applications.map((application) => (
                                    <Col md={6} xxl={4} key={application._id} className="mb-4 d-flex">
                                        <Card
                                            key={application._id}
                                            className={`w-100 border-0 shadow-sm rounded p-2 d-flex flex-column candidate-card card-hover ${application.job && !application.job.status ? 'bg-light text-muted' : ''}`}
                                            onClick={() => handleCardClick(application)}
                                            style={{ cursor: 'pointer' }}>
                                            <Card.Body>
                                                {application.job ? (
                                                    <>
                                                        <Card.Title className="mb-0 me-2 info-card">{application.job.title}</Card.Title>
                                                        <Card.Text>
                                                            {application.job.identifyCompany
                                                                ? 'Empresa confidencial'
                                                                : (application.job.company ? application.job.company.nome : 'Empresa não especificada')}
                                                        </Card.Text>
                                                        <Card.Text className="bg-light rounded text-center text-primary p-2 info-card">
                                                            <FontAwesomeIcon className="me-2" icon={faLocationDot} title="Localização" />
                                                            {application.job.city}, {application.job.state}
                                                        </Card.Text>
                                                        <Row className="mb-2">
                                                            <Col xs={6}>
                                                                <Card.Text className="bg-light rounded text-center text-primary p-2 info-card">
                                                                    <FontAwesomeIcon
                                                                        className="me-2"
                                                                        icon={application.job.modality === 'Remoto' ? faHome : application.job.modality === 'Presencial' ? faBuilding : faLaptopHouse}
                                                                        title="Modelo"
                                                                    />
                                                                    {application.job.modality}
                                                                </Card.Text>
                                                            </Col>
                                                            <Col xs={6}>
                                                                <Card.Text className="bg-light rounded text-center text-primary p-2 info-card">
                                                                    <FontAwesomeIcon className="me-2" icon={faBriefcase} title="Tipo" />
                                                                    {application.job.type}
                                                                </Card.Text>
                                                            </Col>
                                                        </Row>
                                                        <Row>
                                                            <Col xs={6}>
                                                                <Card.Text className="bg-light rounded text-center text-primary p-2 info-card">
                                                                    <FontAwesomeIcon className="me-2" icon={faMoneyBillWave} title="Salário" />
                                                                    {application.job.salary ? application.job.salary : 'A combinar'}
                                                                </Card.Text>
                                                            </Col>
                                                            <Col xs={6}>
                                                                {application.job.pcd && (
                                                                    <Card.Text className="bg-light rounded text-center text-primary p-2 info-card">
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
                                                <div className="d-flex flex-wrap justify-content-between mt-3">
                                                    <small className="text-muted text-truncate">
                                                        Inscrito em: {new Date(application.submissionDate).toLocaleDateString()}
                                                    </small>
                                                    {activeTab === 'encerrada' && application.job && application.job.closingDate && (
                                                        <small className="text-muted text-truncate">
                                                            Encerrada em: {new Date(application.job.closingDate).toLocaleDateString()}
                                                        </small>
                                                    )}
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                ))}
                                {/* Paginação */}
                                {totalPages > 1 && (
                                    <div className="d-flex flex-row p-2 justify-content-center">
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
                            </Row>
                        ) : (
                            <p className="text-center text-muted mt-4">Nenhuma inscrição encontrada.</p>
                        )}
                    </Col>
                    {/* Modal para os detalhes da vaga no mobile */}
                    <JobDetailsModal
                        show={showApplicationModal}
                        onClose={handleCloseApplicationModal}
                        jobDetails={selectedApplication?.job}
                        loading={loadingDetails}
                    />
                </Row>
            </Container>
        </>
    );
};

export default InscricoesCandidato;
