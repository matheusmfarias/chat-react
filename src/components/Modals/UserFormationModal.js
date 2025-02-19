import React from "react";
import { Modal, Form, Row, Col, Button, Spinner } from "react-bootstrap";
import Select from "react-select";

const UserFormationModal = ({
    show,
    onClose,
    newFormacao,
    handleInputChange,
    handleAddFormacao,
    loadingAdd,
    mesesOptions,
    anosOptions,
    grausPosOptions,
    grausGraduacao,
    situacaoOptions,
    escolaridadeOptions
}) => {
    return (
        <Modal show={show} onHide={onClose} centered dialogClassName="modal-dialog-scrollable">
            <Modal.Header closeButton>
                <Modal.Title>Adicionar formação</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Row className="mb-3">
                    <Form.Label>Instituição *</Form.Label>
                    <Form.Group>
                        <Form.Control
                            type="text"
                            name="instituicao"
                            value={newFormacao.instituicao}
                            onChange={handleInputChange}
                            required
                            aria-label="Nome da instituicao"
                            autoFocus
                        />
                    </Form.Group>
                </Row>
                <Row className="mb-3">
                    <Form.Label>Escolaridade *</Form.Label>
                    <Col xs={12}>
                        <Select
                            name="escolaridade"
                            value={escolaridadeOptions.map((escolaridade) => ({ value: escolaridade, label: escolaridade })).find(option => option.value === newFormacao.escolaridade) || null}
                            onChange={(selectedOption) => handleInputChange({ target: { name: 'escolaridade', value: selectedOption ? selectedOption.value : '' } })}
                            required
                            options={escolaridadeOptions.map((escolaridade) => ({ value: escolaridade, label: escolaridade }))}
                            placeholder="Selecione"
                            aria-label="Escolaridade"
                            menuPortalTarget={document.body}
                            styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                        />
                    </Col>
                </Row>
                {(newFormacao.escolaridade === 'Técnico' || newFormacao.escolaridade === 'Graduação' || newFormacao.escolaridade === 'Pós-graduação') && (
                    <Row className="mb-3">
                        <Form.Label>Curso</Form.Label>
                        <Form.Group>
                            <Form.Control
                                type="text"
                                name="curso"
                                value={newFormacao.curso}
                                onChange={handleInputChange}
                                aria-label="Curso"
                            />
                        </Form.Group>
                    </Row>
                )}
                {newFormacao.escolaridade === 'Graduação' && (
                    <Row className="mb-3">
                        <Form.Label>Grau</Form.Label>
                        <Col xs={12}>
                            <Select
                                name="grau"
                                value={grausGraduacao.map((grau) => ({ value: grau, label: grau })).find(option => option.value === newFormacao.grau) || null}
                                onChange={(selectedOption) => handleInputChange({ target: { name: 'grau', value: selectedOption ? selectedOption.value : '' } })}
                                options={grausGraduacao.map((grau) => ({ value: grau, label: grau }))}
                                placeholder="Selecione"
                                menuPortalTarget={document.body}
                                styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                            />
                        </Col>
                    </Row>
                )}
                {newFormacao.escolaridade === 'Pós-graduação' && (
                    <Row className="mb-3">
                        <Form.Label>Grau</Form.Label>
                        <Col xs={12}>
                            <Select
                                name="grau"
                                value={grausPosOptions.map((grau) => ({ value: grau, label: grau })).find(option => option.value === newFormacao.grau) || null}
                                onChange={(selectedOption) => handleInputChange({ target: { name: 'grau', value: selectedOption ? selectedOption.value : '' } })}
                                options={grausPosOptions.map((grau) => ({ value: grau, label: grau }))}
                                placeholder="Selecione"
                                menuPortalTarget={document.body}
                                styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                            />
                        </Col>
                    </Row>
                )}
                <Row className="mb-3">
                    <Form.Label>Situação *</Form.Label>
                    <Col xs={12}>
                        <Select
                            name="situacao"
                            value={situacaoOptions.map((situacao) => ({ value: situacao, label: situacao })).find(option => option.value === newFormacao.situacao) || null}
                            onChange={(selectedOption) => handleInputChange({ target: { name: 'situacao', value: selectedOption ? selectedOption.value : '' } })}
                            options={situacaoOptions.map((situacao) => ({ value: situacao, label: situacao }))}
                            placeholder="Selecione"
                            required
                            menuPortalTarget={document.body}
                            styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                        />
                    </Col>
                </Row>
                <Row className="mb-3">
                    <Form.Label>Início</Form.Label>
                    <Col xs={6}>
                        <Select
                            name="mesInicial"
                            value={mesesOptions.find(option => option.value === newFormacao.mesInicial) || null}
                            onChange={(selectedOption) => handleInputChange({ target: { name: 'mesInicial', value: selectedOption ? selectedOption.value : '' } })}
                            options={mesesOptions}
                            placeholder="Mês"
                            aria-label="Mês de início da formação"
                            menuPortalTarget={document.body}
                            styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                        />
                    </Col>
                    <Col xs={6}>
                        <Select
                            name="anoInicial"
                            value={anosOptions.find(option => option.value === newFormacao.anoInicial) || null}
                            onChange={(selectedOption) => handleInputChange({ target: { name: 'anoInicial', value: selectedOption ? selectedOption.value : '' } })}
                            options={anosOptions}
                            placeholder="Ano"
                            aria-label="Ano de início da formação"
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
                            value={mesesOptions.find(option => option.value === newFormacao.mesFinal) || null}
                            onChange={(selectedOption) => handleInputChange({ target: { name: 'mesFinal', value: selectedOption ? selectedOption.value : '' } })}
                            options={mesesOptions}
                            placeholder="Mês"
                            isDisabled={newFormacao.trabalhoAtualmente}
                            aria-label="Mês final da formação"
                            menuPortalTarget={document.body}
                            styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                        />
                    </Col>
                    <Col xs={6}>
                        <Select
                            name="anoFinal"
                            value={anosOptions.find(option => option.value === newFormacao.anoFinal) || null}
                            onChange={(selectedOption) => handleInputChange({ target: { name: 'anoFinal', value: selectedOption ? selectedOption.value : '' } })}
                            options={anosOptions}
                            placeholder="Ano"
                            isDisabled={newFormacao.trabalhoAtualmente}
                            aria-label="Ano final da formação"
                            menuPortalTarget={document.body}
                            styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                        />
                    </Col>
                </Row>
            </Modal.Body>
            <Modal.Footer>
                <Button
                    onClick={handleAddFormacao}
                    disabled={!newFormacao.instituicao || !newFormacao.escolaridade || !newFormacao.situacao || loadingAdd}
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

export default UserFormationModal;
