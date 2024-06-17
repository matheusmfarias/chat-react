import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, isVerificationRoute = false }) => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const email = queryParams.get('email');
    const token = queryParams.get('token');

    const localStorageToken = localStorage.getItem('token');

    if (isVerificationRoute) {
        // Verificação de token e email na URL para rota de verificação
        if (!email || !token) {
            return <Navigate to="/login" replace />;
        }
    } else {
        // Verificação de token no localStorage para outras rotas protegidas
        if (!localStorageToken) {
            return <Navigate to="/login" replace />;
        }
    }

    return children;
};

export default ProtectedRoute;
