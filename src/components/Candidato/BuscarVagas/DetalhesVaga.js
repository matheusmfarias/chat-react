import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // Adicione o useNavigate
import { Container, Row, Col, Card, Button, Spinner } from 'react-bootstrap';
import api from '../../../services/axiosConfig';
import CurriculoTemplate from '../Curriculo/CurriculoTemplate';
import HeaderCandidato from '../HeaderCandidato/HeaderCandidato';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBriefcase, faBuilding, faHome, faLaptopHouse, faLocationDot, faMoneyBillWave, faWheelchair } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import './DetalhesVagas.css';

const DetalhesVaga = () => {
    const location = useLocation();
    const navigate = useNavigate(); // Hook para navegação
    const { job } = location.state;
    const [loading, setLoading] = useState(false);
    const [loadingSubmit, setLoadingSubmit] = useState(false);
    const [experiencias, setExperiencias] = useState([]);
    const [formacoes, setFormacoes] = useState([]);
    const [informacoes, setInformacoes] = useState({});

    useEffect(() => {
        document.title = "ACI Empregos | Oportunidades";
      }, []);

    const fetchUserInfo = useCallback(async () => {
        setLoading(true);
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
            console.error('Ocorreu um erro ao buscar as informações. Por favor, tente novamente mais tarde.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUserInfo();
    }, [fetchUserInfo]);

    // Função para voltar à lista de vagas
    const handleVoltar = () => {
        navigate(-1); // Volta para a página anterior
    };

    const handleSubmeterCurriculo = async () => {
        setLoadingSubmit(true);
        try {
            const token = localStorage.getItem('token');
            await api.post(`${process.env.REACT_APP_API_URL}/api/jobs/${job._id}/submit-curriculum`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            Swal.fire({
                icon: 'success',
                title: 'Sucesso!',
                text: 'Inscrição realizada!',
                showCancelButton: true,
                confirmButtonText: 'Minhas inscrições',
                cancelButtonText: 'OK',
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate('/inscricoes-candidato'); // Redireciona para /inscrições
                }
            });

        } catch (error) {
            console.error('Ocorreu um erro ao submeter o currículo. Por favor, tente novamente mais tarde.');

            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Você já está inscrito nesta vaga!',
                showCancelButton: true,
                confirmButtonText: 'Outras vagas',
                cancelButtonText: 'OK',
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate('/buscar-vagas'); // Redireciona para /buscar-vagas
                }
            });
        } finally {
            setLoadingSubmit(false);
        }
    };

    return (
        <>
            <HeaderCandidato />
            <div style={{ backgroundColor: '#f9f9f9f9' }}>
                <Container>
                    <Row>
                        <Col md={1} className="mt-2">
                            <Button variant="primary" className="me-2" onClick={handleVoltar}>
                                Voltar
                            </Button>
                        </Col>
                        <Col md={11} className="mt-2">
                            <h1>Revisão</h1>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={7} className="curriculo-container shadow rounded" >
                            <CurriculoTemplate
                                experiencias={experiencias}
                                formacoes={formacoes}
                                informacoes={informacoes}
                            />
                        </Col>

                        <Col md={5}>
                            <Card className="vaga-detalhe border-0 p-0">
                                <Card.Body className="shadow-sm rounded">
                                    {loading ? (
                                        <div className="d-flex justify-content-center align-items-center">
                                            <Spinner animation="border" variant="primary" />
                                        </div>
                                    ) : (
                                        <>
                                            <Card.Title>{job.title}</Card.Title>
                                            {job.identifyCompany && job.company ? (
                                                <Card.Text>{job.company.nome}</Card.Text>
                                            ) : (
                                                <Card.Text>Empresa confidencial</Card.Text>
                                            )}
                                            <Row className="mb-2">
                                                <Col>
                                                    <Card.Text>
                                                        <FontAwesomeIcon style={{ width: '14px' }} className="me-2" icon={faLocationDot} title="Localização" />
                                                        {job.location}
                                                    </Card.Text>
                                                </Col>
                                            </Row>
                                            <Row className="icones-vaga">
                                                <Col className="mb-2">
                                                    <Card.Text>
                                                        <FontAwesomeIcon style={{ width: '14px' }} className="me-2" icon={
                                                            job.modality === 'Remoto' ? faHome :
                                                                job.modality === 'Presencial' ? faBuilding :
                                                                    faLaptopHouse
                                                        } title="Modelo" />
                                                        {job.modality}
                                                    </Card.Text>
                                                </Col>
                                                <Col className="mb-2">
                                                    <Card.Text>
                                                        <FontAwesomeIcon style={{ width: '14px' }} className="me-2" icon={faBriefcase} title="Tipo" />
                                                        {job.type}
                                                    </Card.Text>
                                                </Col>
                                                <Col className="mb-2">
                                                    <Card.Text>
                                                        <FontAwesomeIcon style={{ width: '14px' }} className="me-2" icon={faMoneyBillWave} title="Salário" />
                                                        {job.salary ? `${job.salary}` : "A combinar"}
                                                    </Card.Text>
                                                </Col>
                                            </Row>
                                            <Row className="mb-2">
                                                {job.pcd && (
                                                    <Col>
                                                        <Card.Text>
                                                            <FontAwesomeIcon style={{ width: '14px' }} className="me-2" icon={faWheelchair} title="PcD" />
                                                            PcD
                                                        </Card.Text>
                                                    </Col>
                                                )}
                                            </Row>
                                            <Col md={5}>
                                                <Button variant='outline-primary' onClick={handleSubmeterCurriculo}>
                                                    {loadingSubmit ? (
                                                        <div className="d-flex justify-content-center align-items-center">
                                                            <Spinner animation="border" variant="primary" />
                                                        </div>
                                                    ) : (
                                                        <span>Enviar currículo</span>
                                                    )}
                                                </Button>
                                            </Col>
                                        </>
                                    )}
                                </Card.Body>

                                <Card.Body style={{ maxHeight: '60vh', overflowY: 'auto' }} className="shadow-sm rounded">
                                    {job.offers || job.description || job.responsibilities || job.qualifications || job.requiriments || job.additionalInfo ? (
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
                                        </>
                                    ) : (
                                        <Card.Text>Nenhuma informação adicional informada.</Card.Text>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container >
            </div>
        </>
    );
};

export default DetalhesVaga;
