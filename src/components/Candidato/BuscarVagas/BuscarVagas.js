import React, { useEffect, useState, useMemo } from "react";
import HeaderCandidato from "../HeaderCandidato/HeaderCandidato";
import { useLocation } from 'react-router-dom';
import { Row, Col, Card, Container, Button } from "react-bootstrap";
import { faBriefcase, faBuilding, faChevronLeft, faChevronRight, faHome, faLaptopHouse, faLocationDot, faMoneyBillWave, faWheelchair } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import './BuscarVagas.css'; // Adicionar o arquivo CSS para a transição

const BuscarVagas = () => {
    const location = useLocation();
    const results = useMemo(() => location.state?.results || [], [location.state]);
    const [selectedJob, setSelectedJob] = useState(null); // Estado para controlar a vaga selecionada
    const [currentPage, setCurrentPage] = useState(1); // Estado para controlar a página atual
    const itemsPerPage = 10; // Definindo 10 vagas por página

    // Efeito para abrir automaticamente a primeira vaga encontrada
    useEffect(() => {
        if (results.length > 0) {
            setSelectedJob(results[0]);
        }
    }, [results]);

    const handleCardClick = (job) => {
        setSelectedJob(job); // Atualiza o estado com a vaga selecionada
    };

    // Função para calcular o número total de páginas
    const totalPages = Math.ceil(results.length / itemsPerPage);

    // Função para mudar de página
    const handlePageChange = (direction) => {
        if (direction === 'next' && currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        } else if (direction === 'prev' && currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    // Calculando as vagas para a página atual
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = results.slice(startIndex, endIndex);

    useEffect(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const firstJobOnPage = results.slice(startIndex, startIndex + itemsPerPage)[0];
        setSelectedJob(firstJobOnPage);
    }, [currentPage, results, itemsPerPage]);

    const renderHtmlContent = (content) => {
        return { __html: content };
    };

    return (
        <>
            <HeaderCandidato />
            <Container className="mt-3">
                <Row>
                    <Col md={4} style={{ position: 'relative' }} className="p-2">
                        {currentItems && currentItems.map(result => (
                            <Card
                                key={result._id}
                                className={`vaga-card p-2 mb-4 border-0 shadow-sm rounded ${selectedJob && selectedJob._id === result._id ? 'vaga-card-selecionada shadow-lg' : ''}`}
                                onClick={() => handleCardClick(result)}
                                style={{
                                    cursor: 'pointer',
                                    position: selectedJob && selectedJob._id === result._id ? 'sticky' : 'static',
                                    top: selectedJob && selectedJob._id === result._id ? '0' : 'auto',
                                    zIndex: selectedJob && selectedJob._id === result._id ? '1000' : 'auto'
                                }}
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

                        <div className="d-flex justify-content-center align-items-center mt-4">
                            <Button
                                className="me-2 mb-2"
                                onClick={() => handlePageChange('prev')}
                                disabled={currentPage === 1}
                            >
                                <FontAwesomeIcon icon={faChevronLeft} />
                            </Button>

                            {/* Página Anterior */}
                            {currentPage > 1 && (
                                <Button
                                    className="me-2 mb-2"
                                    onClick={() => handlePageChange('prev')}
                                >
                                    {currentPage - 1}
                                </Button>
                            )}

                            {/* Página Atual */}
                            <Button
                                className="me-2 mb-2"
                                variant="primary"
                                disabled
                            >
                                {currentPage}
                            </Button>

                            {/* Próxima Página */}
                            {currentPage < totalPages && (
                                <Button
                                    className="me-2 mb-2"
                                    onClick={() => handlePageChange('next')}
                                >
                                    {currentPage + 1}
                                </Button>
                            )}

                            <Button
                                className="me-2 mb-2"
                                onClick={() => handlePageChange('next')}
                                disabled={currentPage === totalPages}
                            >
                                <FontAwesomeIcon icon={faChevronRight} />
                            </Button>
                        </div>


                    </Col>
                    <Col md={8} className="mb-3">
                        {/* Coluna da direita para exibir a descrição detalhada da vaga selecionada */}
                        {selectedJob ? (
                            <Card className="vaga-detalhe mb-4 border-0 shadow rounded">
                                {/* Primeiro Card.Body com as informações fixas */}
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
                                        <Card.Text><strong>Salário:</strong> {selectedJob.salary ? `${selectedJob.salary}` : "A combinar"}</Card.Text>
                                        <Card.Text><strong>PCD:</strong> {selectedJob.pcd ? "Sim" : "Não"}</Card.Text>
                                    </Row>
                                    <Card.Text>{selectedJob.type}</Card.Text>
                                </Card.Body>

                                {/* Segundo Card.Body com o conteúdo rolável apenas se necessário */}
                                <Card.Body style={{ maxHeight: '293vh', overflowY: 'auto' }} >
                                    {selectedJob.offers ? (
                                        <>
                                            <Card.Title><strong>Benefícios</strong></Card.Title>
                                            <Card.Text dangerouslySetInnerHTML={renderHtmlContent(selectedJob.offers)} />
                                        </>
                                    ) : null}

                                    {selectedJob.description ? (
                                        <>
                                            <Card.Title><strong>Descrição</strong></Card.Title>
                                            <Card.Text dangerouslySetInnerHTML={renderHtmlContent(selectedJob.description)} />
                                        </>
                                    ) : null}
                                    {selectedJob.responsibilities ? (
                                        <>
                                            <Card.Title><strong>Responsabilidades e atribuições</strong></Card.Title>
                                            <Card.Text dangerouslySetInnerHTML={renderHtmlContent(selectedJob.responsibilities)} />
                                        </>
                                    ) : null}
                                    {selectedJob.qualifications ? (
                                        <>
                                            <Card.Title><strong>Requisitos e qualificações</strong></Card.Title>
                                            <Card.Text dangerouslySetInnerHTML={renderHtmlContent(selectedJob.qualifications)} />
                                        </>
                                    ) : null}
                                    {selectedJob.requiriments ? (
                                        <>
                                            <Card.Title><strong>Será um diferencial</strong></Card.Title>
                                            <Card.Text dangerouslySetInnerHTML={renderHtmlContent(selectedJob.requiriments)} />
                                        </>
                                    ) : null}
                                    {selectedJob.additionalInfo ? (
                                        <>
                                            <Card.Title><strong>Informações adicionais</strong></Card.Title>
                                            <Card.Text dangerouslySetInnerHTML={renderHtmlContent(selectedJob.additionalInfo)} />
                                        </>
                                    ) : null}
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
