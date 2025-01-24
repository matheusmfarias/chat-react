import React, { useState, useEffect, useCallback } from "react";
import api from "../../../services/axiosConfig";
import HeaderEmpresa from "../HeaderEmpresa";
import { Row, Col, Card, Button, Form, InputGroup, Container } from "react-bootstrap";
import { useParams } from "react-router-dom";
import './CurriculosEmpresa.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight, faCircleUser, faSearch, faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { createRoot } from "react-dom/client";
import CurriculoTemplate from "../../Candidato/Curriculo/CurriculoTemplate";
import Skeleton from "react-loading-skeleton";

const CurriculosEmpresa = () => {
  const { jobId } = useParams();
  const [loading, setLoading] = useState(false);
  const [applications, setApplications] = useState([]);
  const [totalApplications, setTotalApplications] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 9;

  const SkeletonCard = () => (
    <Row className="mt-2">
      {Array.from({ length: 9 }).map((_, index) => (
        <Col key={index} className="mb-4 d-flex" md={6} xl={4}>
          <Card className="w-100 border-0 shadow-sm rounded d-flex flex-column">
            <Card.Body>
              <Row>
                <Col md={5} lg={4} xl={2}>
                  <Skeleton height={80} width={80} className="mb-3" style={{ borderRadius: "50%" }} />
                </Col>
                <Col className="mt-md-2 m-2">
                  <Skeleton height={25} width="50%" className="mb-2" />
                  <Skeleton height={20} width="60%" />
                </Col>
              </Row>
              <Row className="mb-4">
                <Col>
                  <Skeleton height={25} width="40%" className="mb-2" />
                  <Skeleton height={20} width="60%" className="mb-4" />
                  <Skeleton height={30} width="40%" className="mb-2" />
                  <Skeleton height={25} width="60%" className="mb-5" />
                </Col>
              </Row>
              <Row>
                <Skeleton height={20} width="35%" />
              </Row>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );

  useEffect(() => {
    document.title = "ACI Empregos | Candidatos";
  });

  const fetchCandidates = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await api.get(`${process.env.REACT_APP_API_URL}/api/jobs/applications/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page: currentPage,
          limit: itemsPerPage,
          searchTerm,
        }
      });

      setApplications(response.data.applications); // Atualiza a lista de candidatos
      setTotalPages(response.data.totalPages); // Atualiza o número total de páginas
      setTotalApplications(response.data.totalApplications); // Total geral de candidatos
    } catch (error) {
      console.error("Erro ao obter os candidatos:", error);
    } finally {
      setLoading(false);
    }
  }, [jobId, currentPage, searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    setLoading(true);
    const timeoutId = setTimeout(() => {
      fetchCandidates();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, fetchCandidates]);

  const handlePageChange = (direction) => {
    setLoading(true);
    if (direction === 'next' && currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    } else if (direction === 'prev' && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setCurrentPage(1);
  };

  const viewCurriculum = async (userId) => {
    // Abre a nova janela para renderizar o currículo
    const newWindow = window.open('', '_blank', 'width=1024,height=768');
    if (!newWindow) {
      console.error("Não foi possível abrir a nova janela. Verifique se pop-ups estão bloqueados.");
      return;
    }

    // Cria o layout básico da nova janela
    newWindow.document.write(`
        <html>
          <head>
            <title>Currículo</title>
            <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css">
            <link rel="stylesheet" href="${window.location.origin}/CurriculoTemplate.css">
          </head>
          <body>
            <div id="curriculo-template-root"></div>
          </body>
        </html>
      `);
    newWindow.document.close();

    // Carregar os dados do candidato e renderizar o currículo
    newWindow.onload = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await api.get(`${process.env.REACT_APP_API_URL}/api/user/candidato/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const user = response.data;

        // Atualizar o título da nova janela com o nome do usuário
        newWindow.document.title = `Currículo de ${user.nome} ${user.sobrenome}`;

        const informacoes = {
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
        };

        const experiencias = user.experiences || [];
        const formacoes = user.formacao || [];

        // Renderiza o currículo usando React
        const rootElement = newWindow.document.getElementById('curriculo-template-root');
        if (rootElement) {
          const root = createRoot(rootElement);
          root.render(
            <CurriculoTemplate
              experiencias={experiencias}
              formacoes={formacoes}
              informacoes={informacoes}
            />
          );
        }
      } catch (error) {
        console.error('Erro ao obter informações do usuário:', error);
        newWindow.close();
      }
    };
  };

  return (
    <>
      <HeaderEmpresa />
      <Container fluid>
        <Row className="mt-3">
          <h1>Recrutamento</h1>
          <Col xs={12} className='mt-2'>
            <Row>
              <Col xs={12} lg={8}>
                <InputGroup>
                  <Form.Control
                    type="text"
                    className='border-primary'
                    placeholder="Pesquisar por nome, experiências, habilidades..."
                    aria-label="Pesquisar"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <FontAwesomeIcon
                      icon={faTimesCircle}
                      className="icon-remove-tag position-absolute"
                      onClick={() => handleClearSearch()}
                      style={{
                        right: '110px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                      }}
                    />
                  )}
                  <Button className="btn-buscar-vagas" variant="outline-primary">
                    <FontAwesomeIcon icon={faSearch} />
                  </Button>
                </InputGroup>
              </Col>
              <Col lg={4} className="d-flex align-items-center">
                {searchTerm && (
                  <span className="p-2 mt-2">
                    A busca "{searchTerm}" retornou {totalApplications} resultado(s).
                  </span>
                )}
              </Col>
            </Row>
            {loading ? (
              <SkeletonCard />
            ) : applications.length > 0 ? (
              <>
                <Row className="mt-3">
                  {applications.map((application) => {
                    const user = application.user || {};
                    const experiences = user.experiences || [];
                    const formacao = user.formacao || [];

                    return (
                      <Col md={6} xxl={4} key={application._id} className="mb-4 d-flex">
                        <Card
                          key={application._id}
                          className="w-100 border-0 shadow-sm rounded p-3 d-flex flex-column card-hover">
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
                              <h5 className="mb-1">{user.nome} {user.sobrenome}</h5>
                              <p className="mb-0 text-muted">{user.email}</p>
                            </div>
                          </div>
                          <div className="mb-2">
                            <h6>Experiências Profissionais:</h6>
                            {experiences.length > 0 ? (
                              <ul className="list-unstyled">
                                {experiences.map((experience, index) => (
                                  <p key={`${experience.empresa}-${index}`}>
                                    {experience.empresa} - {experience.funcao}
                                  </p>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-muted">Nenhuma experiência profissional informada.</p>
                            )}
                          </div>
                          <div className="mb-2">
                            <h6>Experiência Acadêmica:</h6>
                            {formacao.length > 0 ? (
                              <ul className="list-unstyled">
                                {formacao.map((formacaoItem, index) => (
                                  <p key={`${formacaoItem.escolaridade}-${index}`}>
                                    {formacaoItem.escolaridade}
                                    {['Superior', 'Técnico'].includes(formacaoItem.escolaridade) && formacaoItem.curso ? (
                                      null
                                    ) : <> - {formacaoItem.curso}</>}
                                    {" - "}{formacaoItem.situacao}
                                  </p>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-muted">Nenhuma experiência acadêmica informada.</p>
                            )}
                          </div>
                          <Button
                            variant="primary"
                            onClick={() => viewCurriculum(user._id)}
                            className="mt-auto"
                            disabled={!user._id}
                          >
                            Ver Currículo
                          </Button>
                          <div className="d-flex flex-wrap justify-content-between mt-2">
                            <span className="text-muted text-truncate">
                              Inscrito em: {new Date(application.submissionDate).toLocaleDateString()}
                            </span>
                          </div>
                        </Card>
                      </Col>
                    );
                  })}
                </Row>

                {/* Paginação */}
                {totalPages > 1 && (
                  <div className="d-flex flex-row justify-content-center p-2">
                    <Button
                      className="btn-sm me-2 mb-2"
                      onClick={() => handlePageChange('prev')}
                      disabled={currentPage === 1}
                      variant="outline-primary"
                      aria-label="Página anterior"
                    >
                      <FontAwesomeIcon icon={faChevronLeft} />
                    </Button>
                    {currentPage > 1 && (
                      <Button
                        className="btn-sm me-2 mb-2"
                        onClick={() => handlePageChange('prev')}
                        variant="outline-primary"
                      >
                        {currentPage - 1}
                      </Button>
                    )}
                    <Button className="btn-sm me-2 mb-2" variant="outline-primary" disabled>
                      {currentPage}
                    </Button>
                    {currentPage < totalPages && (
                      <Button
                        className="btn-sm me-2 mb-2"
                        onClick={() => handlePageChange('next')}
                        variant="outline-primary"
                      >
                        {currentPage + 1}
                      </Button>
                    )}
                    <Button
                      className="btn-sm me-2 mb-2"
                      onClick={() => handlePageChange('next')}
                      disabled={currentPage === totalPages}
                      variant="outline-primary"
                      aria-label="Próxima página"
                    >
                      <FontAwesomeIcon icon={faChevronRight} />
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <p className="text-center text-muted mt-4">Nenhuma inscrição encontrada.</p>
            )}
          </Col>
        </Row >
      </Container >
    </>
  );
};

export default CurriculosEmpresa;
