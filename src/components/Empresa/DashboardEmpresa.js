import React, { useState, useEffect } from 'react';
import HeaderEmpresa from './HeaderEmpresa';
import MainEmpresa from './MainEmpresa';
import axios from 'axios';
import Footer from '../Footer/Footer';

const DashboardEmpresa = () => {
  const [companyName, setCompanyName] = useState('');
  const [jobs, setJobs] = useState([]);

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

    const fetchJobs = async () => {
      const token = localStorage.getItem('token'); // Certifique-se de que o token está definido
      if (token) {
        try {
          const jobsResponse = await axios.get('http://localhost:5000/api/jobs', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          setJobs(jobsResponse.data);
        } catch (error) {
          console.error('Error fetching jobs:', error);
        }
      }
    };

    fetchCompanyData();
    fetchJobs();
  }, []);

  return (
    <div>
      <HeaderEmpresa />
      <MainEmpresa companyName={companyName} jobs={jobs} />
      <Footer />
    </div>
  );
};

export default DashboardEmpresa;
