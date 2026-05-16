import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider }       from './hooks/useAuth.jsx';
import ProtectedRoute         from './components/ProtectedRoute.jsx';
import LoginPage              from './pages/LoginPage.jsx';
import ForgotPasswordPage     from './pages/ForgotPasswordPage.jsx';
import ChangePasswordPage     from './pages/ChangePasswordPage.jsx';
import DashboardPage          from './pages/DashboardPage.jsx';
import ProductosPage          from './pages/ProductosPage.jsx';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/"                element={<Navigate to="/login" replace />} />
        <Route path="/login"           element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/change-password" element={<ChangePasswordPage />} />
        <Route path="/dashboard"       element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/productos"       element={<ProtectedRoute><ProductosPage /></ProtectedRoute>} />
        <Route path="*"                element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  );
}
