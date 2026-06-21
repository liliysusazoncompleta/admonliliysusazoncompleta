/**
 * @fileoverview Página Mi Cuenta
 * Muestra datos de public.usuarios + public.empleados del usuario en sesión.
 * JOIN: usuarios.cedula = empleados.cedula
 */
import { useState, useEffect } from 'react';
import { useNavigate }         from 'react-router-dom';
import axios                   from 'axios';
import AppLayout               from '../components/AppLayout.jsx';

const api = axios.create({ baseURL: '/api' });
api.interceptors.request.use(cfg => {
  const t = localStorage.getItem('lili_token');
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

const C = {
  primary:'#476500', primary2:'#5d7f13',
  surface:'#fafaed', container:'#eeefe2',
  white:'#ffffff',   text:'#1a1c15',
  muted:'#747967',   sub:'#444939',
  border:'#e2e3d6',  error:'#ba1a1a',
  errorBg:'#ffdad6', successBg:'#eef3e4',
};

const fmtFecha = (val) => {
  if (!val) return '—';
  try {
    return new Date(val).toLocaleString('es-CO', {
      year:'numeric', month:'long', day:'numeric',
      hour:'2-digit', minute:'2-digit',
    });
  } catch { return String(val); }
};

const fmtValor = (campo, val) => {
  if (val === null || val === undefined || val === '') return '—';

  if (typeof val === 'boolean')
    return val
      ? <span className="px-2 py-0.5 rounded-full text-xs font-bold"
              style={{ backgroundColor:C.successBg, color:C.primary }}>✓ Activo</span>
      : <span className="px-2 py-0.5 rounded-full text-xs font-bold"
              style={{ backgroundColor:C.errorBg, color:C.error }}>✗ Inactivo</span>;

  if (campo === 'rol')
    return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold"
                 style={{ backgroundColor:C.primary, color:C.white }}>{val}</span>;

  if (campo === 'salario')
    return `$${Number(val).toLocaleString('es-CO')}`;

  if (/login|desde|created/.test(campo))
    return fmtFecha(val);

  return String(val);
};

/* ── Fila individual ─────────────────────────────────────────────── */
function Fila({ etiqueta, campo, valor }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 py-3"
         style={{ borderBottom:`1px solid ${C.border}` }}>
      <span className="w-52 flex-shrink-0 text-xs font-bold tracking-wide uppercase"
            style={{ color:C.muted }}>
        {etiqueta}
      </span>
      <span className="text-sm font-semibold flex-1" style={{ color:C.text }}>
        {fmtValor(campo, valor)}
      </span>
    </div>
  );
}

/* ── Card de sección ─────────────────────────────────────────────── */
function Seccion({ titulo, icono, children }) {
  return (
    <div className="rounded-2xl overflow-hidden"
         style={{ backgroundColor:C.white, border:`1px solid ${C.border}` }}>
      <div className="flex items-center gap-2.5 px-5 py-4"
           style={{ borderBottom:`1px solid ${C.border}`, backgroundColor:C.container }}>
        <span className="text-lg">{icono}</span>
        <h3 className="font-bold text-sm" style={{ color:C.text }}>{titulo}</h3>
      </div>
      <div className="px-5 pb-1">{children}</div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   PÁGINA
══════════════════════════════════════════════════════════════════ */
export default function MiCuentaPage() {
  const navigate              = useNavigate();
  const [perfil, setPerfil]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

useEffect(() => {
  api.get('/auth/perfil')
    .then(({ data }) => setPerfil(data.data))
    .catch(err => {
      const msg = err.response?.data?.message
        || err.response?.data?.error
        || err.message
        || 'Error desconocido';
      setError(`[${err.response?.status || 'RED'}] ${msg}`);
    })
    .finally(() => setLoading(false));
}, []);

  const inicial = (perfil?.nombre_empleado?.[0] || perfil?.correo?.[0] || 'U').toUpperCase();

  return (
    <AppLayout activeKey="">
      <div className="p-5 md:p-6 max-w-2xl mx-auto space-y-5">

        {/* Encabezado */}
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)}
            className="p-2 rounded-xl transition-colors"
            style={{ backgroundColor:C.container }}
            onMouseEnter={e=>e.currentTarget.style.backgroundColor=C.border}
            onMouseLeave={e=>e.currentTarget.style.backgroundColor=C.container}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                 stroke={C.sub} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <div>
            <h2 className="font-extrabold text-2xl"
                style={{ color:C.text, letterSpacing:'-0.02em' }}>Mi Cuenta</h2>
            <p className="text-sm font-medium mt-0.5" style={{ color:C.muted }}>
              Información de tu perfil y empleado
            </p>
          </div>
        </div>

        {/* Cargando */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
                 style={{ borderColor:C.primary, borderTopColor:'transparent' }}/>
            <p className="text-sm font-medium" style={{ color:C.muted }}>Cargando perfil…</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex items-center gap-3 px-5 py-4 rounded-2xl"
               style={{ backgroundColor:C.errorBg, color:C.error }}>
            <span className="text-xl">⚠️</span>
            <div>
              <p className="font-bold text-sm">No se pudo cargar el perfil</p>
              <p className="text-xs mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Contenido */}
        {!loading && perfil && (
          <>
            {/* Avatar + nombre */}
            <div className="rounded-2xl p-6 flex items-center gap-5"
                 style={{ backgroundColor:C.white, border:`1px solid ${C.border}` }}>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-extrabold text-white flex-shrink-0"
                   style={{ background:`linear-gradient(135deg,${C.primary},${C.primary2})` }}>
                {inicial}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-extrabold text-xl truncate"
                    style={{ color:C.text, letterSpacing:'-0.01em' }}>
                  {perfil.nombre_empleado || perfil.correo}
                </h3>
                <p className="text-sm font-medium mt-0.5" style={{ color:C.muted }}>
                  {perfil.correo}
                </p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                        style={{ backgroundColor:C.primary, color:C.white }}>
                    {perfil.rol}
                  </span>
                  {perfil.cargo && (
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                          style={{ backgroundColor:C.container, color:C.sub }}>
                      {perfil.cargo}
                    </span>
                  )}
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                        style={{
                          backgroundColor: perfil.activo ? C.successBg : C.errorBg,
                          color: perfil.activo ? C.primary : C.error,
                        }}>
                    {perfil.activo ? '✓ Cuenta activa' : '✗ Cuenta inactiva'}
                  </span>
                </div>
              </div>
            </div>

            {/* Sección: Cuenta de acceso */}
            <Seccion titulo="Cuenta de Acceso" icono="🔐">
              <Fila etiqueta="ID Usuario"            campo="id_usuario"    valor={perfil.id_usuario}    />
              <Fila etiqueta="Cédula"                campo="cedula"        valor={perfil.cedula}        />
              <Fila etiqueta="Correo electrónico"    campo="correo"        valor={perfil.correo}        />
              <Fila etiqueta="Rol en el sistema"     campo="rol"           valor={perfil.rol}           />
              <Fila etiqueta="Estado de la cuenta"   campo="activo"        valor={perfil.activo}        />
              <Fila etiqueta="Último inicio sesión"  campo="ultimo_login"  valor={perfil.ultimo_login}  />
              <Fila etiqueta="Cuenta creada el"      campo="usuario_desde" valor={perfil.usuario_desde} />
            </Seccion>

            {/* Sección: Datos del Empleado */}
            {perfil.id_empleado && (
              <Seccion titulo="Datos del Empleado" icono="👤">
                <Fila etiqueta="ID Empleado"          campo="id_empleado"         valor={perfil.id_empleado}         />
                <Fila etiqueta="Nombre"               campo="nombre_empleado"     valor={perfil.nombre_empleado}     />
                <Fila etiqueta="Cédula"               campo="cedula"              valor={perfil.cedula}              />
                <Fila etiqueta="Teléfono"             campo="telefono"            valor={perfil.telefono}            />
                <Fila etiqueta="Dirección principal"  campo="direccion_principal" valor={perfil.direccion_principal} />
                <Fila etiqueta="Dirección alterna"    campo="direccion_alterna"   valor={perfil.direccion_alterna}   />
                <Fila etiqueta="Cargo"                campo="cargo"               valor={perfil.cargo}               />
                <Fila etiqueta="Salario base"         campo="salario"             valor={perfil.salario}             />
                <Fila etiqueta="Estado empleado"      campo="empleado_activo"     valor={perfil.empleado_activo}     />
              </Seccion>
            )}

            {/* Acciones */}
            <div className="rounded-2xl p-5"
                 style={{ backgroundColor:C.white, border:`1px solid ${C.border}` }}>
              <h3 className="font-bold text-sm mb-4" style={{ color:C.text }}>⚙️ Acciones</h3>
              <button
                onClick={() => navigate('/forgot-password')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{ backgroundColor:C.container, color:C.sub }}
                onMouseEnter={e=>e.currentTarget.style.backgroundColor=C.border}
                onMouseLeave={e=>e.currentTarget.style.backgroundColor=C.container}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                Cambiar contraseña
              </button>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
