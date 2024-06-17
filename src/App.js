import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Cadastro from './components/Cadastro/Cadastro';
import Login from './components/Login/Login';
import Header from './components/Header/Header';
import Main from './components/Main/Main';
import Carousel from './components/Carousel/Carousel';
import Footer from './components/Footer/Footer';
import TokenCadastro from './components/Cadastro/TokenCadastro';
import Dashboard from './components/Candidato/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import InputVerificado from './components/Inputs/InputVerificado';
import ConfigCandidato from './components/Candidato/ConfigCandidato/ConfigCandidato';

const App = () => {
  const [isVerificationAllowed, setIsVerificationAllowed] = useState(false);

  return (
    <Router>
      <div className='app-container'>
        <div className='content'>
          <Routes>
            <Route path='/input' element={<InputVerificado />} />
            <Route path='/' element={<Home />} />
            <Route path='/login' element={<Login />} />
            <Route path='/cadastro' element={<Cadastro onRegister={() => setIsVerificationAllowed(true)} />} />
            <Route
              path="/verificacao-token"
              element={
                <TokenCadastro onVerify={() => setIsVerificationAllowed(false)} />
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route path='/config-candidato' element={<ConfigCandidato />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

const Home = () => (
  <>
    <Header />
    <Main />
    <Carousel />
    <Footer />
  </>
);

export default App;
