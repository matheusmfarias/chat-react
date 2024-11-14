import AdminDashboard from '../components/Admin/AdminDashboard';

const AdminProtectedRoutes = [
  { path: '/admin-dashboard', element: <AdminDashboard />, requiredRole: 'admin' },
];

export default AdminProtectedRoutes;
