/**
 * @fileoverview Layout compartido — Sidebar + Topbar (responsive móvil/desktop)
 */
import { useState, useRef, useEffect } from 'react';
import logoLili from '../assets/LOGO_LILI.jpg';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { useCart } from '../hooks/useCart.jsx';

const C = {
  primary:'#476500', primary2:'#5d7f13',
  surface:'#fafaed', container:'#eeefe2',
  white:'#ffffff',   text:'#1a1c15',
  textMuted:'#747967', border:'#e2e3d6',
  orange:'#fc8f34',
};

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
  ventas:      ['M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z','M12 6v6l4 2'],
  empleados:   ['M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2','M9 7a4 4 0 1 0 0 8 4 4 0 0 0 0-8z','M22 21v-2a4 4 0 0 0-3-3.87'],
  usuarios:    ['M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2','M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z'],
  search:      ['M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0'],
  bell:        ['M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9','M13.73 21a2 2 0 0 1-3.46 0'],
  logout:      ['M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4','M16 17l5-5-5-5','M21 12H9'],
  cart:        ['M3 3h2l.4 2M7 13h10l4-8H5.4','M7 13L5.4 5','M7 13l-1.7 4.6A1 1 0 0 0 6.25 19H19','M10 22a1 1 0 1 0 0-2 1 1 0 0 0 0 2z','M18 22a1 1 0 1 0 0-2 1 1 0 0 0 0 2z'],
  carta: ['M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z','M14 2v6h6','M12 17v-6','M9.5 14.5L12 17l2.5-2.5'],
  portafolio: ['M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z','M16 3H8a2 2 0 0 0-2 2v2h12V5a2 2 0 0 0-2-2z','M12 12h.01'],
  proveedores: ['M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z','M9 22V12h6v10'],
  compras: ['M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z','M3 6h18','M16 10a4 4 0 0 1-8 0'],
  menu:        ['M3 6h18','M3 12h18','M3 18h18'],
  close:       ['M18 6 6 18','M6 6l12 12'],
};

