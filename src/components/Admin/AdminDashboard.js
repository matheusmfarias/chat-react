import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button, Form, Table, Navbar, Nav, Container, Row, Col, InputGroup, Pagination } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faToggleOn, faToggleOff, faPlus, faSearch, faSortDown, faSortUp, faSignOutAlt, faEye, faFilter } from '@fortawesome/free-solid-svg-icons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useFormattedCNPJ, { formatCNPJ } from '../../hooks/useFormattedCNPJ';
import ModalComponent from './ModalComponent';
import CurriculoTemplate from '../Candidato/Curriculo/CurriculoTemplate';
import { createRoot } from 'react-dom/client'; // Importar createRoot do react-dom/client
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [empresas, setEmpresas] = useState([]);
    const [candidatos, setCandidatos] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showDisableModal, setShowDisableModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentEmpresa, setCurrentEmpresa] = useState({ nome: '', cnpj: '', setor: '', email: '', senha: '', isDisabled: false });
    const [empresaToDelete, setEmpresaToDelete] = useState(null);
    const [empresaToDisable, setEmpresaToDisable] = useState(null);
    const [formattedCnpj, setFormattedCnpj] = useFormattedCNPJ('');
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [sortColumn, setSortColumn] = useState('nome');
    const [sortDirection, setSortDirection] = useState('asc');
    const [isModified, setIsModified] = useState(false);
    const [isFilterModified, setIsFilterModified] = useState(false);
    const [totalPages, setTotalPages] = useState(1);
    const [activeTab, setActiveTab] = useState('empresas');
    const navigate = useNavigate();

    const fetchEmpresas = useCallback(async (page = 1, search = '', filter = '') => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:5000/api/company', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                params: { page, search, filterStatus: filter, limit: itemsPerPage, sortColumn, sortDirection }
            });
            console.log("Dados recebidos:", response.data);
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
            const response = await axios.get('http://localhost:5000/api/user/candidatos', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                params: { page, search, limit: itemsPerPage }
            });
            console.log("Dados recebidos:", response.data);
            setCandidatos(response.data.candidates);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error('Erro ao buscar candidatos:', error);
        } finally {
            setLoading(false);
        }
    }, [itemsPerPage]);

    useEffect(() => {
        if (activeTab === 'empresas') {
            fetchEmpresas(currentPage, searchTerm);
        } else {
            fetchCandidatos(currentPage, searchTerm);
        }
    }, [currentPage, searchTerm, sortColumn, sortDirection, activeTab, fetchEmpresas, fetchCandidatos]);

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

    const handleShowModal = (empresa = { nome: '', cnpj: '', setor: '', email: '', senha: '', isDisabled: false }) => {
        setCurrentEmpresa({ ...empresa });
        setFormattedCnpj(empresa.cnpj);
        setEditMode(!!empresa._id);
        setShowModal(true);
        setIsModified(false);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setCurrentEmpresa({ nome: '', cnpj: '', setor: '', email: '', senha: '', isDisabled: false });
        setFormattedCnpj('');
    };

    const handleShowDeleteModal = (empresa) => {
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

    const handleShowDetailsModal = (empresa) => {
        setCurrentEmpresa(empresa);
        setShowDetailsModal(true);
    };

    const handleCloseDetailsModal = () => {
        setShowDetailsModal(false);
        setCurrentEmpresa({ nome: '', cnpj: '', setor: '', email: '', senha: '', isDisabled: false });
        setFormattedCnpj('');
    };

    const handleShowFilterModal = () => {
        setShowFilterModal(true);
    };

    const handleCloseFilterModal = () => {
        setShowFilterModal(false);
        setIsFilterModified(false);
    };

    const handleFilterChange = (e) => {
        setFilterStatus(e.target.value);
        setIsFilterModified(true);
    };

    const handleSaveEmpresa = async () => {
        setLoading(true);
        try {
            const empresaData = {
                nome: currentEmpresa.nome,
                cnpj: formattedCnpj.replace(/[^\d]+/g, ''), // Remove pontuações antes de enviar
                setor: currentEmpresa.setor,
                email: currentEmpresa.email,
                isDisabled: currentEmpresa.isDisabled
            };

            if (currentEmpresa.senha) {
                empresaData.senha = currentEmpresa.senha;
            }

            if (!empresaData.nome || !empresaData.cnpj || !empresaData.setor || !empresaData.email) {
                notify('Por favor, preencha todos os campos obrigatórios!', 'error');
                setLoading(false);
                return;
            }

            if (empresaData.nome.length > 100) {
                notify('O nome deve ter no máximo 100 caracteres!', 'error');
                setLoading(false);
                return;
            }

            if (empresaData.setor.length > 50) {
                notify('O setor deve ter no máximo 50 caracteres!', 'error');
                setLoading(false);
                return;
            }

            if (empresaData.email.length > 50) {
                notify('O email deve ter no máximo 50 caracteres!', 'error');
                setLoading(false);
                return;
            }

            console.log("Enviando dados da empresa:", empresaData);
            let response;
            if (editMode) {
                response = await axios.put(`http://localhost:5000/api/company/${currentEmpresa._id}`, empresaData, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
            } else {
                response = await axios.post('http://localhost:5000/api/company/add', empresaData, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
            }
            console.log("Resposta do servidor:", response);
            notify(editMode ? 'Empresa atualizada com sucesso!' : 'Empresa adicionada com sucesso!', 'success');
            fetchEmpresas(currentPage, searchTerm, filterStatus);
            handleCloseModal();
        } catch (error) {
            console.error('Erro ao salvar empresa:', error);
            if (error.response && error.response.data && error.response.data.error) {
                notify(error.response.data.error, 'error');
            } else {
                notify('Erro ao salvar empresa!', 'error');
            }
        } finally {
            setLoading(false);
            setIsModified(false);
        }
    };

    const handleDeleteEmpresa = async () => {
        setLoading(true);
        try {
            await axios.delete(`http://localhost:5000/api/company/${empresaToDelete._id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            const updatedEmpresas = empresas.filter(empresa => empresa._id !== empresaToDelete._id);

            if (updatedEmpresas.length === 0 && currentPage > 1) {
                setCurrentPage(currentPage - 1);
            } else {
                fetchEmpresas(currentPage, searchTerm, filterStatus);
            }

            handleCloseDeleteModal();
            notify('Empresa deletada com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao deletar empresa:', error);
            notify('Erro ao deletar empresa!', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleDisableEmpresa = async () => {
        setLoading(true);
        try {
            const updatedEmpresa = { ...empresaToDisable, isDisabled: !empresaToDisable.isDisabled };
            await axios.put(`http://localhost:5000/api/company/${empresaToDisable._id}`, updatedEmpresa, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            fetchEmpresas(currentPage, searchTerm, filterStatus);
            handleCloseDisableModal();
            notify(`Empresa ${updatedEmpresa.isDisabled ? 'desabilitada' : 'habilitada'} com sucesso!`, 'success');
        } catch (error) {
            console.error('Erro ao desabilitar/habilitar empresa:', error);
            notify('Erro ao desabilitar/habilitar empresa!', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/');
    };

    const handleSort = (column) => {
        const newDirection = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
        setSortColumn(column);
        setSortDirection(newDirection);
    };

    const applyFilter = () => {
        handleCloseFilterModal();
        fetchEmpresas(currentPage, searchTerm, filterStatus);
    };

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

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

    const renderPagination = () => {
        return (
            <Pagination>
                <Pagination.Prev onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} />
                {[...Array(totalPages).keys()].map(number => (
                    <Pagination.Item
                        key={number + 1}
                        onClick={() => paginate(number + 1)}
                        active={number + 1 === currentPage}
                    >
                        {number + 1}
                    </Pagination.Item>
                ))}
                <Pagination.Next onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} />
            </Pagination>
        );
    };

    const renderEmpresasTable = () => (
        <>
            <Row className="mb-3 align-items-center">
                <h2 className='display-6'>Empresas</h2>
                <Col xs={12} md={4} className="d-flex justify-content-start mb-2 mb-md-0">
                    <Button variant="primary" className="me-2 flex-grow-1" onClick={() => handleShowModal()}>
                        <FontAwesomeIcon icon={faPlus} /> Adicionar
                    </Button>
                    <Button variant="secondary" className="me-2 flex-grow-1" onClick={handleShowFilterModal}>
                        <FontAwesomeIcon icon={faFilter} /> Filtros
                    </Button>
                </Col>
                <Col xs={12} md={8} className="d-flex justify-content-end">
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
            <div className="table-responsive position-relative">
                {loading && (
                    <div className="table-loader-overlay">
                        <div className="loader"></div>
                    </div>
                )}
                <Table striped bordered hover className="table">
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
                            <th onClick={() => handleSort('isDisabled')}>
                                Status
                                {sortColumn === 'isDisabled' && (
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
                                <td>{empresa.isDisabled ? 'Inativa' : 'Ativa'}</td>
                                <td>
                                    <div className="btn-group">
                                        <FontAwesomeIcon icon={faEye} className="icon-btn" onClick={() => handleShowDetailsModal(empresa)} title="Visualizar detalhes" />
                                        <FontAwesomeIcon icon={faEdit} className="icon-btn" onClick={() => handleShowModal(empresa)} title="Editar" />
                                        <FontAwesomeIcon icon={empresa.isDisabled ? faToggleOff : faToggleOn} className="icon-btn" onClick={() => handleShowDisableModal(empresa)} title={empresa.isDisabled ? 'Habilitar' : 'Desabilitar'} />
                                        <FontAwesomeIcon icon={faTrash} className="icon-btn" onClick={() => handleShowDeleteModal(empresa)} title="Excluir" />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>
            {renderPagination()}
        </>
    );

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

        axios.get(`http://localhost:5000/api/user/candidato/${candidatoId}`, {
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
                fotoPerfil: `http://localhost:5000${user.profilePicture}` || '',
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

    const renderCandidatosTable = () => (
        <>
            <Row className="mb-3 align-items-center">
                <h2 className='display-6'>Candidatos</h2>
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
            <div className="table-responsive position-relative">
                {loading && (
                    <div className="table-loader-overlay">
                        <div className="loader"></div>
                    </div>
                )}
                <Table striped bordered hover className="table">
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Sobrenome</th>
                            <th>Email</th>
                            <th>Telefone</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {candidatos.map((candidato) => (
                            <tr key={candidato._id}>
                                <td>{candidato.nome}</td>
                                <td>{candidato.sobrenome}</td>
                                <td>{candidato.email}</td>
                                <td>{candidato.additionalInfo?.contactPhone || ''}</td>
                                <td>
                                    <Button variant="primary" onClick={() => handleViewCurriculo(candidato._id)}>
                                        <FontAwesomeIcon icon={faEye} /> Visualizar Currículo
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>
            {renderPagination()}
        </>
    );

    return (
        <div>
            <Navbar bg="dark" variant="dark" expand="lg">
                <Container>
                    <Navbar.Brand href="#">Painel administrativo</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="ms-auto">
                            <Button variant="outline-danger" className="ml-auto" onClick={handleLogout} style={{ maxWidth: '100px' }}>
                                <FontAwesomeIcon icon={faSignOutAlt} /> Sair
                            </Button>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
            <Container className="mt-3">
                <Row className="mb-3">
                    <Col>
                        <Button variant={activeTab === 'empresas' ? 'primary' : 'secondary'} onClick={() => setActiveTab('empresas')} className="me-2">
                            Empresas
                        </Button>
                        <Button variant={activeTab === 'candidatos' ? 'primary' : 'secondary'} onClick={() => setActiveTab('candidatos')}>
                            Candidatos
                        </Button>
                    </Col>
                </Row>
                {activeTab === 'empresas' ? renderEmpresasTable() : renderCandidatosTable()}
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
                                label="Inativa"
                                name="isDisabled"
                                checked={currentEmpresa.isDisabled}
                                onChange={handleInputChange}
                            />
                        </Form.Group>
                    </Form>
                }
                footer={
                    <>
                        <Button variant="secondary" onClick={handleCloseModal}>
                            Cancelar
                        </Button>
                        <Button variant="primary" onClick={handleSaveEmpresa} disabled={!isModified}>
                            {editMode ? 'Salvar' : 'Adicionar'}
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
                        <Button variant="secondary" onClick={handleCloseDeleteModal}>
                            Cancelar
                        </Button>
                        <Button variant="danger" onClick={handleDeleteEmpresa}>
                            Deletar
                        </Button>
                    </>
                }
            />

            <ModalComponent
                show={showDisableModal}
                handleClose={handleCloseDisableModal}
                title={empresaToDisable?.isDisabled ? 'Habilitar Empresa' : 'Desabilitar Empresa'}
                body={`Tem certeza que deseja ${empresaToDisable?.isDisabled ? 'habilitar' : 'desabilitar'} a empresa ${empresaToDisable?.nome}?`}
                footer={
                    <>
                        <Button variant="secondary" onClick={handleCloseDisableModal}>
                            Cancelar
                        </Button>
                        <Button variant="outline-dark" onClick={handleToggleDisableEmpresa}>
                            {empresaToDisable?.isDisabled ? 'Habilitar' : 'Desabilitar'}
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
                        <p><strong>Status:</strong> {currentEmpresa.isDisabled ? 'Inativa' : 'Ativa'}</p>
                    </>
                }
                footer={
                    <Button variant="secondary" onClick={handleCloseDetailsModal}>
                        Fechar
                    </Button>
                }
            />

            <ModalComponent
                show={showFilterModal}
                handleClose={handleCloseFilterModal}
                title="Filtros"
                body={
                    <Form>
                        <Form.Group>
                            <Form.Label>Status</Form.Label>
                            <Form.Control as="select" value={filterStatus} onChange={handleFilterChange}>
                                <option value="">Todos</option>
                                <option value="active">Ativo</option>
                                <option value="inactive">Inativo</option>
                            </Form.Control>
                        </Form.Group>
                    </Form>
                }
                footer={
                    <>
                        <Button variant="secondary" onClick={handleCloseFilterModal}>
                            Cancelar
                        </Button>
                        <Button variant="primary" onClick={applyFilter} disabled={!isFilterModified}>
                            Aplicar
                        </Button>
                    </>
                }
            />

            <ToastContainer />
        </div>
    );
};

export default AdminDashboard;