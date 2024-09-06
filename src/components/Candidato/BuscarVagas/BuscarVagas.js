import React, { useEffect, useState, useMemo, useCallback } from "react";
import HeaderCandidato from "../HeaderCandidato/HeaderCandidato";
import { useLocation, useNavigate } from 'react-router-dom';
import { Row, Col, Card, Container, Button, Form, InputGroup } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBriefcase, faBuilding, faChevronLeft, faChevronRight, faHome, faLaptopHouse, faLocationDot, faMoneyBillWave, faUpRightFromSquare, faWheelchair, faSearch, faFilter, faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import './BuscarVagas.css'; 
import axios from "axios";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const BuscarVagas = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const results = useMemo(() => location.state?.results || [], [location.state]);
    const [selectedJob, setSelectedJob] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Estados para busca e filtros
    const [searchTerm, setSearchTerm] = useState('');
    const [filterParam, setFilterParam] = useState(''); // Filtros como cidade, estado, tipo, modalidade

    // Estado para controle dos filtros visíveis
    const [showFilters, setShowFilters] = useState(false); 
    const [selectedStateFilter, setSelectedStateFilter] = useState('');
    const [selectedCityFilter, setSelectedCityFilter] = useState('');
    const [filters, setFilters] = useState({
        modality: '',
        type: '',
        pcd: '',
    });

    // Função para buscar vagas com base nos filtros
    const handleSearch = useCallback(async () => {
        const params = new URLSearchParams();
        if (searchTerm.trim()) {
            params.append('keyword', searchTerm); // Busca por cargo
        }
        if (filterParam.trim()) {
            params.append('filter', filterParam); // Filtro por cidade, estado, tipo, modalidade
        }

        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:5000/api/jobsSearch?${params.toString()}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            navigate('/buscar-vagas', { state: { results: response.data } });
        } catch (error) {
            console.error('Erro ao buscar vagas:', error);
            toast.error('Erro ao buscar vagas. Tente novamente mais tarde.');
        }
    }, [searchTerm, filterParam, navigate]);

    const handleFilter = useCallback(async () => {
        const params = new URLSearchParams();
        if (filterParam.trim()) {
            params.append('filter', filterParam); // Filtro por cidade, estado, tipo, modalidade
        }

        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:5000/api/jobsSearch?${params.toString()}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            navigate('/buscar-vagas', { state: { results: response.data } });
        } catch (error) {
            console.error('Erro ao aplicar filtros:', error);
            toast.error('Erro ao aplicar filtros. Tente novamente mais tarde.');
        }
    }, [filterParam, navigate]);

    const handleCandidatarClick = () => {
        navigate('/detalhes-vaga', { state: { job: selectedJob } });
    };

    useEffect(() => {
        if (results.length > 0) {
            setSelectedJob(results[0]);
        }
    }, [results]);

    const handleCardClick = (job) => {
        setSelectedJob(job);
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
        const startIndex = (currentPage - 1) * itemsPerPage;
        const firstJobOnPage = results.slice(startIndex, startIndex + itemsPerPage)[0];
        setSelectedJob(firstJobOnPage);
    }, [currentPage, results, itemsPerPage]);

    // Funções para resetar filtros individualmente
    const resetStateFilter = () => {
        setSelectedStateFilter('');
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
                    <Col md={10}>
                        <InputGroup className="shadow">
                            <Form.Control
                                type="text"
                                placeholder="Pesquisar por cargos..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="rounded-start border-primary"
                            />
                            <Form.Control
                                type="text"
                                placeholder="Cidade, estado, tipo ou modelo"
                                value={filterParam}
                                onChange={e => setFilterParam(e.target.value)}
                                className="rounded-0 border-primary"
                            />
                            <Button variant="light" onClick={handleSearch} className="btn-outline-primary rounded-end w-auto px-5">
                                <FontAwesomeIcon icon={faSearch} />
                            </Button>
                            {/* Botão para abrir/fechar filtros */}
                            <Button variant="light" onClick={() => setShowFilters(!showFilters)} className="btn-outline-primary w-auto px-5 ms-2">
                                <FontAwesomeIcon icon={faFilter} /> Filtrar
                            </Button>
                        </InputGroup>
                    </Col>
                </Row>

                {/* Filtros */}
                {showFilters && (
                    <Row className="mb-4">
                        <Col xs={12} md={4} className="d-flex align-items-center">
                            <Form.Control
                                as="select"
                                value={selectedStateFilter}
                                onChange={(e) => setSelectedStateFilter(e.target.value)}
                            >
                                <option value="">Selecione o estado</option>
                                {/* Adicione aqui as opções de estados */}
                            </Form.Control>
                            {selectedStateFilter && (
                                <FontAwesomeIcon icon={faTimesCircle} className="icon-reset" onClick={resetStateFilter} title="Resetar Estado" />
                            )}
                        </Col>
                        <Col xs={12} md={4} className="d-flex align-items-center">
                            <Form.Control
                                as="select"
                                value={selectedCityFilter}
                                onChange={(e) => setSelectedCityFilter(e.target.value)}
                            >
                                <option value="">Selecione a cidade</option>
                                {/* Adicione aqui as opções de cidades */}
                            </Form.Control>
                            {selectedCityFilter && (
                                <FontAwesomeIcon icon={faTimesCircle} className="icon-reset" onClick={resetCityFilter} title="Resetar Cidade" />
                            )}
                        </Col>
                        <Col xs={12} md={4} className="d-flex align-items-center">
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
                    </Row>
                )}

                <Row className="justify-content-center">
                    <Col md={4} style={{ position: 'relative' }} className="p-2">
                        {currentItems.map(result => (
                            <Card
                                key={result._id}
                                className={`vaga-card p-2 mb-4 border-0 shadow-sm rounded ${selectedJob && selectedJob._id === result._id ? 'vaga-card-selecionada shadow-lg' : ''}`}
                                onClick={() => handleCardClick(result)}
                                style={{
                                    cursor: 'pointer',
                                    position: selectedJob && selectedJob._id === result._id ? 'sticky' : 'static',
                                    top: selectedJob && selectedJob._id === result._id ? '16px' : 'auto',
                                    zIndex: selectedJob && selectedJob._id === result._id ? '1000' : 'auto'
                                }}
                            >
                                {/* Detalhes da vaga no card */}
                                <Card.Body>
                                    <Card.Title>{result.title}</Card.Title>
                                    <Card.Text>{result.company ? result.company.nome : 'Empresa confidencial'}</Card.Text>
                                    <Card.Text className="bg-light rounded text-center text-primary p-2">
                                        <FontAwesomeIcon icon={faLocationDot} title="Localização" />
                                        {result.location}
                                    </Card.Text>
                                    <Row>
                                        <Col>
                                            <Card.Text className="bg-light rounded text-center text-primary p-2">
                                                <FontAwesomeIcon
                                                    icon={result.modality === 'Remoto' ? faHome : result.modality === 'Presencial' ? faBuilding : faLaptopHouse}
                                                    title="Modelo"
                                                />
                                                {result.modality}
                                            </Card.Text>
                                        </Col>
                                        <Col>
                                            <Card.Text className="bg-light rounded text-center text-primary p-2">
                                                <FontAwesomeIcon icon={faBriefcase} title="Tipo" />
                                                {result.type}
                                            </Card.Text>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <Card.Text className="bg-light rounded text-center text-primary p-2">
                                                <FontAwesomeIcon icon={faMoneyBillWave} title="Salário" />
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
                            <Button
                                className="btn-sm me-2 mb-2"
                                variant="outline-primary"
                                disabled
                            >
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
                    </Col>
                    
                    {/* Detalhes da vaga à direita */}
                    <Col md={6} style={{ position: 'sticky', top: '10px', height: '100vh', zIndex: '1000' }}>
                        {selectedJob ? (
                            <Card className="vaga-detalhe border-0">
                                <Card.Body className="shadow rounded">
                                    <Card.Title><strong>{selectedJob.title}</strong></Card.Title>
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
                                                    icon={
                                                        selectedJob.modality === 'Remoto' ? faHome :
                                                        selectedJob.modality === 'Presencial' ? faBuilding :
                                                        faLaptopHouse
                                                    }
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
                                                {selectedJob.salary ? `${selectedJob.salary}` : "A combinar"}
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

                                <Card.Body style={{ maxHeight: '70vh', height: 'auto', overflowY: 'auto' }} className="shadow rounded">
                                    {selectedJob.offers || selectedJob.description || selectedJob.responsibilities || selectedJob.qualifications || selectedJob.requiriments || selectedJob.additionalInfo ? (
                                        <>
                                            {selectedJob.offers && (
                                                <>
                                                    <Card.Title><strong>Benefícios</strong></Card.Title>
                                                    <Card.Text dangerouslySetInnerHTML={{ __html: selectedJob.offers }} />
                                                </>
                                            )}
                                            {selectedJob.description && (
                                                <>
                                                    <Card.Title><strong>Descrição</strong></Card.Title>
                                                    <Card.Text dangerouslySetInnerHTML={{ __html: selectedJob.description }} />
                                                </>
                                            )}
                                            {selectedJob.responsibilities && (
                                                <>
                                                    <Card.Title><strong>Responsabilidades e atribuições</strong></Card.Title>
                                                    <Card.Text dangerouslySetInnerHTML={{ __html: selectedJob.responsibilities }} />
                                                </>
                                            )}
                                            {selectedJob.qualifications && (
                                                <>
                                                    <Card.Title><strong>Requisitos e qualificações</strong></Card.Title>
                                                    <Card.Text dangerouslySetInnerHTML={{ __html: selectedJob.qualifications }} />
                                                </>
                                            )}
                                            {selectedJob.requiriments && (
                                                <>
                                                    <Card.Title><strong>Será um diferencial</strong></Card.Title>
                                                    <Card.Text dangerouslySetInnerHTML={{ __html: selectedJob.requiriments }} />
                                                </>
                                            )}
                                            {selectedJob.additionalInfo && (
                                                <>
                                                    <Card.Title><strong>Informações adicionais</strong></Card.Title>
                                                    <Card.Text dangerouslySetInnerHTML={{ __html: selectedJob.additionalInfo }} />
                                                </>
                                            )}
                                        </>
                                    ) : (
                                        <Card.Text>Nenhuma informação adicional informada.</Card.Text>
                                    )}
                                </Card.Body>
                            </Card>
                        ) : (
                            <p>Nenhuma vaga encontrada.</p>
                        )}
                    </Col>
                </Row>
            </Container>
        </>
    );
}

export default BuscarVagas;
