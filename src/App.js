import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import React, { useContext, useState, useEffect } from 'react';
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
import EmailSenha from './components/Login/EmailSenha';
import ConfirmaEmail from './components/Login/ConfirmaEmail';
import RecuperaSenha from './components/Login/RecuperaSenha';

const App = () => {
  const { isLoading } = useContext(LoadingContext);
  const [isVerificationAllowed, setIsVerificationAllowed] = useState(false);

  // Componente aninhado para usar o useNavigate no contexto correto do Router
  const NavigateOnVerification = () => {
    const navigate = useNavigate();

    useEffect(() => {
      if (isVerificationAllowed) {
        navigate('/verificacao-token');
      }
    }, [navigate]);  // Remova `isVerificationAllowed` da lista de dependências

    return null; // Este componente não precisa renderizar nada
  };

  return (
    <>
      {isLoading && <Spinner />}
      <Router>
        <NavigateOnVerification />
        <Routes>
          <Route path='/input' element={<InputVerificado />} />
          <Route path='/' element={
            <Layout>
              <Home />
            </Layout>
          } />
          <Route path='/login' element={<Login />} />
          <Route path="/login-empresa" element={<LoginEmpresa />} />
          <Route path="/email-senha" element={<EmailSenha />} />
          <Route path="/confirma-email" element={<ConfirmaEmail />} />
          <Route path="/recupera-senha" element={<RecuperaSenha />} />
          <Route path='/cadastro' element={<Cadastro onRegister={() => setIsVerificationAllowed(true)} />} />
          <Route path="/verificacao-token" element={<TokenCadastro onVerify={() => setIsVerificationAllowed(false)} />} />

          {/* Rota protegida para dashboard de candidatos */}
          <Route path="/dashboard" element={
            <ProtectedRoute requiredRole="user">
              <Dashboard />
            </ProtectedRoute>
          } />

          {/* Rota protegida para dashboard de empresas */}
          <Route path="/dashboard-empresa" element={
            <ProtectedRoute requiredType="empresa">
              <DashboardEmpresa />
            </ProtectedRoute>
          } />

          {/* Rota protegida para vagas de empresas */}
          <Route path="/vagas-empresa" element={
            <ProtectedRoute requiredType="empresa">
              <Layout>
                <VagasEmpresa />
              </Layout>
            </ProtectedRoute>
          } />

          {/* Rota protegida para alterar email */}
          <Route path='/alterar-email' element={
            <ProtectedRoute requiredType="user">
              <Layout>
                <ChangeEmail />
              </Layout>
            </ProtectedRoute>
          } />

          {/* Rota para verificar email */}
          <Route path="/verify-email" element={
            <ProtectedRoute>
              <Layout>
                <VerifyEmail />
              </Layout>
            </ProtectedRoute>
          } />

          {/* Rota para configurar perfil */}
          <Route path="/profile-setup" element={
            <ProtectedRoute requiredType="user">
              <Layout>
                <ProfileSetup />
              </Layout>
            </ProtectedRoute>
          } />

          {/* Rota protegida para config candidato */}
          <Route path='/config-candidato' element={
            <ProtectedRoute requiredType="user">
              <Layout>
                <ConfigCandidato />
              </Layout>
            </ProtectedRoute>
          } />

          {/* Rota protegida para curriculo */}
          <Route path='/curriculo' element={
            <ProtectedRoute requiredType="user">
              <Layout>
                <Curriculo />
              </Layout>
            </ProtectedRoute>
          } />

          {/* Rota protegida para buscar vagas */}
          <Route path='/buscar-vagas' element={
            <ProtectedRoute requiredType="user">
              <Layout>
                <BuscarVagas />
              </Layout>
            </ProtectedRoute>
          } />

          {/* Rota protegida para detalhes de vaga */}
          <Route path='/detalhes-vaga' element={
            <ProtectedRoute requiredType="user">
              <Layout>
                <DetalhesVaga />
              </Layout>
            </ProtectedRoute>
          } />

          {/* Rota protegida para currículos de empresas */}
          <Route path='/curriculos-empresa/:jobId' element={
            <ProtectedRoute requiredType="empresa">
              <Layout>
                <CurriculosEmpresa />
              </Layout>
            </ProtectedRoute>
          } />

          {/* Rota protegida para visualizar curriculo */}
          <Route path='/curriculo/:id' element={
            <ProtectedRoute requiredType="user">
              <VisualizarCurriculo />
            </ProtectedRoute>
          } />

          {/* Rota protegida para inscrições de candidatos */}
          <Route path='/inscricoes-candidato/' element={
            <ProtectedRoute requiredType="user">
              <Layout>
                <InscricoesCandidato />
              </Layout>
            </ProtectedRoute>
          } />

          {/* Rota protegida para o dashboard de admin */}
          <Route path="/admin-dashboard" element={
            <ProtectedRoute requiredType="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
