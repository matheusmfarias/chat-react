import React from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const ModalComponent = ({
    show,
    handleClose,
    type,
    empresa,
    handleInputChange,
    handleSave,
    handleDelete,
    handleToggleStatus,
    isModified,
    formattedCnpj
}) => {
    // Define o título dinamicamente
    const getTitle = () => {
        switch (type) {
            case 'add': return 'Adicionar empresa';
            case 'edit': return 'Editar empresa';
            case 'delete': return 'Confirmar exclusão';
            case 'disable': return empresa?.status ? 'Desabilitar Empresa' : 'Habilitar Empresa';
            case 'details': return 'Detalhes da Empresa';
            default: return '';
        }
    };

    // Define o corpo dinamicamente
    const getBody = () => {
        switch (type) {
            case 'add':
            case 'edit':
                return (
                    <Form autoComplete="off">
                        <Form.Group className='campos-empresa'>
                            <Form.Label>Nome</Form.Label>
                            <Form.Control
                                type="text"
                                name="nome"
                                value={empresa?.nome || ''}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className='campos-empresa'>
                            <Form.Label>CNPJ</Form.Label>
                            <Form.Control
                                type="text"
                                name="cnpj"
                                value={formattedCnpj || ''}
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
                                value={empresa?.setor || ''}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className='campos-empresa'>
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                value={empresa?.email || ''}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className='campos-empresa'>
                            <Form.Label>Senha</Form.Label>
                            <Form.Control
                                type="password"
                                name="senha"
                                value={empresa?.senha || ''}
                                onChange={handleInputChange}
                            />
                        </Form.Group>
                        <Form.Group className='campos-empresa'>
                            <Form.Check
                                type="checkbox"
                                label="Status"
                                name="status"
                                checked={empresa?.status || false}
                                onChange={handleInputChange}
                            />
                        </Form.Group>
                        {type === 'edit' && (
                            <Form.Group className='campos-empresa'>
                                <Button variant="danger" className='w-100' onClick={handleDelete} title="Deletar">
                                    Deletar empresa
                                </Button>
                            </Form.Group>
                        )}
                    </Form>
                );
            case 'delete':
                return <p>Tem certeza que deseja deletar a empresa {empresa?.nome}?</p>;
            case 'disable':
                return <p>Tem certeza que deseja {empresa?.status ? 'desabilitar' : 'habilitar'} a empresa {empresa?.nome}?</p>;
            case 'details':
                return (
                    <>
                        <p><strong>Nome:</strong> {empresa?.nome}</p>
                        <p><strong>CNPJ:</strong> {formattedCnpj}</p>
                        <p><strong>Setor:</strong> {empresa?.setor}</p>
                        <p><strong>Email:</strong> {empresa?.email}</p>
                        <p><strong>Status:</strong> {empresa?.status ? 'Ativa' : 'Inativa'}</p>
                    </>
                );
            default:
                return null;
        }
    };

    // Define o footer dinamicamente
    const getFooter = () => {
        switch (type) {
            case 'add':
            case 'edit':
                return (
                    <>
                        <Button variant="primary" onClick={handleSave} disabled={!isModified}>
                            {type === 'edit' ? 'Salvar' : 'Adicionar'}
                        </Button>
                        <Button variant="secondary" onClick={handleClose}>
                            Cancelar
                        </Button>
                    </>
                );
            case 'delete':
                return (
                    <>
                        <Button variant="danger" className="w-100" onClick={handleDelete}>
                            Deletar
                        </Button>
                        <Button variant="secondary" onClick={handleClose}>
                            Cancelar
                        </Button>
                    </>
                );
            case 'disable':
                return (
                    <>
                        <Button variant="outline-dark" className="w-100" onClick={handleToggleStatus}>
                            {empresa?.status ? 'Desabilitar' : 'Habilitar'}
                        </Button>
                        <Button variant="secondary" onClick={handleClose}>
                            Cancelar
                        </Button>
                    </>
                );
            case 'details':
                return (
                    <Button variant="secondary" onClick={handleClose}>
                        Fechar
                    </Button>
                );
            default:
                return null;
        }
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>{getTitle()}</Modal.Title>
            </Modal.Header>
            <Modal.Body>{getBody()}</Modal.Body>
            <Modal.Footer>{getFooter()}</Modal.Footer>
        </Modal>
    );
};

export default ModalComponent;
