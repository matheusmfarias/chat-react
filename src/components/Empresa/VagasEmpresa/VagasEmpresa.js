import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Row, Col, Button, InputGroup, Form, Alert, Pagination, Modal } from 'react-bootstrap';
import { FaPlus, FaFilter, FaSearch } from 'react-icons/fa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faToggleOn, faToggleOff, faEye } from '@fortawesome/free-solid-svg-icons';
import HeaderEmpresa from '../HeaderEmpresa';
import ModalVagas from './ModalVagas';
import Swal from 'sweetalert2';
import './VagasEmpresa.css';

const VagasEmpresa = () => {
    const [jobs, setJobs] = useState([]);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [viewModalIsOpen, setViewModalIsOpen] = useState(false); // Novo modal para visualização
    const [selectedJob, setSelectedJob] = useState(null); // Armazena a vaga selecionada para visualização
    const [selectedState, setSelectedState] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [newJob, setNewJob] = useState({
        title: '',
        location: '',
        modality: 'Presencial',
        type: 'Efetivo',
        status: true,
        description: '',
        responsibilities: '',
        qualifications: '',
        additionalInfo: '',
        requirements: '',
        offers: '',
        pcd: false,
        salary: '',
        salaryActive: true,
        descriptionActive: false,
        responsibilitiesActive: false,
        qualificationsActive: false,
        additionalInfoActive: false,
        requirementsActive: false,
        offersActive: false
    });
    const [isEditMode, setIsEditMode] = useState(false);
    const [editJobId, setEditJobId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [filters, setFilters] = useState({
        modality: '',
        type: '',
        status: '',
        pcd: '',
        keyword: ''
    });
    const [showFilters, setShowFilters] = useState(false);

    const handleFilterSearch = useCallback(async () => {
        const params = new URLSearchParams();

        if (searchTerm) params.append('keyword', searchTerm); // O termo de pesquisa busca apenas no campo title
        if (filters.modality) params.append('modality', filters.modality);
        if (filters.type) params.append('type', filters.type);
        if (filters.status) params.append('status', filters.status);
        if (filters.pcd) params.append('pcd', filters.pcd);
        if (selectedState) params.append('location', `${selectedCity}, ${selectedState}`);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:5000/api/jobs?${params.toString()}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setJobs(response.data);
        } catch (error) {
            console.error('Erro ao buscar vagas:', error);
        }
    }, [searchTerm, filters, selectedCity, selectedState]);

    useEffect(() => {
        handleFilterSearch();
    }, [filters, selectedState, selectedCity, handleFilterSearch]);

    useEffect(() => {
        const fetchJobs = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await axios.get('http://localhost:5000/api/jobs', {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                    setJobs(response.data);
                } catch (error) {
                    console.error('Error fetching jobs:', error);
                }
            }
        };

        fetchJobs();
    }, []);

    useEffect(() => {
        const fetchStates = async () => {
            try {
                const statesResponse = await axios.get('https://servicodados.ibge.gov.br/api/v1/localidades/estados');
                setStates(statesResponse.data);
            } catch (error) {
                console.error('Error fetching states:', error);
                setError('Erro ao buscar estados. Tente novamente mais tarde.');
            }
        };

        fetchStates();
    }, []);

    useEffect(() => {
        if (selectedState) {
            const fetchCities = async () => {
                try {
                    const citiesResponse = await axios.get(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedState}/municipios`);
                    setCities(citiesResponse.data);
                } catch (error) {
                    console.error('Error fetching cities:', error);
                    setError('Erro ao buscar cidades. Tente novamente mais tarde.');
                }
            };

            fetchCities();
        } else {
            setCities([]);
        }
    }, [selectedState]);

    function renderHtmlOrFallback(htmlContent) {
        if (htmlContent && htmlContent.trim() !== "") {
            return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
        } else {
            return <p>Não informado</p>;
        }
    }

    

    useEffect(() => {
        handleFilterSearch();
    }, [filters, selectedState, selectedCity, handleFilterSearch]);

    const openModal = (job = null) => {
        if (job) {
            const [city, state] = job.location.split(', ');
            setSelectedState(state);
            setSelectedCity(city);
            setNewJob({
                ...job,
                status: job.status === 'Ativo',
                pcd: !!job.pcd, // Verifique se o valor booleano está sendo atribuído corretamente
                salaryActive: !!job.salary,
                salary: job.salary || '',
                descriptionActive: !!job.description,
                responsibilitiesActive: !!job.responsibilities,
                qualificationsActive: !!job.qualifications,
                additionalInfoActive: !!job.additionalInfo,
                requirementsActive: !!job.requirements,
                offersActive: !!job.offers
            });
            setIsEditMode(true);
            setEditJobId(job._id);
        } else {
            setNewJob({
                title: '',
                location: '',
                modality: 'Presencial',
                type: 'Efetivo',
                status: true,
                description: '',
                responsibilities: '',
                qualifications: '',
                additionalInfo: '',
                requirements: '',
                offers: '',
                pcd: false,
                salary: '',
                salaryActive: true,
                descriptionActive: false,
                responsibilitiesActive: false,
                qualificationsActive: false,
                additionalInfoActive: false,
                requirementsActive: false,
                offersActive: false
            });
            setSelectedState('');
            setSelectedCity('');
            setIsEditMode(false);
            setEditJobId(null);
        }
        setModalIsOpen(true);
    };


    const closeModal = () => {
        setModalIsOpen(false);
    };

    const openViewModal = (job) => {
        setSelectedJob(job);
        setViewModalIsOpen(true);
    };

    const closeViewModal = () => {
        setViewModalIsOpen(false);
    };

    const handleJobSubmit = async (jobData) => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                jobData.location = `${selectedCity}, ${selectedState}`;
                if (isEditMode) {
                    await axios.put(`http://localhost:5000/api/jobs/${editJobId}`, jobData, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                    setJobs(prevJobs => prevJobs.map(job => job._id === editJobId ? jobData : job));
                } else {
                    const response = await axios.post('http://localhost:5000/api/jobs', jobData, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                    setJobs(prevJobs => [...prevJobs, response.data]);
                }
                closeModal();
            } catch (error) {
                console.error('Error saving job:', error);
                setError('Erro ao salvar a vaga. Verifique os dados e tente novamente.');
            }
        }
    };

    const handleDeleteJob = async (id) => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                await axios.delete(`http://localhost:5000/api/jobs/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setJobs(prevJobs => prevJobs.filter(job => job._id !== id));
            } catch (error) {
                console.error('Error deleting job:', error);
                setError('Erro ao deletar a vaga. Tente novamente mais tarde.');
            }
        }
    };

    const handleToggleStatus = async (job) => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                job.status = job.status === 'Ativo' ? 'Inativa' : 'Ativo';
                await axios.put(`http://localhost:5000/api/jobs/${job._id}`, job, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setJobs(prevJobs => prevJobs.map(j => j._id === job._id ? { ...j, status: job.status } : j));
            } catch (error) {
                console.error('Error toggling status:', error);
                setError('Erro ao alterar status da vaga. Tente novamente mais tarde.');
            }
        }
    };

    const handleConfirmDelete = (id) => {
        Swal.fire({
            title: 'Você tem certeza?',
            text: "Esta ação não pode ser desfeita!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sim, deletar!',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                handleDeleteJob(id);
                Swal.fire(
                    'Deletado!',
                    'A vaga foi deletada com sucesso.',
                    'success'
                );
            }
        });
    };

    // Paginação
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentJobs = jobs.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const nextPage = () => {
        if (currentPage < Math.ceil(jobs.length / itemsPerPage)) {
            setCurrentPage(currentPage + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    return (
        <>
            <HeaderEmpresa />
            <div className="container">
                <div className="mt-4">
                    <h1>Minhas Vagas</h1>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Row className="mb-3 align-items-center">
                        <Col xs={12} md={4} className="d-flex justify-content-start mb-2 mb-md-0">
                            <Button variant="primary" className="me-2 flex-grow-1" onClick={() => openModal()}>
                                <FaPlus className="mr-2" />
                                Adicionar
                            </Button>
                            <Button variant="secondary" className="me-2 flex-grow-1" onClick={() => setShowFilters(!showFilters)}>
                                <FaFilter className="mr-2" />
                                Filtro
                            </Button>
                        </Col>
                        <Col xs={12} md={8} className="d-flex justify-content-end">
                            <InputGroup style={{ maxWidth: '500px' }}>
                                <Form.Control
                                    type="text"
                                    placeholder="Pesquisar por cargo"
                                    aria-label="Pesquisar"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                                <Button variant="outline-secondary" style={{ maxWidth: '100px' }} onClick={handleFilterSearch}>
                                    <FaSearch />
                                </Button>
                            </InputGroup>
                        </Col>
                    </Row>

                    {showFilters && (
                        <>
                            <Row className="mb-3">
                                <Col xs={12} md={4}>
                                    <Form.Control
                                        as="select"
                                        value={selectedState}
                                        onChange={(e) => setSelectedState(e.target.value)}
                                    >
                                        <option value="">Selecione o estado</option>
                                        {states.map((state) => (
                                            <option key={state.id} value={state.sigla}>
                                                {state.nome}
                                            </option>
                                        ))}
                                    </Form.Control>
                                </Col>
                                <Col xs={12} md={4}>
                                    <Form.Control
                                        as="select"
                                        value={selectedCity}
                                        onChange={(e) => setSelectedCity(e.target.value)}
                                    >
                                        <option value="">Selecione a cidade</option>
                                        {cities.map((city) => (
                                            <option key={city.id} value={city.nome}>
                                                {city.nome}
                                            </option>
                                        ))}
                                    </Form.Control>
                                </Col>
                                <Col xs={12} md={4}>
                                    <Form.Control
                                        as="select"
                                        value={filters.modality}
                                        onChange={e => setFilters({ ...filters, modality: e.target.value })}
                                    >
                                        <option value="">Modalidade</option>
                                        <option value="Presencial">Presencial</option>
                                        <option value="Híbrido">Híbrido</option>
                                        <option value="Remoto">Remoto</option>
                                    </Form.Control>
                                </Col>
                            </Row>
                            <Row className="mb-3">
                                <Col xs={12} md={4}>
                                    <Form.Control
                                        as="select"
                                        value={filters.type}
                                        onChange={e => setFilters({ ...filters, type: e.target.value })}
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
                                </Col>
                                <Col xs={12} md={4}>
                                    <Form.Control
                                        as="select"
                                        value={filters.status}
                                        onChange={e => setFilters({ ...filters, status: e.target.value })}
                                    >
                                        <option value="">Status</option>
                                        <option value="Ativo">Ativo</option>
                                        <option value="Inativa">Inativa</option>
                                    </Form.Control>
                                </Col>
                                <Col xs={12} md={4}>
                                    <Form.Control
                                        as="select"
                                        value={filters.pcd}
                                        onChange={e => setFilters({ ...filters, pcd: e.target.value })}
                                    >
                                        <option value="">PCD</option>
                                        <option value="true">Sim</option>
                                        <option value="false">Não</option>
                                    </Form.Control>
                                </Col>
                            </Row>
                        </>
                    )}

                    {/* Tabela de Vagas */}
                    {currentJobs.length === 0 ? (
                        <p className="text-center">Nenhuma vaga encontrada...</p>
                    ) : (
                        <>
                            <Table striped bordered hover className="mt-3">
                                <thead>
                                    <tr>
                                        <th>Cargo</th>
                                        <th>Localidade</th>
                                        <th>Modelo</th>
                                        <th>Tipo</th>
                                        <th>Status</th>
                                        <th>PCD</th>
                                        <th>Salário</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentJobs.map((job, index) => (
                                        <tr key={index}>
                                            <td>{job.title}</td>
                                            <td>{job.location}</td>
                                            <td>{job.modality}</td>
                                            <td>{job.type}</td>
                                            <td>
                                                <span
                                                    className={`status-indicator ${job.status === 'Ativo' ? 'active' : 'inactive'}`}
                                                ></span>
                                                {job.status === 'Ativo' ? 'Ativa' : 'Inativa'}
                                            </td>
                                            <td>{job.pcd ? 'Sim' : 'Não'}</td>
                                            <td>{job.salary ? job.salary : 'Não informado'}</td>
                                            <td>
                                                <div className='btn-group'>
                                                    <FontAwesomeIcon icon={faEye} className="icon-btn" onClick={() => openViewModal(job)} title="Visualizar detalhes" />
                                                    <FontAwesomeIcon icon={faEdit} className="icon-btn" onClick={() => openModal(job)} title="Editar" />
                                                    <FontAwesomeIcon icon={job.status === 'Ativo' ? faToggleOn : faToggleOff} className="icon-btn" onClick={() => handleToggleStatus(job)} title={job.status === 'Ativo' ? 'Desabilitar' : 'Habilitar'} />
                                                    <FontAwesomeIcon icon={faTrash} className="icon-btn" onClick={() => handleConfirmDelete(job._id)} title="Excluir" />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                            {/* Paginação */}
                            <Pagination>
                                <Pagination.Prev onClick={prevPage} disabled={currentPage === 1} />
                                {Array.from({ length: Math.ceil(jobs.length / itemsPerPage) }, (_, i) => (
                                    <Pagination.Item key={i + 1} active={i + 1 === currentPage} onClick={() => paginate(i + 1)}>
                                        {i + 1}
                                    </Pagination.Item>
                                ))}
                                <Pagination.Next onClick={nextPage} disabled={currentPage === Math.ceil(jobs.length / itemsPerPage)} />
                            </Pagination>
                        </>
                    )}
                </div>
            </div >

            <ModalVagas
                show={modalIsOpen}
                onHide={closeModal}
                onSubmit={handleJobSubmit}
                jobData={newJob}
                isEditMode={isEditMode}
                states={states}
                cities={cities}
                setSelectedState={setSelectedState}
                setSelectedCity={setSelectedCity}
                selectedState={selectedState}
                selectedCity={selectedCity}
            />

            {/* Novo Modal para Visualização */}
            <Modal show={viewModalIsOpen} onHide={closeViewModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Detalhes da Vaga</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedJob && (
                        <div>
                            <p><strong>Cargo:</strong> {selectedJob.title}</p>
                            <p><strong>Localização:</strong> {selectedJob.location}</p>
                            <p><strong>Modelo:</strong> {selectedJob.modality}</p>
                            <p><strong>Tipo:</strong> {selectedJob.type}</p>
                            <p><strong>Salário:</strong> {selectedJob.salary ? selectedJob.salary : 'Não informado'}</p>
                            <p><strong>Benefícios:</strong></p>
                            {renderHtmlOrFallback(selectedJob.offers)}

                            <p><strong>Descrição:</strong></p>
                            {renderHtmlOrFallback(selectedJob.description)}

                            <p><strong>Responsabilidades e atribuições:</strong></p>
                            {renderHtmlOrFallback(selectedJob.responsibilities)}

                            <p><strong>Requisitos e qualificações:</strong></p>
                            {renderHtmlOrFallback(selectedJob.qualifications)}

                            <p><strong>Será um diferencial:</strong></p>
                            {renderHtmlOrFallback(selectedJob.requirements)}

                            <p><strong>Informações Adicionais:</strong></p>
                            {renderHtmlOrFallback(selectedJob.additionalInfo)}

                            <p><strong>Status:</strong> {selectedJob.status === 'Ativo' ? 'Ativa' : 'Inativa'}</p>
                            <p><strong>PCD:</strong> {selectedJob.pcd === 'Sim' ? 'Sim' : 'Não'}</p>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={closeViewModal}>
                        Fechar
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default VagasEmpresa;
