import React, { useEffect, useState } from 'react';
import './MainEmpresa.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleUser } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

const MainEmpresa = () => {
  const [companyName, setCompanyName] = useState('');

  useEffect(() => {
    const fetchCompanyData = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const companyResponse = await axios.get('http://localhost:5000/api/company/me', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          setCompanyName(companyResponse.data.nome);
        } catch (error) {
          console.error('Error fetching company data:', error);
        }
      }
    };

    fetchCompanyData();

  }, []);

  return (
    <div className="main-content-empresa">
      <div className="central-container-empresa">
      <FontAwesomeIcon icon={faCircleUser} className='profile-empresa-icon' />
        <h2>Olá, {companyName}</h2>
        <p>Acompanhe suas vagas cadastradas</p>
      </div>
    </div>
  );
};

export default MainEmpresa;
