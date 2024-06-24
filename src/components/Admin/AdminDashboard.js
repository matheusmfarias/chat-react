import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Modal, Button, Form, Table, Navbar, Nav, Container, Row, Col } from 'react-bootstrap';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [empresas, setEmpresas] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentEmpresa, setCurrentEmpresa] = useState({ nome: '', cnpj: '', setor: '', email: '', senha: '' });
    const [empresaToDelete, setEmpresaToDelete] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchEmpresas();
    }, []);

    const fetchEmpresas = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/company', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setEmpresas(response.data);
        } catch (error) {
            console.error('Erro ao buscar empresas:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentEmpresa({ ...currentEmpresa, [name]: value });
    };

    const handleShowModal = (empresa = { nome: '', cnpj: '', setor: '', email: '', senha: '' }) => {
        setCurrentEmpresa(empresa);
        setEditMode(!!empresa._id);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setCurrentEmpresa({ nome: '', cnpj: '', setor: '', email: '', senha: '' });
    };

    const handleShowDeleteModal = (empresa) => {
        setEmpresaToDelete(empresa);
        setShowDeleteModal(true);
    };

    const handleCloseDeleteModal = () => {
        setShowDeleteModal(false);
        setEmpresaToDelete(null);
    };

    const handleSaveEmpresa = async () => {
        try {
            if (editMode) {
                await axios.put(`http://localhost:5000/api/company/${currentEmpresa._id}`, currentEmpresa, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
            } else {
                await axios.post('http://localhost:5000/api/company/add', currentEmpresa, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
            }
            fetchEmpresas();
            handleCloseModal();
        } catch (error) {
            console.error('Erro ao salvar empresa:', error);
        }
    };

    const handleDeleteEmpresa = async () => {
        try {
            await axios.delete(`http://localhost:5000/api/company/${empresaToDelete._id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            fetchEmpresas();
            handleCloseDeleteModal();
        } catch (error) {
            console.error('Erro ao deletar empresa:', error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/');
    };

    return (
        <div>
            <Navbar bg="dark" variant="dark" expand="lg">
                <Container>
                    <Navbar.Brand href="#">Admin Dashboard</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="ml-auto">
                            <Button variant="outline-light" onClick={handleLogout}>Logout</Button>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
            <Container className="mt-5">
                <Row className="mb-3">
                    <Col>
                        <h1>Gerenciamento de Empresas</h1>
                    </Col>
                    <Col className="text-right">
                        <Button variant="primary" onClick={() => handleShowModal()}>Adicionar Empresa</Button>
                    </Col>
                </Row>
                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>CNPJ</th>
                            <th>Setor</th>
                            <th>Email</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {empresas.map((empresa) => (
                            <tr key={empresa._id}>
                                <td>{empresa.nome}</td>
                                <td>{empresa.cnpj}</td>
                                <td>{empresa.setor}</td>
                                <td>{empresa.email}</td>
                                <td>
                                    <Button variant="warning" size="sm" onClick={() => handleShowModal(empresa)}>Editar</Button>{' '}
                                    <Button variant="danger" size="sm" onClick={() => handleShowDeleteModal(empresa)}>Deletar</Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Container>

            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>{editMode ? 'Editar Empresa' : 'Adicionar Empresa'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group>
                            <Form.Label>Nome</Form.Label>
                            <Form.Control
                                type="text"
                                name="nome"
                                value={currentEmpresa.nome}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>CNPJ</Form.Label>
                            <Form.Control
                                type="text"
                                name="cnpj"
                                value={currentEmpresa.cnpj}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Setor</Form.Label>
                            <Form.Control
                                type="text"
                                name="setor"
                                value={currentEmpresa.setor}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                value={currentEmpresa.email}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Senha</Form.Label>
                            <Form.Control
                                type="password"
                                name="senha"
                                value={currentEmpresa.senha}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Cancelar
                    </Button>
                    <Button variant="primary" onClick={handleSaveEmpresa}>
                        {editMode ? 'Salvar Alterações' : 'Adicionar Empresa'}
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showDeleteModal} onHide={handleCloseDeleteModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmar Exclusão</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Tem certeza que deseja deletar a empresa {empresaToDelete?.nome}?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseDeleteModal}>
                        Cancelar
                    </Button>
                    <Button variant="danger" onClick={handleDeleteEmpresa}>
                        Deletar
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default AdminDashboard;
