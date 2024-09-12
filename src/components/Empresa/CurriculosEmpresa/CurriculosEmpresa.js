import React, { useState, useEffect } from "react";
import axios from "axios";
import HeaderEmpresa from "../HeaderEmpresa";
import { Table, Button, Collapse, Image, Spinner, Pagination, Row, Col, Card } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import './CurriculosEmpresa.css';
import useFormattedDate from "../../../hooks/useFormattedDate";

const CurriculosEmpresa = () => {
  const { formatDate } = useFormattedDate();
  const [jobsWithApplications, setJobsWithApplications] = useState([]);
  const [openJobId, setOpenJobId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 10;

  useEffect(() => {
    const fetchJobsWithApplications = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/api/jobs/applications", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const activeJobs = response.data.filter(({ job }) => job.status);
        setJobsWithApplications(activeJobs);
      } catch (error) {
        console.error("Erro ao obter vagas com candidaturas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobsWithApplications();
  }, []);

  const toggleJob = (jobId) => {
    setOpenJobId(openJobId === jobId ? null : jobId); // Abre se não estiver aberto, e fecha se já estiver
  };

  const viewCurriculum = (userId) => {
    window.open(`/curriculo/${userId}`, "_blank");
  };

  // Lógica de paginação
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = jobsWithApplications.slice(indexOfFirstJob, indexOfFirstJob + jobsPerPage);
  const totalPages = Math.ceil(jobsWithApplications.length / jobsPerPage);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
      <HeaderEmpresa />
      <div className="container mt-2">
        <h1>Candidaturas</h1>
        {loading ? (
          <div className="d-flex justify-content-center">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : currentJobs.length > 0 ? (
          <Table striped bordered hover responsive className="shadow-sm mt-3 no-inner-borders">
            <thead>
              <tr>
                <th>Cargo</th>
                <th>Localização</th>
                <th className="text-center">Data de Postagem</th>
                <th className="text-center">Status</th>
                <th className="text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {currentJobs.map(({ job, applications }) => (
                <React.Fragment key={job._id}>
                  <tr>
                    <td>{job.title}</td>
                    <td>{job.location}</td>
                    <td className="text-center">{formatDate(job.publicationDate)}</td>
                    <td className="text-center">
                      <span className={`status-indicator ${job.status ? 'active' : 'inactive'}`} />
                      {job.status ? 'Ativa' : 'Inativa'}
                    </td>
                    <td className="text-center">
                      <Button
                        onClick={() => toggleJob(job._id)}
                        aria-controls={`collapse-${job._id}`}
                        aria-expanded={openJobId === job._id}
                      >
                        {openJobId === job._id ? "Recolher Candidatos" : "Ver Candidatos"}{" "}
                        <FontAwesomeIcon icon={openJobId === job._id ? faChevronUp : faChevronDown} />
                      </Button>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan="5">
                      <Collapse in={openJobId === job._id}>
                        <div id={`collapse-${job._id}`}>
                          {applications.length > 0 ? (
                            <div className="application-list">
                              <Row>
                                {applications.map((application) => (
                                  <Col key={application._id} md={4} className="mb-4">
                                    <Card className="application-card shadow rounded border-0 p-2">
                                      <div className="d-flex align-items-start">
                                        <Col md={3} className="text-center">
                                          <Image
                                            src={`http://localhost:5000${application.user.profilePicture}`}
                                            width={80}
                                            height={80}
                                            className="rounded-circle profile-img"
                                          />
                                        </Col>
                                        <Col md={9} className="applicant-info">
                                          <h5 className="mb-1">{application.user.nome} {application.user.sobrenome}</h5>
                                          <p className="mb-0 text-muted">E-mail: {application.user.email}</p>

                                          {/* Exibir todas as experiências do usuário */}
                                          <h6 className="mt-3">Experiências Profissionais:</h6>
                                          {application.user.experiences && application.user.experiences.length > 0 ? (
                                            <Table striped bordered hover size="sm" className="experience-table">
                                              <tbody>
                                                {application.user.experiences.map((experience, index) => (
                                                  <tr key={index}>
                                                    <td>{experience.empresa}</td>
                                                    <td>{experience.funcao}</td>
                                                  </tr>
                                                ))}
                                              </tbody>
                                            </Table>
                                          ) : (
                                            <p className="text-muted">Nenhuma experiência profissional cadastrada.</p>
                                          )}

                                          {/* Exibir todas as experiências acadêmicas */}
                                          <h6 className="mt-3">Experiência Acadêmica:</h6>
                                          {application.user.formacao && application.user.formacao.length > 0 ? (
                                            <Table striped bordered hover size="sm" className="education-table">
                                              <tbody>
                                                {application.user.formacao.map((formacao, index) => (
                                                  <tr key={index}>
                                                    <td>{formacao.escolaridade}</td>
                                                    <td>{formacao.situacao}</td>
                                                  </tr>
                                                ))}
                                              </tbody>
                                            </Table>
                                          ) : (
                                            <p className="text-muted">Nenhuma experiência acadêmica cadastrada.</p>
                                          )}
                                        </Col>
                                      </div>
                                      <Button
                                        variant="outline-primary"
                                        onClick={() => viewCurriculum(application.user._id)}
                                        className="view-cv-btn mt-3"
                                      >
                                        Ver Currículo
                                      </Button>
                                    </Card>
                                  </Col>
                                ))}
                              </Row>
                            </div>
                          ) : (
                            <p className="text-muted text-center">Nenhuma candidatura para esta vaga.</p>
                          )}
                        </div>
                      </Collapse>
                    </td>
                  </tr>

                </React.Fragment>
              ))}
            </tbody>
          </Table>
        ) : (
          <p className="text-muted text-center">Nenhuma vaga disponível no momento.</p>
        )}

        {/* Paginação */}
        <Pagination className="justify-content-center">
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
      </div>
    </>
  );
};

export default CurriculosEmpresa;
