import React, { useCallback, useEffect, useState } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import Select from 'react-select';

const ModalVagas = ({
    show,
    onHide,
    onSubmit,
    jobData,
    isEditMode,
    states,
    cities,
    fetchCities,
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
                pcd: !!jobData.pcd,
                status: !!jobData.status,
                identifyCompany: !!jobData.identifyCompany
            });
        }
    }, [jobData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewJob(prevJob => ({ ...prevJob, [name]: value }));
    };

    const handleSelectChange = (name, selectedOption) => {
        setNewJob(prevJob => ({ ...prevJob, [name]: selectedOption.value }));
    };

    const handleToggleChange = (name) => {
        setNewJob(prevJob => ({
            ...prevJob,
            [name]: !prevJob[name],
            // Limpa os campos correspondentes ao desativar os toggles
            salary: name === 'salaryActive' && prevJob[name] ? '' : prevJob.salary,
            offers: name === 'offersActive' && prevJob[name] ? '' : prevJob.offers,
            description: name === 'descriptionActive' && prevJob[name] ? '' : prevJob.description,
            responsibilities: name === 'responsibilitiesActive' && prevJob[name] ? '' : prevJob.responsibilities,
            qualifications: name === 'qualificationsActive' && prevJob[name] ? '' : prevJob.qualifications,
            requirements: name === 'requirementsActive' && prevJob[name] ? '' : prevJob.requirements,
            additionalInfo: name === 'additionalInfoActive' && prevJob[name] ? '' : prevJob.additionalInfo
        }));
    };

    const handleQuillChange = (name, value) => {
        if (newJob[`${name}Active`]) {
            setNewJob(prevJob => ({ ...prevJob, [name]: value }));
        }
    };

    const formatCurrency = (value) => {
        const numberValue = Number(value.replace(/[^0-9]/g, '')) / 100;
        return numberValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    const handleSalaryChange = (e) => {
        const { value } = e.target;
        if (newJob.salaryActive) {
            setNewJob(prevJob => ({ ...prevJob, salary: formatCurrency(value) }));
        }
    };

    const validateForm = useCallback(() => {
        const isValid = newJob.title && newJob.modality && selectedState && selectedCity && newJob.type;

        const areToggledFieldsValid = (
            (!newJob.salaryActive || (newJob.salary?.trim() || '').length > 0) &&
            (!newJob.offersActive || (newJob.offers?.trim() || '').length > 0) &&
            (!newJob.descriptionActive || (newJob.description?.trim() || '').length > 0) &&
            (!newJob.responsibilitiesActive || (newJob.responsibilities?.trim() || '').length > 0) &&
            (!newJob.qualificationsActive || (newJob.qualifications?.trim() || '').length > 0) &&
            (!newJob.requirementsActive || (newJob.requirements?.trim() || '').length > 0) &&
            (!newJob.additionalInfoActive || (newJob.additionalInfo?.trim() || '').length > 0)
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
        <Modal show={show} onHide={onHide} centered dialogClassName="modal-dialog-scrollable">
            <Modal.Header closeButton>
                <Modal.Title>{isEditMode ? 'Editar Vaga' : 'Adicionar Vaga'}</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ maxHeight: '90vh', overflowY: 'auto' }}>
                <Form onSubmit={handleSubmit}>
                    <Row className='mb-3'>
                        <Col xs={6}>
                            <Form.Group>
                                <Form.Label>Cargo *</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="title"
                                    value={newJob.title}
                                    onChange={handleInputChange}
                                    required
                                />
                            </Form.Group>
                        </Col>
                        <Col xs={6}>
                            <Form.Group>
                                <Form.Label>Modelo *</Form.Label>
                                <Select
                                    options={[
                                        { value: 'Presencial', label: 'Presencial' },
                                        { value: 'Híbrido', label: 'Híbrido' },
                                        { value: 'Remoto', label: 'Remoto' }
                                    ]}
                                    value={{ value: newJob.modality, label: newJob.modality }}
                                    onChange={(selectedOption) => handleSelectChange('modality', selectedOption)}
                                    placeholder="Selecione..."
                                    required
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row className='mb-3'>
                        <Form.Label>Localização *</Form.Label>
                        <Col xs={6}>
                            <Form.Group>
                                <Select
                                    options={states.map(state => ({ value: state.sigla, label: state.nome }))}
                                    value={selectedState ? { value: selectedState, label: selectedState } : null}
                                    onChange={(selectedOption) => {
                                        setSelectedState(selectedOption.value);
                                        setSelectedCity(null);
                                        fetchCities(selectedOption.value);
                                    }}
                                    placeholder="Estado"
                                    required
                                />
                            </Form.Group>
                        </Col>
                        <Col xs={6}>
                            <Form.Group>
                                <Select
                                    options={cities.map(city => ({ value: city.nome, label: city.nome }))}
                                    value={selectedCity ? { value: selectedCity, label: selectedCity } : null}
                                    onChange={(selectedOption) => setSelectedCity(selectedOption.value)}
                                    placeholder="Cidade"

                                    required
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row className='mb-3'>
                        <Col xs={6}>
                            <Form.Group>
                                <Form.Label>Tipo *</Form.Label>
                                <Select
                                    options={[
                                        { value: 'Efetivo', label: 'Efetivo' },
                                        { value: 'Aprendiz', label: 'Aprendiz' },
                                        { value: 'Estágio', label: 'Estágio' },
                                        { value: 'Pessoa Jurídica', label: 'Pessoa Jurídica' },
                                        { value: 'Trainee', label: 'Trainee' },
                                        { value: 'Temporário', label: 'Temporário' },
                                        { value: 'Freelancer', label: 'Freelancer' },
                                        { value: 'Terceiro', label: 'Terceiro' }
                                    ]}
                                    value={{ value: newJob.type, label: newJob.type }}
                                    onChange={(selectedOption) => handleSelectChange('type', selectedOption)}
                                    placeholder="Selecione..."
                                    required
                                />
                            </Form.Group>
                        </Col>
                        <Col xs={6}>
                            <Form.Group>
                                <div className="d-flex justify-content-between">
                                    <Form.Label>Salário</Form.Label>
                                    <Form.Check
                                        type="switch"
                                        id="salary-active-switch"
                                        checked={newJob.salaryActive}
                                        onChange={() => handleToggleChange('salaryActive')}
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
                    <Row className='mb-3'>
                        <Form.Group className='mb-2'>
                            <div className="d-flex justify-content-between">
                                <Form.Label>Benefícios</Form.Label>
                                <Form.Check
                                    type="switch"
                                    id="offers-switch"
                                    label=""
                                    checked={newJob.offersActive}
                                    onChange={() => handleToggleChange('offersActive')}
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
                        <Form.Group className='mb-2'>
                            <div className="d-flex justify-content-between">
                                <Form.Label>Descrição completa</Form.Label>
                                <Form.Check
                                    type="switch"
                                    id="description-switch"
                                    label=""
                                    checked={newJob.descriptionActive}
                                    onChange={() => handleToggleChange('descriptionActive')}
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
                        <Form.Group className='mb-2'>
                            <div className="d-flex justify-content-between">
                                <Form.Label>Responsabilidades e atribuições</Form.Label>
                                <Form.Check
                                    type="switch"
                                    id="responsibilities-switch"
                                    label=""
                                    checked={newJob.responsibilitiesActive}
                                    onChange={() => handleToggleChange('responsibilitiesActive')}
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
                        <Form.Group className='mb-2'>
                            <div className="d-flex justify-content-between">
                                <Form.Label>Requisitos e qualificações</Form.Label>
                                <Form.Check
                                    type="switch"
                                    id="qualifications-switch"
                                    label=""
                                    checked={newJob.qualificationsActive}
                                    onChange={() => handleToggleChange('qualificationsActive')}
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
                        <Form.Group className='mb-2'>
                            <div className="d-flex justify-content-between">
                                <Form.Label>Será um diferencial</Form.Label>
                                <Form.Check
                                    type="switch"
                                    id="requirements-switch"
                                    label=""
                                    checked={newJob.requirementsActive}
                                    onChange={() => handleToggleChange('requirementsActive')}
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
                        <Form.Group className='mb-2'>
                            <div className="d-flex justify-content-between">
                                <Form.Label>Informações adicionais</Form.Label>
                                <Form.Check
                                    type="switch"
                                    id="additional-info-switch"
                                    label=""
                                    checked={newJob.additionalInfoActive}
                                    onChange={() => handleToggleChange('additionalInfoActive')}
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
                        <Form.Group className='mb-2'>
                            <div className="d-flex justify-content-between">
                                <Form.Label className="me-2">Ativa</Form.Label>
                                <Form.Check
                                    type="switch"
                                    id="status-switch"
                                    checked={newJob.status}
                                    onChange={() => handleToggleChange('status')}
                                />
                            </div>
                        </Form.Group>
                        <Form.Group className='mb-2'>
                            <div className="d-flex justify-content-between">
                                <Form.Label className="me-2">PCD</Form.Label>
                                <Form.Check
                                    type="switch"
                                    id="pcd-switch"
                                    checked={newJob.pcd}
                                    onChange={() => handleToggleChange('pcd')}
                                />

                            </div>
                        </Form.Group>
                        <Form.Group>
                            <div className="d-flex justify-content-between">
                                <Form.Label className="me-2">Confidencial</Form.Label>
                                <Form.Check
                                    type="switch"
                                    id="identificacao-switch"
                                    checked={newJob.identifyCompany}
                                    onChange={() => handleToggleChange('identifyCompany')}
                                />

                            </div>
                        </Form.Group>
                    </Row>
                    <Button type="submit" variant="primary" disabled={!isFormValid}>
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