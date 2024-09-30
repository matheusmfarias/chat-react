import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role'); // Pode ser 'user', 'empresa', ou 'admin'

  // Verifica se o token existe
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Verifica se o papel do usuário corresponde ao exigido pela rota
  if (requiredRole && userRole !== requiredRole) {
    // Se o papel do usuário não corresponder, redireciona para a tela inicial
    return <Navigate to="/" replace />;
  }

  // Se o token e o papel estiverem corretos, renderiza o conteúdo protegido
  return children;
};

export default ProtectedRoute;
