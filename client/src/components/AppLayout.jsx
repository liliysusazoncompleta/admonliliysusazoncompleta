/**
 * @fileoverview Layout compartido — Sidebar + Topbar
 * @module client/src/components/AppLayout
 *
 * Uso:
 *   <AppLayout>
 *     <TuContenido />
 *   </AppLayout>
 */
//import { useState } from 'react';
import { useState, useRef, useEffect } from 'react';
import logoLili from '../assets/LOGO_LILI.jpg';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { useCart } from '../hooks/useCart.jsx';

const C = {
  primary:'#476500', primary2:'#5d7f13',
  surface:'#fafaed', container:'#eeefe2',
  white:'#ffffff',   text:'#1a1c15',
  textMuted:'#747967', border:'#e2e3d6',
  orange:'#fc8f34',
};

// ── Icono genérico ────────────────────────────────────────────────────────────
export const Ic = ({ d, size = 18, stroke, fill = 'none', sw = 1.6 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}
       stroke={stroke || C.textMuted} strokeWidth={sw}
       strokeLinecap="round" strokeLinejoin="round">
    {(Array.isArray(d) ? d : [d]).map((p, i) => <path key={i} d={p}/>)}
  </svg>
);

export const IK = {
  dashboard:   ['M3 3h7v7H3z','M14 3h7v7h-7z','M14 14h7v7h-7z','M3 14h7v7H3z'],
  clientes:    ['M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2','M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z','M23 21v-2a4 4 0 0 0-3-3.87','M16 3.13a4 4 0 0 1 0 7.75'],
  productos:   ['M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z','M3.27 6.96L12 12.01l8.73-5.05','M12 22.08V12'],
  facturacion: ['M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z','M14 2v6h6','M16 13H8','M16 17H8','M10 9H8'],
  ventas:      ['M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z','M12 6v6l4 2'],
  empleados:   ['M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2','M9 7a4 4 0 1 0 0 8 4 4 0 0 0 0-8z','M22 21v-2a4 4 0 0 0-3-3.87'],
  usuarios:    ['M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2','M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z'],
  reportes:    ['M18 20V10','M12 20V4','M6 20v-6'],
  config:      ['M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z','M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-2.82 1.17V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-2.82-1.17l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z'],
  search:      ['M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0'],
  bell:        ['M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9','M13.73 21a2 2 0 0 1-3.46 0'],
  logout:      ['M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4','M16 17l5-5-5-5','M21 12H9'],
  heart:       ['M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z'],
  cart:        ['M3 3h2l.4 2M7 13h10l4-8H5.4','M7 13L5.4 5','M7 13l-1.7 4.6A1 1 0 0 0 6.25 19H19','M10 22a1 1 0 1 0 0-2 1 1 0 0 0 0 2z','M18 22a1 1 0 1 0 0-2 1 1 0 0 0 0 2z'],
};

