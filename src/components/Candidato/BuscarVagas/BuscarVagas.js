import React, { useEffect, useState, useMemo, useCallback } from "react";
import HeaderCandidato from "../HeaderCandidato/HeaderCandidato";
import { useLocation, useNavigate } from 'react-router-dom';
import { Row, Col, Card, Container, Button, Form, InputGroup, Spinner } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBriefcase, faBuilding, faChevronLeft, faChevronRight, faHome, faLaptopHouse, faLocationDot, faMoneyBillWave, faUpRightFromSquare, faWheelchair, faSearch, faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import './BuscarVagas.css';
import axios from "axios";

const BuscarVagas = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingDetails, setLoadingDetails] = useState(false);
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
        setSelectedStateFilter('');
        setSelectedCityFilter('');
        setFilters({ modality: '', type: '', pcd: '' });
        setJobs([]); // Limpa as vagass
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

    const handleClearSearch = () => {
        setSearchTerm("");
        setCurrentPage(1); // Reseta para a primeira página
    };

    return (
        <>
            <HeaderCandidato />
            <Container fluid className='px-5' style={{ backgroundColor: '#f9f9f9f9' }}>
                <Row style={{ paddingLeft: '90px', paddingRight: '90px' }}>
                    <Col xs={2} className='mt-4 mb-4' style={{ position: 'sticky', top: '10px', height: '100vh', zIndex: '1000', overflowY: 'hidden' }}>
                        <Row className='mb-4 align-items-center'>
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
                            <Col md={2} className='p-0'>
                                {filters.type.length > 0 && (
                                    <FontAwesomeIcon icon={faTimesCircle} className="icon-reset" onClick={resetTypeFilter} title="Resetar Tipo" />
                                )}
                            </Col>
                        </Row>
                        <Row className='mb-4 align-items-center'>
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
                            <Col md={2} className='p-0'>
                                {filters.modality.length > 0 && (
                                    <FontAwesomeIcon icon={faTimesCircle} className="icon-reset" onClick={resetModalityFilter} title="Resetar Modalidade" />
                                )}
                            </Col>
                        </Row>
                        <Row className='mb-2 align-items-center'>
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
                            <Col md={2} className='p-0'>
                                {selectedStateFilter && (
                                    <FontAwesomeIcon icon={faTimesCircle} className="icon-reset" onClick={resetStateFilter} title="Resetar Estado" />
                                )}
                            </Col>
                        </Row>
                        <Row className='mb-4 align-items-center'>
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
                            <Col md={2} className='p-0'>
                                {selectedCityFilter && (
                                    <FontAwesomeIcon icon={faTimesCircle} className="icon-reset" onClick={resetCityFilter} title="Resetar Cidade" />
                                )}
                            </Col>
                        </Row>
                        <Row className='mb-4 align-items-center'>
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
                            <Col md={2} className='p-0'>
                                {filters.pcd && (
                                    <FontAwesomeIcon icon={faTimesCircle} className="icon-reset" onClick={resetPcdFilter} title="Resetar PCD" />
                                )}
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
                    <Col md={10} className='mt-4'>
                        <Row className='align-items-center' >
                            <InputGroup style={{ maxWidth: '800px' }}>
                                <Form.Control
                                    type="text"
                                    className='shadow border-0'
                                    placeholder="Pesquisar por cargos, cidade, modelo..."
                                    aria-label="Pesquisar"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                                <Button variant="outline-primary" style={{ maxWidth: '100px' }}>
                                    <FontAwesomeIcon icon={faSearch} />
                                </Button>
                            </InputGroup>
                            <Col md={2}>
                                <Button
                                    variant="outline-secondary"
                                    onClick={() => handleClearSearch()}
                                    title="Limpar filtros"
                                    style={{ width: '200px' }}
                                >
                                    Limpar busca
                                </Button>
                            </Col>
                        </Row>
                        <Row className="mt-3">
                            {loading ? (
                                <div className="d-flex justify-content-center">
                                    <Spinner animation="border" variant="primary" />
                                </div>
                            ) : currentItems.length > 0 ? (
                                <>
                                    <Col md={4} style={{ position: 'relative' }}>
                                        {currentItems.map(result => (
                                            <Card
                                                key={result._id}
                                                className={`vaga-card p-2 mb-4 border-0 shadow-sm rounded ${selectedJob && selectedJob._id === result._id ? 'vaga-card-selecionada shadow-lg' : ''}`}
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
                                                    <Card.Text>
                                                        {result.identifyCompany ? (
                                                            result.company ? result.company.nome : 'Empresa não específicada'
                                                        ) : (
                                                            'Empresa confidencial'
                                                        )}
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
                                    <Col md={8} style={{ position: 'sticky', top: '10px', height: '100vh', zIndex: '1000', overflowY: 'hidden' }}>
                                        {loadingDetails ? (
                                            <div className="d-flex justify-content-center">
                                                <Spinner animation="border" variant="primary" />
                                            </div>
                                        ) : selectedJob ? (
                                            <>
                                                <Card className="vaga-detalhe p-0 border-0">
                                                    <Card.Body className="p-3 shadow-sm" style={{ zIndex: '1000' }}>
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
                                </>
                            ) : (
                                <p className="text-muted text-center">Nenhuma vaga encontrada.</p>
                            )}
                        </Row>
                    </Col>
                </Row >
            </Container >
        </>
    );
}

export default BuscarVagas;