const NAV_ITEMS = [
  { key:'dashboard', label:'Inicio',    ik:'dashboard', path:'/dashboard' },
  { key:'clientes',  label:'Clientes',  ik:'clientes',  path:'/clientes'  },
  { key:'productos', label:'Productos', ik:'productos', path:'/productos' },
  { key:'carrito',   label:'Carrito',   ik:'cart',      path:'/carrito'   },
  { key:'carta',     label:'Descargar Carta Clientes', ik:'carta', path:'/carta' },
  { key:'portafolio', label:'Portafolio Empresarial', ik:'portafolio', path:'/portafolio' },
  { key:'ventas',    label:'Ventas',    ik:'ventas',    path:'/ventas'    },
  { key:'compras', label:'Compras', ik:'compras', path:'/compras' },
  { key:'empleados', label:'Empleados', ik:'empleados', path:'/empleados' },
  { key:'usuarios',  label:'Usuarios',  ik:'usuarios',  path:'/usuarios'  },
  { key:'proveedores', label:'Proveedores', ik:'proveedores', path:'/proveedores' },
  
];

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({ activeKey, onLogout, isOpen, onClose, usuario }) {
  // Roles que no deben ver ciertos módulos
  const OCULTOS_PARA = {
    vendedor: ['ventas', 'empleados', 'usuarios'],
    // El rol 'operario' no debe ver: proveedores, compras, usuarios y ventas
    operario: ['proveedores', 'compras', 'usuarios', 'ventas', 'empleados'],
  };
  const rol = (usuario?.rol || '').toLowerCase();
  const itemsVisibles = NAV_ITEMS.filter(i => !(OCULTOS_PARA[rol] || []).includes(i.key));
  const navigate = useNavigate();

  const handleNav = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <aside
    style={{
  width: 210,
  backgroundColor: C.white,
  borderRight: `1px solid ${C.border}`,
  position: 'fixed',
  top: 0, left: 0,
  height: '100vh',
  zIndex: 30,
  transform: isOpen ? 'translateX(0)' : 'translateX(-210px)',
  transition: 'transform 0.3s ease',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',   // ← AGREGAR ESTA LÍNEA
}}>

      {/* Logo + cerrar */}
      <div style={{ borderBottom: `1px solid ${C.border}`, padding: '24px 16px', position: 'relative' }}>
        <button onClick={onClose}
  className="lg:hidden"
  style={{ position:'absolute', top:8, right:8, padding:6, borderRadius:8,
           backgroundColor:'rgba(0,0,0,0.08)', border:'none', cursor:'pointer',
           lineHeight:0, zIndex:10 }}>
  <Ic d={IK.close} size={16} stroke={C.text}/>
</button>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
          <div style={{ width:40, height:40, borderRadius:12, overflow:'hidden' }}>
            <img src={logoLili} alt="Logo" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
          </div>
          <p style={{ fontWeight:800, fontSize:14, marginTop:12, color:C.text, textAlign:'center' }}>Lili y su Sazón</p>
          <p style={{ fontSize:12, color:C.textMuted, marginTop:2 }}>Cocinamos con amor</p>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex:1, overflowY:'auto', padding:'12px 0' }}>
        {itemsVisibles.map(({ key, label, ik, path, roles }) => {
          const on = activeKey === key;
          if (roles && !roles.includes(rol)) return null;
          return (
            <button key={key} onClick={() => handleNav(path)}
              style={{
                width:'100%', display:'flex', alignItems:'center', gap:12,
                padding:'10px 16px', textAlign:'left', border:'none', cursor:'pointer',
                backgroundColor: on ? '#eef3e4' : 'transparent',
                color: on ? C.primary : C.textMuted,
                position:'relative', transition:'background 0.15s',
                fontFamily:'Manrope,sans-serif', fontSize:14, fontWeight:600,
              }}
              onMouseEnter={e => { if(!on) e.currentTarget.style.backgroundColor = C.container; }}
              onMouseLeave={e => { if(!on) e.currentTarget.style.backgroundColor = 'transparent'; }}>
              {on && <div style={{ position:'absolute', right:0, top:6, bottom:6, width:4,
                                   borderRadius:'4px 0 0 4px', backgroundColor:C.primary }}/>}
              <Ic d={IK[ik]} size={17} stroke={on ? C.primary : C.textMuted}/>
              {label}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding:'12px', borderTop:`1px solid ${C.border}` }}>
        <button onClick={() => { onLogout(); onClose(); }}
          style={{
            width:'100%', display:'flex', alignItems:'center', gap:12,
            padding:'8px 12px', borderRadius:8, border:'none', cursor:'pointer',
            backgroundColor:'transparent', color:C.textMuted,
            fontFamily:'Manrope,sans-serif', fontSize:14, fontWeight:600,
          }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor='#fff0f0'; e.currentTarget.style.color='#ba1a1a'; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor='transparent'; e.currentTarget.style.color=C.textMuted; }}>
          <Ic d={IK.logout} size={17} stroke="currentColor"/>
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}

