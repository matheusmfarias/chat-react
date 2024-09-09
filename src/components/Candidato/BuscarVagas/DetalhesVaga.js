import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // Adicione o useNavigate
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import axios from 'axios';
import CurriculoTemplate from '../Curriculo/CurriculoTemplate';
import HeaderCandidato from '../HeaderCandidato/HeaderCandidato';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBriefcase, faBuilding, faHome, faLaptopHouse, faLocationDot, faMoneyBillWave, faWheelchair } from '@fortawesome/free-solid-svg-icons';

const DetalhesVaga = () => {
    const location = useLocation();
    const navigate = useNavigate(); // Hook para navegação
    const { job } = location.state;

    const [experiencias, setExperiencias] = useState([]);
    const [formacoes, setFormacoes] = useState([]);
    const [informacoes, setInformacoes] = useState({});

    const fetchUserInfo = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/user/candidato', {
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
                fotoPerfil: `http://localhost:5000${user.profilePicture}` || '',
                habilidadesProfissionais: user.habilidadesProfissionais || [],
                habilidadesComportamentais: user.habilidadesComportamentais || [],
                cursos: user.cursos || [],
                objetivos: user.objetivos || []
            });

            setExperiencias(user.experiences || []);
            setFormacoes(user.formacao || []);

        } catch (error) {
            console.error('Erro ao buscar informações do usuário', error);
        }
    }, []);

    useEffect(() => {
        fetchUserInfo();
    }, [fetchUserInfo]);

    // Função para voltar à lista de vagas
    const handleVoltar = () => {
        navigate(-1); // Volta para a página anterior
    };

    // Função para submeter o currículo à vaga
    const handleSubmeterCurriculo = () => {
        // Aqui será implementada a lógica para submeter o currículo à vaga (a fazer)
        alert('Currículo submetido! (implementar backend)');
    };

    return (
        <>
            <HeaderCandidato />
            <Container>
                <Row>
                    <Col md={1} className="mt-2">
                        <Button variant="secondary" className="me-2" onClick={handleVoltar}>
                            Voltar
                        </Button>
                    </Col>
                    <Col md={11} className="mt-2">
                        <h1>Revisão do currículo</h1>
                    </Col>
                </Row>
                <Row>
                    <Col md={6} className="curriculo-container">
                        <CurriculoTemplate
                            experiencias={experiencias}
                            formacoes={formacoes}
                            informacoes={informacoes}
                        />
                    </Col>
                    <Col md={6} style={{ position: 'sticky', top: '10px', height: '100vh', zIndex: '1000' }}>
                        <Card className="vaga-detalhe border-0">
                            <Card.Body className="shadow rounded">
                                <Card.Title><strong>{job.title}</strong></Card.Title>
                                {job.identifyCompany && job.company ? (
                                    <Card.Text>{job.company.nome}</Card.Text>
                                ) : (
                                    <Card.Text>Empresa confidencial</Card.Text>
                                )}
                                <Row className="mb-3">
                                    <Col>
                                        <Card.Text>
                                            <FontAwesomeIcon className="me-2" icon={faLocationDot} title="Localização" />
                                            {job.location}
                                        </Card.Text>
                                    </Col>
                                </Row>
                                <Row className="mb-3">
                                    <Col>
                                        <Card.Text>
                                            <FontAwesomeIcon className="me-2" icon={
                                                job.modality === 'Remoto' ? faHome :
                                                    job.modality === 'Presencial' ? faBuilding :
                                                        faLaptopHouse
                                            } title="Modelo" />
                                            {job.modality}
                                        </Card.Text>
                                    </Col>
                                    <Col>
                                        <Card.Text>
                                            <FontAwesomeIcon className="me-2" icon={faBriefcase} title="Tipo" />
                                            {job.type}
                                        </Card.Text>
                                    </Col>
                                    <Col>
                                        <Card.Text>
                                            <FontAwesomeIcon className="me-2" icon={faMoneyBillWave} title="Salário" />
                                            {job.salary ? `${job.salary}` : "A combinar"}
                                        </Card.Text>
                                    </Col>
                                    {job.pcd && (
                                        <Col>
                                            <Card.Text>
                                                <FontAwesomeIcon className="me-2" icon={faWheelchair} title="PcD" />
                                                PcD
                                            </Card.Text>
                                        </Col>
                                    )}
                                </Row>
                                <Col md={5}>
                                    <Button onClick={handleSubmeterCurriculo}>
                                        Submeter currículo
                                    </Button>
                                </Col>
                            </Card.Body>

                            <Card.Body style={{ maxHeight: '69vh', height: 'auto', overflowY: 'auto' }} className="shadow rounded">
                                {job.offers || job.description || job.responsibilities || job.qualifications || job.requiriments || job.additionalInfo ? (
                                    <>
                                        {job.offers && (
                                            <>
                                                <Card.Title><strong>Benefícios</strong></Card.Title>
                                                <Card.Text dangerouslySetInnerHTML={{ __html: job.offers }} />
                                            </>
                                        )}
                                        {job.description && (
                                            <>
                                                <Card.Title><strong>Descrição</strong></Card.Title>
                                                <Card.Text dangerouslySetInnerHTML={{ __html: job.description }} />
                                            </>
                                        )}
                                        {job.responsibilities && (
                                            <>
                                                <Card.Title><strong>Responsabilidades e atribuições</strong></Card.Title>
                                                <Card.Text dangerouslySetInnerHTML={{ __html: job.responsibilities }} />
                                            </>
                                        )}
                                        {job.qualifications && (
                                            <>
                                                <Card.Title><strong>Requisitos e qualificações</strong></Card.Title>
                                                <Card.Text dangerouslySetInnerHTML={{ __html: job.qualifications }} />
                                            </>
                                        )}
                                        {job.requiriments && (
                                            <>
                                                <Card.Title><strong>Será um diferencial</strong></Card.Title>
                                                <Card.Text dangerouslySetInnerHTML={{ __html: job.requiriments }} />
                                            </>
                                        )}
                                        {job.additionalInfo && (
                                            <>
                                                <Card.Title><strong>Informações adicionais</strong></Card.Title>
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
        </>
    );
};

export default DetalhesVaga;
