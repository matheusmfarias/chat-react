import React, { useContext, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Cadastro from './components/Cadastro/Cadastro';
import Login from './components/Login/Login';
import Home from './components/Home/Home';
import TokenCadastro from './components/Cadastro/TokenCadastro';
import Dashboard from './components/Candidato/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import InputVerificado from './components/Inputs/InputVerificado';
import ConfigCandidato from './components/Candidato/ConfigCandidato/ConfigCandidato';
import ProfileSetup from './components/Candidato/ProfileSetup/ProfileSetup';
import ChangeEmail from './components/Candidato/ConfigCandidato/ChangeEmail';
import Layout from './components/Layout/Layout';
import VerifyEmail from './components/Candidato/ConfigCandidato/VerifyEmail';
import { LoadingContext } from './context/LoadingContext';
import Spinner from './components/Spinner/Spinner';
import Curriculo from './components/Candidato/Curriculo/Curriculo';
import AdminDashboard from './components/Admin/AdminDashboard';
import LoginEmpresa from './components/Login/LoginEmpresa';
import DashboardEmpresa from './components/Empresa/DashboardEmpresa';
import VagasEmpresa from './components/Empresa/VagasEmpresa/VagasEmpresa';
import BuscarVagas from './components/Candidato/BuscarVagas/BuscarVagas';
import DetalhesVaga from './components/Candidato/BuscarVagas/DetalhesVaga';
import CurriculosEmpresa from './components/Empresa/CurriculosEmpresa/CurriculosEmpresa';
import VisualizarCurriculo from './components/Empresa/CurriculosEmpresa/VisualizarCurriculo';
import InscricoesCandidato from './components/Candidato/InscricoesCandidato/InscricoesCandidato';

const App = () => {
  const { isLoading } = useContext(LoadingContext);
  const [isVerificationAllowed, setIsVerificationAllowed] = useState(false);

  return (
    <>
      {isLoading && <Spinner />}
      <Router>
        <Routes>
          <Route path='/input' element={<InputVerificado />} />
          <Route path='/' element={
            <Layout>
              <Home />
            </Layout>
          } />
          <Route path='/login' element={<Login />} />
          <Route path="/login-empresa" element={<LoginEmpresa />} />
          <Route path='/cadastro' element={<Cadastro onRegister={() => setIsVerificationAllowed(true)} />} />
          <Route path="/verificacao-token" element={<TokenCadastro onVerify={() => setIsVerificationAllowed(false)} />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/dashboard-empresa" element={
            <ProtectedRoute>
              <DashboardEmpresa />
            </ProtectedRoute>
          } />
          <Route path="/vagas-empresa" element={
            <Layout>
              <VagasEmpresa />
            </Layout>} />
          <Route path='/alterar-email' element={
            <Layout>
              <ChangeEmail />
            </Layout>
          } />
          <Route path="/verify-email" element={
            <Layout>
              <VerifyEmail />
            </Layout>
          } />
          <Route path="/profile-setup" element={
            <Layout>
              <ProfileSetup />
            </Layout>
          } />
          <Route path='/config-candidato' element={
            <Layout>
              <ConfigCandidato />
            </Layout>
          } />
          <Route path='/curriculo' element={
            <Layout>
              <Curriculo />
            </Layout>
          } />
          <Route path='/buscar-vagas' element={
            <Layout>
              <BuscarVagas />
            </Layout>
          } />
          <Route path='/detalhes-vaga' element={
            <Layout>
              <DetalhesVaga />
            </Layout>
          } />
          <Route path='/curriculos-empresa' element={
            <Layout>
              <CurriculosEmpresa />
            </Layout>
          } />
          <Route path='/curriculo/:id' element={
            <VisualizarCurriculo />
          } />
          <Route path='/inscricoes-candidato/' element={
            <Layout>
              <InscricoesCandidato />
            </Layout>
          } />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
