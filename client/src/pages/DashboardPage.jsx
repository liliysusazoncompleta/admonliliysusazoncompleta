/**
 * @fileoverview Dashboard Principal — Lili y su Sazón Completa
 * @module client/src/pages/DashboardPage
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import logoLili from '../assets/LOGO_LILI.jpg';
import imgMenu from '../assets/LiLicocina.png';
//import AppLayout, { Ic, IK } from '../components/AppLayout.jsx'; inicialmente esta linea
import AppLayout from '../components/AppLayout.jsx'; //nueva linea


// ── Paleta ────────────────────────────────────────────────────────────────────
const C = {
  primary:     '#476500',
  primary2:    '#5d7f13',
  surface:     '#fafaed',
  container:   '#eeefe2',
  white:       '#ffffff',
  text:        '#1a1c15',
  textMuted:   '#747967',
  textSub:     '#444939',
  orange:      '#944a00',
  orangeLight: '#fc8f34',
  border:      '#e2e3d6',
};

// ── Icono SVG genérico ────────────────────────────────────────────────────────
const Ic = ({ d, size = 20, stroke, fill = 'none', sw = 1.6 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}
       stroke={stroke || C.textMuted} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    {(Array.isArray(d) ? d : [d]).map((p, i) => <path key={i} d={p}/>)}
  </svg>
);

// ── Rutas de iconos ───────────────────────────────────────────────────────────
const IK = {
  dashboard:     ['M3 3h7v7H3z','M14 3h7v7h-7z','M14 14h7v7h-7z','M3 14h7v7H3z'],
  clientes:      ['M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2','M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z','M23 21v-2a4 4 0 0 0-3-3.87','M16 3.13a4 4 0 0 1 0 7.75'],
  productos:     ['M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z','M3.27 6.96L12 12.01l8.73-5.05','M12 22.08V12'],
  facturacion:   ['M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z','M14 2v6h6','M16 13H8','M16 17H8','M10 9H8'],
  cart:          ['M3 3h2l.4 2M7 13h10l4-8H5.4','M7 13L5.4 5','M7 13l-1.7 4.6A1 1 0 0 0 6.25 19H19','M10 22a1 1 0 1 0 0-2 1 1 0 0 0 0 2z','M18 22a1 1 0 1 0 0-2 1 1 0 0 0 0 2z'],
  ventas:        ['M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z','M12 6v6l4 2'],
  empleados:     ['M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2','M9 7a4 4 0 1 0 0 8 4 4 0 0 0 0-8z','M19 8a3 3 0 0 1 0 6','M22 21v-2a4 4 0 0 0-3-3.87'],
  usuarios:      ['M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2','M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z'],
  reportes:      ['M18 20V10','M12 20V4','M6 20v-6'],
  config:        ['M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z','M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z'],
  search:        ['M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0'],
  bell:          ['M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9','M13.73 21a2 2 0 0 1-3.46 0'],
  logout:        ['M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4','M16 17l5-5-5-5','M21 12H9'],
  arrow:         ['M5 12h14','M12 5l7 7-7 7'],
  heart:         ['M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z'],
  menu:          ['M3 12h18','M3 6h18','M3 18h18'],
};

// ── Menú de navegación ────────────────────────────────────────────────────────
const NAV = [
  { key: 'dashboard',   label: 'Dashboard',     ik: 'dashboard'   },
  { key: 'clientes',    label: 'Clientes',       ik: 'clientes'    },
  { key: 'productos',   label: 'Productos',      ik: 'productos'   },
  { key: 'facturacion', label: 'Facturación',    ik: 'facturacion' },
  { key: 'ventas',      label: 'Ventas',         ik: 'ventas'      },
  { key: 'empleados',   label: 'Empleados',      ik: 'empleados'   },
  { key: 'usuarios',    label: 'Usuarios',       ik: 'usuarios'    },
  { key: 'reportes',    label: 'Reportes',       ik: 'reportes'    },
  { key: 'config',      label: 'Configuración',  ik: 'config'      },
];

// ══════════════════════════════════════════════════════════════════════════════
// SIDEBAR
// ══════════════════════════════════════════════════════════════════════════════
function Sidebar({ active, onNav, onLogout }) {
  return (
    <aside className="hidden lg:flex flex-col h-screen sticky top-0 flex-shrink-0"
           style={{ width: 210, backgroundColor: C.white, borderRight: `1px solid ${C.border}` }}>

      {/* Marca */}
      <div className="flex flex-col items-center py-6 px-4"
           style={{ borderBottom: `1px solid ${C.border}` }}>
            <div className="w-10 h-10 rounded-xl overflow-hidden">
            <img src={logoLili} alt="Logo" className="w-full h-full object-cover"/>
      </div> 
        <p className="font-extrabold text-sm mt-3 text-center leading-tight" style={{ color: C.text }}>
          Lili y su Sazón
        </p>
        <p className="text-xs font-medium mt-0.5" style={{ color: C.textMuted }}>Cocinamos con amor</p>
      </div>

      {/* Navegación */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {NAV.map(({ key, label, ik }) => {
          const on = active === key;
          return (
            <button key={key} onClick={() => onNav(key)}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-left relative transition-colors duration-150"
              style={{ backgroundColor: on ? '#eef3e4' : 'transparent', color: on ? C.primary : C.textMuted }}
              onMouseEnter={(e) => { if (!on) e.currentTarget.style.backgroundColor = C.container; }}
              onMouseLeave={(e) => { if (!on) e.currentTarget.style.backgroundColor = 'transparent'; }}>
              {on && <div className="absolute right-0 top-1.5 bottom-1.5 w-1 rounded-l-full"
                          style={{ backgroundColor: C.primary }}/>}
              <Ic d={IK[ik]} size={17} stroke={on ? C.primary : C.textMuted}/>
              <span className="text-sm font-semibold">{label}</span>
            </button>
          );
        })}
      </nav>

      {/* Cerrar sesión */}
      <div className="py-4 px-3" style={{ borderTop: `1px solid ${C.border}` }}>
        <button onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-150"
          style={{ color: C.textMuted }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor='#fff0f0'; e.currentTarget.style.color='#ba1a1a'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor='transparent'; e.currentTarget.style.color=C.textMuted; }}>
          <Ic d={IK.logout} size={17} stroke="currentColor"/>
          <span className="text-sm font-semibold">Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TOPBAR
