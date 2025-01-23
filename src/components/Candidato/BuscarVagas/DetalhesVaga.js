import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom'; // Adicione o useNavigate
import { Container, Row, Col, Card, Button, Spinner } from 'react-bootstrap';
import api from '../../../services/axiosConfig';
import CurriculoTemplate from '../Curriculo/CurriculoTemplate';
import HeaderCandidato from '../HeaderCandidato/HeaderCandidato';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBriefcase, faBuilding, faHome, faLaptopHouse, faLocationDot, faMoneyBillWave, faWheelchair } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import './DetalhesVagas.css';
import Skeleton from 'react-loading-skeleton';

const DetalhesVaga = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [loadingCurriculo, setLoadingCurriculo] = useState(true);
    const [loadingSubmit, setLoadingSubmit] = useState(false);
    const [job, setJob] = useState(null);
    const [experiencias, setExperiencias] = useState([]);
    const [formacoes, setFormacoes] = useState([]);
    const [informacoes, setInformacoes] = useState({});

    useEffect(() => {
        document.title = "ACI Empregos | Oportunidades";

        // Buscar os detalhes da vaga pelo ID
        const fetchJobDetails = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const response = await api.get(`${process.env.REACT_APP_API_URL}/api/jobsSearch/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setJob(response.data);
            } catch (error) {
                console.error('Erro ao buscar detalhes da vaga:', error);
                Swal.fire('Erro!', 'Não foi possível carregar os detalhes da vaga.', 'error');
                navigate('/buscar-vagas');
            } finally {
                setLoading(false);
            }
        };

        fetchJobDetails();
    }, [id, navigate]);

    const fetchUserInfo = useCallback(async () => {
        setLoadingCurriculo(true);
        try {
            const token = localStorage.getItem('token');
            const response = await api.get(`${process.env.REACT_APP_API_URL}/api/user/candidato`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const user = response.data;

            setInformacoes({
                nome: user.nome,
                sobrenome: user.sobrenome,
                dataNascimento: user.nascimento ? user.nascimento.split('T')[0] : '',
                email: user.email,
                telefoneContato: user.additionalInfo?.contactPhone || '',
                telefoneRecado: user.additionalInfo?.backupPhone || '',
                cnh: user.additionalInfo?.cnh || 'Não tenho',
                tipoCnh: user.additionalInfo?.cnhTypes || [],
                fotoPerfil: `${process.env.REACT_APP_API_URL}${user.profilePicture}` || '',
                habilidadesProfissionais: user.habilidadesProfissionais || [],
                habilidadesComportamentais: user.habilidadesComportamentais || [],
                cursos: user.cursos || [],
                objetivos: user.objetivos || []
            });

            setExperiencias(user.experiences || []);
            setFormacoes(user.formacao || []);

        } catch (error) {
            console.error('Erro ao buscar informações do candidato:', error);
        } finally {
            setLoadingCurriculo(false);
        }
    }, []);

    useEffect(() => {
        fetchUserInfo();
    }, [fetchUserInfo]);

    const handleSubmeterCurriculo = async () => {
        setLoadingSubmit(true);
        try {
            const token = localStorage.getItem('token');
            await api.post(`${process.env.REACT_APP_API_URL}/api/jobs/${id}/submit-curriculum`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            Swal.fire({
                icon: 'success',
                title: 'Sucesso!',
                text: 'Inscrição realizada!',
                showCancelButton: true,
                confirmButtonText: 'Minhas inscrições',
                cancelButtonText: 'Ok',
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate('/inscricoes-candidato');
                }
            });

        } catch (error) {
            Swal.fire('Oops!', 'Você já está inscrito nesta vaga.', 'error');
        } finally {
            setLoadingSubmit(false);
        }
    };

    return (
        <>
            <HeaderCandidato />
            <Container fluid>
                <Row className="mt-3">
                    <h1>Revisão do currículo</h1>
                    <Col lg={6} xxl={5} className="curriculo-container">
                        {loadingCurriculo ? (
                            <>
                                <Row className='p-3'>
                                    <Col md={5} lg={4} xl={3}>
                                        <Skeleton height={150} width={150} className="mb-4" style={{ borderRadius: "50%" }} />
                                    </Col>
                                    <Col className="mt-md-2">
                                        <Skeleton height={30} width="50%" className="mb-2" />
                                        <Skeleton height={20} width="60%" className="mb-2" />
                                        <Skeleton height={20} width="60%" className="mb-2" />
                                        <Skeleton height={20} width="60%" className="mb-2" />
                                        <Skeleton height={20} width="60%" className="mb-2" />
                                        <Skeleton height={20} width="60%" className="mb-2" />
                                    </Col>
                                    <Skeleton height={20} width="80%" className="mb-3 mt-3" />
                                    <Skeleton height={20} width="60%" className="mb-5" />
                                    <Skeleton height={20} width="80%" className="mb-3 mt-2" />
                                    <Skeleton height={20} width="60%" className="mb-5" />
                                    <Skeleton height={20} width="80%" className="mb-3 mt-2" />
                                    <Skeleton height={20} width="60%" className="mb-5" />
                                    <Skeleton height={20} width="80%" className="mb-3 mt-2" />
                                    <Skeleton height={20} width="60%" className="mb-5" />
                                    <Skeleton height={20} width="80%" className="mb-3 mt-2" />
                                    <Skeleton height={20} width="60%" className="mb-5" />
                                    <Skeleton height={20} width="80%" className="mb-3 mt-2" />
                                    <Skeleton height={20} width="60%" className="mb-3" />
                                </Row>
                            </>
                        ) : (
                            <CurriculoTemplate
                                experiencias={experiencias}
                                formacoes={formacoes}
                                informacoes={informacoes}
                            />
                        )}
                    </Col>
                    <Col lg={6} xxl={7}>
                        <Card className="border-0 mb-3">
                            <Card.Body className="shadow-sm rounded">
                                {loading ? (
                                    <>
                                        <Skeleton height={30} width="60%" className="mb-2" />
                                        <Skeleton height={20} width="40%" className="mb-3" />
                                        <Skeleton height={20} width="50%" className="mb-3" />
                                        <Skeleton height={20} width="80%" className="mb-2" />
                                    </>
                                ) : (
                                    job && (
                                        <>
                                            <div className="d-flex align-items-center">
                                                <Card.Title className="mb-0 me-2">{job.title}</Card.Title>
                                                {job.pcd && (
                                                    <FontAwesomeIcon icon={faWheelchair} title="PcD" className="text-primary" />
                                                )}
                                            </div>
                                            <Card.Text className='mt-2'>
                                                {job.identifyCompany ? 'Empresa confidencial' : (job.company ? job.company.nome : 'Empresa não informada')}
                                            </Card.Text>
                                            <Row className="mt-2">
                                                <Card.Text>
                                                    <FontAwesomeIcon className="me-2" icon={faLocationDot} title="Localização" />
                                                    {job.city}, {job.state}
                                                </Card.Text>
                                            </Row>
                                            <Row>
                                                <Col>
                                                    <div className="d-flex mt-2">
                                                        <Card.Text className="me-4">
                                                            <FontAwesomeIcon
                                                                className="me-2"
                                                                icon={job.modality === 'Remoto' ? faHome : job.modality === 'Presencial' ? faBuilding : faLaptopHouse}
                                                                title="Modelo"
                                                            />
                                                            {job.modality}
                                                        </Card.Text>
                                                        <Card.Text className="me-4">
                                                            <FontAwesomeIcon className="me-2" icon={faBriefcase} title="Tipo" />
                                                            {job.type}
                                                        </Card.Text>
                                                        <Card.Text>
                                                            <FontAwesomeIcon className="me-2" icon={faMoneyBillWave} title="Salário" />
                                                            {job.salary ? job.salary : 'A combinar'}
                                                        </Card.Text>
                                                    </div>
                                                </Col>
                                            </Row>
                                            <Col lg={4} className='mt-2'>
                                                <Button onClick={handleSubmeterCurriculo} style={{ minWidth: '166px' }}>
                                                    {loadingSubmit ? (
                                                        <div className="d-flex justify-content-center align-items-center">
                                                            <Spinner animation="border" />
                                                        </div>
                                                    ) : (
                                                        <span>Enviar currículo</span>
                                                    )}
                                                </Button>
                                            </Col>
                                        </>
                                    ))}
                            </Card.Body>

                            <Card.Body style={{ maxHeight: '60vh', overflowY: 'auto' }} className="shadow-sm rounded">
                                {loading ? (
                                    <>
                                        <Skeleton height={20} width="80%" className="mb-3" />
                                        <Skeleton height={20} width="60%" className="mb-5" />
                                        <Skeleton height={20} width="40%" className="mb-3" />
                                        <Skeleton height={20} width="80%" className="mb-5" />
                                        <Skeleton height={20} width="40%" className="mb-3" />
                                        <Skeleton height={20} width="60%" className="mb-5" />
                                        <Skeleton height={20} width="80%" />
                                    </>
                                ) : job && (
                                    <>
                                        {job.offers && (
                                            <>
                                                <Card.Title>Benefícios</Card.Title>
                                                <Card.Text dangerouslySetInnerHTML={{ __html: job.offers }} />
                                            </>
                                        )}
                                        {job.description && (
                                            <>
                                                <Card.Title>Descrição</Card.Title>
                                                <Card.Text dangerouslySetInnerHTML={{ __html: job.description }} />
                                            </>
                                        )}
                                        {job.responsibilities && (
                                            <>
                                                <Card.Title>Responsabilidades e atribuições</Card.Title>
                                                <Card.Text dangerouslySetInnerHTML={{ __html: job.responsibilities }} />
                                            </>
                                        )}
                                        {job.qualifications && (
                                            <>
                                                <Card.Title>Requisitos e qualificações</Card.Title>
                                                <Card.Text dangerouslySetInnerHTML={{ __html: job.qualifications }} />
                                            </>
                                        )}
                                        {job.requiriments && (
                                            <>
                                                <Card.Title>Será um diferencial</Card.Title>
                                                <Card.Text dangerouslySetInnerHTML={{ __html: job.requiriments }} />
                                            </>
                                        )}
                                        {job.additionalInfo && (
                                            <>
                                                <Card.Title>Informações adicionais</Card.Title>
                                                <Card.Text dangerouslySetInnerHTML={{ __html: job.additionalInfo }} />
                                            </>
                                        )}

                                        {!job.offers &&
                                            !job.description &&
                                            !job.responsibilities &&
                                            !job.qualifications &&
                                            !job.requiriments &&
                                            !job.additionalInfo && (
                                                <Card.Text>Nenhuma informação adicional informada.</Card.Text>
                                            )}
                                    </>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container >
        </>
    );
};

export default DetalhesVaga;
