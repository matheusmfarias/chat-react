import React, { useEffect, useState, useMemo, useCallback } from "react";
import HeaderCandidato from "../HeaderCandidato/HeaderCandidato";
import { useLocation, useNavigate } from 'react-router-dom';
import { Row, Col, Card, Container, Button, Form, InputGroup, Spinner } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBriefcase, faBuilding, faChevronLeft, faChevronRight, faHome, faLaptopHouse, faLocationDot, faMoneyBillWave, faUpRightFromSquare, faWheelchair, faSearch, faFilter, faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import './BuscarVagas.css';
import axios from "axios";

const BuscarVagas = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingDetails, setLoadingDetails] = useState(false); // Carregamento dos detalhes da vaga (coluna direita)
    const keyword = location.state?.keyword || '';
    const results = useMemo(() => location.state?.results || [], [location.state]);
    const [selectedJob, setSelectedJob] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Estados para busca e filtros
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

    // Estado para controle dos filtros visíveis
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        // Realiza a busca no backend apenas se o keyword não for vazio
        if (keyword) {
            const fetchJobs = async () => {
                try {
                    const token = localStorage.getItem('token');
                    const response = await axios.get(`http://localhost:5000/api/jobsSearch?keyword=${keyword}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setJobs(response.data);
                } catch (error) {
                    console.error('Erro ao buscar vagas:', error);
                } finally {
                    setLoading(false);
                }
            };

            fetchJobs();  // Executa a busca no backend
        }
    }, [keyword]);  // O useEffect é disparado apenas quando o keyword muda

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

    // Função para buscar vagas com base nos filtros de cargo e filtros aplicados
    const handleSearchByJob = useCallback(async () => {
        const params = new URLSearchParams();

        // Busca por cargo (termo digitado)
        if (searchTerm.trim()) {
            params.append('keyword', searchTerm);
        }

        // Filtros aplicados
        if (selectedStateFilter) params.append('state', selectedStateFilter);
        if (selectedCityFilter) params.append('city', selectedCityFilter);
        if (filters.modality) params.append('modality', filters.modality);
        if (filters.type) params.append('type', filters.type);
        if (filters.pcd) params.append('pcd', filters.pcd);

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:5000/api/jobsSearch?${params.toString()}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            navigate('/buscar-vagas', { state: { results: response.data } });
        } catch (error) {
            console.error('Erro ao buscar vagas:', error);
        } finally {
            setLoading(false);
        }
    }, [searchTerm, selectedStateFilter, selectedCityFilter, filters, navigate]);

    // Atualização na busca enquanto o usuário digita
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            handleSearchByJob();
        }, 500); // Aguarda 500ms após o usuário parar de digitar

        return () => clearTimeout(timeoutId); // Limpa o timeout anterior a cada nova digitação
    }, [searchTerm, selectedStateFilter, selectedCityFilter, filters, handleSearchByJob]);

    // Função para resetar a busca
    const handleResetSearch = () => {
        setSearchTerm(''); // Limpa o termo de busca
        setSelectedStateFilter('');
        setSelectedCityFilter('');
        setFilters({ modality: '', type: '', pcd: '' });
        setJobs([]); // Limpa as vagas
        handleSearchByJob(); // Executa a busca com todos os filtros resetados
    };

    const handleCandidatarClick = () => {
        navigate('/detalhes-vaga', { state: { job: selectedJob } });
    };

    useEffect(() => {
        if (results.length > 0) {
            setSelectedJob(results[0]);
        }
    }, [results]);

    const handleCardClick = async (job) => {
        setLoadingDetails(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:5000/api/jobsSearch/${job._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSelectedJob(response.data);
        } catch (error) {
            console.error('Erro ao buscar detalhes da vaga:', error);
        } finally {
            setLoadingDetails(false);
        }
    };


    const totalPages = Math.ceil(results.length / itemsPerPage);

    const handlePageChange = (direction) => {
        if (direction === 'next' && currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        } else if (direction === 'prev' && currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = results.slice(startIndex, endIndex);

    useEffect(() => {
        const firstJobOnPage = results.slice(startIndex, startIndex + itemsPerPage)[0];
        setSelectedJob(firstJobOnPage);
    }, [currentPage, results, itemsPerPage]);

    // Funções para resetar filtros individualmente
    const resetStateFilter = () => {
        setSelectedStateFilter('');
        setCities([]);
    };

    const resetCityFilter = () => {
        setSelectedCityFilter('');
    };

    const resetModalityFilter = () => {
        setFilters(prevFilters => ({ ...prevFilters, modality: '' }));
    };

    const resetTypeFilter = () => {
        setFilters(prevFilters => ({ ...prevFilters, type: '' }));
    };

    const resetPcdFilter = () => {
        setFilters(prevFilters => ({ ...prevFilters, pcd: '' }));
    };

    return (
        <>
            <HeaderCandidato />
            <Container className="mt-3">
                {/* Barra de busca e filtros */}
                <Row className="mb-4 justify-content-center">
                    <Col md={10} style={{ position: 'relative' }}> {/* Container relativo para o ícone */}
                        <InputGroup className="rounded">
                            <Form.Control
                                type="text"
                                placeholder="Pesquisar por cargos, cidade, modelo..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="border-primary shadow"
                                style={{ paddingRight: '40px' }} // Espaço para o ícone de reset
                            />
                            {searchTerm && (
                                <FontAwesomeIcon
                                    icon={faTimesCircle}
                                    onClick={handleResetSearch}
                                    title="Limpar busca"
                                    style={{
                                        position: 'absolute',
                                        left: '770px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        cursor: 'pointer',
                                        color: '#d33',
                                    }}
                                />
                            )}
                            <Button variant="light" className="btn-outline-primary rounded-end w-auto px-5 shadow">
                                <FontAwesomeIcon icon={faSearch} />
                            </Button>
                            {/* Botão para abrir/fechar filtros */}
                            <Button variant="light" onClick={() => setShowFilters(!showFilters)} className="btn-outline-primary w-auto px-5 ms-2 rounded shadow">
                                <FontAwesomeIcon icon={faFilter} /> Filtrar
                            </Button>
                        </InputGroup>
                    </Col>
                </Row>

                {/* Filtros */}
                {showFilters && (
                    <>
                        <Row className="mb-3 align-items-center justify-content-center">
                            <Col xs={12} md={2} className="d-flex align-items-center">
                                <Form.Control
                                    as="select"
                                    value={selectedStateFilter}
                                    onChange={(e) => setSelectedStateFilter(e.target.value)}
                                >
                                    <option value="">Selecione o estado</option>
                                    {states.map((state) => (
                                        <option key={state.id} value={state.sigla}>
                                            {state.nome}
                                        </option>
                                    ))}
                                </Form.Control>
                                {selectedStateFilter && (
                                    <FontAwesomeIcon icon={faTimesCircle} className="icon-reset" onClick={resetStateFilter} title="Resetar Estado" />
                                )}
                            </Col>
                            <Col xs={12} md={2} className="d-flex align-items-center">
                                <Form.Control
                                    as="select"
                                    value={selectedCityFilter}
                                    onChange={(e) => setSelectedCityFilter(e.target.value)}
                                    disabled={!selectedStateFilter}
                                >
                                    <option value="">Selecione a cidade</option>
                                    {cities.map((city) => (
                                        <option key={city.id} value={city.nome}>
                                            {city.nome}
                                        </option>
                                    ))}
                                </Form.Control>
                                {selectedCityFilter && (
                                    <FontAwesomeIcon icon={faTimesCircle} className="icon-reset" onClick={resetCityFilter} title="Resetar Cidade" />
                                )}
                            </Col>
                            <Col xs={12} md={2} className="d-flex align-items-center">
                                <Form.Control
                                    as="select"
                                    value={filters.modality}
                                    onChange={(e) => setFilters({ ...filters, modality: e.target.value })}
                                >
                                    <option value="">Modalidade</option>
                                    <option value="Presencial">Presencial</option>
                                    <option value="Híbrido">Híbrido</option>
                                    <option value="Remoto">Remoto</option>
                                </Form.Control>
                                {filters.modality && (
                                    <FontAwesomeIcon icon={faTimesCircle} className="icon-reset" onClick={resetModalityFilter} title="Resetar Modalidade" />
                                )}
                            </Col>
                            <Col xs={12} md={2} className="d-flex align-items-center">
                                <Form.Control
                                    as="select"
                                    value={filters.type}
                                    onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                                >
                                    <option value="">Tipo</option>
                                    <option value="Efetivo">Efetivo</option>
                                    <option value="Aprendiz">Aprendiz</option>
                                    <option value="Estágio">Estágio</option>
                                    <option value="Pessoa Jurídica">Pessoa Jurídica</option>
                                    <option value="Trainee">Trainee</option>
                                    <option value="Temporário">Temporário</option>
                                    <option value="Freelancer">Freelancer</option>
                                    <option value="Terceiro">Terceiro</option>
                                </Form.Control>
                                {filters.type && (
                                    <FontAwesomeIcon icon={faTimesCircle} className="icon-reset" onClick={resetTypeFilter} title="Resetar Tipo" />
                                )}
                            </Col>
                            <Col xs={12} md={2} className="d-flex align-items-center">
                                <Form.Control
                                    as="select"
                                    value={filters.pcd}
                                    onChange={(e) => setFilters({ ...filters, pcd: e.target.value })}
                                >
                                    <option value="">PCD</option>
                                    <option value="true">Sim</option>
                                    <option value="false">Não</option>
                                </Form.Control>
                                {filters.pcd && (
                                    <FontAwesomeIcon icon={faTimesCircle} className="icon-reset" onClick={resetPcdFilter} title="Resetar PCD" />
                                )}
                            </Col>
                        </Row>
                    </>
                )}

                <Row className="justify-content-center">
                    {loading ? (
                        <div className="d-flex justify-content-center">
                            <Spinner animation="border" variant="primary" />
                        </div>
                    ) : currentItems.length > 0 ? (
                        <>
                            <Col md={4} style={{ position: 'relative' }} className="p-2">
                                {currentItems.map(result => (
                                    <Card
                                        key={result._id}
                                        className={`vaga-card p-2 mb-4 border-0 shadow-sm rounded ${selectedJob && selectedJob._id === result._id ? 'vaga-card-selecionada shadow-lg' : ''
                                            }`}
                                        onClick={() => handleCardClick(result)}
                                        style={{
                                            cursor: 'pointer',
                                            position: selectedJob && selectedJob._id === result._id ? 'sticky' : 'static',
                                            top: selectedJob && selectedJob._id === result._id ? '16px' : 'auto',
                                            zIndex: selectedJob && selectedJob._id === result._id ? '1000' : 'auto',
                                        }}
                                    >
                                        <Card.Body>
                                            <Card.Title>{result.title}</Card.Title>
                                            <Card.Text>{result.company ? result.company.nome : 'Empresa confidencial'}</Card.Text>
                                            <Card.Text className="bg-light rounded text-center text-primary p-2">
                                                <FontAwesomeIcon icon={faLocationDot} title="Localização" className="mr-2" />
                                                {result.location}
                                            </Card.Text>
                                            <Row className="mb-2">
                                                <Col>
                                                    <Card.Text className="bg-light rounded text-center text-primary p-2">
                                                        <FontAwesomeIcon
                                                            className="mr-2"
                                                            icon={result.modality === 'Remoto' ? faHome : result.modality === 'Presencial' ? faBuilding : faLaptopHouse}
                                                            title="Modelo"
                                                        />
                                                        {result.modality}
                                                    </Card.Text>
                                                </Col>
                                                <Col>
                                                    <Card.Text className="bg-light rounded text-center text-primary p-2">
                                                        <FontAwesomeIcon className="mr-2" icon={faBriefcase} title="Tipo" />
                                                        {result.type}
                                                    </Card.Text>
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col>
                                                    <Card.Text className="bg-light rounded text-center text-primary p-2">
                                                        <FontAwesomeIcon className="mr-2" icon={faMoneyBillWave} title="Salário" />
                                                        {result.salary ? result.salary : 'A combinar'}
                                                    </Card.Text>
                                                </Col>
                                                <Col>
                                                    {result.pcd && (
                                                        <Card.Text className="bg-light rounded text-center text-primary p-2">
                                                            <FontAwesomeIcon icon={faWheelchair} title="PcD" />
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
                                    <div className="d-flex justify-content-center align-items-center mt-4">
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
                            <Col md={6} style={{ position: 'sticky', top: '10px', height: '100vh', zIndex: '1000', overflowY: 'hidden' }}>
                                <Card className="vaga-detalhe border-0">
                                    {loadingDetails ? (
                                        <div className="d-flex justify-content-center">
                                            <Spinner animation="border" variant="primary" />
                                        </div>
                                    ) : selectedJob ? (
                                        <>
                                            <Card.Body className="shadow rounded">
                                                <Card.Title>{selectedJob.title}</Card.Title>
                                                <Card.Text>{selectedJob.company ? selectedJob.company.nome : 'Empresa confidencial'}</Card.Text>
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
                                            <Card.Body style={{ maxHeight: '60vh', height: 'auto', overflowY: 'auto' }} className="shadow rounded">
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
                                        </>
                                    ) : null}
                                </Card>
                            </Col>
                        </>
                    ) : (
                        <p className="text-muted text-center">Nenhuma vaga encontrada.</p>
                    )}
                </Row>
            </Container >
        </>
    );
}

export default BuscarVagas;
