import React from 'react';
import { Container, Col, Button, Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBriefcase, faCalendarDays, faEye, faSackDollar, faWheelchair } from '@fortawesome/free-solid-svg-icons';
import useFormattedDate from '../../../hooks/useFormattedDate';

const DetalhesVagas = ({ job, onBack }) => {
    const { formatDate } = useFormattedDate();

    if (!job) return null;

    const renderHtmlContent = (content) => {
        return { __html: content };
    };

    return (
        <Container fluid style={{ backgroundColor: '#f9f9f9f9' }}>
            <Container>
                <Col md={2}>
                    <Button variant="primary" onClick={onBack} className="mb-4">Voltar para a lista</Button>
                </Col>
                    <Card className="border-0 p-4 shadow-sm">
                        <h2 className="text-center">{job.title}</h2>
                        {job.identifyCompany ? (
                            <h4 className="text-center text-secondary mb-3">{job.company.nome}</h4>
                        ) : (
                            <h4 className="text-center text-secondary mb-3">Empresa confidencial</h4>
                        )}
                        <h5 className="text-center text-secondary">{job.location} • {job.modality}</h5>
                        <h4>Dados da vaga</h4>
                        <Card.Text className="text-secondary">
                            <FontAwesomeIcon icon={faCalendarDays} title="Data de publicação" /> {formatDate(job.publicationDate)}
                        </Card.Text>
                        <Card.Text className="text-secondary"><FontAwesomeIcon icon={faBriefcase} title="Tipo" /> {job.type}</Card.Text>
                        <Card.Text className="text-secondary"><FontAwesomeIcon icon={faSackDollar} title="Salário" /> {job.salary ? job.salary : 'A combinar'}</Card.Text>
                        <Card.Text className="text-secondary"><FontAwesomeIcon icon={faWheelchair} title="PCD" /> {job.pcd ? 'Sim' : 'Não'}</Card.Text>
                        <Card.Text className="text-secondary"><FontAwesomeIcon icon={faEye} title="Identificação" /> {job.identifyCompany ? 'Sim' : 'Não'}</Card.Text>
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
            </Container>
        </Container >
    );
};

export default DetalhesVagas;
