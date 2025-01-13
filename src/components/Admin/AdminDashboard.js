import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/axiosConfig';
import { Button, Form, Table, Container, Row, Col, InputGroup, Pagination, Breadcrumb, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faToggleOn, faToggleOff, faPlus, faSearch, faSortDown, faSortUp, faEye } from '@fortawesome/free-solid-svg-icons';
import { showToast } from '../ToastNotification';
import useFormattedCNPJ, { formatCNPJ } from '../../hooks/useFormattedCNPJ';
import ModalComponent from './ModalComponent';
import CurriculoTemplate from '../Candidato/Curriculo/CurriculoTemplate';
import { createRoot } from 'react-dom/client'; // Importar createRoot do react-dom/client
import useFormattedDate from '../../hooks/useFormattedDate';
import './AdminDashboard.css';
import HeaderAdmin from './HeaderAdmin';

const AdminDashboard = () => {
    const [empresas, setEmpresas] = useState([]);
    const [candidatos, setCandidatos] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showDisableModal, setShowDisableModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentEmpresa, setCurrentEmpresa] = useState({ nome: '', cnpj: '', setor: '', email: '', senha: '', status: true });
    const [empresaToDelete, setEmpresaToDelete] = useState(null);
    const [empresaToDisable, setEmpresaToDisable] = useState(null);
    const [formattedCnpj, setFormattedCnpj] = useFormattedCNPJ('');
    const { formatDate } = useFormattedDate();
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortColumn, setSortColumn] = useState('nome');
    const [sortDirection, setSortDirection] = useState('asc');
    const [isModified, setIsModified] = useState(false);
    const [totalPages, setTotalPages] = useState(1);
    const [activeTab, setActiveTab] = useState('empresas');
    const [currentPageEmpresas, setCurrentPageEmpresas] = useState(1); // Página das empresas
    const [currentPageVagas, setCurrentPageVagas] = useState(1); // Página das vagas
    const [currentPageCandidatosVaga, setCurrentPageCandidatosVaga] = useState(1); // Página dos candidatos de uma vaga
    const [currentPageCandidatos, setCurrentPageCandidatos] = useState(1); // Página dos candidatos gerais (aba)

    //Breadcrumb
    const [currentView, setCurrentView] = useState('empresas');
    const [breadcrumb, setBreadcrumb] = useState(['Empresas']);
    const [jobs, setJobs] = useState([]);
    const [candidatosVaga, setCandidatosVaga] = useState([]);
    const [selectedCompanyId, setSelectedCompanyId] = useState(null); // Armazena o ID da empresa selecionada
    const [selectedJobId, setSelectedJobId] = useState(null); // Armazena o ID da vaga selecionada

    const fetchEmpresas = useCallback(async (page = 1, search = '', filter = '') => {
        setLoading(true);
        try {
            const response = await api.get(`${process.env.REACT_APP_API_URL}/api/company`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                params: { page, search, filterStatus: filter, limit: itemsPerPage, sortColumn, sortDirection }
            });
            setEmpresas(response.data.companies);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error('Erro ao buscar empresas:', error);
        } finally {
            setLoading(false);
        }
    }, [itemsPerPage, sortColumn, sortDirection]);


    const fetchCandidatos = useCallback(async (page = 1, search = '') => {
        setLoading(true);
        try {
            const response = await api.get(`${process.env.REACT_APP_API_URL}/api/user/candidatos`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                params: { page, search, limit: itemsPerPage }
            });
            setCandidatos(response.data.candidates);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error('Erro ao buscar candidatos:', error);
        } finally {
            setLoading(false);
        }
    }, [itemsPerPage]);


    useEffect(() => {
        document.title = "ACI Empregos | Painel Administrativo";
        if (activeTab === 'empresas') {
            fetchEmpresas(currentPage, searchTerm);
        } else {
            fetchCandidatos(currentPage, searchTerm);
        }
    }, [currentPage, searchTerm, sortColumn, sortDirection, activeTab, fetchEmpresas, fetchCandidatos]);

    const fetchJobsByCompany = async (companyId, page = 1) => {
        setLoading(true);
        try {
            setSelectedCompanyId(companyId); // Armazena o ID da empresa selecionada no estado
            const response = await api.get(`${process.env.REACT_APP_API_URL}/api/jobs/${companyId}/jobs`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                params: { page, limit: itemsPerPage }
            });
            setJobs(response.data.jobs);
            setTotalPages(response.data.totalPages);
            setCurrentView('vagas');
            setBreadcrumb(['Empresas', 'Vagas']);
        } catch (error) {
            console.error('Erro ao buscar vagas:', error);
        } finally {
            setLoading(false);
        }
    };


    const fetchCandidatesByJob = async (jobId, page = 1) => {
        setLoading(true);
        try {
            setSelectedJobId(jobId); // Armazena o ID da vaga selecionada
            const response = await api.get(`${process.env.REACT_APP_API_URL}/api/jobs/${jobId}/candidates`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                params: { page, limit: itemsPerPage }
            });
            setCandidatosVaga(response.data.candidates);
            setTotalPages(response.data.totalPages);
            setCurrentView('candidatos');
            setBreadcrumb(['Empresas', 'Vagas', 'Candidatos']);
        } catch (error) {
            console.error('Erro ao buscar candidatos:', error);
        } finally {
            setLoading(false);
        }
    };


    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name === 'cnpj') {
            setFormattedCnpj(value);
            setCurrentEmpresa({ ...currentEmpresa, [name]: value });
        } else {
            setCurrentEmpresa({ ...currentEmpresa, [name]: type === 'checkbox' ? checked : value });
        }
        setIsModified(true);
    };

    const handleShowModal = (empresa = { nome: '', cnpj: '', setor: '', email: '', status: true }) => {
        // Remova a senha do objeto empresa antes de setar o estado
        const { senha, ...empresaSemSenha } = empresa;
        setCurrentEmpresa({ ...empresaSemSenha, senha: '' });  // Sete a senha como vazia
        setFormattedCnpj(empresa.cnpj);
        setEditMode(!!empresa._id);
        setShowModal(true);
        setIsModified(false);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setCurrentEmpresa({ nome: '', cnpj: '', setor: '', email: '', senha: '', status: true });
        setFormattedCnpj('');
    };

    const handleShowDeleteModal = (empresa) => {
        handleCloseModal(true);
        setEmpresaToDelete(empresa);
        setShowDeleteModal(true);
    };

    const handleCloseDeleteModal = () => {
        setShowDeleteModal(false);
        setEmpresaToDelete(null);
    };

    const handleShowDisableModal = (empresa) => {
        setEmpresaToDisable(empresa);
        setShowDisableModal(true);
    };

    const handleCloseDisableModal = () => {
        setShowDisableModal(false);
        setEmpresaToDisable(null);
    };

    const handleCloseDetailsModal = () => {
        setShowDetailsModal(false);
        setCurrentEmpresa({ nome: '', cnpj: '', setor: '', email: '', senha: '', status: true });
        setFormattedCnpj('');
    };

    const handleSaveEmpresa = async () => {
        setLoading(true);
        try {
            const empresaData = {
                nome: currentEmpresa.nome,
                cnpj: formattedCnpj.replace(/[^\d]+/g, ''), // Remove pontuações antes de enviar
                setor: currentEmpresa.setor,
                email: currentEmpresa.email,
                status: currentEmpresa.status
            };

            if (currentEmpresa.senha) {
                empresaData.senha = currentEmpresa.senha;
            }

            if (!empresaData.nome || !empresaData.cnpj || !empresaData.setor || !empresaData.email) {
                showToast('Por favor, preencha todos os campos obrigatórios!', 'error');
                setLoading(false);
                return;
            }

            if (empresaData.nome.length > 100) {
                showToast('O nome deve ter no máximo 100 caracteres!', 'error');
                setLoading(false);
                return;
            }

            if (empresaData.setor.length > 50) {
                showToast('O setor deve ter no máximo 50 caracteres!', 'error');
                setLoading(false);
                return;
            }

            if (empresaData.email.length > 50) {
                showToast('O email deve ter no máximo 50 caracteres!', 'error');
                setLoading(false);
                return;
            }
            if (editMode) {
                await api.put(`${process.env.REACT_APP_API_URL}/api/company/${currentEmpresa._id}`, empresaData, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
            } else {
                await api.post(`${process.env.REACT_APP_API_URL}/api/company/add`, empresaData, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
            }
            showToast(editMode ? 'Empresa atualizada com sucesso!' : 'Empresa adicionada com sucesso!', 'success');
            fetchEmpresas(currentPage, searchTerm);
            handleCloseModal();
        } catch (error) {
            console.error('Erro ao salvar empresa:', error);
            if (error.response && error.response.data && error.response.data.error) {
                showToast(error.response.data.error, 'error');
            } else {
                showToast('Erro ao salvar empresa!', 'error');
            }
        } finally {
            setLoading(false);
            setIsModified(false);
        }
    };

    const handleDeleteEmpresa = async () => {
        setLoading(true);
        try {
            await api.delete(`${process.env.REACT_APP_API_URL}/api/company/${empresaToDelete._id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            const updatedEmpresas = empresas.filter(empresa => empresa._id !== empresaToDelete._id);

            if (updatedEmpresas.length === 0 && currentPage > 1) {
                setCurrentPage(currentPage - 1);
            } else {
                fetchEmpresas(currentPage, searchTerm);
            }

            handleCloseDeleteModal();
            showToast('Empresa deletada com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao deletar empresa:', error);
            showToast('Erro ao deletar empresa!', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleDisableEmpresa = async () => {
        setLoading(true);
        try {
            const updatedEmpresa = { ...empresaToDisable, status: !empresaToDisable.status };
            await api.put(`${process.env.REACT_APP_API_URL}/api/company/${empresaToDisable._id}`, updatedEmpresa, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            fetchEmpresas(currentPage, searchTerm);
            handleCloseDisableModal();
            showToast(`Empresa ${updatedEmpresa.status ? 'habilitada' : 'desabilitada'} com sucesso!`, 'success');
        } catch (error) {
            showToast('Erro ao desabilitar/habilitar empresa!', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSort = (column) => {
        const newDirection = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
        setSortColumn(column);
        setSortDirection(newDirection);
    };

    const renderPagination = (currentPage, totalPages, onPageChange) => (
        totalPages > 1 && (
            <Pagination>
                <Pagination.Prev
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                />
                {[...Array(totalPages).keys()].map(number => (
                    <Pagination.Item
                        key={number + 1}
                        onClick={() => onPageChange(number + 1)}
                        active={number + 1 === currentPage}
                    >
                        {number + 1}
                    </Pagination.Item>
                ))}
                <Pagination.Next
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                />
            </Pagination>
        )
    );

    const handleTabChange = (tab) => {
        setActiveTab(tab);

        if (tab === 'empresas') {
            setCurrentPageEmpresas(1); // Reseta para página 1 ao alternar
        } else if (tab === 'candidatos') {
            setCurrentPageCandidatos(1); // Reseta para página 1 ao alternar
        }
    };

    const paginateEmpresas = (pageNumber) => {
        setCurrentPageEmpresas(pageNumber); // Atualiza a página atual de empresas
        fetchEmpresas(pageNumber, searchTerm); // Chama a função de busca de empresas
    };

    const renderEmpresasTable = () => (
        <>
            <Row className="mb-3 align-items-center">
                <Col xs={12} md={2} className="d-flex justify-content-start mb-2 mb-md-0">
                    <Button variant="outline-primary" className="me-2 flex-grow-1 w-100" onClick={() => handleShowModal()}>
                        <FontAwesomeIcon icon={faPlus} /> Adicionar
                    </Button>
                </Col>
                <Col xs={12} md={10} className="d-flex justify-content-end">
                    <InputGroup style={{ maxWidth: '500px' }}>
                        <Form.Control
                            type="text"
                            placeholder="Pesquisar"
                            aria-label="Pesquisar"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                        <Button variant="outline-secondary" style={{ maxWidth: '100px' }}>
                            <FontAwesomeIcon icon={faSearch} />
                        </Button>
                    </InputGroup>
                </Col>
            </Row>
            <Row>
                {loading ? (
                    <div className="d-flex justify-content-center align-items-center" >
                        <Spinner animation='border' variant='primary' />
                    </div>
                ) : empresas.length > 0 ? (
                    <>
                        <Table striped hover responsive className="table-admin shadow-sm mt-2 rounded text-wrap">
                            <thead>
                                <tr>
                                    <th onClick={() => handleSort('nome')}>
                                        Nome
                                        {sortColumn === 'nome' && (
                                            <FontAwesomeIcon icon={sortDirection === 'asc' ? faSortUp : faSortDown} className="sort-icon" />
                                        )}
                                    </th>
                                    <th onClick={() => handleSort('cnpj')}>
                                        CNPJ
                                        {sortColumn === 'cnpj' && (
                                            <FontAwesomeIcon icon={sortDirection === 'asc' ? faSortUp : faSortDown} className="sort-icon" />
                                        )}
                                    </th>
                                    <th onClick={() => handleSort('setor')}>
                                        Setor
                                        {sortColumn === 'setor' && (
                                            <FontAwesomeIcon icon={sortDirection === 'asc' ? faSortUp : faSortDown} className="sort-icon" />
                                        )}
                                    </th>
                                    <th onClick={() => handleSort('email')}>
                                        Email
                                        {sortColumn === 'email' && (
                                            <FontAwesomeIcon icon={sortDirection === 'asc' ? faSortUp : faSortDown} className="sort-icon" />
                                        )}
                                    </th>
                                    <th onClick={() => handleSort('status')}>
                                        Ativa
                                        {sortColumn === 'status' && (
                                            <FontAwesomeIcon icon={sortDirection === 'asc' ? faSortUp : faSortDown} className="sort-icon" />
                                        )}
                                    </th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {empresas.map((empresa) => (
                                    <tr key={empresa._id}>
                                        <td>{empresa.nome}</td>
                                        <td>{formatCNPJ(empresa.cnpj)}</td>
                                        <td>{empresa.setor}</td>
                                        <td>{empresa.email}</td>
                                        <td>
                                            <span className={`status-indicator ${empresa.status ? 'active' : 'inactive'}`} />
                                            {empresa.status ? 'Sim' : 'Não'}
                                        </td>
                                        <td>
                                            <div className="btn-group">
                                                <FontAwesomeIcon icon={faEye} className="icon-btn" onClick={() => fetchJobsByCompany(empresa._id)} title="Visualizar vagas" />
                                                <FontAwesomeIcon icon={faEdit} className="icon-btn" onClick={() => handleShowModal(empresa)} title="Editar" />
                                                <FontAwesomeIcon icon={empresa.status ? faToggleOn : faToggleOff} className="icon-btn" onClick={() => handleShowDisableModal(empresa)} title={empresa.status ? 'Desabilitar' : 'Habilitar'} />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </>
                ) : (
                    <p className='text-center mt-4'>Nenhuma empresa cadastrada...</p>
                )}
            </Row>
        </>
    );

    const paginateCandidatos = (pageNumber) => {
        setCurrentPageCandidatos(pageNumber); // Atualiza a página atual dos candidatos
        fetchCandidatos(pageNumber, searchTerm); // Chama a função de busca de candidatos gerais
    };

    const renderCandidatosTable = () => (
        <>
            <Row className="mb-3 align-items-center">
                <h1>Candidatos</h1>
                <Col xs={12} md={12} className="d-flex justify-content-end">
                    <InputGroup style={{ maxWidth: '500px' }}>
                        <Form.Control
                            type="text"
                            placeholder="Pesquisar"
                            aria-label="Pesquisar"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                        <Button variant="outline-secondary" style={{ maxWidth: '100px' }}>
                            <FontAwesomeIcon icon={faSearch} />
                        </Button>
                    </InputGroup>
                </Col>
            </Row>
            {loading ? (
                <div className="d-flex justify-content-center align-items-center" >
                    <Spinner animation='border' variant='primary' />
                </div>
            ) : candidatos.length > 0 ? (
                <>
                    <Table striped hover className="shadow mt-3 rounded">
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Sobrenome</th>
                                <th>Último acesso</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {candidatos.map((candidato) => (
                                <tr key={candidato._id} className={candidato.isInactive ? 'table-danger' : ''}>
                                    <td>{candidato.nome}</td>
                                    <td>{candidato.sobrenome}</td>
                                    <td>{formatDate(candidato.lastAccess)}</td>
                                    <td>
                                        <Button variant="primary" onClick={() => handleViewCurriculo(candidato._id)}>
                                            Currículo
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>


                    </Table>
                </>
            ) : (
                <p className='text-center mt-4'>Nenhum candidato cadastrado...</p>
            )}
        </>
    );

    const paginateJobs = (pageNumber) => {
        if (selectedCompanyId) {
            fetchJobsByCompany(selectedCompanyId, pageNumber); // Garante que o companyId está sendo passado
            setCurrentPage(pageNumber); // Atualiza o estado da página atual
        }
    };

    const renderJobsTable = () => (
        <>
            {loading ? (
                <div className="d-flex justify-content-center">
                    <Spinner animation="border" variant="primary" />
                </div>
            ) : jobs.length > 0 ? (
                <>
                    <Table striped hover className="shadow mt-3 rounded">
                        <thead>
                            <tr>
                                <th>Título</th>
                                <th>Localização</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {jobs.map((job) => (
                                <tr key={job._id}>
                                    <td>{job.title}</td>
                                    <td>{job.location}</td>
                                    <td>
                                        <Button variant="primary" onClick={() => fetchCandidatesByJob(job._id)}>
                                            Candidatos
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                    {/* Renderizar paginação */}
                    {renderPagination(currentPage, totalPages, paginateJobs)}
                </>
            ) : (
                <p className="text-center mt-4">Nenhuma vaga cadastrada...</p>
            )}
        </>
    );

    const paginateCandidates = (pageNumber) => {
        if (selectedJobId) {
            fetchCandidatesByJob(selectedJobId, pageNumber); // Garante que o jobId está sendo passado corretamente
            setCurrentPage(pageNumber); // Atualiza o estado da página atual
        }
    };

    const renderCandidatosVagasTable = () => (
        <>
            {loading ? (
                <div className="d-flex justify-content-center">
                    <Spinner animation="border" variant="primary" />
                </div>
            ) : candidatosVaga.length > 0 ? (
                <>
                    <Table striped hover className="shadow mt-3 rounded">
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Email</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {candidatosVaga.map((candidato) => (
                                <tr key={candidato._id}>
                                    <td>{candidato.user && candidato.user.nome ? candidato.user.nome : 'Nome não disponível'}</td>
                                    <td>{candidato.user && candidato.user.email ? candidato.user.email : 'Email não disponível'}</td>
                                    <td>
                                        <Button variant="primary" onClick={() => handleViewCurriculo(candidato.user._id)}>
                                            Currículo
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                    {/* Renderizar paginação */}
                    {renderPagination(currentPage, totalPages, paginateCandidates)}
                </>
            ) : (
                <p className="text-center mt-4">Nenhum candidato cadastrado...</p>
            )}
        </>
    );

    const handleBreadcrumbClick = (level) => {
        if (level === 'empresas') {
            setCurrentPageEmpresas(currentPageEmpresas); // Restaura a página de empresas
            fetchEmpresas(currentPageEmpresas, searchTerm); // Recarrega as empresas
            setBreadcrumb(['Empresas']);
            setCurrentView('empresas');
        } else if (level === 'vagas') {
            setCurrentPageVagas(currentPageVagas); // Restaura a página de vagas
            fetchJobsByCompany(selectedCompanyId, currentPageVagas); // Recarrega as vagas
            setBreadcrumb(['Empresas', 'Vagas']);
            setCurrentView('vagas');
        } else if (level === 'candidatos') {
            setCurrentPageCandidatosVaga(currentPageCandidatosVaga); // Restaura a página de candidatos
            fetchCandidatesByJob(selectedJobId, currentPageCandidatosVaga); // Recarrega os candidatos
            setBreadcrumb(['Empresas', 'Vagas', 'Candidatos']);
            setCurrentView('candidatos');
        }
    };

    const handleViewCurriculo = (candidatoId) => {
        const newWindow = window.open('', '', 'width=800,height=600');
        newWindow.document.write('<html><head><title>Currículo</title></head><body><div id="curriculo-template-root"></div></body></html>');
        // Injetar link CSS do Bootstrap na nova janela
        const bootstrapLink = newWindow.document.createElement('link');
        bootstrapLink.rel = 'stylesheet';
        bootstrapLink.href = 'https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css';
        newWindow.document.head.appendChild(bootstrapLink);

        // Injetar link CSS personalizado na nova janela
        const customLink = newWindow.document.createElement('link');
        customLink.rel = 'stylesheet';
        customLink.type = 'text/css';
        customLink.href = `${window.location.origin}/CurriculoTemplate.css`;
        newWindow.document.head.appendChild(customLink);

        newWindow.document.close();

        api.get(`${process.env.REACT_APP_API_URL}/api/user/candidato/${candidatoId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }).then(response => {
            const user = response.data;
            const informacoes = {
                nome: user.nome,
                sobrenome: user.sobrenome,
                dataNascimento: user.nascimento ? user.nascimento.split('T')[0] : '',
                email: user.email,
                telefoneContato: user.additionalInfo?.contactPhone || '',
                telefoneRecado: user.additionalInfo?.backupPhone || '',
                cnh: user.additionalInfo?.cnh || 'Não tenho',
                tipoCnh: user.additionalInfo?.cnhTypes || [],
                fotoPerfil: `${process.env.REACT_APP_API_URL}${user.profilePicture}` || '',
                habilidadesProfissionais: user.habilidadesProfissionais || [],
                habilidadesComportamentais: user.habilidadesComportamentais || [],
                cursos: user.cursos || [],
                objetivos: user.objetivos || []
            };
            const experiencias = user.experiences || [];
            const formacoes = user.formacao || [];

            const root = createRoot(newWindow.document.getElementById('curriculo-template-root'));
            root.render(
                <CurriculoTemplate
                    experiencias={experiencias}
                    formacoes={formacoes}
                    informacoes={informacoes}
                />
            );
        }).catch(error => {
            console.error('Erro ao buscar currículo do candidato:', error);
            newWindow.close();
        });
    };

    return (
        <div>
            <HeaderAdmin />
            <Container className="mt-3">
                <Row className="mb-3">
                    <Col md={6} xs={12}>
                        <Button
                            variant={activeTab === 'empresas' ? 'primary' : 'secondary'}
                            onClick={() => {
                                handleTabChange('empresas')
                                setActiveTab('empresas');
                                setCurrentView('empresas'); // Resetando para empresas quando clicado
                                setBreadcrumb(['Empresas']); // Atualizando o breadcrumb para Empresas
                            }}
                            className="me-2"
                        >
                            Empresas
                        </Button>
                    </Col>
                    <Col md={6} xs={12}>
                        <Button
                            variant={activeTab === 'candidatos' ? 'primary' : 'secondary'}
                            onClick={() => {
                                handleTabChange('candidatos')
                                setActiveTab('candidatos');
                                setCurrentView(''); // Não precisa de currentView para candidatos diretos
                            }}
                        >
                            Candidatos
                        </Button>
                    </Col>
                </Row>

                {/* Renderização condicional do Breadcrumb apenas para Empresas */}
                {activeTab === 'empresas' && (
                    <Breadcrumb>
                        <Breadcrumb.Item
                            onClick={() => handleBreadcrumbClick('empresas')}
                            style={{ cursor: 'pointer' }}
                        >
                            <span>Empresas</span>
                        </Breadcrumb.Item>

                        {breadcrumb.includes('Vagas') && (
                            <Breadcrumb.Item
                                onClick={() => handleBreadcrumbClick('vagas')}
                                style={{ cursor: 'pointer' }}
                            >
                                <span>Vagas</span>
                            </Breadcrumb.Item>
                        )}

                        {breadcrumb.includes('Candidatos') && (
                            <Breadcrumb.Item active style={{ cursor: 'default' }}>
                                <span>Candidatos</span>
                            </Breadcrumb.Item>
                        )}
                    </Breadcrumb>

                )}

                {/* Renderização condicional baseada no activeTab */}
                {activeTab === 'empresas' && currentView === 'empresas' && (
                    <>
                        {renderEmpresasTable()}
                        {renderPagination(currentPageEmpresas, totalPages, paginateEmpresas)}
                    </>
                )}
                {activeTab === 'empresas' && currentView === 'vagas' && renderJobsTable()}
                {activeTab === 'empresas' && currentView === 'candidatos' && renderCandidatosVagasTable()}
                {activeTab === 'candidatos' && (
                    <>
                        {renderCandidatosTable()}
                        {renderPagination(currentPageCandidatos, totalPages, paginateCandidatos)}
                    </>
                )}
            </Container>

            <ModalComponent
                show={showModal}
                handleClose={handleCloseModal}
                title={editMode ? 'Editar empresa' : 'Adicionar empresa'}
                body={
                    <Form autoComplete="off">
                        <Form.Group className='campos-empresa'>
                            <Form.Label>Nome</Form.Label>
                            <Form.Control
                                type="text"
                                name="nome"
                                value={currentEmpresa.nome}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className='campos-empresa'>
                            <Form.Label>CNPJ</Form.Label>
                            <Form.Control
                                type="text"
                                name="cnpj"
                                value={formattedCnpj}
                                onChange={handleInputChange}
                                required
                                maxLength="18"
                            />
                        </Form.Group>
                        <Form.Group className='campos-empresa'>
                            <Form.Label>Setor</Form.Label>
                            <Form.Control
                                type="text"
                                name="setor"
                                value={currentEmpresa.setor}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className='campos-empresa'>
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                value={currentEmpresa.email}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className='campos-empresa'>
                            <Form.Label>Senha</Form.Label>
                            <Form.Control
                                type="password"
                                name="senha"
                                value={currentEmpresa.senha}
                                onChange={handleInputChange}
                            />
                        </Form.Group>
                        <Form.Group className='campos-empresa'>
                            <Form.Check
                                type="checkbox"
                                label="Status"
                                name="status"
                                checked={currentEmpresa.status}
                                onChange={handleInputChange}
                            />
                        </Form.Group>
                        {editMode ?
                            <Form.Group className='campos-empresa'>
                                <Button variant="danger" className='w-100' onClick={() => handleShowDeleteModal(currentEmpresa)} title="Deletar">
                                    Deletar empresa
                                </Button>
                            </Form.Group>
                            : null}
                    </Form>
                }
                footer={
                    <>
                        <Button variant="primary" onClick={handleSaveEmpresa} disabled={!isModified}>
                            {editMode ? 'Salvar' : 'Adicionar'}
                        </Button>
                        <Button variant="secondary" onClick={handleCloseModal}>
                            Cancelar
                        </Button>
                    </>
                }
            />

            <ModalComponent
                show={showDeleteModal}
                handleClose={handleCloseDeleteModal}
                title="Confirmar exclusão"
                body={`Tem certeza que deseja deletar a empresa ${empresaToDelete?.nome}?`}
                footer={
                    <>
                        <Button variant="danger" className="w-100" onClick={handleDeleteEmpresa}>
                            Deletar
                        </Button>
                        <Button variant="secondary" onClick={handleCloseDeleteModal}>
                            Cancelar
                        </Button>
                    </>
                }
            />

            <ModalComponent
                show={showDisableModal}
                handleClose={handleCloseDisableModal}
                title={empresaToDisable?.status ? 'Desabilitar Empresa' : 'Habilitar Empresa'}
                body={`Tem certeza que deseja ${empresaToDisable?.status ? 'desabilitar' : 'habilitar'} a empresa ${empresaToDisable?.nome}?`}
                footer={
                    <>
                        <Button variant="outline-dark" className="w-100" onClick={handleToggleDisableEmpresa}>
                            {empresaToDisable?.status ? 'Desabilitar' : 'Habilitar'}
                        </Button>
                        <Button variant="secondary" onClick={handleCloseDisableModal}>
                            Cancelar
                        </Button>
                    </>
                }
            />

            <ModalComponent
                show={showDetailsModal}
                handleClose={handleCloseDetailsModal}
                title="Detalhes da Empresa"
                body={
                    <>
                        <p><strong>Nome:</strong> {currentEmpresa.nome}</p>
                        <p><strong>CNPJ:</strong> {formatCNPJ(currentEmpresa.cnpj)}</p>
                        <p><strong>Setor:</strong> {currentEmpresa.setor}</p>
                        <p><strong>Email:</strong> {currentEmpresa.email}</p>
                        <p><strong>Status:</strong> {currentEmpresa.status ? 'Ativa' : 'Inativa'}</p>
                    </>
                }
                footer={
                    <Button variant="secondary" onClick={handleCloseDetailsModal}>
                        Fechar
                    </Button>
                }
            />
        </div>
    );
};

export default AdminDashboard;