const NAV_ITEMS = [
  { key:'dashboard',   label:'Inicio',    ik:'dashboard',   path:'/dashboard'   },
  { key:'clientes',    label:'Clientes',     ik:'clientes',    path:'/clientes'    },
  { key:'productos',   label:'Productos',    ik:'productos',   path:'/productos'   },
  { key:'carrito',     label:'Carrito',      ik:'cart',        path:'/carrito'     },
  //{ key:'facturacion', label:'Facturación',  ik:'facturacion', path:'/facturacion' },
  { key:'ventas',      label:'Ventas',       ik:'ventas',      path:'/ventas'      },
  { key:'empleados',   label:'Empleados',    ik:'empleados',   path:'/empleados'   },
  { key:'usuarios',    label:'Usuarios',     ik:'usuarios',    path:'/usuarios'    },
  //{ key:'reportes',    label:'Reportes',     ik:'reportes',    path:'/reportes'    },
  //{ key:'config',      label:'Configuración',ik:'config',      path:'/configuracion'},
];

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({ activeKey, onLogout }) {
  const navigate = useNavigate();

  return (
    <aside className="hidden lg:flex flex-col h-screen sticky top-0 flex-shrink-0"
           style={{ width:210, backgroundColor:C.white, borderRight:`1px solid ${C.border}` }}>

      {/* Marca */}
      <div className="flex flex-col items-center py-6 px-4"
           style={{ borderBottom:`1px solid ${C.border}` }}>
       <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
          <img
            src={logoLili}
            alt="Lili y su Sazón"
            className="w-full h-full object-cover" />
          </div>
        <p className="font-extrabold text-sm mt-3 text-center leading-tight" style={{ color:C.text }}>
          Lili y su Sazón
        </p>
        <p className="text-xs font-medium mt-0.5" style={{ color:C.textMuted }}>Cocinamos con amor</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 overflow-y-auto">
        {NAV_ITEMS.map(({ key, label, ik, path }) => {
          const on = activeKey === key;
          return (
            <button key={key} onClick={() => navigate(path)}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-left relative transition-colors duration-150"
              style={{ backgroundColor:on?'#eef3e4':'transparent', color:on?C.primary:C.textMuted }}
              onMouseEnter={e=>{ if(!on) e.currentTarget.style.backgroundColor=C.container; }}
              onMouseLeave={e=>{ if(!on) e.currentTarget.style.backgroundColor='transparent'; }}>
              {on && <div className="absolute right-0 top-1.5 bottom-1.5 w-1 rounded-l-full"
                          style={{ backgroundColor:C.primary }}/>}
              <Ic d={IK[ik]} size={17} stroke={on?C.primary:C.textMuted}/>
              <span className="text-sm font-semibold">{label}</span>
            </button>
          );
        })}
      </nav>

      {/* Config + Logout */}
      <div className="py-3 px-3 space-y-1" style={{ borderTop:`1px solid ${C.border}` }}>
        
        <button onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors"
          style={{ color:C.textMuted }}
          onMouseEnter={e=>{ e.currentTarget.style.backgroundColor='#fff0f0'; e.currentTarget.style.color='#ba1a1a'; }}
          onMouseLeave={e=>{ e.currentTarget.style.backgroundColor='transparent'; e.currentTarget.style.color=C.textMuted; }}>
          <Ic d={IK.logout} size={17} stroke="currentColor"/>
          <span className="text-sm font-semibold">Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}

// ── Topbar ────────────────────────────────────────────────────────────────────
function Topbar({ usuario, searchValue, onSearch, onLogout }) {
  const rolLabel = usuario?.rol || 'USUARIO';
  const inicial  = (usuario?.correo?.[0] || 'U').toUpperCase();
  const navigate = useNavigate();  
  const { totalUnidades } = useCart();
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef(null);

// Cerrar al hacer clic fuera
useEffect(() => {
  const handler = (e) => {
    if (dropRef.current && !dropRef.current.contains(e.target)) {
      setDropOpen(false);
    }
  };
  document.addEventListener('mousedown', handler);
  return () => document.removeEventListener('mousedown', handler);
}, []);

  return (
    <header className="sticky top-0 z-20 flex items-center gap-4 px-6"
            style={{ backgroundColor:C.white, borderBottom:`1px solid ${C.border}`, height:60 }}>
      <h1 className="font-bold text-sm flex-shrink-0 hidden sm:block" style={{ color:C.text }}>
        Lili y su Sazón Completa
      </h1>
      <div className="flex-1 max-w-md mx-auto relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <Ic d={IK.search} size={15} stroke={C.textMuted}/>
        </span>
        <input type="text" placeholder="Buscar..." value={searchValue} onChange={e=>onSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-lg text-sm outline-none transition-all"
          style={{ backgroundColor:C.container, color:C.text, border:'2px solid transparent', fontFamily:'Manrope,sans-serif' }}
          onFocus={e=>{ e.target.style.backgroundColor=C.white; e.target.style.border=`2px solid ${C.primary}`; }}
          onBlur={e=>{  e.target.style.backgroundColor=C.container; e.target.style.border='2px solid transparent'; }}/>
      </div>
      <div className="flex items-center gap-2.5 flex-shrink-0">
        <button onClick={() => navigate('/carrito')}
          className="relative p-2 rounded-lg transition-colors"
          style={{ backgroundColor:C.container }}
          title="Ir al carrito"
          onMouseEnter={e=>e.currentTarget.style.backgroundColor='#e2e3d6'}
          onMouseLeave={e=>e.currentTarget.style.backgroundColor=C.container}>
          <Ic d={IK.cart} size={17} stroke={C.text}/>
          {totalUnidades > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                  style={{ backgroundColor:C.orange }}>
              {totalUnidades > 99 ? '99+' : totalUnidades}
            </span>
          )}
        </button>
        <button className="relative p-2 rounded-lg" style={{ backgroundColor:C.container }}>
          <Ic d={IK.bell} size={17} stroke={C.textMuted}/>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ backgroundColor:C.orange }}/>
        </button>
        <span className="text-xs font-bold hidden md:block" style={{ color:C.textMuted }}>
  {rolLabel}
</span>

{/* Avatar con dropdown */}
<div className="relative" ref={dropRef}>
  <button
    onClick={() => setDropOpen(p => !p)}
    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white transition-all"
    style={{ background: `linear-gradient(135deg,${C.primary},${C.primary2})`,
             boxShadow: dropOpen ? `0 0 0 3px ${C.primary}40` : 'none' }}>
    {inicial}
  </button>

  {/* Menú desplegable */}
  {dropOpen && (
    <div
      className="absolute right-0 top-10 w-52 rounded-2xl overflow-hidden z-50"
      style={{ backgroundColor: C.white,
               boxShadow: '0 12px 32px rgba(26,28,21,0.15)',
               border: `1px solid ${C.border}` }}>

      {/* Cabecera con info del usuario */}
      <div className="px-4 py-3" style={{ borderBottom: `1px solid ${C.border}` }}>
        <p className="text-xs font-bold truncate" style={{ color: C.text }}>
          {usuario?.correo}
        </p>
        <p className="text-xs font-medium mt-0.5" style={{ color: C.muted }}>
          {rolLabel}
        </p>
      </div>

      {/* Opción: Ver cuenta */}
      <button
        onClick={() => { setDropOpen(false); navigate('/mi-cuenta'); }}
        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-colors text-left"
        style={{ color: C.sub }}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = C.container}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
        Ver mi cuenta
      </button>

      {/* Separador */}
      <div style={{ height: 1, backgroundColor: C.border }}/>

      {/* Opción: Cerrar sesión */}
      <button
        onClick={() => { setDropOpen(false); onLogout(); }}
        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-colors text-left"
        style={{ color: '#ba1a1a' }}
        onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#fff0f0'; }}
        onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        Cerrar sesión
      </button>
    </div>
  )}
</div>
      </div>
    </header>
  );
}

// ── AppLayout ─────────────────────────────────────────────────────────────────
export default function AppLayout({ children, activeKey = 'dashboard', searchValue = '', onSearch = () => {} }) {
  const { usuario, logout } = useAuth();
  const navigate            = useNavigate();

  const handleLogout = async () => { await logout(); navigate('/login', { replace:true }); };

  return (
    <div className="flex h-screen overflow-hidden"
         style={{ backgroundColor:C.surface, fontFamily:'Manrope,sans-serif' }}>
      <Sidebar activeKey={activeKey} onLogout={handleLogout}/>
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Topbar usuario={usuario} searchValue={searchValue} onSearch={onSearch} onLogout={handleLogout}/>
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
