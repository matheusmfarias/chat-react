import React, { useEffect, useState, useCallback } from "react";
import Skeleton from 'react-loading-skeleton';
import Select from 'react-select';
import HeaderCandidato from "../HeaderCandidato/HeaderCandidato";
import { useLocation, useNavigate } from 'react-router-dom';
import { Modal, Row, Col, Card, Container, Button, Form, InputGroup, Spinner } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBriefcase, faBuilding, faChevronLeft, faChevronRight, faHome, faLaptopHouse, faLocationDot, faMoneyBillWave, faUpRightFromSquare, faWheelchair, faSearch, faTimesCircle, faFilter, faFilterCircleXmark } from "@fortawesome/free-solid-svg-icons";
import './BuscarVagas.css';
import api from "../../../services/axiosConfig";
import Swal from "sweetalert2";

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
    const [currentPage, setCurrentPage] = useState(1);
    const [totalJobs, setTotalJobs] = useState(0);
    const itemsPerPage = 10;

    // Estados para busca e filtros
    const [showFilterModal, setShowFilterModal] = useState(false);
    const handleOpenFilterModal = () => setShowFilterModal(true);
    const handleCloseFilterModal = () => setShowFilterModal(false);
    const keyword = location.state?.keyword || '';
    const [searchTerm, setSearchTerm] = useState(keyword);
    const [selectedStateFilter, setSelectedStateFilter] = useState('');
    const [selectedCityFilter, setSelectedCityFilter] = useState('');
    const [filters, setFilters] = useState({
        modality: [],
        type: [],
        pcd: '',
        state: '',
        city: '',
    });
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [showJobModal, setShowJobModal] = useState(false);

    const SkeletonCard = () => (
        <Row className="mt-3">
            {Array.from({ length: 10 }).map((_, index) => (
                <>
                    <Col lg={5} xxl={4} key={index}>
                        <Card className="p-3 mb-4 border-0 shadow-sm rounded">
                            <Card.Body>
                                <Skeleton height={30} width="60%" className="mb-3" />
                                <Skeleton height={20} width="40%" className="mb-4" />
                                <Skeleton height={20} width="50%" className="mb-3" />
                                <Skeleton height={20} width="80%" className="mb-3" />
                                <Skeleton height={20} width="80%" className="mb-4" />
                                <Skeleton height={20} width="30%" />
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col lg={7} xxl={8} />
                </>
            ))}
        </Row>
    );

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
            fetchLocations(selectedStateFilter); // Busca as cidades do estado selecionado
        } else {
            setCities([]); // Limpa as cidades se nenhum estado estiver selecionado
        }
    }, [selectedStateFilter, fetchLocations]);

    const buildFilters = (filters, selectedStateFilter, selectedCityFilter, searchTerm) => {
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

        return params;
    };

    const handleSearchByJob = useCallback(async () => {
        const params = buildFilters(filters, selectedStateFilter, selectedCityFilter, searchTerm);

        params.append('page', currentPage || 1);
        params.append('limit', itemsPerPage || 10);

        try {
            const token = localStorage.getItem('token');
            const response = await api.get(`${process.env.REACT_APP_API_URL}/api/jobsSearch?${params.toString()}`, {
                headers: { Authorization: `Bearer ${token}` }
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
    }, [searchTerm, selectedStateFilter, selectedCityFilter, filters, currentPage, itemsPerPage]);

    // Atualiza busca quando filtros mudam (resetando para a página 1)
    useEffect(() => {
        setCurrentPage(1);
    }, [keyword, searchTerm, selectedStateFilter, selectedCityFilter, filters]);

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

    // Atualização na busca enquanto o usuário digita
    useEffect(() => {
        setLoading(true);
        const timeoutId = setTimeout(() => {
            handleSearchByJob();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, handleSearchByJob]);

    // Função para resetar o filtro
    const handleResetFilter = () => {
        setLoading(true);
        setSelectedStateFilter('');
        setSelectedCityFilter('');
        setFilters({ modality: '', type: '', pcd: '' });
        setJobs([]);
    };

    const handleCandidatarClick = () => {
        navigate(`/detalhes-vaga/${selectedJob._id}`); // Passa o ID na URL
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

    const handlePageChange = (direction) => {
        setLoading(true);
        if (direction === 'next' && currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        } else if (direction === 'prev' && currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleClearSearch = () => {
        setLoading(true);
        setSearchTerm("");
        setCurrentPage(1);
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
                    <Col lg={2} className='coluna-filtros mt-2' style={{ position: 'sticky', top: '10px', height: '100%', overflowY: 'hidden' }}>
                        <Row>
                            <Col lg={11}>
                                <Form.Group className="mb-2">
                                    <div className="d-flex flex-row justify-content-between">
                                        <h5>Tipo</h5>
                                        {(hasFiltersApplied(filters, selectedStateFilter, selectedCityFilter)) && (
                                            <FontAwesomeIcon
                                                icon={faFilterCircleXmark}
                                                title="Limpar filtros"
                                                onClick={handleResetFilter}
                                                size="lg"
                                                style={{ cursor: 'pointer' }}
                                            />
                                        )}
                                    </div>
                                    {['Efetivo', 'Aprendiz', 'Estágio', 'Pessoa Jurídica', 'Trainee', 'Temporário', 'Freelancer', 'Terceiro'].map((type) => (
                                        <Form.Check
                                            type="checkbox"
                                            label={type}
                                            key={type}
                                            value={type}
                                            checked={filters.type.includes(type)}
                                            onChange={(e) => {
                                                setLoading(true);
                                                const newTypes = e.target.checked
                                                    ? [...filters.type, type]
                                                    : filters.type.filter((t) => t !== type);
                                                setFilters({ ...filters, type: newTypes });
                                            }}
                                        />
                                    ))}
                                </Form.Group>
                                <Form.Group className="mb-2">
                                    <h5>Modalidade</h5>
                                    {['Presencial', 'Híbrido', 'Remoto'].map((modality) => (
                                        <Form.Check
                                            type="checkbox"
                                            label={modality}
                                            key={modality}
                                            value={modality}
                                            checked={filters.modality.includes(modality)}
                                            onChange={(e) => {
                                                setLoading(true);
                                                const newModalities = e.target.checked
                                                    ? [...filters.modality, modality]
                                                    : filters.modality.filter((t) => t !== modality);
                                                setFilters({ ...filters, modality: newModalities });
                                            }}
                                        />
                                    ))}
                                </Form.Group>
                                <Form.Group className="mb-2">
                                    <h5>Localização</h5>
                                    <Select
                                        options={states.map((state) => ({
                                            value: state.sigla,
                                            label: state.nome,
                                        }))}
                                        value={
                                            states
                                                .map((state) => ({ value: state.sigla, label: state.nome }))
                                                .find((option) => option.value === selectedStateFilter) || null
                                        }
                                        onChange={(selectedOption) => {
                                            setLoading(true);
                                            setSelectedStateFilter(selectedOption?.value || '');
                                            setCities([]);
                                        }}
                                        placeholder="Estado"
                                        menuPortalTarget={document.body}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-2">
                                    <Select
                                        options={cities.map((city) => ({
                                            value: city.nome,
                                            label: city.nome,
                                        }))}
                                        value={
                                            cities
                                                .map((city) => ({ value: city.nome, label: city.nome }))
                                                .find((option) => option.value === selectedCityFilter) || null
                                        }
                                        onChange={(selectedOption) => {
                                            setLoading(true);
                                            setSelectedCityFilter(selectedOption?.value || '')
                                        }}
                                        placeholder="Cidade"
                                        menuPortalTarget={document.body}
                                    />
                                </Form.Group>
                                <Form.Group className="d-flex flex-row justify-content-between">
                                    <h5>PcD</h5>
                                    <Form.Check
                                        type="switch"
                                        id="pcd-toggle"
                                        label=""
                                        checked={filters.pcd === "true"}
                                        onChange={(e) => {
                                            setLoading(true);
                                            setFilters({ ...filters, pcd: e.target.checked ? "true" : "" });
                                        }}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Col>
                    <Col xs={12} lg={10} className='mt-2'>
                        <Row style={{ backgroundColor: '#f9f9f9f9', position: 'sticky', top: '0px', scale: '1.01', zIndex: '999' }}>
                            <Col lg={8} className="mt-2">
                                <InputGroup className="position-relative">
                                    <Form.Control
                                        type="text"
                                        className="border-primary"
                                        placeholder="Pesquisar por oportunidades, cidade, modelo..."
                                        aria-label="Pesquisar"
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                    />
                                    {searchTerm && (
                                        <FontAwesomeIcon
                                            icon={faTimesCircle}
                                            className="icon-remove-tag position-absolute"
                                            onClick={() => handleClearSearch()}
                                            style={{
                                                right: '110px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                            }}
                                        />
                                    )}
                                    <Button className="btn-buscar-vagas" variant="outline-primary">
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
                                    PCD: Sim
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
                        <Modal show={showFilterModal} onHide={handleCloseFilterModal} centered>
                            <Modal.Header closeButton>
                                <Modal.Title>Filtros</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                {/* Conteúdo dos filtros */}
                                <Row>
                                    <Col>
                                        <Form.Group className="mb-2">
                                            <h5>Tipo</h5>
                                            {['Efetivo', 'Aprendiz', 'Estágio', 'Pessoa Jurídica', 'Trainee', 'Temporário', 'Freelancer', 'Terceiro'].map((type) => (
                                                <Form.Check
                                                    type="checkbox"
                                                    label={type}
                                                    key={type}
                                                    value={type}
                                                    checked={filters.type.includes(type)}
                                                    onChange={(e) => {
                                                        const newTypes = e.target.checked
                                                            ? [...filters.type, type]
                                                            : filters.type.filter((t) => t !== type);
                                                        setFilters({ ...filters, type: newTypes });
                                                    }}
                                                />
                                            ))}
                                        </Form.Group>
                                        <Form.Group className="mb-2">
                                            <h5>Modalidade</h5>
                                            {['Presencial', 'Híbrido', 'Remoto'].map((modality) => (
                                                <Form.Check
                                                    type="checkbox"
                                                    label={modality}
                                                    key={modality}
                                                    value={modality}
                                                    checked={filters.modality.includes(modality)}
                                                    onChange={(e) => {
                                                        const newModalities = e.target.checked
                                                            ? [...filters.modality, modality]
                                                            : filters.modality.filter((t) => t !== modality);
                                                        setFilters({ ...filters, modality: newModalities });
                                                    }}
                                                />
                                            ))}
                                        </Form.Group>
                                        <Form.Group className="mb-2">
                                            <h5>Localização</h5>
                                            <Select
                                                options={states.map((state) => ({
                                                    value: state.sigla,
                                                    label: state.nome,
                                                }))}
                                                value={
                                                    states
                                                        .map((state) => ({ value: state.sigla, label: state.nome }))
                                                        .find((option) => option.value === selectedStateFilter) || null
                                                }
                                                onChange={(selectedOption) => {
                                                    setLoading(true);
                                                    setSelectedStateFilter(selectedOption?.value || '');
                                                    setCities([]);
                                                }}
                                                placeholder="Estado"
                                            />
                                        </Form.Group>
                                        <Form.Group className="mb-2">
                                            <Select
                                                options={cities.map((city) => ({
                                                    value: city.nome,
                                                    label: city.nome,
                                                }))}
                                                value={
                                                    cities
                                                        .map((city) => ({ value: city.nome, label: city.nome }))
                                                        .find((option) => option.value === selectedCityFilter) || null
                                                }
                                                onChange={(selectedOption) => {
                                                    setLoading(true);
                                                    setSelectedCityFilter(selectedOption?.value || '')
                                                }}
                                                placeholder="Cidade"
                                            />
                                        </Form.Group>
                                        <Form.Group className="d-flex flex-row justify-content-between">
                                            <h5>PcD</h5>
                                            <Form.Check
                                                type="switch"
                                                id="pcd-toggle"
                                                label=""
                                                checked={filters.pcd === "true"}
                                                onChange={(e) => {
                                                    setLoading(true);
                                                    setFilters({ ...filters, pcd: e.target.checked ? "true" : "false" });
                                                }}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Modal.Body>
                            <Modal.Footer>
                                <Button variant="primary" onClick={handleCloseFilterModal}>
                                    Aplicar Filtros
                                </Button>
                                <Button variant="secondary" onClick={handleCloseFilterModal}>
                                    Fechar
                                </Button>
                            </Modal.Footer>
                        </Modal>
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
                                        <div className="d-flex flex-row p-2" style={{ marginLeft: '6px' }}>
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
                                <Modal show={showJobModal} onHide={handleCloseJobModal} centered dialogClassName="modal-dialog-scrollable">
                                    <Modal.Header closeButton>
                                        <Modal.Title>Detalhes da vaga</Modal.Title>
                                    </Modal.Header>
                                    <Modal.Body className="p-0">
                                        {selectedJob ? (
                                            <>
                                                <Card className="border-0">
                                                    <Card.Body>
                                                        {loadingDetails ? (
                                                            <>
                                                                <Skeleton height={30} width="60%" className="mb-2" />
                                                                <Skeleton height={20} width="40%" className="mb-4" />
                                                                <Skeleton height={20} width="50%" className="mb-3" />
                                                                <Skeleton height={20} width="80%" className="mb-5" />
                                                            </>
                                                        ) : (
                                                            selectedJob && (
                                                                <>
                                                                    <div className="d-flex flex-row align-items-center">
                                                                        <Card.Title className="mb-0 me-2">{selectedJob.title}</Card.Title>
                                                                        {selectedJob.pcd && (
                                                                            <FontAwesomeIcon icon={faWheelchair} title="PcD" className="text-primary" />
                                                                        )}
                                                                    </div>
                                                                    <Card.Text className='mt-2'>
                                                                        {selectedJob.identifyCompany ? 'Empresa confidencial' : (selectedJob.company ? selectedJob.company.nome : 'Empresa não informada')}
                                                                    </Card.Text>
                                                                    <Row>
                                                                        <Card.Text>
                                                                            <FontAwesomeIcon className="me-2" icon={faLocationDot} title="Localização" />
                                                                            {selectedJob.city}, {selectedJob.state}
                                                                        </Card.Text>
                                                                    </Row>
                                                                    <Row>
                                                                        <Col>
                                                                            <div className="d-flex flex-row mt-2">
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
                                                                    <Col className='mt-1'>
                                                                        <Button onClick={handleSubmeterCurriculo} style={{ minWidth: '166px' }}>
                                                                            {loadingSubmit ? (
                                                                                <div className="d-flex justify-content-center align-items-center">
                                                                                    <Spinner animation="border" />
                                                                                </div>
                                                                            ) : (
                                                                                <span>Enviar currículo</span>
                                                                            )}
                                                                        </Button>
                                                                    </Col>
                                                                </>
                                                            ))}
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
                                            </>
                                        ) : (
                                            <p>Carregando detalhes...</p>
                                        )}
                                    </Modal.Body>
                                    <Modal.Footer>
                                        <Button variant="secondary" onClick={handleCloseJobModal}>
                                            Fechar
                                        </Button>
                                    </Modal.Footer>
                                </Modal>
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
