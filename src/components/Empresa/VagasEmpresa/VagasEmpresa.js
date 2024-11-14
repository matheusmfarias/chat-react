import React, { useCallback, useEffect, useState } from 'react';
import api from '../../../services/axiosConfig';
import axios from 'axios';
import { Table, Row, Col, Button, InputGroup, Form, Spinner, Pagination, Container, Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faToggleOn, faToggleOff, faEye, faPlus, faSearch, faTimesCircle, faUserTie, faFilter } from '@fortawesome/free-solid-svg-icons';
import HeaderEmpresa from '../HeaderEmpresa';
import ModalVagas from './ModalVagas';
import Swal from 'sweetalert2';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './VagasEmpresa.css';
import DetalhesVagas from './DetalhesVagas';
import { useNavigate } from 'react-router-dom';

const VagasEmpresa = () => {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [selectedStateFilter, setSelectedStateFilter] = useState('');
    const [selectedCityFilter, setSelectedCityFilter] = useState('');
    const [selectedStateModal, setSelectedStateModal] = useState('');
    const [selectedCityModal, setSelectedCityModal] = useState('');
    const [viewingJob, setViewingJob] = useState(false);
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
        offersActive: false,
        identifyCompany: true
    });
    const [showFilterModal, setShowFilterModal] = useState(false);
    const handleOpenFilterModal = () => setShowFilterModal(true);
    const handleCloseFilterModal = () => setShowFilterModal(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editJobId, setEditJobId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [filters, setFilters] = useState({
        modality: '',
        type: '',
        status: '',
        pcd: '',
        keyword: ''
    });

    const notify = (message, type) => {
        toast[type](message, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            closeButton: false
        });
    };

    const handleFilterSearch = useCallback(async () => {
        const params = new URLSearchParams();

        if (searchTerm) params.append('keyword', searchTerm);
        if (filters.modality.length > 0) filters.modality.forEach(m => params.append('modality', m));
        if (filters.type.length > 0) filters.type.forEach(t => params.append('type', t));
        if (filters.status) params.append('status', filters.status);
        if (filters.pcd) params.append('pcd', filters.pcd);
        if (selectedStateFilter && selectedCityFilter) {
            params.append('location', `${selectedCityFilter}, ${selectedStateFilter}`);
        } else if (selectedStateFilter) {
            params.append('location', selectedStateFilter);
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await api.get(`${process.env.REACT_APP_API_URL}/api/jobs?${params.toString()}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setJobs(response.data);
        } catch (error) {
            console.error('Erro ao buscar vagas:', error);
            notify('Erro ao buscar vagas. Tente novamente mais tarde.', 'error');
        } finally {
            setLoading(false);
        }
    }, [searchTerm, filters, selectedCityFilter, selectedStateFilter]);

    useEffect(() => {
        handleFilterSearch();
    }, [filters, selectedStateFilter, selectedCityFilter, handleFilterSearch]);

    useEffect(() => {
        document.title = "ACI Empregos | Vagas";
        const fetchJobs = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await api.get(`${process.env.REACT_APP_API_URL}/api/jobs`, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                    setJobs(response.data);
                } catch (error) {
                    console.error('Error fetching jobs:', error);
                    notify('Erro ao buscar vagas. Tente novamente mais tarde.', 'error');
                } finally {
                    setLoading(false);
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
                notify('Erro ao buscar estados.', 'error');
            }
        };

        fetchStates();
    }, []);

    useEffect(() => {
        if (selectedStateFilter) {
            const fetchCities = async () => {
                try {
                    const citiesResponse = await axios.get(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedStateFilter}/municipios`);
                    setCities(citiesResponse.data);
                } catch (error) {
                    console.error('Error fetching cities:', error);
                    notify('Erro ao buscar cidades.', 'error');
                }
            };

            fetchCities();
        } else {
            setCities([]);
        }
    }, [selectedStateFilter]);

    useEffect(() => {
        if (selectedStateModal) {
            const fetchCities = async () => {
                try {
                    const citiesResponse = await axios.get(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedStateModal}/municipios`);
                    setCities(citiesResponse.data);
                } catch (error) {
                    console.error('Error fetching cities:', error);
                    notify('Erro ao buscar cidades.', 'error');
                }
            };

            fetchCities();
        } else {
            setCities([]);
        }
    }, [selectedStateModal]);

    const openViewJob = (job) => {
        setSelectedJob(job);
        setViewingJob(true);
    };

    const closeViewJob = () => {
        setViewingJob(false);
        setSelectedJob(null);
    };

    const openModal = (job = null) => {
        if (job) {
            const [city, state] = job.location.split(', ');
            setSelectedStateModal(state);
            setSelectedCityModal(city);
            setNewJob({
                ...job,
                status: !!job.status,
                pcd: !!job.pcd,
                salaryActive: !!job.salary,
                salary: job.salary || '',
                descriptionActive: !!job.description,
                responsibilitiesActive: !!job.responsibilities,
                qualificationsActive: !!job.qualifications,
                additionalInfoActive: !!job.additionalInfo,
                requirementsActive: !!job.requirements,
                offersActive: !!job.offers,
                identifyCompany: !!job.identifyCompany
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
                offersActive: false,
                identifyCompany: true
            });
            setSelectedStateModal('');
            setSelectedCityModal('');
            setIsEditMode(false);
            setEditJobId(null);
        }
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
    };

    const viewCandidates = (jobId) => {
        navigate(`/curriculos-empresa/${jobId}`);
    }

    const handleJobSubmit = async (jobData) => {
        const token = localStorage.getItem('token');
        if (token) {
            setLoading(true);
            try {
                jobData.location = `${selectedCityModal}, ${selectedStateModal}`;
                if (isEditMode) {
                    await api.put(`${process.env.REACT_APP_API_URL}/api/jobs/${editJobId}`, jobData, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                    setJobs(prevJobs => prevJobs.map(job => job._id === editJobId ? jobData : job));
                    notify('Vaga atualizada com sucesso!', 'success');
                } else {
                    const response = await api.post(`${process.env.REACT_APP_API_URL}/api/jobs`, jobData, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                    setJobs(prevJobs => [...prevJobs, response.data]);
                    notify('Vaga adicionada com sucesso!', 'success');
                }
                closeModal();
            } catch (error) {
                console.error('Error saving job:', error);
                notify('Erro ao salvar a vaga.', 'error');
            } finally {
                setLoading(false);
            }
        }
    };

    /* por enquanto off, a empresa pode apenas desabilitar
    const handleDeleteJob = async (id) => {
        const token = localStorage.getItem('token');
        setLoading(true);
        if (token) {
            try {
                await api.delete(`${process.env.REACT_APP_API_URL}/api/jobs/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                // Atualiza a lista de vagas após a exclusão
                const updatedJobs = jobs.filter(job => job._id !== id);
                setJobs(updatedJobs);

                // Verifica se a página atual ficou vazia após a exclusão
                const totalPages = Math.ceil(updatedJobs.length / itemsPerPage);
                if (currentPage > totalPages && currentPage > 1) {
                    setCurrentPage(currentPage - 1);  // Retorna para a página anterior
                }

                notify('Vaga deletada com sucesso!', 'success');
            } catch (error) {
                console.error('Error deleting job:', error);
                notify('Erro ao deletar a vaga.', 'error');
            } finally {
                setLoading(false);
            }
        }
    }; */

    const handleToggleStatus = async (job) => {
        const token = localStorage.getItem('token');
        if (token) {
            Swal.fire({
                title: `Tem certeza que deseja ${job.status ? 'encerrar' : 'ativar'} a vaga?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: `Sim, ${job.status ? 'encerrar' : 'ativar'}!`,
                cancelButtonText: 'Cancelar'
            }).then(async (result) => {
                if (result.isConfirmed) {
                    setLoading(true);
                    try {
                        const updatedJob = { ...job, status: !job.status };

                        await api.put(`${process.env.REACT_APP_API_URL}/api/jobs/${job._id}`, updatedJob, {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        });

                        setJobs(prevJobs => prevJobs.map(j =>
                            j._id === job._id ? { ...j, status: updatedJob.status } : j
                        ));
                        notify(`Vaga ${updatedJob.status ? 'ativada' : 'inativada'} com sucesso!`, 'success');
                    } catch (error) {
                        console.error('Error toggling status:', error);
                        notify('Erro ao alterar o status.', 'error');
                    } finally {
                        setLoading(false);
                    }
                }
            });
        }
    };

    /* por enquanto off, a empresa pode apenas desabilitar
    const handleConfirmDelete = (id) => {
        Swal.fire({
            title: 'Tem certeza que deseja deletar a vaga?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sim, deletar!',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                handleDeleteJob(id);
            }
        });
        <FontAwesomeIcon icon={faTrash} className="icon-btn" onClick={() => handleConfirmDelete(job._id)} title="Excluir" />
    }; */

    const handleResetSearch = () => {
        setSelectedStateFilter('');
        setSelectedCityFilter('');
        setFilters({ modality: '', type: '', pcd: '', status: '' });
        setJobs([]); // Limpa as vagas
    };

    const handleClearSearch = () => {
        setSearchTerm("");
        setCurrentPage(1); // Reseta para a primeira página
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
            <ToastContainer />
            <HeaderEmpresa />
            {viewingJob && selectedJob ? (
                <DetalhesVagas job={selectedJob} onBack={closeViewJob} />
            ) : (
                <Container fluid style={{ backgroundColor: '#f9f9f9f9' }}>
                    <Row className="row-buscar-vagas mt-4">
                        <h1>Gestão de vagas</h1>
                        <Col className='coluna-filtros mt-2 mb-4' style={{ position: 'sticky', top: '10px', height: '100vh', zIndex: '1000', overflowY: 'hidden' }}>
                            <Row className='mb-4 align-items-center'>
                                <h5>Ativa</h5>
                                <Col xs={12} md={10}>
                                    <Form.Control
                                        as="select"
                                        value={filters.status}
                                        style={{ width: '200px' }}
                                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                    >
                                        <option value="">Selecione</option>
                                        <option value="true">Sim</option>
                                        <option value="false">Não</option>
                                    </Form.Control>
                                </Col>
                            </Row>
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
                                <Col md={2} className='mt-2'>
                                    <Button className="shadow border-0" onClick={() => openModal()}>
                                        <FontAwesomeIcon icon={faPlus} /> Adicionar vaga
                                    </Button>
                                </Col>
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
                                        variant="secondary"
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
                                {filters.status && (
                                    <div className="filter-tag">
                                        Ativa: {filters.status === 'true' ? 'Sim' : 'Não'}
                                        <FontAwesomeIcon
                                            icon={faTimesCircle}
                                            className="icon-remove-tag"
                                            onClick={() => setFilters({ ...filters, status: '' })} // Remove o filtro de PCD
                                        />
                                    </div>
                                )}
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
                                    <Row className='mb-4 align-items-center'>
                                        <h5>Ativa</h5>
                                        <Col xs={12}>
                                            <Form.Control
                                                as="select"
                                                value={filters.status}
                                                style={{ width: '100%' }}
                                                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                            >
                                                <option value="">Selecione</option>
                                                <option value="true">Sim</option>
                                                <option value="false">Não</option>
                                            </Form.Control>
                                        </Col>
                                    </Row>
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
                                ) : jobs.length > 0 ? (
                                    <>
                                        <Table striped hover responsive className="table-responsive shadow-sm mt-3 rounded">
                                            <thead>
                                                <tr>
                                                    <th>Cargo</th>
                                                    <th>Localidade</th>
                                                    <th>Modelo</th>
                                                    <th>Tipo</th>
                                                    <th>Ativa</th>
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
                                                            <span className={`status-indicator ${job.status ? 'active' : 'inactive'}`} />
                                                            {job.status ? 'Sim' : 'Não'}
                                                        </td>
                                                        <td>{job.pcd ? 'Sim' : 'Não'}</td>
                                                        <td>{job.salary ? job.salary : 'Não informado'}</td>
                                                        <td>
                                                            <div className='btn-group'>
                                                                <FontAwesomeIcon icon={faUserTie} className="icon-btn" onClick={() => viewCandidates(job._id)} title="Candidatos" />
                                                                <FontAwesomeIcon icon={faEye} className="icon-btn" onClick={() => openViewJob(job)} title="Visualizar detalhes" />
                                                                <FontAwesomeIcon icon={faEdit} className="icon-btn" onClick={() => openModal(job)} title="Editar" />
                                                                <FontAwesomeIcon
                                                                    icon={job.status ? faToggleOn : faToggleOff}
                                                                    className="icon-btn"
                                                                    onClick={() => handleToggleStatus(job)}
                                                                    title={job.status ? 'Desabilitar' : 'Habilitar'}
                                                                />
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                        {/* Paginação */}
                                        {jobs.length > itemsPerPage && (
                                            <Pagination className='mt-4'>
                                                <Pagination.Prev onClick={prevPage} disabled={currentPage === 1} />
                                                {Array.from({ length: Math.ceil(jobs.length / itemsPerPage) }, (_, i) => (
                                                    <Pagination.Item key={i + 1} active={i + 1 === currentPage} onClick={() => paginate(i + 1)}>
                                                        {i + 1}
                                                    </Pagination.Item>
                                                ))}
                                                <Pagination.Next onClick={nextPage} disabled={currentPage === Math.ceil(jobs.length / itemsPerPage)} />
                                            </Pagination>
                                        )}
                                    </>
                                ) : (
                                    <p className="text-center mt-4">Nenhuma vaga encontrada...</p>
                                )}
                            </Row>
                        </Col>
                    </Row >
                </Container>
            )}

            <ModalVagas
                show={modalIsOpen}
                onHide={closeModal}
                onSubmit={handleJobSubmit}
                jobData={newJob}
                isEditMode={isEditMode}
                states={states}
                cities={cities}
                setSelectedState={setSelectedStateModal}
                setSelectedCity={setSelectedCityModal}
                selectedState={selectedStateModal}
                selectedCity={selectedCityModal}
            />
        </>
    );
};

export default VagasEmpresa;
