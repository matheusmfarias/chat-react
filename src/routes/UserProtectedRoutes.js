import Layout from '../components/Layout/Layout';
import Dashboard from '../components/Candidato/Dashboard';
import ConfigCandidato from '../components/Candidato/ConfigCandidato/ConfigCandidato';
import ProfileSetup from '../components/Candidato/ProfileSetup/ProfileSetup';
import ChangeEmail from '../components/Candidato/ConfigCandidato/ChangeEmail';
import VerifyEmail from '../components/Candidato/ConfigCandidato/VerifyEmail';
import Curriculo from '../components/Candidato/Curriculo/Curriculo';
import BuscarVagas from '../components/Candidato/BuscarVagas/BuscarVagas';
import DetalhesVaga from '../components/Candidato/BuscarVagas/DetalhesVaga';
import InscricoesCandidato from '../components/Candidato/InscricoesCandidato/InscricoesCandidato';

const UserProtectedRoutes = [
  { path: '/dashboard', element: <Dashboard />, requiredRole: 'user' },
  { path: '/config-candidato', element: <Layout><ConfigCandidato /></Layout>, requiredRole: 'user' },
  { path: '/profile-setup', element: <Layout><ProfileSetup /></Layout>, requiredRole: 'user' },
  { path: '/alterar-email', element: <Layout><ChangeEmail /></Layout>, requiredRole: 'user' },
  { path: '/verify-email', element: <Layout><VerifyEmail /></Layout>, requiredRole: 'user' },
  { path: '/curriculo', element: <Layout><Curriculo /></Layout>, requiredRole: 'user' },
  { path: '/buscar-vagas', element: <BuscarVagas />, requiredRole: 'user' },
  { path: '/detalhes-vaga/:id', element: <DetalhesVaga />, requiredRole: 'user' },
  { path: '/inscricoes-candidato', element: <Layout><InscricoesCandidato /></Layout>, requiredRole: 'user' },
];

export default UserProtectedRoutes;
