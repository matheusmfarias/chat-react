import React, { useState, useEffect } from 'react';
import api from '../../services/axiosConfig';
import { Button, Form, Navbar, Nav, Container, InputGroup, Spinner, Modal, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt, faCog, faPencilAlt, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import './AdminDashboard.css';
import { useNavigate } from 'react-router-dom';
import { showToast } from '../ToastNotification';

const HeaderAdmin = () => {
    const navigate = useNavigate();
    const [showModalConfig, setShowModalConfig] = useState(false);
    const [newEmail, setNewEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loadingSubmit, setLoadingSubmit] = useState(false);
    const [loadingAdminData, setLoadingAdminData] = useState(false);
    const [adminData, setAdminData] = useState({
        email: ''
    });
    const [isEditable, setIsEditable] = useState({ email: false });
    const [showPasswordFields, setShowPasswordFields] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSaveDisabled, setIsSaveDisabled] = useState(true);

    useEffect(() => {
        const hasEmailChanged = isEditable.email && newEmail !== adminData.email;
        const hasPasswordChanged = showPasswordFields && newPassword && newPassword === confirmPassword;
        setIsSaveDisabled(!(hasEmailChanged || hasPasswordChanged));
    }, [newEmail, newPassword, confirmPassword, isEditable, showPasswordFields, adminData.email]);

    const handleShowModalConfig = () => {
        fetchAdminData();
        setShowModalConfig(true);
    };

    const handleCloseModalConfig = () => {
        setIsEditable(false);
        setShowModalConfig(false);
        setShowPasswordFields(false);
        setShowPassword(false);
        setShowConfirmPassword(false);
        setNewPassword('');
        setConfirmPassword('');
    };

    const fetchAdminData = async () => {
        setLoadingAdminData(true);
        try {
            const token = localStorage.getItem('token');
            const response = await api.get(`${process.env.REACT_APP_API_URL}/api/admin/admin`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const admin = response.data;

            const adminData = {
                email: admin.email
            };

            setAdminData(adminData);
        } catch (error) {
            console.error('Erro ao buscar os dados do admin', error);
        } finally {
            setLoadingAdminData(false);
        }
    };

    const handleSaveChanges = async () => {
        setLoadingSubmit(true);
        try {
            const token = localStorage.getItem('token');

            if (isEditable.email && newEmail !== adminData.email) {
                await api.post(
                    `${process.env.REACT_APP_API_URL}/api/admin/change-email`,
                    { email: newEmail },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
                setAdminData({ ...adminData, email: newEmail });
                showToast('E-mail atualizado com sucesso!', 'success');
            }

            // Atualizar Senha
            if (showPasswordFields && newPassword && newPassword === confirmPassword) {
                await api.post(
                    `${process.env.REACT_APP_API_URL}/api/admin/change-password`,
                    { newPassword }, // Envia apenas a nova senha
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
                showToast('Senha atualizada com sucesso!', 'success');
            } else if (showPasswordFields && newPassword !== confirmPassword) {
                showToast('As senhas não coincidem.', 'error');
                return;
            }

            setIsEditable({ email: false });
            setShowPasswordFields(false);
            setNewPassword('');
            setConfirmPassword('');
            handleCloseModalConfig();
        } catch (error) {
            showToast('Erro ao salvar alterações.', 'error');
        } finally {
            setLoadingSubmit(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/');
    };

    return (
        <>
            <Navbar bg="dark" variant="dark" expand="sm">
                <Container>
                    <Row className='d-flex flex-row align-items-center'>
                        <Col xs={10}>
                            <Navbar.Brand>Painel administrativo</Navbar.Brand>
                        </Col>

                        <Col xs={2}>
                            <Navbar.Toggle aria-controls="basic-navbar-nav" className='border-0 m-0' style={{ outline: 'none', boxShadow: 'none' }}/>
                        </Col>

                    </Row>

                    <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
                        <Nav>
                            <Nav.Item className="me-sm-2 mb-2">
                                <Button
                                    variant="outline-secondary"
                                    onClick={handleShowModalConfig}
                                    className="w-100"
                                >
                                    <FontAwesomeIcon icon={faCog} /> Configurações
                                </Button>
                            </Nav.Item>
                            <Nav.Item>
                                <Button
                                    variant="outline-danger"
                                    onClick={handleLogout}
                                    className="w-100"
                                >
                                    <FontAwesomeIcon icon={faSignOutAlt} /> Sair
                                </Button>
                            </Nav.Item>
                        </Nav>
                    </Navbar.Collapse>
                </Container>

                <Modal show={showModalConfig} onHide={handleCloseModalConfig}>
                    <Modal.Header closeButton>
                        <Modal.Title>Configurações da conta</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            {loadingAdminData ? (
                                <div className="d-flex justify-content-center align-items-center">
                                    <Spinner animation='border' variant='primary' />
                                </div>
                            ) : (
                                <>
                                    <Form.Group className="mb-3">
                                        <Form.Label>E-mail</Form.Label>
                                        <InputGroup>
                                            <Form.Control
                                                type="email"
                                                value={isEditable.email ? newEmail : adminData.email}
                                                onChange={(e) => setNewEmail(e.target.value)}
                                                disabled={!isEditable.email}
                                                style={{ width: '80%' }}
                                            />
                                            <Button
                                                variant="outline-secondary"
                                                onClick={() => {
                                                    setIsEditable({ ...isEditable, email: !isEditable.email });
                                                    setNewEmail(adminData.email);
                                                }}
                                                style={{ width: '20%' }}
                                            >
                                                <FontAwesomeIcon icon={faPencilAlt} />
                                            </Button>
                                        </InputGroup>
                                    </Form.Group>

                                    {!showPasswordFields ? (
                                        <Button variant="outline-primary" onClick={() => setShowPasswordFields(true)} style={{ width: '100%' }}>
                                            Alterar senha
                                        </Button>
                                    ) : (
                                        <>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Nova Senha</Form.Label>
                                                <InputGroup>
                                                    <Form.Control
                                                        type={showPassword ? 'text' : 'password'}
                                                        placeholder="Digite a nova senha"
                                                        value={newPassword}
                                                        onChange={(e) => setNewPassword(e.target.value)}
                                                        style={{ width: '80%' }}
                                                    />
                                                    <Button variant="outline-secondary" onClick={() => setShowPassword(!showPassword)} style={{ width: '20%' }}>
                                                        <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                                                    </Button>
                                                </InputGroup>
                                            </Form.Group>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Confirmar Senha</Form.Label>
                                                <InputGroup>
                                                    <Form.Control
                                                        type={showConfirmPassword ? 'text' : 'password'}
                                                        placeholder="Confirme a nova senha"
                                                        value={confirmPassword}
                                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                                        style={{ width: '80%' }}
                                                    />
                                                    <Button variant="outline-secondary" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ width: '20%' }}>
                                                        <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                                                    </Button>
                                                </InputGroup>
                                            </Form.Group>
                                        </>
                                    )}
                                </>
                            )}
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="primary" onClick={handleSaveChanges} disabled={isSaveDisabled}>
                            {loadingSubmit ? (
                                <Spinner animation="border" variant="white" />
                            ) : (
                                'Salvar'
                            )}
                        </Button>
                        <Button variant="secondary" onClick={handleCloseModalConfig}>Fechar</Button>
                    </Modal.Footer>
                </Modal>
            </Navbar>
        </>
    );
};

export default HeaderAdmin;