// ══════════════════════════════════════════════════════════════════════════════
function Topbar({ usuario }) {
  const [q, setQ] = useState('');
  const rolLabel  = usuario?.rol || 'USUARIO';
  const inicial   = (usuario?.correo?.[0] || 'U').toUpperCase();

  return (
    <header className="sticky top-0 z-20 flex items-center gap-4 px-6"
            style={{ backgroundColor: C.white, borderBottom: `1px solid ${C.border}`, height: 60 }}>

      <h1 className="font-bold text-sm flex-shrink-0 hidden sm:block" style={{ color: C.text }}>
        Lili y su Sazón Completa
      </h1>

      {/* Buscador */}
      <div className="flex-1 max-w-md mx-auto relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <Ic d={IK.search} size={15} stroke={C.textMuted}/>
        </span>
        <input type="text" placeholder="Buscar..." value={q} onChange={e=>setQ(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-lg text-sm outline-none transition-all"
          style={{ backgroundColor: C.container, color: C.text, border:'2px solid transparent', fontFamily:'Manrope,sans-serif' }}
          onFocus={e=>{e.target.style.backgroundColor=C.white;e.target.style.border=`2px solid ${C.primary}`;}}
          onBlur={e=>{e.target.style.backgroundColor=C.container;e.target.style.border='2px solid transparent';}}/>
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-2.5 flex-shrink-0">
        <button className="relative p-2 rounded-lg" style={{ backgroundColor: C.container }}>
          <Ic d={IK.bell} size={17} stroke={C.textMuted}/>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                style={{ backgroundColor: C.orangeLight }}/>
        </button>
        <span className="text-xs font-bold hidden md:block" style={{ color: C.textMuted }}>
          {rolLabel}
        </span>
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
             style={{ background: `linear-gradient(135deg,${C.primary},${C.primary2})` }}>
          {inicial}
        </div>
      </div>
    </header>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MÓDULOS
// ══════════════════════════════════════════════════════════════════════════════
const MODS = [
  {
    key:'productos', title:'Productos', ik:'productos', color:C.primary, bg:'#eef3e4', hi:false, cta:'Acceder',
    desc:'Crea, edita y organiza el catálogo de platillos. Controla códigos, tipos, presentaciones, precios e imágenes de cada producto.',
  },
  {
    key:'clientes', title:'Clientes', ik:'clientes', color:C.primary, bg:'#eef3e4', hi:false, cta:'Acceder',
    desc:'Registra y gestiona el directorio de clientes. Consulta datos de contacto, historial de pedidos y preferencias de cada cliente.',
  },
  {
    key:'carrito', title:'Carrito', ik:'cart', color:C.primary, bg:'#eef3e4', hi:false, cta:'Acceder',
    desc:'Agrega productos al carrito, ajusta cantidades, genera cotizaciones en PDF y envíalas por WhatsApp a tus clientes.',
  },
  {
    key:'ventas', title:'Ventas', ik:'ventas', color:C.orange, bg:'#fff3eb', hi:true, cta:'Nuevo Pedido',
    desc:'Registra nuevos pedidos, consulta el historial de ventas, filtra por fecha y vendedor, y cambia el estado de cada entrega.',
  },
];

function ModCard({ mod, onNav }) {
  return (
    <div onClick={() => onNav(mod.key)} className="rounded-2xl p-5 flex flex-col gap-3 cursor-pointer transition-all duration-200"
         style={{ backgroundColor: C.white, border: `1px solid ${C.border}`, boxShadow:'0 2px 8px rgba(26,28,21,0.05)' }}
         onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(26,28,21,0.10)';}}
         onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='0 2px 8px rgba(26,28,21,0.05)';}}>
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
             style={{ backgroundColor: mod.bg }}>
          <Ic d={IK[mod.ik]} size={19} stroke={mod.color}/>
        </div>
        <div className="w-10 h-10 rounded-full opacity-[0.08]" style={{ backgroundColor: mod.color }}/>
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-sm" style={{ color: C.text }}>{mod.title}</h3>
        <p className="text-xs mt-1 leading-relaxed" style={{ color: C.textMuted }}>{mod.desc}</p>
      </div>
      <button className="flex items-center gap-1.5 text-xs font-bold transition-opacity hover:opacity-70"
              style={{ color: mod.hi ? C.orange : C.primary }}>
        {mod.cta}
        {mod.hi
          ? <span className="w-4 h-4 rounded-full border-2 flex items-center justify-center text-xs leading-none"
                  style={{ borderColor: C.orange }}>+</span>
          : <Ic d={IK.arrow} size={14} stroke={C.primary}/>}
      </button>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// RESUMEN DEL DÍA
// ══════════════════════════════════════════════════════════════════════════════
function ResumenHoy() {
  const items = [
    { label:'Pedidos Nuevos', val:8,            color:C.text    },
    { label:'En Preparación', val:4,             color:C.orange  },
    { label:'Completados',    val:12,            color:C.primary },
    { label:'Ingresos Est.',  val:'$4,250.00',  color:C.text    },
  ];
  return (
    <div className="rounded-2xl p-6 h-full" style={{ backgroundColor: C.white, border:`1px solid ${C.border}` }}>
      <h3 className="font-bold text-sm mb-5" style={{ color: C.text }}>Resumen de Hoy</h3>
      <div className="space-y-4">
        {items.map(({ label, val, color }) => (
          <div key={label} className="flex items-center justify-between">
            <span className="text-sm font-medium" style={{ color: C.textMuted }}>{label}</span>
            <span className="text-sm font-extrabold" style={{ color }}>{val}</span>
          </div>
        ))}
      </div>
      <div className="mt-5 pt-5" style={{ borderTop: `1px solid ${C.border}` }}>
        <div className="flex justify-between mb-2">
          <span className="text-xs font-medium" style={{ color: C.textMuted }}>Eficiencia del día</span>
          <span className="text-xs font-bold" style={{ color: C.primary }}>75%</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: C.container }}>
          <div className="h-full rounded-full" style={{ width:'75%', background:`linear-gradient(90deg,${C.primary},${C.primary2})` }}/>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MENÚ ESPECIAL DEL DÍA
// ══════════════════════════════════════════════════════════════════════════════
function MenuEspecial() {
  return (
    <div className="rounded-2xl overflow-hidden relative" style={{ minHeight: 400 }}>
      <img src={imgMenu}
           alt="LiLicocina.png" className="absolute inset-0 w-full h-full object-cover"/>
     
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PÁGINA PRINCIPAL
// ══════════════════════════════════════════════════════════════════════════════
export default function DashboardPage() {
  const { usuario } = useAuth();
  const navigate    = useNavigate();
  const [search, setSearch] = useState('');
  const [tiposProducto, setTiposProducto] = useState([]);
  const obtenerTiposProducto = async () => {

  try {

    const response = await fetch(
      'http://localhost:3001/api/tipo-producto'
    );

    const data = await response.json();

    setTiposProducto(data);

  } catch (error) {

    console.error(
      'Error cargando tipos de producto',
      error
    );
  }
};
useEffect(() => {
  obtenerTiposProducto();
}, []);

  const fechaHoy = new Date().toLocaleDateString('es-CO', {
    weekday:'long', year:'numeric', month:'long', day:'numeric'
  });

  return (
    <AppLayout activeKey="dashboard" searchValue={search} onSearch={setSearch}>
      <div className="p-5 md:p-6 space-y-5">

          {/* Banner bienvenida */}
          <div className="rounded-2xl p-5 md:p-6 flex flex-col sm:flex-row sm:items-center gap-4"
               style={{ backgroundColor: C.white, border:`1px solid ${C.border}` }}>
            <div className="flex-1">
              <h2 className="font-extrabold text-xl md:text-2xl" style={{ color: C.text, letterSpacing:'-0.02em' }}>
                Bienvenido al sistema
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed max-w-lg" style={{ color: C.textMuted }}>
                Gestione pedidos, inventario y clientes desde un solo lugar.
                Usa los módulos principales para acceder rápidamente a las funciones más usadas del sistema.
              </p>
              <div className="flex items-center gap-4 mt-4 flex-wrap">
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold tracking-wider uppercase"
                        style={{ backgroundColor: C.primary, color: C.white, boxShadow:`0 4px 12px rgba(71,101,0,0.3)` }}
                        onMouseEnter={e=>{e.currentTarget.style.backgroundColor=C.primary2;}}
                        onMouseLeave={e=>{e.currentTarget.style.backgroundColor=C.primary;}}>
                  ✦ Resumen del día
                </button>
                <span className="text-sm font-medium" style={{ color: C.textMuted }}>
                  Hoy: <strong style={{ color: C.text }}>12 pedidos pendientes</strong>
                </span>
              </div>
            </div>
            <div className="text-right hidden md:block flex-shrink-0">
              <p className="text-xs font-medium capitalize" style={{ color: C.textMuted }}>{fechaHoy}</p>
              <p className="text-xs mt-1 font-bold" style={{ color: C.primary }}>
                {usuario?.rol} — {usuario?.correo?.split('@')[0]}
              </p>
            </div>
          </div>

          {/* Módulos Principales */}
          <section>
            <h3 className="font-bold text-sm mb-3" style={{ color: C.text }}>Módulos Principales</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {MODS.map(mod => <ModCard key={mod.key} mod={mod} onNav={(key) => navigate(`/${key}`)}/>)}
            </div>
          </section>

          {/* Menú especial + Resumen */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2"><MenuEspecial/></div>
            <div><ResumenHoy/></div>
          </section>

          {/* Footer */}
          <footer className="text-center py-5">
            <Ic d={IK.heart} size={18} fill="#fca5a5" stroke="#ef4444" sw={1.5}/>
            <p className="text-sm font-semibold italic mt-2" style={{ color: C.textMuted }}>
              "Cocinamos con amor para tu familia"
            </p>
            <p className="text-xs mt-1" style={{ color: C.border }}>
              Lili y su Sazón Completa © {new Date().getFullYear()}
            </p>
          </footer>

      </div>
    </AppLayout>
  );
}
