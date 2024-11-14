import React, { useEffect } from 'react';
import { destroySession } from '../utils/sessionUtils';

import Layout from '../components/Layout/Layout';
import Home from '../components/Home/Home';
import Login from '../components/Login/Login';
import LoginEmpresa from '../components/Login/LoginEmpresa';
import EmailSenha from '../components/Login/EmailSenha';
import ConfirmaEmail from '../components/Login/ConfirmaEmail';
import RecuperaSenha from '../components/Login/RecuperaSenha';
import Cadastro from '../components/Cadastro/Cadastro';
import TokenCadastro from '../components/Cadastro/TokenCadastro';
import InputVerificado from '../components/Inputs/InputVerificado';

const PublicRouteWrapper = ({ element }) => {
  useEffect(() => {
    destroySession();
  }, []);

  return element;
};

const PublicRoutes = [
  { path: '/input', element: <PublicRouteWrapper element={<InputVerificado />} /> },
  { path: '/', element: <PublicRouteWrapper element={<Layout><Home /></Layout>} /> },
  { path: '/login', element: <PublicRouteWrapper element={<Login />} /> },
  { path: '/login-empresa', element: <PublicRouteWrapper element={<LoginEmpresa />} /> },
  { path: '/email-senha', element: <PublicRouteWrapper element={<EmailSenha />} /> },
  { path: '/confirma-email', element: <PublicRouteWrapper element={<ConfirmaEmail />} /> },
  { path: '/recupera-senha', element: <PublicRouteWrapper element={<RecuperaSenha />} /> },
  { path: '/cadastro', element: <PublicRouteWrapper element={<Cadastro />} /> },
  { path: '/verificacao-token', element: <PublicRouteWrapper element={<TokenCadastro />} /> },
];

export default PublicRoutes;
