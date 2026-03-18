import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext'; // Import ajouté
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Layout from './components/UI/Layout';

// Pages Auth
import LoginPage from './pages/LoginPage';
import UnauthorizedPage from './pages/UnauthorizedPage';

// Pages Dashboard & Manager
import ManagerDashboardPage from './pages/Manager/ManagerDashboardPage';
import ProjectDetailPage from './pages/Manager/ProjectDetailPage';
import UserDashboardPage from './pages/User/UserDashboardPage';

// Pages Rapports
import NewReportPage from './pages/Reports/NewReportPage';
import MyReportsPage from './pages/Reports/MyReportsPage';

// Pages Fil d'actualité
import FeedPage from './pages/Feed/FeedPage';

// Pages Admin
import AdminDashboardPage from './pages/Admin/AdminDashboardPage';
import UsersListPage from './pages/Admin/UsersListPage';
import UserFormPage from './pages/Admin/UserFormPage';

/**
 * Composant pour rediriger l'utilisateur selon son rôle
 */
const HomeRedirect = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (user?.role === 'manager' || user?.role === 'admin') {
    return <Navigate to="/manager" replace />;
  }
  return <Navigate to="/dashboard" replace />;
};

function App() {
  return (
    <ToastProvider> {/* Enveloppe externe pour garantir l'accès au context partout */}
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* 1. ROUTES PUBLIQUES */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            
            {/* 2. ROUTES PROTÉGÉES AVEC LAYOUT */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<HomeRedirect />} />
              <Route path="dashboard" element={<UserDashboardPage />} />
              
              <Route path="reports">
                <Route index element={<MyReportsPage />} />
                <Route path="new" element={<NewReportPage />} />
                <Route path="edit/:reportId" element={<NewReportPage />} />
              </Route>

              <Route path="feed" element={<FeedPage />} />

              {/* ESPACE MANAGER */}
              <Route path="manager" element={
                <ProtectedRoute allowedRoles={['admin', 'manager']}>
                  <ManagerDashboardPage />
                </ProtectedRoute>
              } />
              
              <Route path="manager/projects/:projectId" element={
                <ProtectedRoute allowedRoles={['admin', 'manager']}>
                  <ProjectDetailPage />
                </ProtectedRoute>
              } />

              {/* ESPACE ADMIN */}
              <Route path="admin" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Outlet />
                </ProtectedRoute>
              }>
                <Route index element={<AdminDashboardPage />} />
                <Route path="users" element={<UsersListPage />} />
                <Route path="users/new" element={<UserFormPage />} />
                <Route path="users/:userId" element={<UserFormPage />} />
              </Route>
            </Route>

            {/* 3. CATCH-ALL REDIRECTION */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;