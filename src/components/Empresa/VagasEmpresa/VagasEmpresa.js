import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Row, Col, Button, InputGroup, Form, Pagination, Modal, Container } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faToggleOn, faToggleOff, faEye, faPlus, faFilter, faSearch, faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import HeaderEmpresa from '../HeaderEmpresa';
import ModalVagas from './ModalVagas';
import './VagasEmpresa.css';

const VagasEmpresa = () => {
    const [vagas, setVagas] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showDisableModal, setShowDisableModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentVaga, setCurrentVaga] = useState({ cargo: '', local: '', modalidade: '', tipo: '', descricao: '', responsabilidades: '', qualificacoes: '', infoAdicional: '', requisitos: '', beneficios: '', pcd: false, salario: '', isDisabled: false });
    const [vagaToDelete, setVagaToDelete] = useState(null);
    const [vagaToDisable, setVagaToDisable] = useState(null);
    const [loading, setLoading] = useState(false);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [sortColumn, setSortColumn] = useState('cargo');
    const [sortDirection, setSortDirection] = useState('asc');
    const [isModified, setIsModified] = useState(false);
    const [isFilterModified, setIsFilterModified] = useState(false);
    const [totalPages, setTotalPages] = useState(1);

    const fetchVagas = useCallback(async (page = 1, search = '', filter = '') => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:5000/api/jobs', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                params: { page, search, filterStatus: filter, limit: itemsPerPage, sortColumn, sortDirection }
            });
            setVagas(response.data.vagas);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error('Error fetching vagas:', error);
        } finally {
            setLoading(false);
        }
    }, [itemsPerPage, sortColumn, sortDirection]);

    const handleShowModal = (vaga = { cargo: '', local: '', modalidade: '', tipo: '', descricao: '', responsabilidades: '', qualificacoes: '', infoAdicional: '', requisitos: '', beneficios: '', pcd: false, salario: '', isDisabled: false }) => {
        setCurrentVaga({ ...vaga });
        setEditMode(!!vaga._id);
        setShowModal(true);
        setIsModified(false);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setCurrentVaga({ cargo: '', local: '', modalidade: '', tipo: '', descricao: '', responsabilidades: '', qualificacoes: '', infoAdicional: '', requisitos: '', beneficios: '', pcd: false, salario: '', isDisabled: false });
    };

    const handleShowDeleteModal = (vaga) => {
        setVagaToDelete(vaga);
        setShowDeleteModal(true);
    };

    const handleCloseDeleteModal = () => {
        setShowDeleteModal(false);
        setVagaToDelete(null);
    };

    const handleShowDisableModal = (vaga) => {
        setVagaToDisable(vaga);
        setShowDisableModal(true);
    };

    const handleCloseDisableModal = () => {
        setShowDisableModal(false);
        setVagaToDisable(null);
    };

    const handleShowDetailsModal = (vaga) => {
        setCurrentVaga(vaga);
        setShowDetailsModal(true);
    };

    const handleCloseDetailsModal = () => {
        setShowDetailsModal(false);
        setCurrentVaga({ cargo: '', local: '', modalidade: '', tipo: '', descricao: '', responsabilidades: '', qualificacoes: '', infoAdicional: '', requisitos: '', beneficios: '', pcd: false, salario: '', isDisabled: false });
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

    const handleSaveVaga = async () => {
        setLoading(true);
        try {
            const vagaData = {
                cargo: currentVaga.cargo,
                local: currentVaga.local,
                modalidade: currentVaga.modalidade,
                tipo: currentVaga.tipo,
                descricao: currentVaga.descricao,
                responsabilidades: currentVaga.responsabilidades,
                qualificacoes: currentVaga.qualificacoes,
                infoAdicional: currentVaga.infoAdicional,
                requisitos: currentVaga.requisitos,
                beneficios: currentVaga.beneficios,
                pcd: currentVaga.pcd,
                salario: currentVaga.salario,
                isDisabled: currentVaga.isDisabled
            };

            //add erros e exceções

            console.log("Enviando dados da vaga:", vagaData);

            let response;

            if (editMode) {
                response = await axios.put(`http://localhost:5000/api/jobs/${currentVaga._id}`, vagaData, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
            } else {
                response = await axios.post(`http://localhost:5000/api/jobs/add`, vagaData, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
            }

            console.log("Resposta do servidor:", response);
            notify(editMode ? 'Vaga atualizada com sucesso!' : 'Vaga adicionada com sucesso!', 'success');
            fetchVagas(currentPage, searchTerm, filterStatus);
            handleCloseModal();
        } catch (error) {
            console.error('Erro ao salvar vaga:', error);
            if (error.response && error.response.data && error.response.data.error) {
                notify(error.response.data.error, 'error');
            } else {
                notify('Erro ao salvar a vaga!', 'error');
            }
        } finally {
            setLoading(false);
            setIsModified(false);
        }
    };

    const handleDeleteVaga = async () => {
        setLoading(true);
        try {
            await axios.delete(`http://localhost:5000/api/jobs/${vagaToDelete._id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            const updatedVagas = vagas.filter(vaga => vaga._id !== vagaToDelete._id);

            if (updatedVagas.length === 0 && currentPage > 1) {
                setCurrentPage(currentPage - 1);
            } else {
                fetchVagas(currentPage, searchTerm, filterStatus);
            }

            handleCloseDeleteModal();
            notify('Vaga deletada com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao deletar a vaga:', error);
            notify('Erro ao deletar a vaga!', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleDisableVaga = async () => {
        setLoading(true);

        try {
            const updatedVaga = { ...vagaToDisable, isDisabled: !vagaToDisable.isDisabled };
            await axios.put(`http://localhost:5000/api/jobs/${vagaToDisable._id}`, updatedVaga, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            fetchVagas(currentPage, searchTerm, filterStatus);
            handleCloseDisableModal();
            notify(`Vaga ${updatedVaga.isDisabled ? 'desabilitada' : 'habilitada'} com sucesso!`, 'success');
        } catch (error) {
            console.error('Erro ao desabilitar/habilitar vaga:', error);
            notify('Erro ao desabilitar/habilitar vaga!', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSort = (column) => {
        const newDirection = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
        setSortColumn(column);
        setSortDirection(newDirection);
    };

    const applyFilter = () => {
        handleCloseFilterModal();
        fetchVagas(currentPage, searchTerm, filterStatus);
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

    const renderVagasTable = () => (
        <>
            <Row className="mb-3 align-items-center">
                <h1>Minhas vagas</h1>
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
                            placeholder="Pesquisar por cargo..."
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
                            <th onClick={() => handleSort('cargo')}>
                                Cargo
                                {sortColumn === 'cargo' && (
                                    <FontAwesomeIcon icon={sortDirection === 'asc' ? faSortUp : faSortDown} className="sort-icon" />
                                )}
                            </th>
                            <th onClick={() => handleSort('local')}>
                                Localização
                                {sortColumn === 'local' && (
                                    <FontAwesomeIcon icon={sortDirection === 'asc' ? faSortUp : faSortDown} className="sort-icon" />
                                )}
                            </th>
                            <th onClick={() => handleSort('modalidade')}>
                                Modalidade
                                {sortColumn === 'modalidade' && (
                                    <FontAwesomeIcon icon={sortDirection === 'asc' ? faSortUp : faSortDown} className="sort-icon" />
                                )}
                            </th>
                            <th onClick={() => handleSort('tipo')}>
                                Tipo
                                {sortColumn === 'tipo' && (
                                    <FontAwesomeIcon icon={sortDirection === 'asc' ? faSortUp : faSortDown} className="sort-icon" />
                                )}
                            </th>
                            <th onClick={() => handleSort('salario')}>
                                Salário
                                {sortColumn === 'salario' && (
                                    <FontAwesomeIcon icon={sortDirection === 'asc' ? faSortUp : faSortDown} className="sort-icon" />
                                )}
                            </th>
                            <th onClick={() => handleSort('pcd')}>
                                PCD
                                {sortColumn === 'pcd' && (
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
                        {vagas.map((vaga) => (
                            <tr key={vaga._id}>
                                <td>{vaga.cargo}</td>
                                <td>{vaga.local}</td>
                                <td>{vaga.modalidade}</td>
                                <td>{vaga.tipo}</td>
                                <td>{vaga.isDisabled ? 'Inativa' : 'Ativa'}</td>
                                <td>
                                    <div className="btn-group">
                                        <FontAwesomeIcon icon={faEye} className="icon-btn" onClick={() => handleShowDetailsModal(vaga)} title="Visualizar detalhes" />
                                        <FontAwesomeIcon icon={faEdit} className="icon-btn" onClick={() => handleShowModal(vaga)} title="Editar" />
                                        <FontAwesomeIcon icon={vaga.isDisabled ? faToggleOff : faToggleOn} className="icon-btn" onClick={() => handleShowDisableModal(vaga)} title={vaga.isDisabled ? 'Habilitar' : 'Desabilitar'} />
                                        <FontAwesomeIcon icon={faTrash} className="icon-btn" onClick={() => handleShowDeleteModal(vaga)} title="Excluir" />
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

    return (
        <>
            <HeaderEmpresa />

            <Container className="mt-3">
                {renderVagasTable()}
            </Container>

        </>
    );
};

export default VagasEmpresa;
