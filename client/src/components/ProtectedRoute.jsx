/**
 * @fileoverview Ruta protegida — redirige al login si no hay sesión activa
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: '#fafaed' }}
      >
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: '#476500', borderTopColor: 'transparent' }}
          />
          <p className="text-sm font-medium" style={{ color: '#747967', fontFamily: 'Manrope, sans-serif' }}>
            Verificando sesión…
          </p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}
