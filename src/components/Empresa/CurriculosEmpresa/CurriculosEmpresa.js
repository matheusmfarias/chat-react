import React, { useState, useEffect } from "react";
import axios from "axios";
import HeaderEmpresa from "../HeaderEmpresa";
import { Spinner, Pagination, Row, Col, Card, Button, Form, InputGroup } from "react-bootstrap";
import { useParams } from "react-router-dom";
import './CurriculosEmpresa.css';

const CurriculosEmpresa = () => {
  const { jobId } = useParams();
  const [loading, setLoading] = useState(false);
  const [applications, setApplications] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchCandidates = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");

        // Chama a API passando o jobId como parte da rota
        const response = await axios.get(`http://localhost:5000/api/jobs/applications/${jobId}`, {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            page: currentPage,
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

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  const viewCurriculum = (userId) => {
    window.open(`/curriculo/${userId}`, "_blank");
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <>
      <HeaderEmpresa />
      <div className="container mt-4">
        <h2 className="text-center mb-4">Candidatos para a Vaga</h2>

        {/* Campo de busca */}
        <InputGroup className="mb-4 justify-content-center">
          <Form.Control
            type="text"
            placeholder="Buscar por nome ou email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ maxWidth: "400px" }}
          />
          <Button variant="primary" onClick={() => setCurrentPage(1)} className="ml-2">Buscar</Button>
        </InputGroup>

        {/* Lista de candidatos */}
        <Row>
          {applications.length === 0 ? (
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
                          src={`http://localhost:5000${user.profilePicture}`}
                          width={80}
                          height={80}
                          className="rounded-circle"
                          alt="Foto de perfil"
                          style={{ objectFit: "cover", border: "2px solid #ddd" }}
                        />
                      ) : (
                        <div
                          className="placeholder rounded-circle bg-secondary"
                          style={{ width: "80px", height: "80px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", color: "#fff" }}
                        >
                          ?
                        </div>
                      )}
                      <div className="ml-3">
                        <h5 className="mb-1">{user.nome} {user.sobrenome}</h5>
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
                              <small>{formacaoItem.escolaridade} - {formacaoItem.situacao}</small>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-muted">Nenhuma experiência acadêmica cadastrada.</p>
                      )}
                    </div>

                    <Button
                      variant="outline-primary"
                      onClick={() => viewCurriculum(user._id)}
                      className="mt-auto"
                      style={{ fontSize: "14px", padding: "8px 12px" }}
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

        {/* Paginação */}
        {totalPages > 1 && (
          <Pagination className="justify-content-center mt-4">
            {[...Array(totalPages).keys()].map((pageNumber) => (
              <Pagination.Item
                key={pageNumber + 1}
                active={currentPage === pageNumber + 1}
                onClick={() => handlePageChange(pageNumber + 1)}
              >
                {pageNumber + 1}
              </Pagination.Item>
            ))}
          </Pagination>
        )}
      </div>
    </>
  );
};

export default CurriculosEmpresa;
