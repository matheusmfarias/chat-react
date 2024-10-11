import React, { useState, useEffect } from "react";
import api from "../../../services/axiosConfig";
import HeaderEmpresa from "../HeaderEmpresa";
import { Spinner, Pagination, Row, Col, Card, Button, Form, InputGroup, Container } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import './CurriculosEmpresa.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleUser, faSearch } from "@fortawesome/free-solid-svg-icons";

const CurriculosEmpresa = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [applications, setApplications] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 9; // Define o número de itens por página

  useEffect(() => {
    const fetchCandidates = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");

        // Chama a API passando o jobId e o termo de busca como parte da rota
        const response = await api.get(`${process.env.REACT_APP_API_URL}/api/jobs/applications/${jobId}`, {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            page: currentPage,
            limit: itemsPerPage, // Envia o número de itens por página
            searchTerm
          }
        });

        setApplications(response.data.candidates || []);
        setTotalPages(response.data.totalPages || 1);
      } catch (error) {
        console.error("Erro ao obter os candidatos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, [jobId, currentPage, searchTerm]);

  const handleClearSearch = () => {
    setSearchTerm("");
    setCurrentPage(1);
  };

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const viewCurriculum = (userId) => {
    window.open(`/curriculo/${userId}`, "_blank");
  };

  return (
    <>
      <HeaderEmpresa />
      <Container fluid style={{ backgroundColor: '#f9f9f9f9' }}>
        <Row className="row-buscar-vagas mt-4">
          <Col md={2}>
            <Button variant="primary" className="mb-3" onClick={() => navigate('/vagas-empresa')}>
              Voltar para vagas
            </Button>
            <h1>Recrutamento</h1>
          </Col>
        </Row>
        <Row className="row-buscar-vagas mt-2">
          <Col xs={12} md={12} className='coluna-vagas mt-2'>
            <Row className='busca-coluna-vagas align-items-center'>
              <InputGroup style={{ maxWidth: '800px' }}>
                <Form.Control
                  type="text"
                  className='input-buscar-vagas shadow border-primary'
                  placeholder="Pesquisar por candidato..."
                  aria-label="Pesquisar"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
                <Button className="btn-buscar-vagas" variant="outline-primary">
                  <FontAwesomeIcon icon={faSearch} />
                </Button>
              </InputGroup>
              <Col md={2}>
                <Button
                  className="btn-limpar-busca"
                  variant="outline-secondary"
                  onClick={() => handleClearSearch()}
                  title="Limpar busca"
                >
                  Limpar busca
                </Button>
              </Col>
            </Row>
            <Row className="mt-4">
              {loading ? (
                <div className="d-flex justify-content-center align-items-center">
                  <Spinner animation='border' variant='primary' />
                </div>
              ) : applications.length === 0 ? (
                <p className="text-center">Nenhum candidato encontrado para esta vaga.</p>
              ) : (
                applications.map((application) => {
                  const user = application.user || {};
                  const experiences = user.experiences || [];
                  const formacao = user.formacao || [];

                  return (
                    <Col key={application._id} md={6} lg={4} className="mb-4 d-flex">
                      <Card className="w-100 shadow-sm rounded p-3 d-flex flex-column candidate-card">
                        <div className="d-flex align-items-center mb-3">
                          {user.profilePicture ? (
                            <img
                              src={`${process.env.REACT_APP_API_URL}${user.profilePicture}`}
                              width={80}
                              height={80}
                              className="rounded-circle"
                              alt="Foto de perfil"
                              style={{ objectFit: "cover", border: "2px solid #ddd" }}
                            />
                          ) : (
                            <FontAwesomeIcon
                              icon={faCircleUser}
                              className="rounded-circle"
                              alt="Sem foto"
                              style={{ width: "80px", height: "80px", objectFit: "cover", border: "2px solid #ddd" }}
                            />
                          )}
                          <div className="m-2">
                            <h5 className="txt-nome-candidato mb-1">{user.nome} {user.sobrenome}</h5>
                            <p className="mb-0 text-muted">{user.email}</p>
                          </div>
                        </div>

                        <div className="mb-3">
                          <h6>Experiências Profissionais:</h6>
                          {experiences.length > 0 ? (
                            <ul className="list-unstyled">
                              {experiences.map((experience, index) => (
                                <li key={`${experience.empresa}-${index}`}>
                                  <small>{experience.empresa} - {experience.funcao}</small>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-muted">Nenhuma experiência profissional cadastrada.</p>
                          )}
                        </div>

                        <div className="mb-3">
                          <h6>Experiência Acadêmica:</h6>
                          {formacao.length > 0 ? (
                            <ul className="list-unstyled">
                              {formacao.map((formacaoItem, index) => (
                                <li key={`${formacaoItem.escolaridade}-${index}`}>
                                  <small>
                                    {formacaoItem.escolaridade}
                                    {['Superior', 'Técnico'].includes(formacaoItem.escolaridade) && formacaoItem.curso ? (
                                      <> - {formacaoItem.curso}</>
                                    ) : null}
                                    {" - "}{formacaoItem.situacao}
                                  </small>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-muted">Nenhuma experiência acadêmica cadastrada.</p>
                          )}
                        </div>
                        <Button
                          variant="primary"
                          onClick={() => viewCurriculum(user._id)}
                          className="mt-auto"
                          style={{ padding: "8px 12px" }}
                          disabled={!user._id}
                        >
                          Ver Currículo
                        </Button>
                      </Card>
                    </Col>
                  );
                })
              )}
            </Row>

            {/* Paginação com botões de próximo e anterior */}
            {totalPages > 1 && (
              <div className="d-flex justify-content-center mt-2">
                <Pagination>
                  <Pagination.Prev onClick={handlePreviousPage} disabled={currentPage === 1}>
                  </Pagination.Prev>
                  {[...Array(totalPages).keys()].map((pageNumber) => (
                    <Pagination.Item
                      key={pageNumber + 1}
                      active={currentPage === pageNumber + 1}
                      onClick={() => handlePageChange(pageNumber + 1)}
                    >
                      {pageNumber + 1}
                    </Pagination.Item>
                  ))}
                  <Pagination.Next onClick={handleNextPage} disabled={currentPage === totalPages}>
                  </Pagination.Next>
                </Pagination>
              </div>
            )}
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default CurriculosEmpresa;
