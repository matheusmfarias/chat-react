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
import SpinnerDemo from './components/Spinner/SpinnerDemo'

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
          <Route path='/cadastro' element={<Cadastro onRegister={() => setIsVerificationAllowed(true)} />} />
          <Route path="/verificacao-token" element={<TokenCadastro onVerify={() => setIsVerificationAllowed(false)} />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
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
          <Route path='/spinner-demo' element={<SpinnerDemo />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
