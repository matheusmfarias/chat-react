import React from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBriefcase, faSackDollar, faWheelchair } from '@fortawesome/free-solid-svg-icons';

const DetalhesVagas = ({ job, onBack }) => {
    if (!job) return null;

    // Função para renderizar conteúdo HTML com segurança
    const renderHtmlContent = (content) => {
        return { __html: content };
    };

    return (
        <Container className="mt-4">
            <Col md={2}>
                <Button variant="primary" onClick={onBack} className="mb-4">Voltar para a lista</Button>
            </Col>
            <Row className="shadow-lg mb-4">
                <Col md={12} className="shadow-sm mb-1 p-2 rounded">
                    <Card className="border-0 p-3">
                        <h2 className="text-center mb-3">{job.title}</h2>
                        <h4 className="text-center text-secondary mb-4">{job.company.nome}</h4>
                        <h5 className="text-center text-secondary mb-4">{job.location} • {job.modality}</h5>
                    </Card>
                </Col>

                <Col md={12} className="shadow-sm mb-1 p-3 rounded">
                    <Card className="border-0 p-3">
                        <h4>Dados da vaga</h4>
                        <Card.Text className="text-secondary"><FontAwesomeIcon icon={faBriefcase} title="Tipo" /> {job.type}</Card.Text>
                        <Card.Text className="text-secondary"><FontAwesomeIcon icon={faSackDollar} title="Salário" /> {job.salary ? job.salary : 'A combinar'}</Card.Text>
                        <Card.Text className="text-secondary"><FontAwesomeIcon icon={faWheelchair} title="PCD" /> {job.pcd ? 'Sim' : 'Não'}</Card.Text>
                    </Card>
                </Col>

                <Col md={12} className="shadow-sm mb-1 p-3 rounded">
                    <Card className="border-0 p-3">
                        <h4>Benefícios</h4>
                        <Card.Text dangerouslySetInnerHTML={renderHtmlContent(job.offers || 'Não informado')} />

                        <h4>Descrição completa</h4>
                        <Card.Text dangerouslySetInnerHTML={renderHtmlContent(job.description || 'Não informado')} />

                        <h4>Responsabilidades e atribuições</h4>
                        <Card.Text dangerouslySetInnerHTML={renderHtmlContent(job.responsibilities || 'Não informado')} />

                        <h4>Requisitos e qualificações</h4>
                        <Card.Text dangerouslySetInnerHTML={renderHtmlContent(job.qualifications || 'Não informado')} />

                        <h4>Será um diferencial</h4>
                        <Card.Text dangerouslySetInnerHTML={renderHtmlContent(job.requirements || 'Não informado')} />

                        <h4>Informações adicionais</h4>
                        <Card.Text dangerouslySetInnerHTML={renderHtmlContent(job.additionalInfo || 'Não informado')} />
                    </Card>
                </Col>

            </Row>
        </Container >
    );
};

export default DetalhesVagas;
