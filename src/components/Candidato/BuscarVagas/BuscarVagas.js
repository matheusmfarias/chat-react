import React, { useEffect, useState, useCallback } from "react";
import HeaderCandidato from "../HeaderCandidato/HeaderCandidato";
import { useLocation, useNavigate } from 'react-router-dom';
import { Modal, Row, Col, Card, Container, Button, Form, InputGroup, Spinner } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBriefcase, faBuilding, faChevronLeft, faChevronRight, faHome, faLaptopHouse, faLocationDot, faMoneyBillWave, faUpRightFromSquare, faWheelchair, faSearch, faTimesCircle, faFilter } from "@fortawesome/free-solid-svg-icons";
import './BuscarVagas.css';
import axios from "axios";
import api from "../../../services/axiosConfig";
import Swal from "sweetalert2";

const BuscarVagas = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingSubmit, setLoadingSubmit] = useState(false);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const keyword = location.state?.keyword || '';
    const [selectedJob, setSelectedJob] = useState(null);
    const [visuallySelectedJob, setVisuallySelectedJob] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Estados para busca e filtros
    const [showFilterModal, setShowFilterModal] = useState(false);
    const handleOpenFilterModal = () => setShowFilterModal(true);
    const handleCloseFilterModal = () => setShowFilterModal(false);
    const [searchTerm, setSearchTerm] = useState(keyword);
    const [selectedStateFilter, setSelectedStateFilter] = useState('');
    const [selectedCityFilter, setSelectedCityFilter] = useState('');
    const [filters, setFilters] = useState({
        modality: '',
        type: '',
        pcd: '',
    });
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);

    const [showJobModal, setShowJobModal] = useState(false);

    useEffect(() => {
        document.title = "ACI Empregos | Oportunidades";
        if (keyword) {
            const fetchJobs = async () => {
                try {
                    const token = localStorage.getItem('token');
                    const response = await api.get(`${process.env.REACT_APP_API_URL}/api/jobsSearch?keyword=${keyword}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setJobs(response.data);  // Armazena todos os resultados em 'jobs'
                } catch (error) {
                    console.error('Erro ao buscar vagas:', error);
                } finally {
                    setLoading(false);
                }
            };
            fetchJobs();
        }
    }, [keyword]);

    // Função para buscar estados via API do IBGE
    const fetchStates = useCallback(async () => {
        try {
            const response = await axios.get('https://servicodados.ibge.gov.br/api/v1/localidades/estados');
            setStates(response.data);
        } catch (error) {
            console.error('Erro ao buscar estados:', error);
        }
    }, []);

    // Função para buscar cidades baseado no estado selecionado
    const fetchCities = useCallback(async (state) => {
        setLoading(true);
        try {
            const response = await axios.get(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${state}/municipios`);
            setCities(response.data);
        } catch (error) {
            console.error('Erro ao buscar cidades:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Buscar cidades quando o estado for selecionado
    useEffect(() => {
        if (selectedStateFilter) {
            fetchCities(selectedStateFilter);
        } else {
            setCities([]);
        }
    }, [selectedStateFilter, fetchCities]);

    // Carregar os estados ao carregar o componente
    useEffect(() => {
        fetchStates();
    }, [fetchStates]);

    // Função para abrir o modal ao clicar em uma vaga no mobile
    const handleCardClickMobile = async (job) => {
        // Define o job visualmente selecionado e abre o modal imediatamente
        setVisuallySelectedJob(job);
        setShowJobModal(true); // Abre o modal instantaneamente

        setLoadingDetails(true); // Indica que os dados estão sendo carregados
        try {
            const token = localStorage.getItem('token');
            const response = await api.get(`${process.env.REACT_APP_API_URL}/api/jobsSearch/${job._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSelectedJob(response.data); // Atualiza os detalhes da vaga
        } catch (error) {
            console.error('Erro ao buscar detalhes da vaga:', error);
        } finally {
            setLoadingDetails(false); // Indica que o carregamento terminou
        }
    };

    const handleCloseJobModal = () => setShowJobModal(false);

    // Função para buscar vagas com base nos filtros de cargo e filtros aplicados
    const handleSearchByJob = useCallback(async () => {
        const params = new URLSearchParams();

        // Aplicar filtros aos parâmetros da busca
        if (searchTerm.trim()) {
            params.append('keyword', searchTerm);
        }
        if (filters.modality.length > 0) filters.modality.forEach(m => params.append('modality', m));
        if (filters.type.length > 0) filters.type.forEach(t => params.append('type', t));
        if (filters.pcd) params.append('pcd', filters.pcd);
        if (selectedStateFilter && selectedCityFilter) {
            params.append('location', `${selectedCityFilter}, ${selectedStateFilter}`);
        } else if (selectedStateFilter) {
            params.append('location', selectedStateFilter);
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await api.get(`${process.env.REACT_APP_API_URL}/api/jobsSearch?${params.toString()}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setJobs(response.data);  // Atualiza 'jobs' com os resultados filtrados
        } catch (error) {
            console.error('Erro ao buscar vagas:', error);
        } finally {
            setLoading(false);
        }
    }, [searchTerm, selectedStateFilter, selectedCityFilter, filters]);

    // Atualização na busca enquanto o usuário digita
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            handleSearchByJob();
        }, 500); // Aguarda 500ms após o usuário parar de digitar

        return () => clearTimeout(timeoutId); // Limpa o timeout anterior a cada nova digitação
    }, [searchTerm, selectedStateFilter, selectedCityFilter, filters, handleSearchByJob]);

    // Função para resetar a busca
    const handleResetSearch = () => {
        setSelectedStateFilter('');
        setSelectedCityFilter('');
        setFilters({ modality: '', type: '', pcd: '' });
        setJobs([]); // Limpa as vagass
    };

    const handleCandidatarClick = () => {
        navigate('/detalhes-vaga', { state: { job: selectedJob } });
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
            console.error('Ocorreu um erro ao submeter o currículo. Por favor, tente novamente mais tarde.');

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

    useEffect(() => {
        if (jobs.length > 0) {
            const fetchFirstJobDetails = async () => {
                setVisuallySelectedJob(jobs[0]);
                setLoadingDetails(true);
                try {
                    const token = localStorage.getItem('token');
                    const response = await api.get(`${process.env.REACT_APP_API_URL}/api/jobsSearch/${jobs[0]._id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setSelectedJob(response.data);
                } catch (error) {
                    console.error('Erro ao buscar detalhes da vaga:', error);
                } finally {
                    setLoadingDetails(false);
                }
            };

            fetchFirstJobDetails();
        }
    }, [jobs]);

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


    const totalPages = Math.ceil(jobs.length / itemsPerPage);

    const handlePageChange = (direction) => {
        if (direction === 'next' && currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        } else if (direction === 'prev' && currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = jobs.slice(startIndex, endIndex);

    useEffect(() => {
        const firstJobOnPage = jobs.slice(startIndex, startIndex + itemsPerPage)[0];
        setVisuallySelectedJob(firstJobOnPage);
        setSelectedJob(firstJobOnPage);
    }, [currentPage, jobs, itemsPerPage, startIndex]);

    const handleClearSearch = () => {
        setSearchTerm("");
        setCurrentPage(1); // Reseta para a primeira página
    };

    return (
        <>
            <HeaderCandidato />
            <Container fluid style={{ backgroundColor: '#f9f9f9f9' }}>
                <Row className="m-md-2 mt-2">
                    <h1>Oportunidades</h1>
                    <Col className='coluna-filtros mt-2 mb-4' style={{ position: 'sticky', top: '10px', height: '120vh', overflowY: 'hidden', zIndex: '1000' }}>
                        <Row className="mb-2">
                            <h5>Tipo</h5>
                            <Col xs={12} md={10} >
                                <Form.Group>
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
                            </Col>
                        </Row>
                        <Row className='mb-2'>
                            <h5>Modalidade</h5>
                            <Col xs={12} md={10}>
                                <Form.Group>
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
                            </Col>
                        </Row>
                        <Row className='mb-2'>
                            <h5>Localização</h5>
                            <span className='text-muted'>Estado</span>
                            <Col xs={12} md={10}>
                                <Form.Control
                                    as="select"
                                    style={{ width: '200px' }}
                                    value={selectedStateFilter}
                                    onChange={(e) => setSelectedStateFilter(e.target.value)}
                                >
                                    <option value="">Selecione</option>
                                    {states.map((state) => (
                                        <option key={state.id} value={state.sigla}>
                                            {state.nome}
                                        </option>
                                    ))}
                                </Form.Control>
                            </Col>
                        </Row>
                        <Row className='mb-2'>
                            <span className='text-muted'>Cidade</span>
                            <Col xs={12} md={10}>
                                <Form.Control
                                    as="select"
                                    style={{ width: '200px' }}
                                    value={selectedCityFilter}
                                    onChange={(e) => setSelectedCityFilter(e.target.value)}
                                >
                                    <option value="">Selecione</option>
                                    {cities.map((city) => (
                                        <option key={city.id} value={city.nome}>
                                            {city.nome}
                                        </option>
                                    ))}
                                </Form.Control>
                            </Col>
                        </Row>
                        <Row className='mb-2'>
                            <h5>PCD</h5>
                            <Col xs={12} md={10}>
                                <Form.Control
                                    as="select"
                                    style={{ width: '200px' }}
                                    value={filters.pcd}
                                    onChange={(e) => setFilters({ ...filters, pcd: e.target.value })}
                                >
                                    <option value="">Selecione</option>
                                    <option value="true">Sim</option>
                                    <option value="false">Não</option>
                                </Form.Control>
                            </Col>
                        </Row>
                        <Row>
                            <Button
                                variant="primary"
                                className="m-2"
                                onClick={handleResetSearch}
                                title="Limpar filtros"
                                style={{ width: '200px' }}
                            >
                                Limpar filtros
                            </Button>
                        </Row>
                    </Col>
                    <Col xs={12} md={10} className='coluna-vagas mt-2'>
                        <Row className='busca-coluna-vagas align-items-center'>
                            <InputGroup style={{ maxWidth: '800px' }}>
                                <Form.Control
                                    type="text"
                                    className='input-buscar-vagas shadow border-primary'
                                    placeholder="Pesquisar por cargos, cidade, modelo..."
                                    aria-label="Pesquisar"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                                <Button className="btn-buscar-vagas" variant="outline-primary">
                                    <FontAwesomeIcon icon={faSearch} />
                                </Button>
                            </InputGroup>
                            <Col md={2}>
                                <Button
                                    className="btn-limpar-busca"
                                    variant="outline-secondary"
                                    onClick={() => handleClearSearch()}
                                    title="Limpar busca"
                                >
                                    Limpar busca
                                </Button>
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
                        <div className="filter-tag-container mt-2">
                            {filters.type.length > 0 && filters.type.map((filter, index) => (
                                <div className="filter-tag" key={index}>
                                    {filter}
                                    <FontAwesomeIcon
                                        icon={faTimesCircle}
                                        className="icon-remove-tag"
                                        onClick={() => {
                                            // Remove o filtro de tipo específico ao clicar no "x"
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
                                        onClick={() => setSelectedStateFilter('')} // Remove o filtro de estado
                                    />
                                </div>
                            )}
                            {selectedCityFilter && (
                                <div className="filter-tag">
                                    Cidade: {selectedCityFilter}
                                    <FontAwesomeIcon
                                        icon={faTimesCircle}
                                        className="icon-remove-tag"
                                        onClick={() => setSelectedCityFilter('')} // Remove o filtro de cidade
                                    />
                                </div>
                            )}
                            {filters.pcd && (
                                <div className="filter-tag">
                                    PCD: {filters.pcd === 'true' ? 'Sim' : 'Não'}
                                    <FontAwesomeIcon
                                        icon={faTimesCircle}
                                        className="icon-remove-tag"
                                        onClick={() => setFilters({ ...filters, pcd: '' })} // Remove o filtro de PCD
                                    />
                                </div>
                            )}
                        </div>
                        {/* Modal para os filtros */}
                        <Modal show={showFilterModal} onHide={handleCloseFilterModal} centered>
                            <Modal.Header closeButton>
                                <Modal.Title>Filtros</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                {/* Conteúdo dos filtros */}
                                <Row className="mb-4 align-items-center">
                                    <h5>Tipo</h5>
                                    <Col xs={12}>
                                        <Form.Group>
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
                                    </Col>
                                </Row>
                                <Row className="mb-4 align-items-center">
                                    <h5>Modalidade</h5>
                                    <Col xs={12}>
                                        <Form.Group>
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
                                    </Col>
                                </Row>

                                <Row className='mb-2 align-items-center'>
                                    <h5>Localização</h5>
                                    <span className='text-muted'>Estado</span>
                                    <Col xs={12} md={10}>
                                        <Form.Control
                                            as="select"
                                            style={{ width: '100%' }}
                                            value={selectedStateFilter}
                                            onChange={(e) => setSelectedStateFilter(e.target.value)}
                                        >
                                            <option value="">Selecione</option>
                                            {states.map((state) => (
                                                <option key={state.id} value={state.sigla}>
                                                    {state.nome}
                                                </option>
                                            ))}
                                        </Form.Control>
                                    </Col>
                                </Row>
                                <Row className='mb-4 align-items-center'>
                                    <span className='text-muted'>Cidade</span>
                                    <Col xs={12} md={10}>
                                        <Form.Control
                                            as="select"
                                            style={{ width: '100%' }}
                                            value={selectedCityFilter}
                                            onChange={(e) => setSelectedCityFilter(e.target.value)}
                                        >
                                            <option value="">Selecione</option>
                                            {cities.map((city) => (
                                                <option key={city.id} value={city.nome}>
                                                    {city.nome}
                                                </option>
                                            ))}
                                        </Form.Control>
                                    </Col>
                                </Row>
                                <Row className='mb-4 align-items-center'>
                                    <h5>PCD</h5>
                                    <Col xs={12} md={10}>
                                        <Form.Control
                                            as="select"
                                            style={{ width: '100%' }}
                                            value={filters.pcd}
                                            onChange={(e) => setFilters({ ...filters, pcd: e.target.value })}
                                        >
                                            <option value="">Selecione</option>
                                            <option value="true">Sim</option>
                                            <option value="false">Não</option>
                                        </Form.Control>
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
                        <Row className="mt-3">
                            {loading ? (
                                <div className="d-flex justify-content-center align-items-center">
                                    <Spinner animation="border" variant="primary" />
                                </div>
                            ) : currentItems.length > 0 ? (
                                <>
                                    <Col md={5} style={{ position: 'relative' }}>
                                        {currentItems.map(result => (
                                            <Card
                                                key={result._id}
                                                className={`vaga-card p-2 mb-4 border-0 shadow-sm rounded ${visuallySelectedJob && visuallySelectedJob._id === result._id ? 'vaga-card-selecionada shadow' : ''}`}
                                                onClick={() => {
                                                    if (window.innerWidth <= 768) {
                                                        // Chama o modal no mobile
                                                        handleCardClickMobile(result);
                                                    } else {
                                                        // Executa a ação normal no desktop
                                                        handleCardClick(result);
                                                    }
                                                }}
                                                style={{
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                <Card.Body>
                                                    <Card.Title>{result.title}</Card.Title>
                                                    <Card.Text>
                                                        {result.identifyCompany
                                                            ? 'Empresa confidencial'
                                                            : (result.company ? result.company.nome : 'Empresa não especificada')}
                                                    </Card.Text>
                                                    <Card.Text className="bg-light rounded text-center text-primary p-2">
                                                        <FontAwesomeIcon className="me-2" icon={faLocationDot} title="Localização" />
                                                        {result.location}
                                                    </Card.Text>
                                                    <Row className="mb-2">
                                                        <Col>
                                                            <Card.Text className="bg-light rounded text-center text-primary p-2">
                                                                <FontAwesomeIcon
                                                                    className="me-2"
                                                                    icon={result.modality === 'Remoto' ? faHome : result.modality === 'Presencial' ? faBuilding : faLaptopHouse}
                                                                    title="Modelo"
                                                                />
                                                                {result.modality}
                                                            </Card.Text>
                                                        </Col>
                                                        <Col>
                                                            <Card.Text className="bg-light rounded text-center text-primary p-2">
                                                                <FontAwesomeIcon className="me-2" icon={faBriefcase} title="Tipo" />
                                                                {result.type}
                                                            </Card.Text>
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Col>
                                                            <Card.Text className="bg-light rounded text-center text-primary p-2">
                                                                <FontAwesomeIcon className="me-2" icon={faMoneyBillWave} title="Salário" />
                                                                {result.salary ? result.salary : 'A combinar'}
                                                            </Card.Text>
                                                        </Col>
                                                        <Col>
                                                            {result.pcd && (
                                                                <Card.Text className="bg-light rounded text-center text-primary p-2">
                                                                    <FontAwesomeIcon className="me-2" icon={faWheelchair} title="PcD" />
                                                                    PcD
                                                                </Card.Text>
                                                            )}
                                                        </Col>
                                                    </Row>
                                                </Card.Body>
                                            </Card>
                                        ))}

                                        {/* Paginação */}
                                        {currentItems.length > 0 && (
                                            <div className="d-flex flex-row p-2" style={{ marginLeft: '6px' }}>
                                                <Button
                                                    className="btn-sm me-2 mb-2"
                                                    onClick={() => handlePageChange('prev')}
                                                    disabled={currentPage === 1}
                                                    variant="outline-primary"
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
                                                >
                                                    <FontAwesomeIcon icon={faChevronRight} />
                                                </Button>
                                            </div>
                                        )}
                                    </Col>

                                    {/* Detalhes da vaga à direita */}
                                    <Col md={7} className="coluna-detalhes-vagas" style={{ position: 'sticky', top: '10px', height: '100vh', zIndex: '1000', overflowY: 'hidden' }}>
                                        {loadingDetails ? (
                                            <div className="d-flex justify-content-center">
                                                <Spinner animation="border" variant="primary" />
                                            </div>
                                        ) : selectedJob ? (
                                            <>
                                                <Card className="vaga-detalhe p-0 border-0">
                                                    <Card.Body className="p-3 shadow-sm" style={{ zIndex: '1000' }}>
                                                        <Card.Title>{selectedJob.title}</Card.Title>
                                                        <Card.Text>
                                                            {selectedJob.identifyCompany ? 'Empresa confidencial' : (selectedJob.company ? selectedJob.company.nome : 'Empresa não informada')}
                                                        </Card.Text>
                                                        <Row className="mb-3">
                                                            <Col>
                                                                <Card.Text>
                                                                    <FontAwesomeIcon className="me-2" icon={faLocationDot} title="Localização" />
                                                                    {selectedJob.location}
                                                                </Card.Text>
                                                            </Col>
                                                        </Row>
                                                        <Row className="mb-3">
                                                            <Col>
                                                                <Card.Text>
                                                                    <FontAwesomeIcon
                                                                        className="me-2"
                                                                        icon={selectedJob.modality === 'Remoto' ? faHome : selectedJob.modality === 'Presencial' ? faBuilding : faLaptopHouse}
                                                                        title="Modelo"
                                                                    />
                                                                    {selectedJob.modality}
                                                                </Card.Text>
                                                            </Col>
                                                            <Col>
                                                                <Card.Text>
                                                                    <FontAwesomeIcon className="me-2" icon={faBriefcase} title="Tipo" />
                                                                    {selectedJob.type}
                                                                </Card.Text>
                                                            </Col>
                                                            <Col>
                                                                <Card.Text>
                                                                    <FontAwesomeIcon className="me-2" icon={faMoneyBillWave} title="Salário" />
                                                                    {selectedJob.salary ? selectedJob.salary : 'A combinar'}
                                                                </Card.Text>
                                                            </Col>
                                                            <Col>
                                                                {selectedJob.pcd && (
                                                                    <Card.Text>
                                                                        <FontAwesomeIcon className="me-2" icon={faWheelchair} title="PcD" />
                                                                        PcD
                                                                    </Card.Text>
                                                                )}
                                                            </Col>
                                                        </Row>
                                                        <Col md={4} className="justify-content-center">
                                                            <Button onClick={handleCandidatarClick}>
                                                                Candidatar-se <FontAwesomeIcon icon={faUpRightFromSquare} title="Link" />
                                                            </Button>
                                                        </Col>
                                                    </Card.Body>
                                                    <Card.Body style={{ maxHeight: '60vh', height: 'auto', overflowY: 'auto' }} className="shadow-sm rounded">
                                                        {selectedJob.offers || selectedJob.description || selectedJob.responsibilities || selectedJob.qualifications || selectedJob.requiriments || selectedJob.additionalInfo ? (
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
                                                            </>
                                                        ) : (
                                                            <Card.Text>Nenhuma informação adicional informada.</Card.Text>
                                                        )}
                                                    </Card.Body>
                                                </Card>
                                            </>
                                        ) : null}
                                    </Col>
                                    {/* Modal para os detalhes da vaga no mobile */}
                                    <Modal show={showJobModal} onHide={handleCloseJobModal} centered>
                                        {loadingDetails ? (
                                            <div className="d-flex justify-content-center align-items-center p-4">
                                                <Spinner animation="border" variant="primary" />
                                            </div>
                                        ) : selectedJob ? (
                                            <>
                                                <Modal.Header closeButton>
                                                    <Modal.Title>Detalhes da vaga</Modal.Title>
                                                </Modal.Header>
                                                <Modal.Body>
                                                    {selectedJob ? (
                                                        <>
                                                            <Card className="vaga-detalhe border-0">
                                                                <Card.Body className="p-0">
                                                                    <Card.Title>{selectedJob.title}</Card.Title>
                                                                    <Card.Text>{selectedJob.company ? selectedJob.company.nome : 'Empresa confidencial'}</Card.Text>
                                                                    <Row className="mb-2">
                                                                        <Col>
                                                                            <Card.Text>
                                                                                <FontAwesomeIcon style={{ width: '14px' }} className="me-2" icon={faLocationDot} title="Localização" />
                                                                                {selectedJob.location}
                                                                            </Card.Text>
                                                                        </Col>
                                                                    </Row>
                                                                    <Row className="mb-3 d-flex">
                                                                        <Col className="mb-2">
                                                                            <Card.Text>
                                                                                <FontAwesomeIcon
                                                                                    className="me-2"
                                                                                    icon={selectedJob.modality === 'Remoto' ? faHome : selectedJob.modality === 'Presencial' ? faBuilding : faLaptopHouse}
                                                                                    title="Modelo"
                                                                                    style={{ width: '14px' }}
                                                                                />
                                                                                {selectedJob.modality}
                                                                            </Card.Text>
                                                                        </Col>
                                                                        <Col className="mb-2">
                                                                            <Card.Text>
                                                                                <FontAwesomeIcon className="me-2" icon={faBriefcase} title="Tipo" style={{ width: '14px' }} />
                                                                                {selectedJob.type}
                                                                            </Card.Text>
                                                                        </Col>
                                                                        <Col className="mb-2">
                                                                            <Card.Text>
                                                                                <FontAwesomeIcon className="me-2" icon={faMoneyBillWave} title="Salário" style={{ width: '14px' }} />
                                                                                {selectedJob.salary ? selectedJob.salary : 'A combinar'}
                                                                            </Card.Text>
                                                                        </Col>
                                                                        <Col>
                                                                            {selectedJob.pcd && (
                                                                                <Card.Text>
                                                                                    <FontAwesomeIcon className="me-2" icon={faWheelchair} title="PcD" style={{ width: '14px' }} />
                                                                                    PcD
                                                                                </Card.Text>
                                                                            )}
                                                                        </Col>
                                                                    </Row>
                                                                    <Col md={4} className="justify-content-center">
                                                                        <Button onClick={handleSubmeterCurriculo}>
                                                                            {loadingSubmit ? (
                                                                                <div className="d-flex justify-content-center align-items-center">
                                                                                    <Spinner animation="border" variant="primary" />
                                                                                </div>
                                                                            ) : (
                                                                                <span>Enviar currículo</span>
                                                                            )}
                                                                        </Button>
                                                                    </Col>
                                                                </Card.Body>
                                                                <Card.Body className="p-0 mt-2">
                                                                    {selectedJob.offers || selectedJob.description || selectedJob.responsibilities || selectedJob.qualifications || selectedJob.requiriments || selectedJob.additionalInfo ? (
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
                                                                        </>
                                                                    ) : (
                                                                        <Card.Text>Nenhuma informação adicional informada.</Card.Text>
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
                                            </>
                                        ) : null}
                                    </Modal>
                                </>
                            ) : (
                                <p className="text-muted text-center">Nenhuma vaga encontrada.</p>
                            )}
                        </Row>
                    </Col>
                </Row>
            </Container >
        </>
    );
}

export default BuscarVagas;
