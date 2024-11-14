import React from 'react';
import { Navigate } from 'react-router-dom';
import { destroySession } from '../utils/sessionUtils';

const ProtectedRoute = ({ children, requiredRole }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role'); // Deve ser 'user', 'empresa', ou 'admin'

  // Verifica se o token existe
  if (!token) {
    destroySession();
    return <Navigate to="/" replace />;
  }

  // Verifica se a role do usuário corresponde ao exigido pela rota
  if (requiredRole && userRole !== requiredRole) {
    destroySession();
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
