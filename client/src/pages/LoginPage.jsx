/**
 * @fileoverview Página de Inicio de Sesión
 * @module client/src/pages/LoginPage
 *
 * Pantalla dividida: panel visual izquierdo (imagen gastronómica) +
 * panel derecho con formulario. Estilo Empresa Artesanal.
 */

import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import logoLili from '../assets/LOGO_LILI.jpg';

// ── Iconos SVG inline ─────────────────────────────────────────────────────────
const MailIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);

const LockIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const EyeIcon = ({ open }) => open ? (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
    <circle cx="12" cy="12" r="3"/>
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

const CheckIcon = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

// ── Logotipo SVG de la empresa (artesanal) ────────────────────────────────────
const LogoMarca = () => ( 
 <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-modal">
    <img
      src={logoLili}
      alt="Lili y su Sazón Completa"
      className="w-full h-full object-cover"
    />
  </div>
);

// ── Panel Hero izquierdo ───────────────────────────────────────────────────────
const HeroPanel = () => {
  // Imagen gastronómica de alta calidad (Unsplash - libre de derechos)
  const imageUrl =
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=900&q=85&fit=crop&crop=center';

  return (
    <div className="relative hidden lg:flex lg:w-[52%] h-full overflow-hidden">
      {/* Imagen de fondo */}
      <img
        src={imageUrl}
        alt="Cocina artesanal Lili y su Sazón"
        className="absolute inset-0 w-full h-full object-cover animate-fade-in"
        style={{ animationDuration: '1.2s' }}
        onError={(e) => {
          // Fallback a gradient si la imagen no carga
          e.target.style.display = 'none';
        }}
      />

      {/* Overlay gradiente */}
      <div className="absolute inset-0 hero-gradient" />

      {/* Patrón de textura sutil */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Contenido del hero */}
      <div className="relative z-10 flex flex-col justify-end p-10 pb-14 h-full">
        {/* Badge empresa */}
        <div
          className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm
                     border border-white/20 rounded-full px-4 py-2 w-fit mb-6
                     opacity-0 animate-fade-up animation-delay-300"
          style={{ animationFillMode: 'forwards' }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-primary-fixed-dim animate-float" />
          <span className="text-white/90 text-xs font-semibold tracking-wider uppercase">
            Catering Gourmet · Medellin-Colombia
          </span>
        </div>

        {/* Tagline principal */}
        <h1
          className="text-white font-extrabold leading-[1.1] mb-4
                     opacity-0 animate-fade-up animation-delay-400"
          style={{
            fontSize: 'clamp(2rem, 3.5vw, 3rem)',
            letterSpacing: '-0.02em',
            animationFillMode: 'forwards',
          }}
        >
          Cocina a puesta cerradas con<br />
          <span style={{ color: '#add461' }}>amor</span> para<br />
          tu familia
        </h1>

        {/* Descripción */}
        <p
          className="text-white/70 font-medium max-w-xs leading-relaxed
                     opacity-0 animate-fade-up animation-delay-500"
          style={{ fontSize: '1rem', animationFillMode: 'forwards' }}
        >
          Gestión gourmet de catering artesanal para experiencias culinarias.
        </p>

        {/* Stats */}
        <div
          className="flex gap-8 mt-8 opacity-0 animate-fade-up animation-delay-600"
          style={{ animationFillMode: 'forwards' }}
        >
          {[
            //{ valor: '+500', label: 'Eventos' },
            { valor: '12+', label: 'Años' },
            { valor: '100%', label: 'Artesanal' },
          ].map(({ valor, label }) => (
            <div key={label}>
              <p className="text-white font-bold text-xl">{valor}</p>
              <p className="text-white/50 text-xs font-medium tracking-wide uppercase mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── Componente principal de Login ─────────────────────────────────────────────
export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ correo: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe]     = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');
  const [fieldErrors, setFieldErrors]   = useState({});

  const correoRef  = useRef(null);
  const submitRef  = useRef(null);

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  // Focus al montar
  useEffect(() => {
    correoRef.current?.focus();
  }, []);

  // Restaurar correo guardado
  useEffect(() => {
    const saved = localStorage.getItem('lili_correo_guardado');
    if (saved) {
      setForm((p) => ({ ...p, correo: saved }));
      setRememberMe(true);
    }
  }, []);

  const validate = () => {
    const errors = {};
    if (!form.correo.trim()) errors.correo = 'El correo es requerido';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo)) errors.correo = 'Ingresa un correo válido';
    if (!form.password) errors.password = 'La contraseña es requerida';
    else if (form.password.length < 4) errors.password = 'Mínimo 4 caracteres';
    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((p) => ({ ...p, [name]: '' }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length) { setFieldErrors(errors); return; }

    setLoading(true);
    setError('');

    if (rememberMe) localStorage.setItem('lili_correo_guardado', form.correo);
    else localStorage.removeItem('lili_correo_guardado');

    const result = await login(form.correo.trim().toLowerCase(), form.password);

    if (result.success) {
      navigate('/dashboard', { replace: true });
    } else {
      setError(result.message || 'Credenciales inválidas');
      setLoading(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen flex"
      style={{ backgroundColor: '#fafaed', fontFamily: 'Manrope, sans-serif' }}
    >
      {/* Panel izquierdo — Hero gastronómico */}
      <HeroPanel />

      {/* Panel derecho — Formulario */}
      <div className="flex-1 lg:w-[48%] flex items-center justify-center px-6 py-12 relative overflow-y-auto">
        {/* Decoración de fondo */}
        <div
          className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-30 pointer-events-none"
          style={{
            background: 'radial-gradient(circle, #c8f17a 0%, transparent 70%)',
            transform: 'translate(30%, -30%)',
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-20 pointer-events-none"
          style={{
            background: 'radial-gradient(circle, #add461 0%, transparent 70%)',
            transform: 'translate(-30%, 30%)',
          }}
        />

        <div className="w-full max-w-sm relative z-10">

          {/* ── Logo y encabezado ─────────────────────────────────────────── */}
          <div
            className="flex flex-col items-center text-center mb-8
                       opacity-0 animate-scale-in"
            style={{ animationFillMode: 'forwards', animationDelay: '100ms' }}
          >
            <LogoMarca />
            <div className="mt-5">
              <h2
                className="font-extrabold text-on-surface"
                style={{ fontSize: '1.75rem', letterSpacing: '-0.02em' }}
              >
                Bienvenido/a
              </h2>
              <p className="mt-1 text-sm text-on-surface-variant font-medium">
                Ingresa tus credenciales para acceder al sistema
              </p>
            </div>
          </div>

          {/* ── Formulario ───────────────────────────────────────────────── */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">

            {/* ── Error general ──────────────────────────────────────────── */}
            {error && (
              <div
                className="flex items-start gap-3 px-4 py-3 rounded-lg text-sm font-medium
                           opacity-0 animate-fade-up"
                style={{
                  backgroundColor: '#ffdad6',
                  color: '#93000a',
                  animationFillMode: 'forwards',
                  animationDuration: '0.3s',
                }}
              >
                <svg className="w-4 h-4 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* ── Campo: Correo ───────────────────────────────────────────── */}
            <div
              className="opacity-0 animate-fade-up animation-delay-200"
              style={{ animationFillMode: 'forwards' }}
            >
              <label
                htmlFor="correo"
                className="block text-xs font-bold tracking-wider uppercase mb-2"
                style={{ color: '#444939' }}
              >
                Correo electrónico
              </label>
              <div className="relative">
                <span
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: fieldErrors.correo ? '#ba1a1a' : '#747967' }}
                >
                  <MailIcon />
                </span>
                <input
                  ref={correoRef}
                  id="correo"
                  name="correo"
                  type="email"
                  autoComplete="email"
                  placeholder="admin@liliysazon.com"
                  value={form.correo}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full pl-11 pr-4 py-3 rounded-lg text-sm font-medium outline-none
                             transition-all duration-200 disabled:opacity-60"
                  style={{
                    backgroundColor: fieldErrors.correo ? '#ffdad6' : '#eeefe2',
                    color: '#1a1c15',
                    border: fieldErrors.correo ? '2px solid #ba1a1a' : '2px solid transparent',
                    boxShadow: 'none',
                  }}
                  onFocus={(e) => {
                    if (!fieldErrors.correo) {
                      e.target.style.backgroundColor = '#ffffff';
                      e.target.style.border = '2px solid #476500';
                    }
                  }}
                  onBlur={(e) => {
                    if (!fieldErrors.correo) {
                      e.target.style.backgroundColor = '#eeefe2';
                      e.target.style.border = '2px solid transparent';
                    }
                  }}
                />
              </div>
              {fieldErrors.correo && (
                <p className="mt-1.5 text-xs font-medium" style={{ color: '#ba1a1a' }}>
                  {fieldErrors.correo}
                </p>
              )}
            </div>

            {/* ── Campo: Contraseña ───────────────────────────────────────── */}
            <div
              className="opacity-0 animate-fade-up animation-delay-300"
              style={{ animationFillMode: 'forwards' }}
            >
              <label
                htmlFor="password"
                className="block text-xs font-bold tracking-wider uppercase mb-2"
                style={{ color: '#444939' }}
              >
                Contraseña
              </label>
              <div className="relative">
                <span
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: fieldErrors.password ? '#ba1a1a' : '#747967' }}
                >
                  <LockIcon />
                </span>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full pl-11 pr-12 py-3 rounded-lg text-sm font-medium outline-none
                             transition-all duration-200 disabled:opacity-60"
                  style={{
                    backgroundColor: fieldErrors.password ? '#ffdad6' : '#eeefe2',
                    color: '#1a1c15',
                    border: fieldErrors.password ? '2px solid #ba1a1a' : '2px solid transparent',
                  }}
                  onFocus={(e) => {
                    if (!fieldErrors.password) {
                      e.target.style.backgroundColor = '#ffffff';
                      e.target.style.border = '2px solid #476500';
                    }
                  }}
                  onBlur={(e) => {
                    if (!fieldErrors.password) {
                      e.target.style.backgroundColor = '#eeefe2';
                      e.target.style.border = '2px solid transparent';
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5
                             transition-colors duration-150"
                  style={{ color: '#747967' }}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
              {fieldErrors.password && (
                <p className="mt-1.5 text-xs font-medium" style={{ color: '#ba1a1a' }}>
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {/* ── Recordarme / Olvidé contraseña ─────────────────────────── */}
            <div
              className="flex items-center justify-between opacity-0 animate-fade-up animation-delay-400"
              style={{ animationFillMode: 'forwards' }}
            >
              <label className="flex items-center gap-2.5 cursor-pointer group select-none">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={rememberMe}
                  onClick={() => setRememberMe((p) => !p)}
                  className="w-4 h-4 rounded flex items-center justify-center
                             transition-all duration-150 shrink-0"
                  style={{
                    backgroundColor: rememberMe ? '#476500' : 'transparent',
                    border: rememberMe ? '2px solid #476500' : '2px solid #c4c9b4',
                  }}
                >
                  {rememberMe && (
                    <span style={{ color: '#fff' }}>
                      <CheckIcon />
                    </span>
                  )}
                </button>
                <span className="text-sm font-medium" style={{ color: '#444939' }}>
                  Recordarme
                </span>
              </label>

              <Link
                to="/forgot-password"
                className="text-sm font-semibold transition-colors duration-150
                           hover:underline underline-offset-2"
                style={{ color: '#476500' }}
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {/* ── Botón de envío ──────────────────────────────────────────── */}
            <div
              className="pt-1 opacity-0 animate-fade-up animation-delay-500"
              style={{ animationFillMode: 'forwards' }}
            >
              <button
                ref={submitRef}
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2.5
                           py-3.5 px-6 rounded-lg font-semibold text-sm
                           transition-all duration-200 active:scale-[0.98]
                           disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: '#476500',
                  color: '#ffffff',
                  boxShadow: loading ? 'none' : '0 4px 14px rgba(71, 101, 0, 0.35)',
                }}
                onMouseEnter={(e) => {
                  if (!loading) e.target.style.backgroundColor = '#5d7f13';
                }}
                onMouseLeave={(e) => {
                  if (!loading) e.target.style.backgroundColor = '#476500';
                }}
              >
                {loading ? (
                  <>
                    <SpinnerIcon />
                    <span>Verificando credenciales…</span>
                  </>
                ) : (
                  <span>Iniciar sesión</span>
                )}
              </button>
            </div>
          </form>

          {/* ── Footer de la card ─────────────────────────────────────────── */}
          <p
            className="mt-8 text-center text-xs font-medium opacity-0 animate-fade-up animation-delay-600"
            style={{ color: '#747967', animationFillMode: 'forwards' }}
          >
            © {new Date().getFullYear()} Lili y su Sazón Completa · Todos los derechos reservados
          </p>
        </div>
      </div>
    </div>
  );
}
