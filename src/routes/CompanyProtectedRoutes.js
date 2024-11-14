import Layout from '../components/Layout/Layout';
import DashboardEmpresa from '../components/Empresa/DashboardEmpresa';
import VagasEmpresa from '../components/Empresa/VagasEmpresa/VagasEmpresa';
import CurriculosEmpresa from '../components/Empresa/CurriculosEmpresa/CurriculosEmpresa';
import VisualizarCurriculo from '../components/Empresa/CurriculosEmpresa/VisualizarCurriculo';

const CompanyProtectedRoutes = [
  { path: '/dashboard-empresa', element: <DashboardEmpresa />, requiredRole: 'empresa' },
  { path: '/vagas-empresa', element: <Layout><VagasEmpresa /></Layout>, requiredRole: 'empresa' },
  { path: '/curriculos-empresa/:jobId', element: <Layout><CurriculosEmpresa /></Layout>, requiredRole: 'empresa' },
  { path: '/curriculo/:id', element: <VisualizarCurriculo />, requiredRole: 'empresa' },
];

export default CompanyProtectedRoutes;
