/**
 * @fileoverview Dashboard Principal — Placeholder
 * @module client/src/pages/DashboardPage
 */

import { useAuth } from '../hooks/useAuth.jsx';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-6 px-6"
      style={{ backgroundColor: '#fafaed', fontFamily: 'Manrope, sans-serif' }}
    >
      {/* Logo placeholder */}
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-modal"
        style={{ background: 'linear-gradient(135deg, #5d7f13 0%, #476500 100%)' }}
      >
        🍽️
      </div>

      <div className="text-center">
        <h1
          className="font-extrabold"
          style={{ fontSize: '2rem', color: '#1a1c15', letterSpacing: '-0.02em' }}
        >
          ¡Bienvenido/a, {usuario?.correo?.split('@')[0]}!
        </h1>
        <p className="mt-2 text-sm font-medium" style={{ color: '#747967' }}>
          Rol: <span className="font-bold" style={{ color: '#476500' }}>{usuario?.rol}</span>
          {' · '} Empleado #{usuario?.id_empleado}
        </p>
      </div>

      <div
        className="rounded-xl p-6 text-center max-w-sm w-full shadow-card"
        style={{ backgroundColor: '#ffffff' }}
      >
        <p className="text-sm font-medium" style={{ color: '#444939' }}>
          El módulo de dashboard completo será implementado en la siguiente fase del proyecto.
        </p>
        <p className="mt-3 text-xs" style={{ color: '#747967' }}>
          Este es el punto de entrada seguro del sistema ERP de
          Lili y su Sazón Completa 🌿
        </p>
      </div>

      <button
        onClick={handleLogout}
        className="px-6 py-2.5 rounded-lg text-sm font-semibold
                   transition-all duration-200 hover:opacity-80"
        style={{ backgroundColor: '#eeefe2', color: '#1a1c15' }}
      >
        Cerrar sesión
      </button>
    </div>
  );
}
