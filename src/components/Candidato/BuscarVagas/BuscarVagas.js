import React, { useEffect, useState } from "react";
import HeaderCandidato from "../HeaderCandidato/HeaderCandidato";
import { useLocation } from 'react-router-dom';
import { Row, Col, Card, Container } from "react-bootstrap";
import { faBriefcase, faBuilding, faHome, faLaptopHouse, faLocationDot, faMoneyBillWave, faWheelchair } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import './BuscarVagas.css'; // Adicionar o arquivo CSS para a transição

const BuscarVagas = () => {
    const location = useLocation();
    const results = location.state?.results;
    const [selectedJob, setSelectedJob] = useState(null); // Estado para controlar a vaga selecionada

    // Efeito para abrir automaticamente a primeira vaga encontrada
    useEffect(() => {
        if (results && results.length > 0) {
            setSelectedJob(results[0]);
        }
    }, [results]);

    const handleCardClick = (job) => {
        setSelectedJob(job); // Atualiza o estado com a vaga selecionada
    };

    return (
        <>
            <HeaderCandidato />
            <Container className="mt-3">
                <Row>
                    <Col md={4}>
                        {/* Coluna da esquerda para exibir os cards das vagas */}
                        {results && results.map(result => (
                            <Card
                                key={result._id}
                                className={`vaga-card mb-4 border-0 shadow-sm rounded ${selectedJob && selectedJob._id === result._id ? 'vaga-card-selecionada shadow-lg' : ''}`} // Adiciona sombra especial se for o card selecionado
                                onClick={() => handleCardClick(result)} // Define a vaga selecionada ao clicar no card
                                style={{ cursor: 'pointer' }}
                            >
                                <Card.Body>
                                    <Card.Title>{result.title}</Card.Title>
                                    {result.identifyCompany && result.company ? (
                                        <Card.Text>{result.company.nome}</Card.Text>
                                    ) : (
                                        <Card.Text>Empresa confidencial</Card.Text>
                                    )}
                                    <Card.Text className="bg-light rounded text-center text-primary p-2">
                                        <FontAwesomeIcon className="me-2" icon={faLocationDot} title="Localização" />
                                        {result.location}
                                    </Card.Text>
                                    <Row className="mb-2">
                                        <Col>
                                            <Card.Text className="bg-light rounded text-center text-primary p-2">
                                                <FontAwesomeIcon
                                                    className="me-2"
                                                    icon={
                                                        result.modality === 'Remoto' ? faHome :
                                                            result.modality === 'Presencial' ? faBuilding :
                                                                faLaptopHouse
                                                    }
                                                    title="Modelo"
                                                />
                                                {result.modality}
                                            </Card.Text>
                                        </Col>
                                        <Col>
                                            <Card.Text className="bg-light rounded text-center text-primary p-2">
                                                <FontAwesomeIcon className="me-2" icon={faBriefcase} title="Tipo" />
                                                {result.type}
                                            </Card.Text>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <Card.Text className="bg-light rounded text-center text-primary p-2">
                                                <FontAwesomeIcon className="me-2" icon={faMoneyBillWave} title="Salário" />
                                                {result.salary !== "" ?
                                                    result.salary : (
                                                        'A combinar'
                                                    )}
                                            </Card.Text>
                                        </Col>
                                        <Col>
                                            {result.pcd ? (
                                                <Card.Text className="bg-light rounded text-center text-primary p-2">
                                                    <FontAwesomeIcon className="me-2" icon={faWheelchair} title="PcD" />
                                                    PcD
                                                </Card.Text>
                                            ) : (
                                                ''
                                            )}
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        ))}
                    </Col>
                    <Col md={8}>
                        {/* Coluna da direita para exibir a descrição detalhada da vaga selecionada */}
                        {selectedJob ? (
                            <Card className="vaga-detalhe mb-4 border-0 shadow-sm rounded">
                                <Card.Body>
                                    <Card.Title><strong>{selectedJob.title}</strong></Card.Title>
                                    {selectedJob.identifyCompany && selectedJob.company ? (
                                        <Card.Text>{selectedJob.company.nome}</Card.Text>
                                    ) : (
                                        <Card.Text>Empresa confidencial</Card.Text>
                                    )}
                                    <Row>
                                        <Card.Text>{selectedJob.location}</Card.Text>
                                        <Card.Text>{selectedJob.modality}</Card.Text>
                                    </Row>
                                    <Card.Text><strong>Tipo:</strong> {selectedJob.type}</Card.Text>
                                    <Card.Text><strong>Publicação:</strong> {new Date(selectedJob.publicationDate).toLocaleDateString()}</Card.Text>
                                    <Card.Text><strong>Descrição:</strong> {selectedJob.description}</Card.Text>
                                    <Card.Text><strong>Salário:</strong> {selectedJob.salary ? `R$ ${selectedJob.salary}` : "Não informado"}</Card.Text>
                                    <Card.Text><strong>PCD:</strong> {selectedJob.pcd ? "Sim" : "Não"}</Card.Text>
                                </Card.Body>
                            </Card>
                        ) : (
                            <p>Selecione uma vaga à esquerda para ver os detalhes.</p>
                        )}
                    </Col>
                </Row>
            </Container>
        </>
    );
}

export default BuscarVagas;
