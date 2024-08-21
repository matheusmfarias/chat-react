import React, { useCallback, useEffect, useState } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const ModalVagas = ({
    show,
    onHide,
    onSubmit,
    jobData,
    isEditMode,
    states,
    cities,
    setSelectedState,
    setSelectedCity,
    selectedState,
    selectedCity
}) => {
    const [newJob, setNewJob] = useState(jobData);
    const [isFormValid, setIsFormValid] = useState(false);

    useEffect(() => {
        if (jobData) {
            setNewJob({
                ...jobData,
                pcd: !!jobData.pcd // Converte para booleano
            });
        }
    }, [jobData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewJob(prevJob => ({ ...prevJob, [name]: value }));
    };

    const handleToggleChange = (name) => {
        setNewJob(prevJob => ({ ...prevJob, [name]: !prevJob[name] }));
    };

    const handleQuillChange = (name, value) => {
        setNewJob(prevJob => ({ ...prevJob, [name]: value }));
    };

    const formatCurrency = (value) => {
        const numberValue = Number(value.replace(/[^0-9]/g, '')) / 100;
        return numberValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    const handleSalaryChange = (e) => {
        const { value } = e.target;
        setNewJob(prevJob => ({ ...prevJob, salary: formatCurrency(value) }));
    };

    const validateForm = useCallback(() => {
        const isValid = newJob.title && newJob.modality && selectedState && selectedCity && newJob.type;

        // Verificação adicional para campos com toggle ativo
        const areToggledFieldsValid = (
            (!newJob.salaryActive || newJob.salary.trim().length > 0) &&
            (!newJob.offersActive || newJob.offers.trim().length > 0) &&
            (!newJob.descriptionActive || newJob.description.trim().length > 0) &&
            (!newJob.responsibilitiesActive || newJob.responsibilities.trim().length > 0) &&
            (!newJob.qualificationsActive || newJob.qualifications.trim().length > 0) &&
            (!newJob.requirementsActive || newJob.requirements.trim().length > 0) &&
            (!newJob.additionalInfoActive || newJob.additionalInfo.trim().length > 0)
        );

        setIsFormValid(isValid && areToggledFieldsValid);
    }, [newJob, selectedState, selectedCity]);

    useEffect(() => {
        validateForm();
    }, [newJob, selectedState, selectedCity, validateForm]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(newJob);
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>{isEditMode ? 'Editar Vaga' : 'Adicionar Vaga'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <Row>
                        <Col md={6}>
                            <Form.Group className="form-group-custom">
                                <Form.Label className='fb'>Cargo *</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="title"
                                    value={newJob.title}
                                    onChange={handleInputChange}
                                    required
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="form-group-custom">
                                <Form.Label>Modelo *</Form.Label>
                                <Form.Control
                                    as="select"
                                    name="modality"
                                    value={newJob.modality}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="Presencial">Presencial</option>
                                    <option value="Híbrido">Híbrido</option>
                                    <option value="Remoto">Remoto</option>
                                </Form.Control>
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={6}>
                            <Form.Group className="form-group-custom">
                                <Form.Label>Localização *</Form.Label>
                                <Form.Control
                                    as="select"
                                    value={selectedState}
                                    onChange={(e) => setSelectedState(e.target.value)}
                                    required
                                    className="mb-3"
                                >
                                    <option value="">Selecione o estado</option>
                                    {states.map((state) => (
                                        <option key={state.id} value={state.sigla}>
                                            {state.nome}
                                        </option>
                                    ))}
                                </Form.Control>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="form-group-custom">
                                <Form.Label>&nbsp;</Form.Label>
                                <Form.Control
                                    as="select"
                                    value={selectedCity}
                                    onChange={(e) => setSelectedCity(e.target.value)}
                                    required
                                >
                                    <option value="">Selecione a cidade</option>
                                    {cities.map((city) => (
                                        <option key={city.id} value={city.nome}>
                                            {city.nome}
                                        </option>
                                    ))}
                                </Form.Control>
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={6}>
                            <Form.Group className="form-group-custom">
                                <Form.Label>Tipo *</Form.Label>
                                <Form.Control
                                    as="select"
                                    name="type"
                                    value={newJob.type}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="Efetivo">Efetivo</option>
                                    <option value="Aprendiz">Aprendiz</option>
                                    <option value="Estágio">Estágio</option>
                                    <option value="Pessoa Jurídica">Pessoa Jurídica</option>
                                    <option value="Trainee">Trainee</option>
                                    <option value="Temporário">Temporário</option>
                                    <option value="Freelancer">Freelancer</option>
                                    <option value="Terceiro">Terceiro</option>
                                </Form.Control>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="form-group-custom">
                                <div className="d-flex justify-content-between align-items-center">
                                    <Form.Label>Salário</Form.Label>
                                    <Form.Check
                                        type="switch"
                                        id="salary-active-switch"
                                        label=""
                                        checked={newJob.salaryActive}
                                        onChange={() => handleToggleChange('salaryActive')}
                                        style={{ marginLeft: 'auto' }}
                                    />
                                </div>
                                <Form.Control
                                    type="text"
                                    name="salary"
                                    value={newJob.salary}
                                    onChange={handleSalaryChange}
                                    placeholder="R$ 0,00"
                                    disabled={!newJob.salaryActive}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={12}>
                            <Form.Group className="form-group-custom">
                                <div className="d-flex justify-content-between align-items-center">
                                    <Form.Label>Benefícios</Form.Label>
                                    <Form.Check
                                        type="switch"
                                        id="offers-switch"
                                        label=""
                                        checked={newJob.offersActive}
                                        onChange={() => handleToggleChange('offersActive')}
                                        style={{ marginLeft: 'auto' }}
                                    />
                                </div>
                                {newJob.offersActive && (
                                    <div className="quill-transition">
                                        <ReactQuill
                                            value={newJob.offers}
                                            onChange={(value) => handleQuillChange('offers', value)}
                                        />
                                    </div>
                                )}
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={12}>
                            <Form.Group className="form-group-custom">
                                <div className="d-flex justify-content-between align-items-center">
                                    <Form.Label>Descrição Completa</Form.Label>
                                    <Form.Check
                                        type="switch"
                                        id="description-switch"
                                        label=""
                                        checked={newJob.descriptionActive}
                                        onChange={() => handleToggleChange('descriptionActive')}
                                        style={{ marginLeft: 'auto' }}
                                    />
                                </div>
                                {newJob.descriptionActive && (
                                    <div className="quill-transition">
                                        <ReactQuill
                                            value={newJob.description}
                                            onChange={(value) => handleQuillChange('description', value)}
                                        />
                                    </div>
                                )}
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={12}>
                            <Form.Group className="form-group-custom">
                                <div className="d-flex justify-content-between align-items-center">
                                    <Form.Label>Responsabilidades e Atribuições</Form.Label>
                                    <Form.Check
                                        type="switch"
                                        id="responsibilities-switch"
                                        label=""
                                        checked={newJob.responsibilitiesActive}
                                        onChange={() => handleToggleChange('responsibilitiesActive')}
                                        style={{ marginLeft: 'auto' }}
                                    />
                                </div>
                                {newJob.responsibilitiesActive && (
                                    <div className="quill-transition">
                                        <ReactQuill
                                            value={newJob.responsibilities}
                                            onChange={(value) => handleQuillChange('responsibilities', value)}
                                        />
                                    </div>
                                )}
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={12}>
                            <Form.Group className="form-group-custom">
                                <div className="d-flex justify-content-between align-items-center">
                                    <Form.Label>Requisitos e Qualificações</Form.Label>
                                    <Form.Check
                                        type="switch"
                                        id="qualifications-switch"
                                        label=""
                                        checked={newJob.qualificationsActive}
                                        onChange={() => handleToggleChange('qualificationsActive')}
                                        style={{ marginLeft: 'auto' }}
                                    />
                                </div>
                                {newJob.qualificationsActive && (
                                    <div className="quill-transition">
                                        <ReactQuill
                                            value={newJob.qualifications}
                                            onChange={(value) => handleQuillChange('qualifications', value)}
                                        />
                                    </div>
                                )}
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={12}>
                            <Form.Group className="form-group-custom">
                                <div className="d-flex justify-content-between align-items-center">
                                    <Form.Label>Será um diferencial</Form.Label>
                                    <Form.Check
                                        type="switch"
                                        id="requirements-switch"
                                        label=""
                                        checked={newJob.requirementsActive}
                                        onChange={() => handleToggleChange('requirementsActive')}
                                        style={{ marginLeft: 'auto' }}
                                    />
                                </div>
                                {newJob.requirementsActive && (
                                    <div className="quill-transition">
                                        <ReactQuill
                                            value={newJob.requirements}
                                            onChange={(value) => handleQuillChange('requirements', value)}
                                        />
                                    </div>
                                )}
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={12}>
                            <Form.Group className="form-group-custom">
                                <div className="d-flex justify-content-between align-items-center">
                                    <Form.Label>Informações Adicionais</Form.Label>
                                    <Form.Check
                                        type="switch"
                                        id="additional-info-switch"
                                        label=""
                                        checked={newJob.additionalInfoActive}
                                        onChange={() => handleToggleChange('additionalInfoActive')}
                                        style={{ marginLeft: 'auto' }}
                                    />
                                </div>
                                {newJob.additionalInfoActive && (
                                    <div className="quill-transition">
                                        <ReactQuill
                                            value={newJob.additionalInfo}
                                            onChange={(value) => handleQuillChange('additionalInfo', value)}
                                        />
                                    </div>
                                )}
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={12} className="d-flex justify-content-between">
                            <Form.Group className="form-group-custom">
                                <div className="d-flex justify-content-between">
                                    <Form.Label className='mr-2'>Status</Form.Label>
                                    <Form.Check
                                        type="switch"
                                        id="status-switch"
                                        checked={newJob.status}
                                        onChange={() => handleToggleChange('status')}
                                    />
                                </div>
                            </Form.Group>
                            <Form.Group className="form-group-custom">
                                <div className="d-flex justify-content-between">
                                    <Form.Label className='mr-2'>PCD</Form.Label>
                                    <Form.Check
                                        type="switch"
                                        id="pcd-switch"
                                        checked={newJob.pcd} // Certifique-se de que o estado correto está sendo passado aqui
                                        onChange={() => handleToggleChange('pcd')}
                                    />

                                </div>
                            </Form.Group>
                        </Col>
                    </Row>
                    <Button type="submit" variant="primary" className="mr-2" disabled={!isFormValid}>
                        {isEditMode ? 'Salvar' : 'Adicionar'}
                    </Button>
                    <Button variant="secondary" onClick={onHide}>
                        Cancelar
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default ModalVagas;