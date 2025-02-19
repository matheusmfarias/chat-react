import React from "react";
import { Modal, Form, Row, Col, Button, Spinner } from "react-bootstrap";
import Select from "react-select";

const UserExperienceModal = ({
    show,
    onClose,
    newExperiencia,
    handleInputChange,
    handleAddExperiencia,
    loadingAdd,
    mesesOptions,
    anosOptions
}) => {
    return (
        <Modal show={show} onHide={onClose} centered dialogClassName="modal-dialog-scrollable">
            <Modal.Header closeButton>
                <Modal.Title>Adicionar experiência</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Row className="mb-3">
                    <Form.Label>Empresa *</Form.Label>
                    <Form.Group>
                        <Form.Control
                            type="text"
                            name="empresa"
                            value={newExperiencia.empresa}
                            onChange={handleInputChange}
                            required
                            aria-label="Nome da empresa"
                            autoFocus
                        />
                    </Form.Group>
                </Row>
                <Row className="mb-3">
                    <Form.Label>Início</Form.Label>
                    <Col xs={6}>
                        <Select
                            name="mesInicial"
                            value={mesesOptions.find(option => option.value === newExperiencia.mesInicial) || null}
                            onChange={(selectedOption) => handleInputChange({ target: { name: 'mesInicial', value: selectedOption ? selectedOption.value : '' } })}
                            options={mesesOptions}
                            placeholder="Mês"
                            aria-label="Mês de início da experiência"
                            menuPortalTarget={document.body}
                            styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                        />
                    </Col>
                    <Col xs={6}>
                        <Select
                            name="anoInicial"
                            value={anosOptions.find(option => option.value === newExperiencia.anoInicial) || null}
                            onChange={(selectedOption) => handleInputChange({ target: { name: 'anoInicial', value: selectedOption ? selectedOption.value : '' } })}
                            options={anosOptions}
                            placeholder="Ano"
                            aria-label="Ano de início da experiência"
                            menuPortalTarget={document.body}
                            styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                        />
                    </Col>
                </Row>
                <Row className="mb-2">
                    <Form.Label>Fim</Form.Label>
                    <Col xs={6}>
                        <Select
                            name="mesFinal"
                            value={mesesOptions.find(option => option.value === newExperiencia.mesFinal) || null}
                            onChange={(selectedOption) => handleInputChange({ target: { name: 'mesFinal', value: selectedOption ? selectedOption.value : '' } })}
                            options={mesesOptions}
                            placeholder="Mês"
                            isDisabled={newExperiencia.trabalhoAtualmente}
                            aria-label="Mês final da experiência"
                            menuPortalTarget={document.body}
                            styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                        />
                    </Col>
                    <Col xs={6}>
                        <Select
                            name="anoFinal"
                            value={anosOptions.find(option => option.value === newExperiencia.anoFinal) || null}
                            onChange={(selectedOption) => handleInputChange({ target: { name: 'anoFinal', value: selectedOption ? selectedOption.value : '' } })}
                            options={anosOptions}
                            placeholder="Ano"
                            isDisabled={newExperiencia.trabalhoAtualmente}
                            aria-label="Ano final da experiência"
                            menuPortalTarget={document.body}
                            styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                        />
                    </Col>
                </Row>
                <Row className="mb-3">
                    <Form.Group>
                        <Form.Check
                            type="checkbox"
                            label="Trabalho atualmente"
                            name="trabalhoAtualmente"
                            checked={newExperiencia.trabalhoAtualmente}
                            onChange={handleInputChange}
                            aria-label="Trabalho atualmente"
                        />
                    </Form.Group>
                </Row>
                <Row className="mb-3">
                    <Form.Group>
                        <Form.Label>Função/Cargo</Form.Label>
                        <Form.Control
                            type="text"
                            name="funcao"
                            value={newExperiencia.funcao}
                            onChange={handleInputChange}
                            aria-label="Função/Cargo"
                        />
                    </Form.Group>
                </Row>
                <Row className="mb-3">
                    <Form.Group>
                        <Form.Label>Principais atividades</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            name="atividades"
                            value={newExperiencia.atividades}
                            onChange={handleInputChange}
                            placeholder="Descreva suas principais responsabilidades nesta experiência."
                            aria-label="Principais atividades"
                        />
                    </Form.Group>
                </Row>
            </Modal.Body>
            <Modal.Footer>
                <Button
                    onClick={handleAddExperiencia}
                    disabled={!newExperiencia.empresa || loadingAdd}
                >
                    {loadingAdd ? (
                        <div className="d-flex justify-content-center align-items-center">
                            <Spinner animation="border" />
                        </div>
                    ) : (
                        <span>Adicionar</span>
                    )}
                </Button>
                <Button variant="secondary" onClick={onClose}>
                    Fechar
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default UserExperienceModal;
