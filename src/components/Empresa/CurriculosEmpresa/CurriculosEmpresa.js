// components/CurriculosEmpresa/CurriculosEmpresa.js
import React, { useState, useEffect } from "react";
import axios from 'axios';
import HeaderEmpresa from "../HeaderEmpresa";
import { Table, Button, Collapse, ListGroup, Image, Spinner, Pagination } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';

const CurriculosEmpresa = () => {
  const [jobsWithApplications, setJobsWithApplications] = useState([]);
  const [openJobId, setOpenJobId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 10;

  useEffect(() => {
    const fetchJobsWithApplications = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/jobs/applications', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const activeJobs = response.data.filter(({ job }) => job.status); // Filtrando vagas com status true
        setJobsWithApplications(activeJobs);
      } catch (error) {
        console.error('Erro ao obter vagas com candidaturas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobsWithApplications();
  }, []);

  const toggleJob = (jobId) => {
    setOpenJobId(openJobId === jobId ? null : jobId);
  };

  const viewCurriculum = (userId) => {
    window.open(`/curriculo/${userId}`, '_blank');
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
      <div className="container mt-4">
        <h2 className="mb-4 text-center">Candidaturas Recebidas</h2>
        {loading ? (
          <div className="d-flex justify-content-center">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : currentJobs.length > 0 ? (
          <>
            <Table responsive bordered hover className="mb-4">
              <thead className="bg-primary text-white">
                <tr>
                  <th>Título da Vaga</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {currentJobs.map(({ job, applications }) => (
                  <React.Fragment key={job._id}>
                    <tr onClick={() => toggleJob(job._id)} style={{ cursor: 'pointer' }}>
                      <td>{job.title}</td>
                      <td className="text-center">
                        <FontAwesomeIcon icon={openJobId === job._id ? faChevronUp : faChevronDown} />
                      </td>
                    </tr>
                    <tr>
                      <td colSpan="2">
                        <Collapse in={openJobId === job._id}>
                          <div>
                            {applications.length > 0 ? (
                              <ListGroup variant="flush">
                                {applications.map((application) => (
                                  <ListGroup.Item key={application._id} className="d-flex align-items-center p-3">
                                    <Image
                                      src={`http://localhost:5000${application.user.profilePicture}`}
                                      roundedCircle
                                      width={50}
                                      height={50}
                                      className="me-3 shadow-sm"
                                      style={{ border: '2px solid #e0e0e0' }}
                                    />
                                    <div className="flex-grow-1">
                                      <h5 className="mb-1">{application.user.nome} {application.user.sobrenome}</h5>
                                      <p className="mb-0 text-muted">Candidato</p>
                                    </div>
                                    <Button variant="outline-primary" onClick={() => viewCurriculum(application.user._id)} className="ms-3">
                                      Ver Currículo
                                    </Button>
                                  </ListGroup.Item>
                                ))}
                              </ListGroup>
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
          </>
        ) : (
          <p className="text-muted text-center">Nenhuma vaga disponível no momento.</p>
        )}
      </div>
    </>
  );
};

export default CurriculosEmpresa;
