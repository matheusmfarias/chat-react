import React, { useCallback, useEffect, useState } from "react";
import api from '../../../services/axiosConfig';
import HeaderCandidato from "../HeaderCandidato/HeaderCandidato";
import { Container, Row, Col, Card, InputGroup, Form, Button, Modal } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBriefcase, faBuilding, faChevronLeft, faChevronRight, faFilter, faFilterCircleXmark, faHome, faLaptopHouse, faLocationDot, faMoneyBillWave, faSearch, faTimesCircle, faWheelchair } from "@fortawesome/free-solid-svg-icons";
import Skeleton from "react-loading-skeleton";
import Select from 'react-select';

const InscricoesCandidato = () => {
    const [loading, setLoading] = useState(true);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [activeTab, setActiveTab] = useState('andamento');
    const [applications, setApplications] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [totalApplications, setTotalApplications] = useState(0);
    const itemsPerPage = 9;

    const [showFilterModal, setShowFilterModal] = useState(false);
    const handleOpenFilterModal = () => setShowFilterModal(true);
    const handleCloseFilterModal = () => setShowFilterModal(false);

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

    const [selectedApplication, setSelectedApplication] = useState(null);
    const [showApplicationModal, setShowApplicationModal] = useState(false);

    const SkeletonCard = () => (
        <Row className="mt-4">
            {Array.from({ length: 9 }).map((_, index) => (
                <Col key={index} className="mb-4 d-flex" md={6} xl={4}>
                    <Card className="w-100 border-0 shadow-sm rounded p-2 d-flex flex-column">
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
        document.title = "ACI Empregos | Inscrições";
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

        if (searchTerm.trim()) params.append('searchTerm', searchTerm);

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

    const fetchUserApplications = useCallback(async () => {
        const params = buildFilters(filters, selectedStateFilter, selectedCityFilter, searchTerm);

        params.append('page', currentPage || 1);
        params.append('limit', itemsPerPage || 9);

        if (activeTab === 'andamento') {
            params.append('status', 'true');
        } else if (activeTab === 'encerrada') {
            params.append('status', 'false');
        }

        try {
            const token = localStorage.getItem("token");
            const response = await api.get(`${process.env.REACT_APP_API_URL}/api/user/applications?${params.toString()}`, {
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

    }, [activeTab, searchTerm, selectedStateFilter, selectedCityFilter, filters, currentPage, itemsPerPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedStateFilter, selectedCityFilter, filters]);

    // Atualização na busca enquanto o usuário digita
    useEffect(() => {
        setLoading(true);
        const timeoutId = setTimeout(() => {
            fetchUserApplications();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, fetchUserApplications]);

    // Função para resetar o filtro
    const handleResetFilter = () => {
        setLoading(true);
        setSelectedStateFilter('');
        setSelectedCityFilter('');
        setFilters({ modality: '', type: '', pcd: '' });
        setApplications([]);
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

    const handleCloseApplicationModal = () => setShowApplicationModal(false);

    return (
        <>
            <HeaderCandidato />
            <Container fluid>
                <Row className="mt-lg-3 mt-2">
                    <h1>Minhas Inscrições</h1>
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
                                    <span>Estado</span>
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
                                        placeholder="Selecione"
                                        menuPortalTarget={document.body}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-2">
                                    <span>Cidade</span>
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
                                        placeholder="Selecione"
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
                                        onChange={(e) => setSearchTerm(e.target.value)}
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
                        <Col md={12} lg={8} className="mt-1">
                            <div className='tabs-curriculo'>
                                <button
                                    className={activeTab === 'andamento' ? 'active' : ''}
                                    style={{ width: '100%' }}
                                    onClick={() => {
                                        setActiveTab('andamento');
                                        setCurrentPage(1); // Reiniciar para a primeira página
                                    }}
                                >
                                    Em andamento
                                </button>
                                <button
                                    className={activeTab === 'encerrada' ? 'active' : ''}
                                    style={{ width: '100%' }}
                                    onClick={() => {
                                        setActiveTab('encerrada');
                                        setCurrentPage(1); // Reiniciar para a primeira página
                                    }}
                                >
                                    Encerradas
                                </button>
                            </div>
                        </Col>
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
                                            <span>Estado</span>
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
                                                placeholder="Selecione"
                                            />
                                        </Form.Group>
                                        <Form.Group className="mb-2">
                                            <span>Cidade</span>
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
                                                placeholder="Selecione"
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
                        ) : applications.length > 0 ? (
                            <>
                                <Row className="mt-4">
                                    {applications.map((application) => (
                                        <>
                                            <Col md={6} xxl={4} key={application._id} className="mb-4 d-flex">
                                                <Card
                                                    key={application._id}
                                                    className={`w-100 border-0 shadow-sm rounded p-2 d-flex flex-column candidate-card ${application.job && !application.job.status ? 'bg-light text-muted' : ''}`}
                                                    onClick={() => handleCardClick(application)}
                                                    style={{ cursor: 'pointer' }}>
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
                                        </>
                                    ))}
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
                    <Modal show={showApplicationModal} onHide={handleCloseApplicationModal} centered dialogClassName="modal-dialog-scrollable">
                        <Modal.Header closeButton>
                            <Modal.Title>Detalhes da vaga</Modal.Title>
                        </Modal.Header>
                        <Modal.Body className="p-0">
                            <Card className="border-0">
                                <Card.Body>
                                    {loadingDetails ? (
                                        <>
                                            <Skeleton height={30} width="60%" className="mb-2" />
                                            <Skeleton height={20} width="40%" className="mb-4" />
                                            <Skeleton height={20} width="50%" className="mb-3" />
                                            <Skeleton height={20} width="80%" className="mb-5" />
                                            <Skeleton height={20} width="80%" className="mb-3" />
                                            <Skeleton height={20} width="60%" className="mb-4" />
                                            <Skeleton height={20} width="80%" className="mb-3" />
                                            <Skeleton height={20} width="60%" className="mb-4" />
                                            <Skeleton height={20} width="80%" className="mb-3" />
                                            <Skeleton height={20} width="60%" className="mb-4" />
                                            <Skeleton height={20} width="80%" className="mb-3" />
                                            <Skeleton height={20} width="60%" className="mb-4" />
                                        </>
                                    ) : selectedApplication && selectedApplication.job ? (
                                        <>
                                            <div className="d-flex flex-row align-items-center">
                                                <Card.Title className="mb-0 me-2">{selectedApplication.job.title}</Card.Title>
                                                {selectedApplication.job.pcd && (
                                                    <FontAwesomeIcon icon={faWheelchair} title="PcD" className="text-primary" />
                                                )}
                                            </div>
                                            <Card.Text className='mt-2'>
                                                {selectedApplication.job.identifyCompany ? 'Empresa confidencial' : (selectedApplication.job.company ? selectedApplication.job.company.nome : 'Empresa não informada')}
                                            </Card.Text>
                                            <Row>
                                                <Card.Text>
                                                    <FontAwesomeIcon className="me-2" icon={faLocationDot} title="Localização" />
                                                    {selectedApplication.job.location}
                                                </Card.Text>
                                            </Row>
                                            <Row>
                                                <Col>
                                                    <div className="d-flex flex-row mt-2">
                                                        <Card.Text className="me-4">
                                                            <FontAwesomeIcon
                                                                className="me-2"
                                                                icon={selectedApplication.job.modality === 'Remoto' ? faHome : selectedApplication.job.modality === 'Presencial' ? faBuilding : faLaptopHouse}
                                                                title="Modelo"
                                                            />
                                                            {selectedApplication.job.modality}
                                                        </Card.Text>
                                                        <Card.Text className="me-4">
                                                            <FontAwesomeIcon className="me-2" icon={faBriefcase} title="Tipo" />
                                                            {selectedApplication.job.type}
                                                        </Card.Text>
                                                        <Card.Text>
                                                            <FontAwesomeIcon className="me-2" icon={faMoneyBillWave} title="Salário" />
                                                            {selectedApplication.job.salary ? selectedApplication.job.salary : 'A combinar'}
                                                        </Card.Text>
                                                    </div>
                                                </Col>
                                            </Row>
                                            {selectedApplication.job ? (
                                                <>
                                                    {selectedApplication.job.offers && (
                                                        <>
                                                            <Card.Title>Benefícios</Card.Title>
                                                            <Card.Text dangerouslySetInnerHTML={{ __html: selectedApplication.job.offers }} />
                                                        </>
                                                    )}
                                                    {selectedApplication.job.description && (
                                                        <>
                                                            <Card.Title>Descrição</Card.Title>
                                                            <Card.Text dangerouslySetInnerHTML={{ __html: selectedApplication.job.description }} />
                                                        </>
                                                    )}
                                                    {selectedApplication.job.responsibilities && (
                                                        <>
                                                            <Card.Title>Responsabilidades e atribuições</Card.Title>
                                                            <Card.Text dangerouslySetInnerHTML={{ __html: selectedApplication.job.responsibilities }} />
                                                        </>
                                                    )}
                                                    {selectedApplication.job.qualifications && (
                                                        <>
                                                            <Card.Title>Requisitos e qualificações</Card.Title>
                                                            <Card.Text dangerouslySetInnerHTML={{ __html: selectedApplication.job.qualifications }} />
                                                        </>
                                                    )}
                                                    {selectedApplication.job.requiriments && (
                                                        <>
                                                            <Card.Title>Será um diferencial</Card.Title>
                                                            <Card.Text dangerouslySetInnerHTML={{ __html: selectedApplication.job.requiriments }} />
                                                        </>
                                                    )}
                                                    {selectedApplication.job.additionalInfo && (
                                                        <>
                                                            <Card.Title>Informações adicionais</Card.Title>
                                                            <Card.Text dangerouslySetInnerHTML={{ __html: selectedApplication.job.additionalInfo }} />
                                                        </>
                                                    )}
                                                </>
                                            ) : (
                                                <Card.Text>Nenhuma informação adicional informada.</Card.Text>
                                            )}
                                        </>
                                    ) : (
                                        <p>Carregando detalhes...</p>
                                    )}
                                </Card.Body>
                            </Card>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={handleCloseApplicationModal}>
                                Fechar
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </Row>
            </Container>
        </>
    );
};

export default InscricoesCandidato;
