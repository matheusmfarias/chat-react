import React, { useState, useEffect } from "react";
import axios from "axios";
import HeaderEmpresa from "../HeaderEmpresa";
import { Card, Button, Collapse, Image, Spinner, Pagination, Table } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import useFormattedDate from "../../../hooks/useFormattedDate";
import './CurriculosEmpresa.css';

const CurriculosEmpresa = () => {
  const { formatDate } = useFormattedDate();
  const [jobsWithApplications, setJobsWithApplications] = useState([]);
  const [openJobId, setOpenJobId] = useState(null); // Controla qual vaga está expandida
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
    setOpenJobId(openJobId === jobId ? null : jobId); // Alterna entre expandir/recolher o job
  };

  const viewCurriculum = (userId) => {
    window.open(`/curriculo/${userId}`, "_blank");
  };

  // Lógica de paginação
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = jobsWithApplications.slice(indexOfFirstJob, indexOfLastJob);
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
                <React.Fragment key={job.id}>
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
                        variant="primary"
                        onClick={() => toggleJob(job.id)}
                        aria-expanded={openJobId === job.id}
                      >
                        Ver Candidatos{" "}
                        <FontAwesomeIcon icon={openJobId === job.id ? faChevronUp : faChevronDown} />
                      </Button>
                    </td>
                  </tr>
                  {/* Collapse para mostrar os candidatos */}
                  <tr>
                    <td colSpan="5" className="p-0">
                      <Collapse in={openJobId === job.id}>
                        <div>
                          {applications.length > 0 ? (
                            <Card className="m-3">
                              <Card.Body>
                                <h5>Candidatos</h5>
                                {applications.map((application) => (
                                  <Card key={application.user.id} className="mb-3">
                                    <Card.Body className="d-flex justify-content-between align-items-center">
                                      <div><Image
                                        src={`http://localhost:5000${application.user.profilePicture}`}
                                        
                                        width={128}
                                        height={128}

                                        className="me-3 rounded-circle"
                                      />
                                        <h6>{application.user.nome}</h6>
                                        <p>{application.user.email}</p>
                                      </div>
                                      <Button
                                        variant="outline-primary"
                                        onClick={() => viewCurriculum(application.userId)}
                                      >
                                        Ver Currículo
                                      </Button>
                                    </Card.Body>
                                  </Card>
                                ))}
                              </Card.Body>
                            </Card>
                          ) : (
                            <p className="text-center">Nenhum candidato encontrado.</p>
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
          <p className="text-center">Nenhuma vaga encontrada...</p>
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
