import DashboardEmpresa from '../components/Empresa/DashboardEmpresa';
import VagasEmpresa from '../components/Empresa/VagasEmpresa/VagasEmpresa';
import CurriculosEmpresa from '../components/Empresa/CurriculosEmpresa/CurriculosEmpresa';

const CompanyProtectedRoutes = [
  { path: '/dashboard-empresa', element: <DashboardEmpresa />, requiredRole: 'empresa' },
  { path: '/vagas-empresa', element: <VagasEmpresa />, requiredRole: 'empresa' },
  { path: '/curriculos-empresa/:jobId', element: <CurriculosEmpresa />, requiredRole: 'empresa' }
];

export default CompanyProtectedRoutes;
