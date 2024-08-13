import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Modal, Button, Form, Table, Row, Col, InputGroup } from 'react-bootstrap';
import { FaPlus, FaFilter, FaEdit, FaTrash } from 'react-icons/fa';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './VagasEmpresa.css';
import HeaderEmpresa from '../HeaderEmpresa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

const VagasEmpresa = () => {
    const [jobs, setJobs] = useState([]);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [newJob, setNewJob] = useState({
        title: '',
        location: '',
        modality: 'Presencial',
        type: 'Efetivo',
        status: true,
        description: '',
        responsibilities: '',
        qualifications: '',
        additionalInfo: '',
        requirements: '',
        offers: '',
        pcd: false,
        salary: '',
        salaryActive: true,
        descriptionActive: false,
        responsibilitiesActive: false,
        qualificationsActive: false,
        additionalInfoActive: false,
        requirementsActive: false,
        offersActive: false
    });
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [selectedState, setSelectedState] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [isEditMode, setIsEditMode] = useState(false);
    const [editJobId, setEditJobId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchJobs = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const jobsResponse = await axios.get('http://localhost:5000/api/jobs', {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                    setJobs(jobsResponse.data);
                } catch (error) {
                    console.error('Error fetching jobs:', error);
                }
            }
        };

        fetchJobs();
    }, []);

    useEffect(() => {
        const fetchStates = async () => {
            try {
                const statesResponse = await axios.get('https://servicodados.ibge.gov.br/api/v1/localidades/estados');
                setStates(statesResponse.data);
            } catch (error) {
                console.error('Error fetching states:', error);
            }
        };

        fetchStates();
    }, []);

    useEffect(() => {
        if (selectedState) {
            const fetchCities = async () => {
                try {
                    const citiesResponse = await axios.get(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedState}/municipios`);
                    setCities(citiesResponse.data);
                } catch (error) {
                    console.error('Error fetching cities:', error);
                }
            };

            fetchCities();
        } else {
            setCities([]);
        }
    }, [selectedState]);

    const openModal = (job = null) => {
        if (job) {
            const [city, state] = job.location.split(', ');
            setSelectedState(state);
            setSelectedCity(city);
            setNewJob({
                ...job,
                status: job.status === 'Ativo',
                pcd: job.pcd === 'Ativo',
                salaryActive: !!job.salary,
                salary: job.salary || '',
                descriptionActive: !!job.description,
                responsibilitiesActive: !!job.responsibilities,
                qualificationsActive: !!job.qualifications,
                additionalInfoActive: !!job.additionalInfo,
                requirementsActive: !!job.requirements,
                offersActive: !!job.offers
            });
            setIsEditMode(true);
            setEditJobId(job._id);
        } else {
            setNewJob({
                title: '',
                location: '',
                modality: 'Presencial',
                type: 'Efetivo',
                status: true,
                description: '',
                responsibilities: '',
                qualifications: '',
                additionalInfo: '',
                requirements: '',
                offers: '',
                pcd: false,
                salary: '',
                salaryActive: true,
                descriptionActive: false,
                responsibilitiesActive: false,
                qualificationsActive: false,
                additionalInfoActive: false,
                requirementsActive: false,
                offersActive: false
            });
            setSelectedState('');
            setSelectedCity('');
            setIsEditMode(false);
            setEditJobId(null);
        }
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
    };

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

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const jobData = {
                    ...newJob,
                    location: `${selectedCity}, ${selectedState}`,
                    status: newJob.status ? 'Ativo' : 'Inativo',
                    pcd: newJob.pcd ? 'Ativo' : 'Inativo',
                    salary: newJob.salaryActive ? newJob.salary : null,
                    description: newJob.descriptionActive ? newJob.description : null,
                    responsibilities: newJob.responsibilitiesActive ? newJob.responsibilities : null,
                    qualifications: newJob.qualificationsActive ? newJob.qualifications : null,
                    additionalInfo: newJob.additionalInfoActive ? newJob.additionalInfo : null,
                    requirements: newJob.requirementsActive ? newJob.requirements : null,
                    offers: newJob.offersActive ? newJob.offers : null
                };
                if (isEditMode) {
                    await axios.put(`http://localhost:5000/api/jobs/${editJobId}`, jobData, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                    setJobs(prevJobs => prevJobs.map(job => job._id === editJobId ? jobData : job));
                } else {
                    const response = await axios.post('http://localhost:5000/api/jobs', jobData, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                    setJobs(prevJobs => [...prevJobs, response.data]);
                }
                closeModal();
            } catch (error) {
                console.error('Error saving job:', error);
            }
        }
    };

    const handleDeleteJob = async (id) => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                await axios.delete(`http://localhost:5000/api/jobs/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setJobs(prevJobs => prevJobs.filter(job => job._id !== id));
            } catch (error) {
                console.error('Error deleting job:', error);
            }
        }
    };

    return (
        <>
            <HeaderEmpresa />
            <div className="container">
                <div className="mt-4">
                    <h1>Minhas Vagas</h1>
                    <Row className="mb-3 align-items-center">
                        <Col xs={12} md={4} className="d-flex justify-content-start mb-2 mb-md-0">
                            <Button variant="primary" className="me-2 flex-grow-1" onClick={() => openModal()}>
                                <FaPlus className="mr-2" />
                                Adicionar
                            </Button>
                            <Button variant="secondary" className="me-2 flex-grow-1">
                                <FaFilter className="mr-2" />
                                Filtro
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
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Cargo</th>
                                <th>Localidade</th>
                                <th>Modelo</th>
                                <th>Tipo</th>
                                <th>Status</th>
                                <th>PCD</th>
                                <th>Salário</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {jobs.map((job, index) => (
                                <tr key={index}>
                                    <td>{job.title}</td>
                                    <td>{job.location}</td>
                                    <td>{job.modality}</td>
                                    <td>{job.type}</td>
                                    <td>{job.status}</td>
                                    <td>{job.pcd}</td>
                                    <td>{job.salary ? job.salary : 'Não informado'}</td>
                                    <td>
                                        <Button variant="warning" className="mr-2" onClick={() => openModal(job)}>
                                            <FaEdit />
                                        </Button>
                                        <Button variant="danger" onClick={() => handleDeleteJob(job._id)}>
                                            <FaTrash />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            </div>

            <Modal show={modalIsOpen} onHide={closeModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{isEditMode ? 'Editar Vaga' : 'Adicionar Vaga'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleFormSubmit}>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="form-group-custom">
                                    <Form.Label className='fb'>Cargo</Form.Label>
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
                                    <Form.Label>Modelo</Form.Label>
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
                                    <Form.Label>Localização</Form.Label>
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
                                    <Form.Label>Tipo</Form.Label>
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
                                            checked={newJob.pcd}
                                            onChange={() => handleToggleChange('pcd')}
                                        />
                                    </div>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Button type="submit" variant="primary" className="mr-2">
                            {isEditMode ? 'Salvar' : 'Adicionar'}
                        </Button>
                        <Button variant="secondary" onClick={closeModal}>
                            Cancelar
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </>
    );
};

export default VagasEmpresa;
