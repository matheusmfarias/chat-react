import React, { useCallback, useEffect, useState } from 'react';
import api from '../../../services/axiosConfig';
import { Row, Col, Button, InputGroup, Form, Container, Modal, Card, Dropdown } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSearch, faTimesCircle, faFilter, faFilterCircleXmark, faChevronRight, faChevronLeft, faLocationDot, faHome, faBuilding, faLaptopHouse, faBriefcase, faMoneyBillWave, faWheelchair, faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import HeaderEmpresa from '../HeaderEmpresa';
import ModalVagas from './ModalVagas';
import Swal from 'sweetalert2';
import { showToast, TOAST_TYPES } from '../../ToastNotification';
import './VagasEmpresa.css';
import DetalhesVagas from './DetalhesVagas';
import { useNavigate, useLocation } from 'react-router-dom';
import Select from 'react-select';
import Skeleton from 'react-loading-skeleton';

const VagasEmpresa = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('andamento');
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
        state: '',
        city: '',
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
    const [isRedirectHandled, setIsRedirectHandled] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalJobs, setTotalJobs] = useState(0);
    const itemsPerPage = 9;
    const [filters, setFilters] = useState({
        modality: [],
        type: [],
        pcd: '',
        state: '',
        city: '',
    });

    const SkeletonCard = () => (
        <Row className="mt-2">
            {Array.from({ length: 9 }).map((_, index) => (
                <Col key={index} className="mb-4 d-flex" md={6} xxl={4}>
                    <Card className="w-100 border-0 shadow-sm rounded p-2 d-flex flex-column">
                        <Card.Body>
                            <Skeleton height={30} width="60%" className="mb-3" />
                            <Skeleton height={20} width="40%" className="mb-4" />
                            <Skeleton height={20} width="50%" className="mb-3" />
                            <Skeleton height={20} width="80%" className="mb-3" />
                            <Skeleton height={20} width="80%" className="mb-3" />
                            <Skeleton height={30} width="30%" />
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
        document.title = "ACI Empregos | Vagas";
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
        params.append('limit', itemsPerPage || 9);

        if (activeTab === 'andamento') {
            params.append('status', 'true');
        } else if (activeTab === 'encerrada') {
            params.append('status', 'false');
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await api.get(`${process.env.REACT_APP_API_URL}/api/jobs?${params.toString()}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const jobs = response.data.jobs;

            // Adiciona totalApplications a cada vaga
            const jobsWithApplications = await Promise.all(
                jobs.map(async (job) => {
                    try {
                        const applicationsResponse = await api.get(`${process.env.REACT_APP_API_URL}/api/jobs/applications/${job._id}`, {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        });
                        return { ...job, totalApplications: applicationsResponse.data.totalApplications };
                    } catch (error) {
                        console.error(`Erro ao buscar inscrições para a vaga ${job._id}:`, error);
                        return { ...job, totalApplications: 0 }; // Caso ocorra erro, define totalApplications como 0
                    }
                })
            );

            setJobs(jobsWithApplications);
            setTotalPages(response.data.totalPages);
            setTotalJobs(response.data.totalJobs);
        } catch (error) {
            console.error('Erro ao buscar vagas:', error);
        } finally {
            setLoading(false);
        }
    }, [activeTab, searchTerm, selectedStateFilter, selectedCityFilter, filters, currentPage, itemsPerPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedStateFilter, selectedCityFilter, filters]);

    useEffect(() => {
        setLoading(true);
        const timeoutId = setTimeout(() => {
            handleSearchByJob();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, handleSearchByJob]);

    const handleResetFilter = () => {
        setLoading(true);
        setSelectedStateFilter('');
        setSelectedCityFilter('');
        setFilters({ modality: '', type: '', pcd: '' });
        setJobs([]);
    };

    const handlePageChange = (direction) => {
        setLoading(true);
        if (direction === 'next' && currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        } else if (direction === 'prev' && currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
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

    useEffect(() => {
        if (location.state?.openEditModal && location.state.jobId && !isRedirectHandled) {
            const jobToEdit = jobs.find((job) => job._id === location.state.jobId);
            if (jobToEdit) {
                openModal(jobToEdit); // Abre o modal corretamente
                setIsRedirectHandled(true); // Marca como redirecionado
            }
        }
    }, [location.state, jobs, isRedirectHandled]);

    useEffect(() => {
        if (isRedirectHandled) {
            // Limpa o estado da navegação APÓS o modal ter sido processado
            navigate('/vagas-empresa', { replace: true });
        }
    }, [isRedirectHandled, navigate]);

    const closeViewJob = () => {
        setViewingJob(false);
        setSelectedJob(null);
    };

    const openModal = (job = null) => {
        if (job) {
            const state = job.state;
            const city = job.city;
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
                state: '',
                city: '',
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
        setIsEditMode(false);
        setEditJobId(null);
        setIsRedirectHandled(false);
    };

    const viewCandidates = (jobId) => {
        navigate(`/curriculos-empresa/${jobId}`);
    }

    const handleJobSubmit = async (jobData) => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                jobData.state = `${selectedStateModal}`;
                jobData.city = `${selectedCityModal}`;
                if (isEditMode) {
                    await api.put(`${process.env.REACT_APP_API_URL}/api/jobs/${editJobId}`, jobData, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                    showToast('Vaga atualizada com sucesso!', TOAST_TYPES.SUCCESS);
                    handleSearchByJob();
                } else {
                    await api.post(`${process.env.REACT_APP_API_URL}/api/jobs`, jobData, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                    showToast('Vaga adicionada com sucesso!', TOAST_TYPES.SUCCESS);
                    handleSearchByJob();
                }
                closeModal();
            } catch (error) {
                console.error('Error saving job:', error);
                showToast('Erro ao salvar a vaga.', TOAST_TYPES.ERROR);
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

                showToast('Vaga deletada com sucesso!', 'success');
            } catch (error) {
                console.error('Error deleting job:', error);
                showToast('Erro ao deletar a vaga.', 'error');
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
                    try {
                        const updatedJob = { ...job, status: !job.status };

                        await api.put(`${process.env.REACT_APP_API_URL}/api/jobs/${job._id}`, updatedJob, {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        });
                        showToast(`Vaga ${updatedJob.status ? 'ativada' : 'inativada'} com sucesso!`, TOAST_TYPES.SUCCESS);
                        handleSearchByJob();
                    } catch (error) {
                        console.error('Error toggling status:', error);
                        showToast('Erro ao alterar o status.', TOAST_TYPES.ERROR);
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

    const handleClearSearch = () => {
        setLoading(true);
        setSearchTerm("");
        setCurrentPage(1);
    };

    return (
        <>
            <HeaderEmpresa />
            {viewingJob && selectedJob ? (
                <DetalhesVagas job={selectedJob} onBack={closeViewJob} />
            ) : (
                <Container fluid>
                    <Row className="mt-3">
                        <h1>Gestão de vagas</h1>
                        <Col lg={2} className='coluna-filtros mt-2'>
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
                            <Row>
                                <Col lg={1} xl={2}>
                                    <Button title="Adicionar vaga" onClick={() => openModal()}>
                                        <FontAwesomeIcon icon={faPlus} />
                                        <span className='txt-vaga mx-2'>Vaga</span>
                                    </Button>
                                </Col>
                                <Col lg={6} xl={5}>
                                    <InputGroup className="position-relative">
                                        <Form.Control
                                            type="text"
                                            className='border-primary'
                                            placeholder="Pesquisar por vagas, cidade, modelo..."
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
                                <Col lg={5} xl={5} className="d-flex align-items-center">
                                    {searchTerm && (
                                        <span className="p-2 mt-2">
                                            A busca "{searchTerm}" retornou {totalJobs} resultado(s).
                                        </span>
                                    )}
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
                            <div className="filter-tag-container">
                                {filters.status && (
                                    <div className="filter-tag">
                                        Ativa: {filters.status === 'true' ? 'Sim' : 'Não'}
                                        <FontAwesomeIcon
                                            icon={faTimesCircle}
                                            className="icon-remove-tag"
                                            onClick={() => setFilters({ ...filters, status: '' })} // Remove o filtro de Status
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
                                                const newTypes = filters.type.filter((t) => t !== filter);
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
                                                const newModalities = filters.modality.filter((m) => m !== modality);
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
                                                setSelectedStateFilter(''); // Reseta o estado
                                                setCities([]); // Limpa as cidades
                                            }}
                                        />
                                    </div>
                                )}
                                {selectedCityFilter && (
                                    <div className="filter-tag">
                                        Cidade: {selectedCityFilter}
                                        <FontAwesomeIcon
                                            icon={faTimesCircle}
                                            className="icon-remove-tag"
                                            onClick={() => setSelectedCityFilter('')} // Reseta a cidade
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
                            <Col>
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
                                    {jobs.map((job) => (
                                        <Col md={6} xxl={4} key={job._id} className="mb-4 d-flex">
                                            <Card
                                                key={job._id}
                                                className={`w-100 border-0 shadow-sm rounded p-2 d-flex flex-column card-hover ${job && !job.status ? 'bg-light text-muted' : ''}`}>
                                                <Card.Body>
                                                    {job ? (
                                                        <>
                                                            <div className="d-flex flex-row align-items-center justify-content-between">
                                                                <div className="d-flex flex-row align-items-center" style={{ maxWidth: '85%' }}>
                                                                    <Card.Title className="mb-0 me-2 info-card">
                                                                        {job.title}
                                                                    </Card.Title>
                                                                </div>
                                                                <Dropdown align="end">
                                                                    <Dropdown.Toggle
                                                                        className="border-0 p-0 m-0 bg-transparent"
                                                                        id={`dropdown-${job._id}`}
                                                                        style={{ cursor: 'pointer', height: '32px' }}
                                                                    >
                                                                        <div className='opcoes-vaga d-flex align-items-center justify-content-center'>
                                                                            <FontAwesomeIcon icon={faEllipsisV} className="text-primary" size='lg' />
                                                                        </div>
                                                                    </Dropdown.Toggle>
                                                                    <Dropdown.Menu>
                                                                        <Dropdown.Item onClick={() => viewCandidates(job._id)}>Candidatos</Dropdown.Item>
                                                                        <Dropdown.Item onClick={() => openModal(job)}>Editar</Dropdown.Item>
                                                                        <Dropdown.Item onClick={() => handleToggleStatus(job)}>
                                                                            {job && job.status ? 'Desabilitar' : 'Habilitar'}
                                                                        </Dropdown.Item>
                                                                    </Dropdown.Menu>
                                                                </Dropdown>
                                                            </div>
                                                            <Card.Text className="bg-light rounded text-center text-primary p-2 info-card mt-3">
                                                                <FontAwesomeIcon className="me-2" icon={faLocationDot} title="Localização" />
                                                                {job.city}, {job.state}
                                                            </Card.Text>
                                                            <Row className="mb-2">
                                                                <Col xs={6}>
                                                                    <Card.Text className="bg-light rounded text-center text-primary p-2 info-card">
                                                                        <FontAwesomeIcon
                                                                            className="me-2"
                                                                            icon={job.modality === 'Remoto' ? faHome : job.modality === 'Presencial' ? faBuilding : faLaptopHouse}
                                                                            title="Modelo"
                                                                        />
                                                                        {job.modality}
                                                                    </Card.Text>
                                                                </Col>
                                                                <Col xs={6}>
                                                                    <Card.Text className="bg-light rounded text-center text-primary p-2 info-card">
                                                                        <FontAwesomeIcon className="me-2" icon={faBriefcase} title="Tipo" />
                                                                        {job.type}
                                                                    </Card.Text>
                                                                </Col>
                                                            </Row>
                                                            <Row className="mb-2">
                                                                <Col xs={6}>
                                                                    <Card.Text className="bg-light rounded text-center text-primary p-2 info-card">
                                                                        <FontAwesomeIcon className="me-2" icon={faMoneyBillWave} title="Salário" />
                                                                        {job.salary ? job.salary : 'A combinar'}
                                                                    </Card.Text>
                                                                </Col>
                                                                <Col xs={6}>
                                                                    {job.pcd && (
                                                                        <Card.Text className="bg-light rounded text-center text-primary p-2 info-card">
                                                                            <FontAwesomeIcon className="me-2" icon={faWheelchair} title="PcD" />
                                                                            PcD
                                                                        </Card.Text>
                                                                    )}
                                                                </Col>
                                                            </Row>
                                                            <Row className="mb-2">
                                                                <Col>
                                                                    <Card.Text
                                                                        className="bg-light rounded text-center text-secondary p-2 info-card"
                                                                        style={{ cursor: 'pointer' }}
                                                                        onClick={() => viewCandidates(job._id)}>
                                                                        Total de inscrições: {job.totalApplications}
                                                                    </Card.Text>
                                                                </Col>
                                                            </Row>
                                                            <hr className="my-3 rounded justify-content-center" />
                                                            <div className="d-flex flex-wrap justify-content-between mt-3">
                                                                <small className="text-muted text-truncate">
                                                                    Publicada em: {new Date(job.publicationDate).toLocaleDateString()}
                                                                </small>
                                                                {activeTab === 'encerrada' && job && job.closingDate && (
                                                                    <small className="text-muted text-truncate">
                                                                        Encerrada em: {new Date(job.closingDate).toLocaleDateString()}
                                                                    </small>
                                                                )}
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <Card.Text>Informações da vaga não disponíveis</Card.Text>
                                                    )}
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    ))}
                                    {/* Paginação */}
                                    {totalPages > 1 && (
                                        <div className="d-flex flex-row p-2 justify-content-center" style={{ marginLeft: '6px' }}>
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
                                <p className="text-center mt-4">Nenhuma vaga encontrada...</p>
                            )}
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
                fetchCities={(stateCode) => fetchLocations(stateCode)}
                setSelectedState={setSelectedStateModal}
                setSelectedCity={setSelectedCityModal}
                selectedState={selectedStateModal}
                selectedCity={selectedCityModal}
            />

        </>
    );
};

export default VagasEmpresa;
