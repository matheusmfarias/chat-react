import React, { useEffect, useState, useCallback } from "react";
import Skeleton from 'react-loading-skeleton';
import HeaderCandidato from "../HeaderCandidato/HeaderCandidato";
import { useLocation, useNavigate } from 'react-router-dom';
import { Row, Col, Card, Container, Button, Form, InputGroup } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBriefcase, faBuilding, faChevronLeft, faChevronRight, faHome, faLaptopHouse, faLocationDot, faMoneyBillWave, faUpRightFromSquare, faWheelchair, faSearch, faTimesCircle, faFilter } from "@fortawesome/free-solid-svg-icons";
import './BuscarVagas.css';
import api from "../../../services/axiosConfig";
import Swal from "sweetalert2";
import JobDetailsModal from "../../Modals/JobDetailsModal";
import Filters from "../../Filters/Filters";
import FiltersModal from "../../Modals/FiltersModal";

const BuscarVagas = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingSubmit, setLoadingSubmit] = useState(false);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);
    const [visuallySelectedJob, setVisuallySelectedJob] = useState(null);
    const [totalPages, setTotalPages] = useState(1);
    const [totalJobs, setTotalJobs] = useState(0);
    const currentPage = parseInt(new URLSearchParams(location.search).get('page')) || 1;
    const itemsPerPage = 10;

    // Estados para busca e filtros
    const [showFilterModal, setShowFilterModal] = useState(false);
    const handleOpenFilterModal = () => setShowFilterModal(true);
    const handleCloseFilterModal = () => setShowFilterModal(false);

    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [showJobModal, setShowJobModal] = useState(false);

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

    const getInitialSearchTerm = () => {
        const params = new URLSearchParams(window.location.search);
        return params.get('keyword') || '';
    };

    const [filters, setFilters] = useState(getInitialFilters);
    const [searchTerm, setSearchTerm] = useState(getInitialSearchTerm);
    const [selectedStateFilter, setSelectedStateFilter] = useState(getInitialFilters().state);
    const [selectedCityFilter, setSelectedCityFilter] = useState(getInitialFilters().city);

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
        document.title = "ACI Empregos | Oportunidades";
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

    const handleSearchByJob = useCallback(async () => {
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
            const token = localStorage.getItem('token');
            const response = await api.get(`${process.env.REACT_APP_API_URL}/api/jobsSearch?${apiParams.toString()}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setJobs(response.data.jobs);
            setTotalPages(response.data.totalPages);
            setTotalJobs(response.data.totalJobs);

            if (response.data.totalJobs > 0) {
                const firstJob = response.data.jobs[0];
                setVisuallySelectedJob(firstJob);

                try {
                    const jobDetailsResponse = await api.get(`${process.env.REACT_APP_API_URL}/api/jobsSearch/${firstJob._id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setSelectedJob(jobDetailsResponse.data);
                } catch (detailsError) {
                    console.error('Erro ao buscar detalhes da vaga:', detailsError);
                } finally {
                    setLoadingDetails(false);
                }
            }
        } catch (error) {
            console.error('Erro ao buscar vagas:', error);
        } finally {
            setLoading(false);
        }
    }, [location.search, itemsPerPage]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const currentPage = parseInt(params.get('page')) || 1;

        updateURLWithFilters(filters, selectedStateFilter, selectedCityFilter, searchTerm, currentPage);
    }, [filters, selectedStateFilter, selectedCityFilter, searchTerm, location.search, updateURLWithFilters]);

    useEffect(() => {
        handleSearchByJob();
    }, [location.search, handleSearchByJob]);

    const SkeletonCard = () => (
        <Row className="mt-3">
            {Array.from({ length: 10 }).map((_, index) => (
                <React.Fragment key={index}>
                    <Col lg={5} xxl={4} key={index}>
                        <Card className="p-3 mb-4 border-0 shadow-sm rounded">
                            <Card.Body>
                                <Skeleton height={30} width="60%" className="mb-3" />
                                <Skeleton height={20} width="40%" className="mb-3" />
                                <Skeleton height={20} width="50%" className="mb-3" />
                                <Skeleton height={20} width="80%" className="mb-3" />
                                <Skeleton height={20} width="80%" className="mb-3" />
                                <Skeleton height={20} width="30%" />
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col lg={7} xxl={8} />
                </React.Fragment>
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

    // Função para abrir o modal ao clicar em uma vaga no mobile
    const handleCardClickMobile = async (job) => {
        // Define o job visualmente selecionado e abre o modal imediatamente
        setVisuallySelectedJob(job);
        setShowJobModal(true);

        setLoadingDetails(true);
        try {
            const token = localStorage.getItem('token');
            const response = await api.get(`${process.env.REACT_APP_API_URL}/api/jobsSearch/${job._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSelectedJob(response.data);
        } catch (error) {
            console.error('Erro ao buscar detalhes da vaga:', error);
        } finally {
            setLoadingDetails(false);
        }
    };

    const handleCloseJobModal = () => setShowJobModal(false);

    useEffect(() => {
        setLoading(true);
        const timeoutId = setTimeout(() => {
            handleSearchByJob();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, handleSearchByJob]);

    const handleResetFilter = () => {
        setLoading(true);
        setFilters({ modality: [], type: [], pcd: '', state: '', city: '' });
        setSelectedStateFilter('');
        setSelectedCityFilter('');
        setSearchTerm('');
        updateURLWithFilters({ modality: [], type: [], pcd: '', state: '', city: '' }, '', '', '', 1);
    };

    const handleCandidatarClick = () => {
        navigate(`/detalhes-vaga/${selectedJob._id}`);
        document.body.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmeterCurriculo = async () => {
        setLoadingSubmit(true);
        try {
            const token = localStorage.getItem('token');
            await api.post(`${process.env.REACT_APP_API_URL}/api/jobs/${selectedJob._id}/submit-curriculum`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            Swal.fire({
                icon: 'success',
                title: 'Sucesso!',
                text: 'Inscrição realizada!',
                showCancelButton: true,
                confirmButtonText: 'Minhas inscrições',
                cancelButtonText: 'OK',
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate('/inscricoes-candidato'); // Redireciona para /inscrições
                }
            });

        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Você já está inscrito nesta vaga!',
                showCancelButton: true,
                confirmButtonText: 'Outras vagas',
                cancelButtonText: 'OK',
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate('/buscar-vagas'); // Redireciona para /buscar-vagas
                }
            });
        } finally {
            setLoadingSubmit(false);
        }
    };

    const handleCardClick = async (job) => {
        setVisuallySelectedJob(job);
        setLoadingDetails(true);
        try {
            const token = localStorage.getItem('token');
            const response = await api.get(`${process.env.REACT_APP_API_URL}/api/jobsSearch/${job._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSelectedJob(response.data);
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
                    <h1>Oportunidades</h1>
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
                    <Col xs={12} lg={10} className='mt-2'>
                        <Row style={{ backgroundColor: '#f9f9f9f9', position: 'sticky', top: '0px', scale: '1.01', zIndex: '999' }}>
                            <Col lg={8} className="mt-2">
                                <InputGroup>
                                    <Form.Control
                                        type="text"
                                        className="border-primary"
                                        placeholder="Pesquisar por oportunidades, cidade, modelo..."
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
                                        A busca "{searchTerm}" retornou {totalJobs} resultado(s).
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
                        ) : jobs.length > 0 ? (
                            <Row className="mt-3">
                                <Col lg={5} xxl={4} style={{ position: 'relative' }}>
                                    {jobs.map(result => (
                                        <Card
                                            key={result._id}
                                            className={`vaga-card p-2 mb-4 border-0 shadow-sm rounded ${visuallySelectedJob && visuallySelectedJob._id === result._id ? 'vaga-card-selecionada shadow' : ''}`}
                                            onClick={() => {
                                                if (window.innerWidth <= 991) {
                                                    handleCardClickMobile(result);
                                                } else {
                                                    handleCardClick(result);
                                                }
                                            }}
                                            style={{
                                                cursor: 'pointer',
                                            }}
                                        >
                                            <Card.Body>
                                                <Card.Title className="mb-0 me-2 info-card">{result.title}</Card.Title>
                                                <Card.Text>
                                                    {result.identifyCompany
                                                        ? 'Empresa confidencial'
                                                        : (result.company ? result.company.nome : 'Empresa não especificada')}
                                                </Card.Text>
                                                <Card.Text className="bg-light rounded text-center text-primary p-2 info-card">
                                                    <FontAwesomeIcon className="me-2" icon={faLocationDot} title="Localização" />
                                                    {result.city}, {result.state}
                                                </Card.Text>
                                                <Row className="mb-2">
                                                    <Col xs={6}>
                                                        <Card.Text className="bg-light rounded text-center text-primary p-2 info-card">
                                                            <FontAwesomeIcon
                                                                className="me-2"
                                                                icon={result.modality === 'Remoto' ? faHome : result.modality === 'Presencial' ? faBuilding : faLaptopHouse}
                                                                title="Modelo"
                                                            />
                                                            {result.modality}
                                                        </Card.Text>
                                                    </Col>
                                                    <Col xs={6}>
                                                        <Card.Text className="bg-light rounded text-center text-primary p-2 info-card">
                                                            <FontAwesomeIcon className="me-2" icon={faBriefcase} title="Tipo" />
                                                            {result.type}
                                                        </Card.Text>
                                                    </Col>
                                                </Row>
                                                <Row>
                                                    <Col xs={6}>
                                                        <Card.Text className="bg-light rounded text-center text-primary p-2 info-card">
                                                            <FontAwesomeIcon className="me-2" icon={faMoneyBillWave} title="Salário" />
                                                            {result.salary ? result.salary : 'A combinar'}
                                                        </Card.Text>
                                                    </Col>
                                                    <Col xs={6}>
                                                        {result.pcd && (
                                                            <Card.Text className="bg-light rounded text-center text-primary p-2 info-card">
                                                                <FontAwesomeIcon className="me-2" icon={faWheelchair} title="PcD" />
                                                                PcD
                                                            </Card.Text>
                                                        )}
                                                    </Col>
                                                </Row>
                                                <hr className="my-3 rounded justify-content-center" />
                                                <Card.Text className="text-muted">
                                                    Publicado em: {new Date(result.publicationDate).toLocaleDateString()}
                                                </Card.Text>
                                            </Card.Body>
                                        </Card>
                                    ))}
                                    {/* Paginação */}
                                    {totalPages > 1 && (
                                        <div className="d-flex flex-row p-2">
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
                                </Col>
                                {/* Detalhes da vaga à direita */}
                                <Col lg={7} xxl={8} className="coluna-detalhes-vagas">
                                    <div style={{ position: 'sticky', top: '70px', overflowY: 'hidden' }}>
                                        <Card className="border-0 mb-3">
                                            <Card.Body className="shadow-sm rounded">
                                                {loadingDetails ? (
                                                    <>
                                                        <Skeleton height={25} width="60%" className="mb-3" />
                                                        <Skeleton height={20} width="40%" className="mb-4" />
                                                        <Skeleton height={20} width="50%" className="mb-4" />
                                                        <Skeleton height={20} width="80%" className="mb-5" />
                                                    </>
                                                ) : (
                                                    selectedJob && (
                                                        <>
                                                            <div className="d-flex align-items-center">
                                                                <Card.Title className="mb-0 me-2">{selectedJob.title}</Card.Title>
                                                                {selectedJob.pcd && (
                                                                    <FontAwesomeIcon icon={faWheelchair} title="PcD" className="text-primary" />
                                                                )}
                                                            </div>
                                                            <Card.Text className="mb-2">
                                                                {selectedJob.identifyCompany ? 'Empresa confidencial' : (selectedJob.company ? selectedJob.company.nome : 'Empresa não informada')}
                                                            </Card.Text>
                                                            <Row className="mb-2">
                                                                <Card.Text>
                                                                    <FontAwesomeIcon className="me-2" icon={faLocationDot} title="Localização" />
                                                                    {selectedJob.city}, {selectedJob.state}
                                                                </Card.Text>
                                                            </Row>
                                                            <Row className="mb-2">
                                                                <Col>
                                                                    <div className="d-flex">
                                                                        <Card.Text className="me-4">
                                                                            <FontAwesomeIcon
                                                                                className="me-2"
                                                                                icon={selectedJob.modality === 'Remoto' ? faHome : selectedJob.modality === 'Presencial' ? faBuilding : faLaptopHouse}
                                                                                title="Modelo"
                                                                            />
                                                                            {selectedJob.modality}
                                                                        </Card.Text>
                                                                        <Card.Text className="me-4">
                                                                            <FontAwesomeIcon className="me-2" icon={faBriefcase} title="Tipo" />
                                                                            {selectedJob.type}
                                                                        </Card.Text>
                                                                        <Card.Text>
                                                                            <FontAwesomeIcon className="me-2" icon={faMoneyBillWave} title="Salário" />
                                                                            {selectedJob.salary ? selectedJob.salary : 'A combinar'}
                                                                        </Card.Text>
                                                                    </div>
                                                                </Col>
                                                            </Row>
                                                            <Col lg={4}>
                                                                <Button onClick={handleCandidatarClick} style={{ minWidth: '166px' }}>
                                                                    Candidatar-se <FontAwesomeIcon icon={faUpRightFromSquare} title="Link" />
                                                                </Button>
                                                            </Col>
                                                        </>
                                                    ))}
                                            </Card.Body>

                                            <Card.Body style={{ maxHeight: '45vh', overflowY: 'auto' }} className="shadow-sm rounded">
                                                {loadingDetails ? (
                                                    <>
                                                        <Skeleton height={20} width="80%" className="mb-3" />
                                                        <Skeleton height={20} width="60%" className="mb-4" />
                                                        <Skeleton height={20} width="80%" className="mb-3" />
                                                        <Skeleton height={20} width="60%" className="mb-4" />
                                                        <Skeleton height={20} width="80%" className="mb-3" />
                                                        <Skeleton height={20} width="60%" className="mb-4" />
                                                        <Skeleton height={20} width="80%" className="mb-3" />
                                                        <Skeleton height={20} width="60%" className="mb-4" />
                                                    </>
                                                ) : selectedJob && (
                                                    <>
                                                        {selectedJob.offers && (
                                                            <>
                                                                <Card.Title>Benefícios</Card.Title>
                                                                <Card.Text dangerouslySetInnerHTML={{ __html: selectedJob.offers }} />
                                                            </>
                                                        )}
                                                        {selectedJob.description && (
                                                            <>
                                                                <Card.Title>Descrição</Card.Title>
                                                                <Card.Text dangerouslySetInnerHTML={{ __html: selectedJob.description }} />
                                                            </>
                                                        )}
                                                        {selectedJob.responsibilities && (
                                                            <>
                                                                <Card.Title>Responsabilidades e atribuições</Card.Title>
                                                                <Card.Text dangerouslySetInnerHTML={{ __html: selectedJob.responsibilities }} />
                                                            </>
                                                        )}
                                                        {selectedJob.qualifications && (
                                                            <>
                                                                <Card.Title>Requisitos e qualificações</Card.Title>
                                                                <Card.Text dangerouslySetInnerHTML={{ __html: selectedJob.qualifications }} />
                                                            </>
                                                        )}
                                                        {selectedJob.requiriments && (
                                                            <>
                                                                <Card.Title>Será um diferencial</Card.Title>
                                                                <Card.Text dangerouslySetInnerHTML={{ __html: selectedJob.requiriments }} />
                                                            </>
                                                        )}
                                                        {selectedJob.additionalInfo && (
                                                            <>
                                                                <Card.Title>Informações adicionais</Card.Title>
                                                                <Card.Text dangerouslySetInnerHTML={{ __html: selectedJob.additionalInfo }} />
                                                            </>
                                                        )}

                                                        {!selectedJob.offers &&
                                                            !selectedJob.description &&
                                                            !selectedJob.responsibilities &&
                                                            !selectedJob.qualifications &&
                                                            !selectedJob.requiriments &&
                                                            !selectedJob.additionalInfo && (
                                                                <Card.Text>Nenhuma informação adicional informada.</Card.Text>
                                                            )}
                                                    </>
                                                )}
                                            </Card.Body>
                                        </Card>
                                    </div>
                                </Col>
                                {/* Modal para os detalhes da vaga no mobile */}
                                <JobDetailsModal
                                    show={showJobModal}
                                    onClose={handleCloseJobModal}
                                    jobDetails={selectedJob}
                                    loading={loadingDetails}
                                    onSubmit={handleSubmeterCurriculo}
                                    submitting={loadingSubmit}
                                />
                            </Row>
                        ) : (
                            <p className="text-muted text-center mt-2 mt-md-4">Nenhuma vaga encontrada.</p>
                        )}
                    </Col>
                </Row >
            </Container >
        </>
    );
}

export default BuscarVagas;
