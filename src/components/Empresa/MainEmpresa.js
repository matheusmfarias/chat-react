import React from 'react';
import { Container, Carousel } from 'react-bootstrap';
import './MainEmpresa.css';
import profileIcon from '../../assets/images/logo-banrisul.png'; // Supondo que o ícone de perfil esteja nesse caminho

const MainEmpresa = ({ companyName, jobs }) => {
  return (
    <div className="empresa-dashboard-main">
      <div className="welcome-section">
        <img src={profileIcon} alt="Profile Icon" className="profile-icon" />
        <h2>Olá, {companyName}</h2>
        <p>Acompanhe suas vagas cadastradas</p>
      </div>
      <Container>
        <h3>Vagas cadastradas</h3>
        <Carousel>
          {jobs.map((job, index) => (
            <Carousel.Item key={index}>
              <div className="job-card">
                <h4>{job.title}</h4>
                <p><strong>Local:</strong> {job.location}</p>
                <p><strong>Tipo:</strong> {job.type}</p>
                <p><strong>Modalidade:</strong> {job.modality}</p>
                <p><strong>PcD:</strong> {job.pcd ? 'Sim' : 'Não'}</p>
                <p><strong>Data de publicação:</strong> {job.publishedDate}</p>
              </div>
            </Carousel.Item>
          ))}
        </Carousel>
      </Container>
    </div>
  );
};

export default MainEmpresa;
