import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LoadingContext } from './context/LoadingContext';
import Spinner from './components/Spinner/Spinner';

// Importação das rotas
import ProtectedRoute from './routes/ProtectedRoute';
import PublicRoutes from './routes/PublicRoutes';
import UserProtectedRoutes from './routes/UserProtectedRoutes';
import CompanyProtectedRoutes from './routes/CompanyProtectedRoutes';
import AdminProtectedRoutes from './routes/AdminProtectedRoutes';
import NotFound from './components/NotFound/NotFound';

const App = () => {
  const { isLoading } = useContext(LoadingContext);

  return (
    <div className="app-container">
      {isLoading && <Spinner />}
      <Router>
        <Routes>
          {/* Rotas públicas */}
          {PublicRoutes.map((route, index) => (
            <Route key={index} path={route.path} element={route.element} />
          ))}

          {/* Rotas protegidas para usuários (candidatos) */}
          {UserProtectedRoutes.map((route, index) => (
            <Route
              key={index}
              path={route.path}
              element={
                <ProtectedRoute requiredRole={route.requiredRole}>
                  {route.element}
                </ProtectedRoute>
              }
            />
          ))}

          {/* Rotas protegidas para empresas */}
          {CompanyProtectedRoutes.map((route, index) => (
            <Route
              key={index}
              path={route.path}
              element={
                <ProtectedRoute requiredRole={route.requiredRole}>
                  {route.element}
                </ProtectedRoute>
              }
            />
          ))}

          {/* Rotas protegidas para administradores */}
          {AdminProtectedRoutes.map((route, index) => (
            <Route
              key={index}
              path={route.path}
              element={
                <ProtectedRoute requiredRole={route.requiredRole}>
                  {route.element}
                </ProtectedRoute>
              }
            />
          ))}

          {/* Página de rota não encontrada */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </div>
  );
};

export default App;