// ── Topbar ────────────────────────────────────────────────────────────────────
function Topbar({ usuario, searchValue, onSearch, onLogout, onMenuToggle }) {
  const rolLabel    = usuario?.rol || 'USUARIO';
  const nombreLabel = usuario?.empleado_nombre
    ? usuario.empleado_nombre.split(' ').slice(0, 2).join(' ')
    : (usuario?.correo?.split('@')[0] || 'Usuario');
  const inicial     = (nombreLabel[0] || 'U').toUpperCase();
  const navigate = useNavigate();
  const { totalUnidades } = useCart();
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target))
        setDropOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 px-4"
            style={{ backgroundColor:C.white, borderBottom:`1px solid ${C.border}`, height:60 }}>

      {/* Hamburguesa */}
      <button onClick={onMenuToggle}
        className="p-2 rounded-xl flex-shrink-0 transition-colors"
        style={{ backgroundColor:C.container, border:'none', cursor:'pointer', lineHeight:0 }}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = C.border}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = C.container}>
        <Ic d={IK.menu} size={20} stroke={C.text}/>
      </button>

      {/* Título */}
      <h1 className="font-bold text-sm flex-shrink-0 hidden sm:block" style={{ color:C.text }}>
        Lili y su Sazón Completa
      </h1>

      {/* Buscador */}
      <div className="flex-1 max-w-md mx-auto relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <Ic d={IK.search} size={15} stroke={C.textMuted}/>
        </span>
        <input type="text" placeholder="Buscar..." value={searchValue}
          onChange={e => onSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-lg text-sm outline-none transition-all"
          style={{ backgroundColor:C.container, color:C.text, border:'2px solid transparent', fontFamily:'Manrope,sans-serif' }}
          onFocus={e => { e.target.style.backgroundColor=C.white; e.target.style.border=`2px solid ${C.primary}`; }}
          onBlur={e  => { e.target.style.backgroundColor=C.container; e.target.style.border='2px solid transparent'; }}/>
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-2 flex-shrink-0">

        {/* Carrito */}
        <button onClick={() => navigate('/carrito')}
          className="relative p-2 rounded-lg transition-colors"
          style={{ backgroundColor:C.container }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor='#e2e3d6'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor=C.container}>
          <Ic d={IK.cart} size={17} stroke={C.text}/>
          {totalUnidades > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                  style={{ backgroundColor:C.orange }}>
              {totalUnidades > 99 ? '99+' : totalUnidades}
            </span>
          )}
        </button>

        {/* Campana */}
        <button className="relative p-2 rounded-lg" style={{ backgroundColor:C.container }}>
          <Ic d={IK.bell} size={17} stroke={C.textMuted}/>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ backgroundColor:C.orange }}/>
        </button>

        {/* Nombre usuario */}
        <span className="text-xs font-bold hidden md:block" style={{ color:C.textMuted }}>{nombreLabel}</span>

        {/* Avatar + dropdown */}
        <div className="relative" ref={dropRef}>
          <button onClick={() => setDropOpen(p => !p)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
            style={{ background:`linear-gradient(135deg,${C.primary},${C.primary2})`,
                     boxShadow: dropOpen ? `0 0 0 3px ${C.primary}40` : 'none' }}>
            {inicial}
          </button>

          {dropOpen && (
            <div className="absolute right-0 top-10 w-52 rounded-2xl overflow-hidden z-50"
                 style={{ backgroundColor:C.white, border:`1px solid ${C.border}`,
                          boxShadow:'0 12px 32px rgba(26,28,21,0.15)' }}>
              <div className="px-4 py-3" style={{ borderBottom:`1px solid ${C.border}` }}>
                <p className="text-sm font-bold truncate" style={{ color:C.text }}>{nombreLabel}</p>
                <p className="text-xs font-medium mt-0.5 truncate" style={{ color:C.textMuted }}>{usuario?.correo}</p>
                <p className="text-xs font-medium mt-0.5" style={{ color:C.textMuted }}>{rolLabel}</p>
              </div>
              <button onClick={() => { setDropOpen(false); navigate('/mi-cuenta'); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-colors text-left"
                style={{ color:C.text }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor=C.container}
                onMouseLeave={e => e.currentTarget.style.backgroundColor='transparent'}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
                Ver mi cuenta
              </button>
              <div style={{ height:1, backgroundColor:C.border }}/>
              <button onClick={() => { setDropOpen(false); onLogout(); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-colors text-left"
                style={{ color:'#ba1a1a' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor='#fff0f0'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor='transparent'}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // En desktop (≥1024px) el sidebar siempre está visible
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setSidebarOpen(true);
      else setSidebarOpen(false);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => { await logout(); navigate('/login', { replace:true }); };
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden',
                  backgroundColor:C.surface, fontFamily:'Manrope,sans-serif' }}>

      {/* Overlay — solo móvil */}
      {sidebarOpen && window.innerWidth < 1024 && (
        <div
          style={{ position:'fixed', inset:0, zIndex:20, backgroundColor:'rgba(26,28,21,0.55)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
      usuario={usuario}  
        activeKey={activeKey}
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        onClose={closeSidebar}
      />

      {/* Área principal — margen izquierdo en desktop para el sidebar sticky */}
      <div style={{
        flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minWidth:0,
        marginLeft: sidebarOpen && window.innerWidth >= 1024 ? 210 : 0,
        transition: 'margin-left 0.3s ease',
      }}>
        <Topbar
          usuario={usuario}
          searchValue={searchValue}
          onSearch={onSearch}
          onLogout={handleLogout}
          onMenuToggle={() => setSidebarOpen(p => !p)}
        />
        <main style={{ flex:1, overflowY:'auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
