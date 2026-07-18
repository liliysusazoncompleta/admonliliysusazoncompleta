/**
 * @fileoverview Página "¿Olvidaste tu contraseña?"
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api.js';

//const api = axios.create({ baseURL: '/api' });

const MailIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);
const ArrowLeft = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
  </svg>
);
const SpinnerIcon = () => (
  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
  </svg>
);

export default function ForgotPasswordPage() {
  const apiBase = import.meta.env.VITE_API_URL || '/api';
  const [correo,  setCorrro]  = useState('');
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!correo.trim()) { setError('Ingresa tu correo electrónico.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) { setError('Ingresa un correo válido.'); return; }

    setLoading(true);
    setError('');

    try {
      const { data } = await api.post('/auth/forgot-password', {
        correo: correo.toLowerCase().trim(),
      });

      if (data.success) {
        setSent(true);
      } else {
        setError(data.message || 'No se pudo procesar la solicitud.');
      }

    } catch (err) {
      // Mostrar el mensaje real del servidor si existe
      const serverMsg = err.response?.data?.message;
      const status    = err.response?.status;

      if (serverMsg) {
        setError(`Error del servidor (${status}): ${serverMsg}`);
      } else if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        setError(`No se puede conectar al servidor. Verifica que el backend esté corriendo y accesible desde: ${apiBase}`);
      } else {
        setError(`Error inesperado: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
         style={{ backgroundColor: '#fafaed', fontFamily: 'Manrope, sans-serif' }}>

      <div className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-20 pointer-events-none"
           style={{ background: 'radial-gradient(circle, #c8f17a 0%, transparent 70%)', transform: 'translate(30%,-30%)' }}/>

      <div className="w-full max-w-sm relative z-10">

        <Link to="/login"
          className="inline-flex items-center gap-2 text-sm font-semibold mb-6 transition-opacity hover:opacity-70"
          style={{ color: '#476500' }}>
          <ArrowLeft /> Volver al inicio de sesión
        </Link>

        <div className="rounded-2xl p-8" style={{ backgroundColor: '#ffffff', boxShadow: '0 12px 24px rgba(26,28,21,0.10)' }}>

          {!sent ? (
            <>
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4 text-2xl"
                     style={{ background: 'linear-gradient(135deg, #5d7f13 0%, #476500 100%)' }}>🔑</div>
                <h1 className="font-extrabold text-2xl" style={{ color: '#1a1c15', letterSpacing: '-0.02em' }}>
                  ¿Olvidaste tu contraseña?
                </h1>
                <p className="mt-2 text-sm font-medium" style={{ color: '#747967' }}>
                  Ingresa tu correo y te enviaremos las instrucciones.
                </p>
              </div>

              {/* Error — ahora muestra el mensaje real */}
              {error && (
                <div className="px-4 py-3 rounded-lg text-sm font-medium mb-4"
                     style={{ backgroundColor: '#ffdad6', color: '#93000a' }}>
                  <p className="font-bold mb-1">⚠️ Error</p>
                  <p className="text-xs leading-relaxed">{error}</p>
                </div>
              )}

              {/* Formulario */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold tracking-wider uppercase mb-2"
                         style={{ color: '#444939' }}>Correo electrónico</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                          style={{ color: '#747967' }}><MailIcon /></span>
                    <input
                      type="email"
                      value={correo}
                      onChange={(e) => { setCorrro(e.target.value); setError(''); }}
                      placeholder="tu@correo.com"
                      disabled={loading}
                      className="w-full pl-11 pr-4 py-3 rounded-lg text-sm font-medium outline-none transition-all duration-200"
                      style={{ backgroundColor: '#eeefe2', color: '#1a1c15', border: '2px solid transparent' }}
                      onFocus={(e) => { e.target.style.backgroundColor = '#fff'; e.target.style.border = '2px solid #476500'; }}
                      onBlur={(e)  => { e.target.style.backgroundColor = '#eeefe2'; e.target.style.border = '2px solid transparent'; }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-lg font-semibold text-sm transition-all active:scale-[0.98] disabled:opacity-60"
                  style={{ backgroundColor: '#476500', color: '#fff', boxShadow: '0 4px 14px rgba(71,101,0,0.35)' }}
                  onMouseEnter={(e) => { if (!loading) e.target.style.backgroundColor = '#5d7f13'; }}
                  onMouseLeave={(e) => { if (!loading) e.target.style.backgroundColor = '#476500'; }}>
                  {loading
                    ? <><SpinnerIcon /><span>Enviando…</span></>
                    : 'Enviar instrucciones'}
                </button>
              </form>
            </>
          ) : (
            /* Éxito */
            <div className="text-center py-4">
              <div className="text-5xl mb-4">📬</div>
              <h2 className="font-extrabold text-xl mb-3" style={{ color: '#1a1c15' }}>¡Revisa tu correo!</h2>
              <p className="text-sm font-medium leading-relaxed mb-2" style={{ color: '#747967' }}>
                Si <strong style={{ color: '#1a1c15' }}>{correo}</strong> está registrado,
                recibirás las instrucciones en los próximos minutos.
              </p>
              <p className="text-xs mb-6" style={{ color: '#747967' }}>
                El enlace expira en <strong>30 minutos</strong>. Revisa también tu carpeta de spam.
              </p>
              <Link to="/login"
                className="inline-block px-6 py-2.5 rounded-lg text-sm font-semibold"
                style={{ backgroundColor: '#eeefe2', color: '#1a1c15' }}>
                Volver al inicio de sesión
              </Link>
            </div>
          )}
        </div>

        <p className="text-center text-xs mt-6 font-medium" style={{ color: '#747967' }}>
          © {new Date().getFullYear()} Lili y su Sazón Completa
        </p>
      </div>
    </div>
  );
}
