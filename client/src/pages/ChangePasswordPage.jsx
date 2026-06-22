/**
 * @fileoverview Página "Restablecer contraseña"
 * @module client/src/pages/ChangePasswordPage
 *
 * Se accede desde el enlace del correo:
 *   http://localhost:5173/admonliliysusazoncompleta/#/change-password?token=TOKEN_AQUI
 */

import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../lib/api.js';

//const api = axios.create({ baseURL: '/api' });

// ── Iconos ────────────────────────────────────────────────────────────────────
const EyeIcon = ({ open }) => open ? (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>
  </svg>
) : (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
    <line x1="2" y1="2" x2="22" y2="22"/>
  </svg>
);

const SpinnerIcon = () => (
  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
  </svg>
);

// ── Indicador de fortaleza de contraseña ──────────────────────────────────────
const StrengthBar = ({ password }) => {
  const checks = [
    { label: 'Mínimo 8 caracteres',     ok: password.length >= 8 },
    { label: 'Una letra mayúscula',      ok: /[A-Z]/.test(password) },
    { label: 'Una letra minúscula',      ok: /[a-z]/.test(password) },
    { label: 'Un número',               ok: /\d/.test(password) },
    { label: 'Un carácter especial',    ok: /[@$!%*?&_\-#]/.test(password) },
  ];
  const strength = checks.filter(c => c.ok).length;
  const colors   = ['#e2e3d6', '#ba1a1a', '#944a00', '#c8a000', '#476500', '#2d4200'];

  if (!password) return null;

  return (
    <div className="mt-2 space-y-2">
      {/* Barra de fortaleza */}
      <div className="flex gap-1">
        {[1,2,3,4,5].map(i => (
          <div key={i} className="flex-1 h-1 rounded-full transition-colors duration-300"
               style={{ backgroundColor: i <= strength ? colors[strength] : '#e2e3d6' }}/>
        ))}
      </div>
      {/* Requisitos */}
      <ul className="space-y-0.5">
        {checks.map(({ label, ok }) => (
          <li key={label} className="flex items-center gap-1.5 text-xs font-medium"
              style={{ color: ok ? '#476500' : '#747967' }}>
            <span>{ok ? '✓' : '○'}</span> {label}
          </li>
        ))}
      </ul>
    </div>
  );
};

// ── Componente principal ───────────────────────────────────────────────────────
export default function ChangePasswordPage() {
 const [searchParams]   = useSearchParams();
const navigate         = useNavigate();

// HashRouter pone los params después del #
// useSearchParams no los lee → leer directo del hash
const getTokenFromHash = () => {
  const hash = window.location.hash;
  const q = hash.indexOf('?');
  if (q === -1) return null;
  return new URLSearchParams(hash.slice(q)).get('token');
};
const token = getTokenFromHash() || searchParams.get('token');

  const [tokenValido,    setTokenValido]    = useState(null); // null=verificando, true, false
  const [newPassword,    setNewPassword]    = useState('');
  const [confirmPass,    setConfirmPass]    = useState('');
  const [showNew,        setShowNew]        = useState(false);
  const [showConfirm,    setShowConfirm]    = useState(false);
  const [loading,        setLoading]        = useState(false);
  const [success,        setSuccess]        = useState(false);
  const [error,          setError]          = useState('');

  // ── Validar token al montar ──────────────────────────────────────────────
  useEffect(() => {
    if (!token) { setTokenValido(false); return; }

    api.get(`/auth/validate-token/${token}`)
      .then(({ data }) => setTokenValido(data.valid))
      .catch(() => setTokenValido(false));
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPass) {
      setError('Las contraseñas no coinciden.'); return;
    }

    setLoading(true);
    try {
      await api.post('/auth/change-password', {
        token,
        newPassword,
        confirmPassword: confirmPass,
      });
      setSuccess(true);
      // Redirigir al login después de 3 segundos
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cambiar la contraseña.');
    } finally {
      setLoading(false);
    }
  };

  // ── Pantalla: verificando token ──────────────────────────────────────────
  if (tokenValido === null) {
    return (
      <div className="min-h-screen flex items-center justify-center"
           style={{ backgroundColor: '#fafaed', fontFamily: 'Manrope, sans-serif' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 rounded-full animate-spin"
               style={{ borderColor: '#476500', borderTopColor: 'transparent' }}/>
          <p className="text-sm font-medium" style={{ color: '#747967' }}>Verificando enlace…</p>
        </div>
      </div>
    );
  }

  // ── Pantalla: token inválido o expirado ──────────────────────────────────
  if (!tokenValido) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4"
           style={{ backgroundColor: '#fafaed', fontFamily: 'Manrope, sans-serif' }}>
        <div className="w-full max-w-sm text-center">
          <div className="rounded-2xl p-8 shadow-modal" style={{ backgroundColor: '#fff' }}>
            <div className="text-4xl mb-4">⏱️</div>
            <h2 className="font-extrabold text-xl mb-3" style={{ color: '#1a1c15' }}>
              Enlace expirado
            </h2>
            <p className="text-sm font-medium mb-6" style={{ color: '#747967' }}>
              Este enlace de recuperación no es válido o ya expiró (30 min de vigencia).
              Por favor solicita uno nuevo.
            </p>
            <Link to="/forgot-password"
              className="inline-block w-full py-3 rounded-lg text-sm font-semibold text-center transition-all"
              style={{ backgroundColor: '#476500', color: '#fff' }}>
              Solicitar nuevo enlace
            </Link>
            <Link to="/login"
              className="inline-block mt-3 text-sm font-semibold"
              style={{ color: '#476500' }}>
              Volver al inicio de sesión
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Pantalla: éxito ──────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4"
           style={{ backgroundColor: '#fafaed', fontFamily: 'Manrope, sans-serif' }}>
        <div className="w-full max-w-sm text-center">
          <div className="rounded-2xl p-8 shadow-modal" style={{ backgroundColor: '#fff' }}>
            <div className="text-4xl mb-4">🎉</div>
            <h2 className="font-extrabold text-xl mb-3" style={{ color: '#1a1c15' }}>
              ¡Contraseña actualizada!
            </h2>
            <p className="text-sm font-medium mb-2" style={{ color: '#747967' }}>
              Tu contraseña fue cambiada correctamente.
              Serás redirigido al inicio de sesión en 3 segundos…
            </p>
            <Link to="/login"
              className="inline-block mt-4 text-sm font-semibold underline underline-offset-2"
              style={{ color: '#476500' }}>
              Ir ahora
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Pantalla principal: formulario ───────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center px-4"
         style={{ backgroundColor: '#fafaed', fontFamily: 'Manrope, sans-serif' }}>

      <div className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-20 pointer-events-none"
           style={{ background: 'radial-gradient(circle, #c8f17a 0%, transparent 70%)', transform: 'translate(30%,-30%)' }}/>

      <div className="w-full max-w-sm relative z-10">
        <div className="rounded-2xl p-8 shadow-modal" style={{ backgroundColor: '#fff' }}>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4 text-2xl"
                 style={{ background: 'linear-gradient(135deg, #5d7f13 0%, #476500 100%)' }}>
              🔒
            </div>
            <h1 className="font-extrabold text-2xl" style={{ color: '#1a1c15', letterSpacing: '-0.02em' }}>
              Nueva contraseña
            </h1>
            <p className="mt-2 text-sm font-medium" style={{ color: '#747967' }}>
              Elige una contraseña segura para tu cuenta.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium mb-4"
                 style={{ backgroundColor: '#ffdad6', color: '#93000a' }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Nueva contraseña */}
            <div>
              <label className="block text-xs font-bold tracking-wider uppercase mb-2"
                     style={{ color: '#444939' }}>
                Nueva contraseña
              </label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setError(''); }}
                  placeholder="••••••••"
                  disabled={loading}
                  className="w-full pl-4 pr-12 py-3 rounded-lg text-sm font-medium outline-none transition-all"
                  style={{ backgroundColor: '#eeefe2', color: '#1a1c15', border: '2px solid transparent' }}
                  onFocus={(e) => { e.target.style.backgroundColor = '#fff'; e.target.style.border = '2px solid #476500'; }}
                  onBlur={(e)  => { e.target.style.backgroundColor = '#eeefe2'; e.target.style.border = '2px solid transparent'; }}
                />
                <button type="button" tabIndex={-1}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2"
                  style={{ color: '#747967' }}
                  onClick={() => setShowNew(p => !p)}>
                  <EyeIcon open={showNew}/>
                </button>
              </div>
              <StrengthBar password={newPassword} />
            </div>

            {/* Confirmar contraseña */}
            <div>
              <label className="block text-xs font-bold tracking-wider uppercase mb-2"
                     style={{ color: '#444939' }}>
                Confirmar contraseña
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPass}
                  onChange={(e) => { setConfirmPass(e.target.value); setError(''); }}
                  placeholder="••••••••"
                  disabled={loading}
                  className="w-full pl-4 pr-12 py-3 rounded-lg text-sm font-medium outline-none transition-all"
                  style={{
                    backgroundColor: confirmPass && confirmPass !== newPassword ? '#ffdad6' : '#eeefe2',
                    color: '#1a1c15',
                    border: confirmPass && confirmPass !== newPassword ? '2px solid #ba1a1a' : '2px solid transparent',
                  }}
                  onFocus={(e) => {
                    if (!confirmPass || confirmPass === newPassword) {
                      e.target.style.backgroundColor = '#fff';
                      e.target.style.border = '2px solid #476500';
                    }
                  }}
                  onBlur={(e)  => {
                    e.target.style.backgroundColor = confirmPass && confirmPass !== newPassword ? '#ffdad6' : '#eeefe2';
                    e.target.style.border = confirmPass && confirmPass !== newPassword ? '2px solid #ba1a1a' : '2px solid transparent';
                  }}
                />
                <button type="button" tabIndex={-1}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2"
                  style={{ color: '#747967' }}
                  onClick={() => setShowConfirm(p => !p)}>
                  <EyeIcon open={showConfirm}/>
                </button>
              </div>
              {confirmPass && confirmPass !== newPassword && (
                <p className="mt-1.5 text-xs font-medium" style={{ color: '#ba1a1a' }}>
                  Las contraseñas no coinciden
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !newPassword || !confirmPass}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-lg font-semibold text-sm transition-all active:scale-[0.98] disabled:opacity-60"
              style={{ backgroundColor: '#476500', color: '#fff', boxShadow: '0 4px 14px rgba(71,101,0,0.35)' }}>
              {loading ? <><SpinnerIcon /><span>Guardando…</span></> : 'Guardar nueva contraseña'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
