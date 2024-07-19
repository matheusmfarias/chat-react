import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button, Form, Table, Navbar, Nav, Container, Row, Col, InputGroup, Pagination } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faToggleOn, faToggleOff, faPlus, faSearch, faSortDown, faSortUp, faSignOutAlt, faEye, faFileExport, faFilter } from '@fortawesome/free-solid-svg-icons';
import { CSVLink } from "react-csv";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useFormattedCNPJ, { formatCNPJ } from '../../hooks/useFormattedCNPJ';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import ModalComponent from './ModalComponent';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [empresas, setEmpresas] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [empresasPerPage] = useState(10);
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showDisableModal, setShowDisableModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentEmpresa, setCurrentEmpresa] = useState({ nome: '', cnpj: '', setor: '', email: '', senha: '', isDisabled: false });
    const [empresaToDelete, setEmpresaToDelete] = useState(null);
    const [empresaToDisable, setEmpresaToDisable] = useState(null);
    const [formattedCnpj, setFormattedCnpj] = useFormattedCNPJ('');
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [sortColumn, setSortColumn] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc');
    const navigate = useNavigate();

    useEffect(() => {
        fetchEmpresas();
    }, []);

    const fetchEmpresas = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:5000/api/company', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setEmpresas(response.data);
        } catch (error) {
            console.error('Erro ao buscar empresas:', error);
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
    };

    const handleShowModal = (empresa = { nome: '', cnpj: '', setor: '', email: '', senha: '', isDisabled: false }) => {
        setCurrentEmpresa(empresa);
        setFormattedCnpj(empresa.cnpj);
        setEditMode(!!empresa._id);
        setShowModal(true);
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
    };

    const handleShowExportModal = () => {
        setShowExportModal(true);
    };

    const handleCloseExportModal = () => {
        setShowExportModal(false);
    };

    const handleSaveEmpresa = async () => {
        setLoading(true);
        try {
            const empresaData = {
                ...currentEmpresa,
                cnpj: formattedCnpj.replace(/\D/g, '')
            };
            if (editMode) {
                await axios.put(`http://localhost:5000/api/company/${empresaData._id}`, empresaData, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                notify('Empresa atualizada com sucesso!', 'success');
            } else {
                await axios.post('http://localhost:5000/api/company/add', empresaData, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                notify('Empresa adicionada com sucesso!', 'success');
            }
            fetchEmpresas();
            handleCloseModal();
        } catch (error) {
            console.error('Erro ao salvar empresa:', error);
            notify('Erro ao salvar empresa!', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteEmpresa = async () => {
        setLoading(true);
        try {
            await axios.delete(`http://localhost:5000/api/company/${empresaToDelete._id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            fetchEmpresas();
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
            fetchEmpresas();
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
    };

    const sortedEmpresas = [...empresas].sort((a, b) => {
        if (!sortColumn) return 0;
        if (sortDirection === 'asc') {
            return a[sortColumn] > b[sortColumn] ? 1 : -1;
        } else {
            return a[sortColumn] < b[sortColumn] ? 1 : -1;
        }
    });

    const filteredEmpresas = sortedEmpresas.filter(empresa =>
        (empresa.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        empresa.cnpj.toLowerCase().includes(searchTerm.toLowerCase()) ||
        empresa.setor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        empresa.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (filterStatus === '' || (filterStatus === 'active' && !empresa.isDisabled) || (filterStatus === 'inactive' && empresa.isDisabled))
    );

    // Paginação
    const indexOfLastEmpresa = currentPage * empresasPerPage;
    const indexOfFirstEmpresa = indexOfLastEmpresa - empresasPerPage;
    const currentEmpresas = filteredEmpresas.slice(indexOfFirstEmpresa, indexOfLastEmpresa);

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

    const handleExportPDF = () => {
        const doc = new jsPDF();
        doc.autoTable({
            head: [['Nome', 'CNPJ', 'Setor', 'Email', 'Status']],
            body: empresas.map(empresa => [empresa.nome, formatCNPJ(empresa.cnpj), empresa.setor, empresa.email, empresa.isDisabled ? 'Inativa' : 'Ativa']),
        });
        doc.save('empresas.pdf');
        handleCloseExportModal();
        notify('Empresas exportadas em PDF!', 'success');
    };

    return (
        <div>
            {loading && (
                <div className="loader-overlay">
                    <div className="loader"></div>
                </div>
            )}
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
                <Row className="mb-3 align-items-center">
                    <h2 className='display-6'>Empresas</h2>
                    <Col xs={12} md={4} className="d-flex justify-content-start mb-2 mb-md-0">
                        <Button variant="primary" className="me-2 flex-grow-1" onClick={() => handleShowModal()}>
                            <FontAwesomeIcon icon={faPlus} /> Adicionar
                        </Button>
                        <Button variant="secondary" className="me-2 flex-grow-1" onClick={handleShowFilterModal}>
                            <FontAwesomeIcon icon={faFilter} /> Filtros
                        </Button>
                        <Button variant="secondary" className="me-2 flex-grow-1" onClick={handleShowExportModal}>
                            <FontAwesomeIcon icon={faFileExport} /> Exportar
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
                <div className="table-responsive">
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
                            {currentEmpresas.map((empresa) => (
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
                <Pagination>
                    <Pagination.Prev onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} />
                    {[...Array(Math.ceil(filteredEmpresas.length / empresasPerPage)).keys()].map(number => (
                        <Pagination.Item key={number + 1} onClick={() => paginate(number + 1)} active={number + 1 === currentPage}>
                            {number + 1}
                        </Pagination.Item>
                    ))}
                    <Pagination.Next onClick={() => paginate(currentPage + 1)} disabled={currentPage === Math.ceil(filteredEmpresas.length / empresasPerPage)} />
                </Pagination>
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
                                required
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
                        <Button variant="primary" onClick={handleSaveEmpresa}>
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
                            <Form.Control as="select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
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
                        <Button variant="primary" onClick={applyFilter}>
                            Aplicar
                        </Button>
                    </>
                }
            />

            <ModalComponent
                show={showExportModal}
                handleClose={handleCloseExportModal}
                title="Exportar Dados"
                body={
                    <>
                        <Button variant="secondary" className="me-2">
                            <CSVLink data={empresas} filename={"empresas.csv"} className="text-white text-decoration-none">
                                Exportar como CSV
                            </CSVLink>
                        </Button>
                        <Button variant="secondary" onClick={handleExportPDF}>
                            Exportar como PDF
                        </Button>
                    </>
                }
                footer={
                    <Button variant="secondary" onClick={handleCloseExportModal}>
                        Fechar
                    </Button>
                }
            />

            <ToastContainer />
        </div>
    );
};

export default AdminDashboard;
