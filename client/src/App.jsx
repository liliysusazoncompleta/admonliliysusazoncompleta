import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider }       from './hooks/useAuth.jsx';
import { CartProvider }       from './hooks/useCart.jsx';
import ProtectedRoute         from './components/ProtectedRoute.jsx';
import LoginPage              from './pages/LoginPage.jsx';
import ForgotPasswordPage     from './pages/ForgotPasswordPage.jsx';
import ChangePasswordPage     from './pages/ChangePasswordPage.jsx';
import DashboardPage          from './pages/DashboardPage.jsx';
import ProductosPage          from './pages/ProductosPage.jsx';
import ClientesPage           from './pages/ClientesPage.jsx';
import CarritoPage            from './pages/CarritoPage.jsx';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Routes>
          <Route path="/"                element={<Navigate to="/login" replace />} />
          <Route path="/login"           element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/change-password" element={<ChangePasswordPage />} />
          <Route path="/dashboard"       element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/productos"       element={<ProtectedRoute><ProductosPage /></ProtectedRoute>} />
          <Route path="/clientes"        element={<ProtectedRoute><ClientesPage /></ProtectedRoute>} />
          <Route path="/carrito"         element={<ProtectedRoute><CarritoPage /></ProtectedRoute>} />
          <Route path="*"                element={<Navigate to="/login" replace />} />
        </Routes>
      </CartProvider>
    </AuthProvider>
  );
}
