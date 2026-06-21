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
import EmpleadosPage          from './pages/EmpleadosPage.jsx';
import UsuariosPage           from './pages/UsuariosPage.jsx';
import VentasPage             from './pages/VentasPage.jsx';
import MiCuentaPage           from './pages/MiCuentaPage.jsx';
import CartaPage from './pages/CartaPage.jsx';
import PortafolioPage from './pages/PortafolioPage.jsx';


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
          <Route path="/carta"           element={<ProtectedRoute><CartaPage /></ProtectedRoute>} />
          <Route path="/empleados"       element={<ProtectedRoute><EmpleadosPage /></ProtectedRoute>} />
          <Route path="/usuarios"        element={<ProtectedRoute><UsuariosPage /></ProtectedRoute>} />
          <Route path="/ventas"          element={<ProtectedRoute><VentasPage /></ProtectedRoute>} />
          <Route path="/mi-cuenta"       element={<ProtectedRoute><MiCuentaPage /></ProtectedRoute>} />
          <Route path="/portafolio"      element={<ProtectedRoute><PortafolioPage /></ProtectedRoute>} />
          <Route path="*"                element={<Navigate to="/login" replace />} />
        </Routes>
      </CartProvider>
    </AuthProvider>
  );
}
