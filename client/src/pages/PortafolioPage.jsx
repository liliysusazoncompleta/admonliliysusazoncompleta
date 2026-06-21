/**
 * @fileoverview Portafolio Empresarial — Descarga en PDF
 * Diseño elegante con portada, quiénes somos, productos por categoría
 * y página de contacto/redes sociales.
 */
import { useState, useEffect, useRef } from 'react';
import { jsPDF }   from 'jspdf';
import html2canvas  from 'html2canvas';
import AppLayout    from '../components/AppLayout.jsx';
import logoLili     from '../assets/LOGO_LILI.jpg';
import api          from '../lib/api.js';

/* ── Paleta elegante ─────────────────────────────────────────── */
const P = {
  darkGreen:   '#1B3A0F',
  midGreen:    '#2C5418',
  lightGreen:  '#476500',
  gold:        '#C8973A',
  goldLight:   '#E8C06A',
  cream:       '#FAFAF2',
  creamDark:   '#F0EDE0',
  white:       '#FFFFFF',
  text:        '#1A1A0E',
  textLight:   '#4A4A3A',
  textMuted:   '#7A7A6A',
  border:      '#D4C9A0',
  rowAlt:      '#F5F2E8',
  red:         '#8B1A1A',
};

/* ── Dimensiones carta 780px ─────────────────────────────────── */
const PW  = 780;
const PH  = Math.round(PW * 279 / 216); // ~1008px

const fmtP = v => `$${Number(v).toLocaleString('es-CO', { minimumFractionDigits: 0 })}`;

/* ── Línea decorativa dorada ─────────────────────────────────── */
const LineaOro = ({ mt = 12, mb = 12 }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: `${mt}px 0 ${mb}px` }}>
    <div style={{ flex: 1, height: 1, backgroundColor: P.gold, opacity: 0.4 }}/>
    <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: P.gold }}/>
    <div style={{ flex: 1, height: 1, backgroundColor: P.gold, opacity: 0.4 }}/>
  </div>
);

/* ══════════════════════════════════════════════════════════════
   PÁGINA 1 — PORTADA
══════════════════════════════════════════════════════════════ */
function Portada() {
  return (
    <div style={{
      width: PW, height: PH, position: 'relative', overflow: 'hidden',
      background: `linear-gradient(160deg, ${P.darkGreen} 0%, ${P.midGreen} 50%, ${P.darkGreen} 100%)`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Georgia, serif',
    }}>
      {/* Patrón decorativo top */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 6,
                    background: `linear-gradient(90deg, ${P.gold}, ${P.goldLight}, ${P.gold})` }}/>
      {/* Patrón decorativo bottom */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 6,
                    background: `linear-gradient(90deg, ${P.gold}, ${P.goldLight}, ${P.gold})` }}/>

      {/* Círculo decorativo de fondo */}
      <div style={{
        position: 'absolute', width: 600, height: 600, borderRadius: '50%',
        border: `1px solid rgba(200,151,58,0.15)`,
        top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
      }}/>
      <div style={{
        position: 'absolute', width: 480, height: 480, borderRadius: '50%',
        border: `1px solid rgba(200,151,58,0.12)`,
        top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
      }}/>

      {/* Contenido central */}
      <div style={{ textAlign: 'center', zIndex: 1, padding: '0 60px' }}>

        {/* Eyebrow */}
        <p style={{ color: P.gold, fontSize: 11, letterSpacing: 6, margin: '0 0 24px',
                    fontFamily: 'Arial, sans-serif', fontWeight: 400, textTransform: 'uppercase' }}>
          S A B O R &nbsp;&nbsp; D E &nbsp;&nbsp; F A M I L I A
        </p>

        {/* Logo */}
        <div style={{
          width: 160, height: 160, borderRadius: '50%', margin: '0 auto 28px',
          border: `3px solid ${P.gold}`, padding: 4, backgroundColor: 'rgba(200,151,58,0.1)',
        }}>
          <img src={logoLili} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}/>
        </div>

        {/* Nombre empresa */}
        <h1 style={{ color: P.white, fontSize: 38, margin: '0 0 8px', fontWeight: 700,
                     letterSpacing: 2, lineHeight: 1.2 }}>
          Lili y su Sazón
        </h1>
        <h2 style={{ color: P.goldLight, fontSize: 24, margin: '0 0 28px', fontWeight: 400,
                     fontStyle: 'italic', letterSpacing: 1 }}>
          Completa
        </h2>

        {/* Divisor */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '0 auto 28px', width: 260 }}>
          <div style={{ flex: 1, height: 1, backgroundColor: P.gold, opacity: 0.6 }}/>
          <div style={{ fontSize: 14, color: P.gold }}>✦</div>
          <div style={{ flex: 1, height: 1, backgroundColor: P.gold, opacity: 0.6 }}/>
        </div>

        {/* Tagline */}
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, letterSpacing: 3,
                    fontFamily: 'Arial, sans-serif', textTransform: 'uppercase',
                    margin: '0 0 40px', lineHeight: 1.8 }}>
          Catering · Eventos · Alimentación Empresarial
        </p>

        {/* Año */}
        <div style={{
          display: 'inline-block', border: `1px solid rgba(200,151,58,0.4)`,
          padding: '8px 28px', borderRadius: 2,
        }}>
          <p style={{ color: P.gold, fontSize: 12, margin: 0, letterSpacing: 3,
                      fontFamily: 'Arial, sans-serif' }}>
            PORTAFOLIO DE SERVICIOS
          </p>
        </div>
      </div>

      {/* Footer portada */}
      <div style={{ position: 'absolute', bottom: 24, textAlign: 'center', width: '100%' }}>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, letterSpacing: 2,
                    fontFamily: 'Arial, sans-serif', margin: 0 }}>
          MEDELLÍN · ANTIOQUIA · COLOMBIA
        </p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   PÁGINA 2 — QUIÉNES SOMOS
══════════════════════════════════════════════════════════════ */
function QuienesSomos() {
  return (
    <div style={{
      width: PW, minHeight: PH, backgroundColor: P.cream,
      fontFamily: 'Georgia, serif', position: 'relative', boxSizing: 'border-box',
    }}>
      {/* Header verde */}
      <div style={{
        background: `linear-gradient(135deg, ${P.darkGreen}, ${P.midGreen})`,
        padding: '32px 48px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 4, height: 40, backgroundColor: P.gold, borderRadius: 2 }}/>
          <div>
            <p style={{ color: P.gold, fontSize: 10, letterSpacing: 4, margin: '0 0 4px',
                        fontFamily: 'Arial, sans-serif', textTransform: 'uppercase' }}>
              NUESTRA EMPRESA
            </p>
            <h2 style={{ color: P.white, fontSize: 28, margin: 0, fontWeight: 700 }}>
              Quiénes Somos
            </h2>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div style={{ padding: '44px 48px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>

        {/* Columna izquierda */}
        <div>
          <h3 style={{ color: P.darkGreen, fontSize: 18, margin: '0 0 8px', fontWeight: 700 }}>
            Nuestra Historia
          </h3>
          <LineaOro mt={0} mb={16}/>
          <p style={{ color: P.textLight, fontSize: 13, lineHeight: 1.9, margin: '0 0 20px', textAlign: 'justify' }}>
            Somos una empresa familiar colombiana con inicios en la ciudad de Medellín, con más de <strong style={{ color: P.darkGreen }}>5 años</strong> ofreciendo alimentos para toda ocasión, de la mejor calidad y los mejores precios.
          </p>
          <p style={{ color: P.textLight, fontSize: 13, lineHeight: 1.9, margin: 0, textAlign: 'justify' }}>
            Brindamos servicios de alimentación para organizaciones y reuniones familiares, garantizando una excelente calidad en cada producto que llega a tu mesa.
          </p>

          <div style={{ marginTop: 28 }}>
            <h3 style={{ color: P.darkGreen, fontSize: 18, margin: '0 0 8px', fontWeight: 700 }}>
              Nuestra Misión
            </h3>
            <LineaOro mt={0} mb={16}/>
            <p style={{ color: P.textLight, fontSize: 13, lineHeight: 1.9, margin: 0, textAlign: 'justify' }}>
              Deleitar a nuestros clientes con preparaciones artesanales de alta calidad, usando ingredientes frescos y recetas tradicionales que evocan el sabor del hogar colombiano.
            </p>
          </div>
        </div>

        {/* Columna derecha */}
        <div>
          <h3 style={{ color: P.darkGreen, fontSize: 18, margin: '0 0 8px', fontWeight: 700 }}>
            Nuestros Servicios
          </h3>
          <LineaOro mt={0} mb={16}/>

          {[
            { icon: '🍽️', title: 'Catering Empresarial', desc: 'Alimentación para organizaciones, refrigerios y almuerzos corporativos.' },
            { icon: '🎉', title: 'Eventos Sociales', desc: 'Bodas, quinceañeros, grados, reuniones familiares y celebraciones especiales.' },
            { icon: '📦', title: 'Pedidos a Domicilio', desc: 'Entregamos en Medellín y el Área Metropolitana con puntualidad garantizada.' },
            { icon: '🧁', title: 'Charcutería & Repostería', desc: 'Pasteles, empanadas, postres y toda clase de pastelería artesanal.' },
            { icon: '🥗', title: 'Menús Personalizados', desc: 'Diseñamos el menú ideal para cada ocasión según tus necesidades y presupuesto.' },
          ].map(({ icon, title, desc }) => (
            <div key={title} style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                backgroundColor: P.darkGreen, display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 16,
              }}>{icon}</div>
              <div>
                <p style={{ color: P.darkGreen, fontWeight: 700, fontSize: 12, margin: '2px 0 2px',
                            fontFamily: 'Arial, sans-serif', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {title}
                </p>
                <p style={{ color: P.textMuted, fontSize: 12, margin: 0, lineHeight: 1.5 }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Valores */}
      <div style={{
        margin: '0 48px 40px',
        background: `linear-gradient(135deg, ${P.darkGreen}12, ${P.midGreen}08)`,
        border: `1px solid ${P.border}`,
        borderRadius: 4, padding: '20px 24px',
      }}>
        <p style={{ color: P.gold, fontSize: 10, letterSpacing: 4, margin: '0 0 12px',
                    fontFamily: 'Arial, sans-serif', textTransform: 'uppercase' }}>
          NUESTROS VALORES
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {[
            { v: 'Calidad', d: 'Ingredientes frescos y seleccionados' },
            { v: 'Amor', d: 'Cocinamos con pasión y dedicación' },
            { v: 'Puntualidad', d: 'Entregas a tiempo, siempre' },
            { v: 'Tradición', d: 'Recetas familiares colombianas' },
          ].map(({ v, d }) => (
            <div key={v} style={{ textAlign: 'center' }}>
              <p style={{ color: P.darkGreen, fontWeight: 700, fontSize: 13, margin: '0 0 4px' }}>{v}</p>
              <p style={{ color: P.textMuted, fontSize: 10.5, margin: 0, lineHeight: 1.4 }}>{d}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Barra inferior */}
      <div style={{ height: 6, background: `linear-gradient(90deg, ${P.gold}, ${P.goldLight}, ${P.gold})`,
                    position: 'absolute', bottom: 0, left: 0, right: 0 }}/>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   PÁGINA DE CATEGORÍA (productos)
══════════════════════════════════════════════════════════════ */
function PaginaCategoria({ categoria, productos, numPagina }) {
  const mitad = Math.ceil(productos.length / 2);
  const col1  = productos.slice(0, mitad);
  const col2  = productos.slice(mitad);

  const MiniTabla = ({ items }) => (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10.5 }}>
      <thead>
        <tr style={{ background: `linear-gradient(135deg, ${P.darkGreen}, ${P.midGreen})` }}>
          <th style={{ padding: '7px 10px', textAlign: 'left', color: P.gold,
                       fontSize: 9, fontFamily: 'Arial,sans-serif', textTransform: 'uppercase',
                       letterSpacing: 0.8, fontWeight: 700 }}>Producto</th>
          <th style={{ padding: '7px 6px', textAlign: 'center', color: P.gold,
                       fontSize: 9, fontFamily: 'Arial,sans-serif', textTransform: 'uppercase',
                       letterSpacing: 0.8, fontWeight: 700, width: 80 }}>Presentación</th>
          <th style={{ padding: '7px 10px', textAlign: 'right', color: P.gold,
                       fontSize: 9, fontFamily: 'Arial,sans-serif', textTransform: 'uppercase',
                       letterSpacing: 0.8, fontWeight: 700, width: 72 }}>Precio</th>
        </tr>
      </thead>
      <tbody>
        {items.map((p, i) => (
          <tr key={p.id_producto}
              style={{ backgroundColor: i % 2 === 0 ? P.white : P.rowAlt,
                       borderBottom: `1px solid ${P.border}` }}>
            <td style={{ padding: '6px 10px', color: P.text, fontSize: 10.5, lineHeight: 1.3 }}>
              {p.nombre}
            </td>
            <td style={{ padding: '6px 6px', color: P.textMuted, fontSize: 10, textAlign: 'center' }}>
              {p.presentacion}
            </td>
            <td style={{ padding: '6px 10px', color: P.darkGreen, fontSize: 11,
                         textAlign: 'right', fontWeight: 700, fontFamily: 'Arial,sans-serif' }}>
              {fmtP(p.valor)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div style={{
      width: PW, minHeight: PH, backgroundColor: P.cream,
      fontFamily: 'Georgia, serif', position: 'relative', boxSizing: 'border-box',
    }}>
      {/* Header categoría */}
      <div style={{
        background: `linear-gradient(135deg, ${P.darkGreen}, ${P.midGreen})`,
        padding: '28px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 4, height: 36, backgroundColor: P.gold, borderRadius: 2 }}/>
          <div>
            <p style={{ color: 'rgba(200,151,58,0.7)', fontSize: 9, letterSpacing: 4,
                        margin: '0 0 3px', fontFamily: 'Arial, sans-serif', textTransform: 'uppercase' }}>
              CATÁLOGO DE PRODUCTOS
            </p>
            <h2 style={{ color: P.white, fontSize: 26, margin: 0, fontWeight: 700 }}>
              {categoria}
            </h2>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 9, margin: 0,
                      fontFamily: 'Arial, sans-serif', letterSpacing: 2 }}>
            {productos.length} PRODUCTOS
          </p>
          <div style={{ width: 36, height: 36, borderRadius: '50%', marginTop: 4,
                        border: `1px solid rgba(200,151,58,0.4)`, overflow: 'hidden' }}>
            <img src={logoLili} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
          </div>
        </div>
      </div>

      {/* Tabla en 2 columnas */}
      <div style={{ padding: '20px 32px 32px', display: 'grid',
                    gridTemplateColumns: col2.length > 0 ? '1fr 1fr' : '1fr', gap: 14 }}>
        <MiniTabla items={col1}/>
        {col2.length > 0 && <MiniTabla items={col2}/>}
      </div>

      {/* Footer */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
        <div style={{ padding: '8px 32px', display: 'flex', justifyContent: 'space-between',
                      alignItems: 'center', borderTop: `1px solid ${P.border}` }}>
          <p style={{ color: P.textMuted, fontSize: 9, margin: 0, fontFamily: 'Arial,sans-serif',
                      fontStyle: 'italic' }}>
            Lili y su Sazón Completa · (+57) 3177719249 · @liliysusazoncompleta
          </p>
          <p style={{ color: P.textMuted, fontSize: 9, margin: 0, fontFamily: 'Arial,sans-serif' }}>
            Pág. {numPagina}
          </p>
        </div>
        <div style={{ height: 4, background: `linear-gradient(90deg, ${P.gold}, ${P.goldLight}, ${P.gold})` }}/>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   PÁGINA FINAL — CONTACTO & REDES SOCIALES
══════════════════════════════════════════════════════════════ */
function PaginaContacto() {
  return (
    <div style={{
      width: PW, height: PH, position: 'relative', overflow: 'hidden',
      background: `linear-gradient(160deg, ${P.darkGreen} 0%, ${P.midGreen} 60%, #1E4010 100%)`,
      fontFamily: 'Georgia, serif',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{ height: 5, position: 'absolute', top: 0, left: 0, right: 0,
                    background: `linear-gradient(90deg, ${P.gold}, ${P.goldLight}, ${P.gold})` }}/>

      <div style={{ textAlign: 'center', zIndex: 1, padding: '0 60px', width: '100%' }}>

        {/* Logo */}
        <div style={{ width: 120, height: 120, borderRadius: '50%', margin: '0 auto 24px',
                      border: `3px solid ${P.gold}`, padding: 3 }}>
          <img src={logoLili} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}/>
        </div>

        <h2 style={{ color: P.white, fontSize: 32, margin: '0 0 4px', fontWeight: 700 }}>
          Lili y su Sazón Completa
        </h2>
        <p style={{ color: P.gold, fontSize: 13, margin: '0 0 32px', fontStyle: 'italic' }}>
          Cocinamos con amor para ti y tu familia
        </p>

        {/* Divisor */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: 300, margin: '0 auto 40px' }}>
          <div style={{ flex: 1, height: 1, backgroundColor: P.gold, opacity: 0.5 }}/>
          <span style={{ color: P.gold, fontSize: 12 }}>✦</span>
          <div style={{ flex: 1, height: 1, backgroundColor: P.gold, opacity: 0.5 }}/>
        </div>

        {/* Cards de contacto */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 40 }}>
          {[
            { icon: '📞', label: 'WhatsApp', value: '(+57) 317 771 9249', sub: 'Llámanos o escríbenos' },
            { icon: '📸', label: 'Instagram', value: '@liliysusazoncompleta', sub: 'Síguenos para novedades' },
            { icon: '👥', label: 'Facebook', value: 'Lili y su Sazon Completa', sub: 'Síguenos en Facebook' },
          ].map(({ icon, label, value, sub }) => (
            <div key={label} style={{
              backgroundColor: 'rgba(255,255,255,0.08)',
              border: `1px solid rgba(200,151,58,0.3)`,
              borderRadius: 4, padding: '20px 16px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
              <p style={{ color: P.gold, fontSize: 10, letterSpacing: 3, margin: '0 0 6px',
                          fontFamily: 'Arial,sans-serif', textTransform: 'uppercase' }}>{label}</p>
              <p style={{ color: P.white, fontSize: 12, fontWeight: 700, margin: '0 0 4px',
                          fontFamily: 'Arial,sans-serif' }}>{value}</p>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, margin: 0,
                          fontFamily: 'Arial,sans-serif' }}>{sub}</p>
            </div>
          ))}
        </div>

        {/* Info adicional */}
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.06)',
          border: `1px solid rgba(200,151,58,0.25)`,
          borderRadius: 4, padding: '16px 24px',
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24,
        }}>
          {[
            { icon: '📍', label: 'Dirección', val: 'Calle 112 # 51A-15\nMedellín, Antioquia' },
            { icon: '🌐', label: 'Sitio Web', val: 'liliysusazoncompleta\n.github.io' },
            { icon: '🕒', label: 'Atención', val: 'Lunes a Sábado\n7:00 AM – 8:00 PM' },
          ].map(({ icon, label, val }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <span style={{ fontSize: 18 }}>{icon}</span>
              <p style={{ color: P.gold, fontSize: 9, letterSpacing: 2, margin: '6px 0 4px',
                          fontFamily: 'Arial,sans-serif', textTransform: 'uppercase' }}>{label}</p>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11, margin: 0, lineHeight: 1.5,
                          fontFamily: 'Arial,sans-serif', whiteSpace: 'pre-line' }}>{val}</p>
            </div>
          ))}
        </div>

        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, margin: '32px 0 0',
                    fontFamily: 'Arial,sans-serif', letterSpacing: 2 }}>
          © {new Date().getFullYear()} LILI Y SU SAZÓN COMPLETA · TODOS LOS DERECHOS RESERVADOS
        </p>
      </div>

      <div style={{ height: 5, position: 'absolute', bottom: 0, left: 0, right: 0,
                    background: `linear-gradient(90deg, ${P.gold}, ${P.goldLight}, ${P.gold})` }}/>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   PÁGINA PRINCIPAL
══════════════════════════════════════════════════════════════ */
export default function PortafolioPage() {
  const [grouped,    setGrouped]    = useState({});
  const [loading,    setLoading]    = useState(true);
  const [generating, setGenerating] = useState(false);
  const [progress,   setProgress]   = useState('');
  const [msg,        setMsg]        = useState('');
  const [preview, setPreview] = useState(false);
  const portaRef = useRef(null);

  /* Categorías excluidas */
  
  useEffect(() => {
  api.get('/productos?limit=500')
    .then(({ data }) => {
      const map = {};
      (data.data || []).forEach(p => {
        // Solo incluir productos de la categoría "negocios"
        if (!p.tipo_nombre?.toLowerCase().includes('negocio')) return;
        if (!map[p.tipo_nombre]) map[p.tipo_nombre] = [];
        map[p.tipo_nombre].push(p);
      });
      setGrouped(map);
    })
      .catch(() => setMsg('Error al cargar los productos.'))
      .finally(() => setLoading(false));
  }, []);

  /* Generar PDF multipágina */
  const generarPDF = async () => {
    const container = portaRef.current;
    if (!container) return;
    setGenerating(true);
    setMsg('');
    setProgress('Preparando páginas...');

    try {
      setProgress('Capturando contenido (puede tardar 20-30 seg)...');
      const canvas = await html2canvas(container, {
        scale: 2, useCORS: true, allowTaint: true,
        logging: false, width: PW, windowWidth: PW,
      });

      setProgress('Generando PDF...');
      const pdf    = new jsPDF('p', 'mm', 'letter');
      const PW_MM  = 216;
      const PH_MM  = 279;
      const pgHpx  = Math.round(canvas.width * PH_MM / PW_MM);
      const total  = Math.ceil(canvas.height / pgHpx);

      for (let i = 0; i < total; i++) {
        if (i > 0) pdf.addPage('letter', 'p');
        const sliceH = Math.min(pgHpx, canvas.height - i * pgHpx);
        const slice  = document.createElement('canvas');
        slice.width  = canvas.width;
        slice.height = sliceH;
        const ctx = slice.getContext('2d');
        ctx.drawImage(canvas, 0, -(i * pgHpx));
        pdf.addImage(slice.toDataURL('image/jpeg', 0.93), 'JPEG', 0, 0, PW_MM, PH_MM * sliceH / pgHpx);
        setProgress(`Página ${i + 1} de ${total}...`);
      }

      pdf.save('portafolio-lili-sazon-completa.pdf');
      setMsg(`✅ Portafolio descargado (${total} páginas)`);
    } catch (e) {
      setMsg(`❌ Error: ${e.message}`);
    } finally {
      setGenerating(false);
      setProgress('');
    }
  };

  const categorias = Object.entries(grouped);

  return (
    <AppLayout activeKey="portafolio">
      <div style={{ padding: 24, fontFamily: 'Manrope, sans-serif' }}>

        {/* Encabezado */}
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: '#1a1c15',
                       letterSpacing: '-0.02em', margin: '0 0 4px' }}>
            Portafolio Empresarial
          </h2>
          <p style={{ color: '#747967', fontSize: 14, margin: 0 }}>
            Descarga el portafolio completo de Lili y su Sazón Completa en PDF
          </p>
        </div>

        {/* Panel principal */}
        <div style={{
          backgroundColor: '#fff', border: '1px solid #e2e3d6',
          borderRadius: 16, padding: '24px 28px', marginBottom: 20,
        }}>
          {loading ? (
            <p style={{ color: '#747967', fontSize: 14, margin: 0 }}>Cargando productos...</p>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>

              {/* Info */}
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, color: '#1a1c15', margin: '0 0 6px', fontWeight: 700 }}>
                  Contenido del portafolio
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {['✅ Portada elegante', '✅ Quiénes somos', '✅ Misión y valores',
                    '✅ Catálogo por categoría', '✅ Precios actualizados', '✅ Redes sociales y contacto'
                  ].map(t => (
                    <span key={t} style={{
                      fontSize: 12, color: '#476500', backgroundColor: '#eef3e4',
                      padding: '3px 10px', borderRadius: 20, fontWeight: 600,
                    }}>{t}</span>
                  ))}
                </div>
                <p style={{ fontSize: 12, color: '#747967', margin: '8px 0 0' }}>
                  {categorias.length} categorías · {Object.values(grouped).reduce((s,a)=>s+a.length,0)} productos
                </p>
              </div>

             {/* Botones */}
<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>

  {/* Vista previa */}
  <button onClick={() => setPreview(true)} disabled={loading}
    style={{
  background: 'linear-gradient(135deg, #476500, #5d7f13)',
  color: '#fff',
  border: 'none',
  borderRadius: 12,
  padding: '14px 32px',
  fontSize: 14,
  fontWeight: 700,
  cursor: loading ? 'not-allowed' : 'pointer',
  fontFamily: 'Manrope, sans-serif',
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  minWidth: 220,
  justifyContent: 'center',
  boxShadow: '0 6px 20px rgba(71,101,0,0.35)',
}}
onMouseEnter={e => { if (!loading) e.currentTarget.style.background = 'linear-gradient(135deg, #5d7f13, #476500)'; }}
onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(135deg, #476500, #5d7f13)'; }}>
    👁️ VISTA PREVIA
  </button>

  {/* Descarga */}
  <button onClick={generarPDF} disabled={generating || loading}
    style={{
      background: generating
        ? '#9aae5a'
        : 'linear-gradient(135deg, #1B3A0F, #2C5418)',
      color: '#fff',
      border: 'none',
      borderRadius: 12,
      padding: '14px 32px',
      fontSize: 14,
      fontWeight: 700,
      cursor: generating ? 'not-allowed' : 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      boxShadow: generating ? 'none' : '0 6px 20px rgba(27,58,15,0.4)',
      fontFamily: 'Manrope, sans-serif',
      minWidth: 220,
      justifyContent: 'center',
    }}>
    {generating ? `⏳ ${progress || 'Generando...'}` : '📥 Descargar Portafolio PDF'}
  </button>

  {msg && (
    <p style={{
      fontSize: 13, fontWeight: 600, margin: 0, textAlign: 'center',
      color: msg.startsWith('✅') ? '#476500' : '#ba1a1a',
    }}>{msg}</p>
  )}
</div>
            </div>
          )}
        </div>

        {/* Vista previa mini */}
        {!loading && categorias.length > 0 && (
          <div style={{
            backgroundColor: '#fff', border: '1px solid #e2e3d6',
            borderRadius: 16, padding: '16px 24px',
          }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#444939', letterSpacing: 1,
                        textTransform: 'uppercase', margin: '0 0 12px' }}>
              Categorías incluidas
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px,1fr))', gap: 8 }}>
              {categorias.map(([cat, prods]) => (
                <div key={cat} style={{
                  background: 'linear-gradient(135deg, #1B3A0F08, #2C541808)',
                  borderRadius: 8, padding: '10px 14px',
                  border: '1px solid #e2e3d6',
                }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#1B3A0F', margin: '0 0 2px' }}>
                    {cat}
                  </p>
                  <p style={{ fontSize: 11, color: '#747967', margin: 0 }}>
                    {prods.length} producto{prods.length !== 1 ? 's' : ''}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Template oculto para captura ─────────────────────── */}
      <div ref={portaRef} style={{
        position: 'fixed', top: '-99999px', left: '-99999px',
        width: PW, pointerEvents: 'none',
      }}>
        <Portada/>
        <QuienesSomos/>
        {categorias.map(([cat, prods], i) => (
          <PaginaCategoria key={cat} categoria={cat} productos={prods} numPagina={i + 3}/>
        ))}
        <PaginaContacto/>
      </div>

      {/* ── Modal Vista Previa ──────────────────────────────── */}
{preview && (
  <div style={{
    position: 'fixed', inset: 0, zIndex: 50,
    backgroundColor: 'rgba(0,0,0,0.75)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 16,
  }}
    onClick={e => { if (e.target === e.currentTarget) setPreview(false); }}>

    <div style={{
      backgroundColor: '#fff', borderRadius: 16,
      width: '95vw', maxWidth: 860,
      maxHeight: '92vh', display: 'flex', flexDirection: 'column',
      overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,0.4)',
    }}>

      {/* Header modal */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 20px', borderBottom: '1px solid #e2e3d6',
        backgroundColor: '#1B3A0F',
      }}>
        <div>
          <p style={{ color: '#C8973A', fontSize: 11, letterSpacing: 3,
                      margin: '0 0 2px', textTransform: 'uppercase',
                      fontFamily: 'Manrope, sans-serif' }}>
            VISTA PREVIA
          </p>
          <p style={{ color: '#fff', fontSize: 15, fontWeight: 700, margin: 0,
                      fontFamily: 'Manrope, sans-serif' }}>
            Portafolio — Lili y su Sazón Completa
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => { setPreview(false); generarPDF(); }}
            style={{
              background: 'linear-gradient(135deg, #C8973A, #E8C06A)',
              color: '#1B3A0F', border: 'none', borderRadius: 10,
              padding: '8px 18px', fontSize: 13, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'Manrope, sans-serif',
            }}>
            📥 Descargar
          </button>
          <button onClick={() => setPreview(false)}
            style={{
              background: 'rgba(255,255,255,0.15)', color: '#fff',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: 10, padding: '8px 16px',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'Manrope, sans-serif',
            }}>
            ✕ Cerrar
          </button>
        </div>
      </div>

      {/* Contenido scrollable — escala el template para caber en pantalla */}
      <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#f0f0f0', padding: 20 }}>
        <div style={{
          transform: 'scale(0.75)', transformOrigin: 'top center',
          width: PW, margin: '0 auto',
          // Compensar el espacio que pierde el scale
          marginBottom: `-${PH * 0.25 * Object.keys(grouped).length + 2}px`,
        }}>
          <Portada/>
          <QuienesSomos/>
          {Object.entries(grouped).map(([cat, prods], i) => (
            <PaginaCategoria key={cat} categoria={cat} productos={prods} numPagina={i + 3}/>
          ))}
          <PaginaContacto/>
        </div>
      </div>

      {/* Footer modal */}
      <div style={{
        padding: '10px 20px', borderTop: '1px solid #e2e3d6',
        backgroundColor: '#fafaed', textAlign: 'center',
      }}>
        <p style={{ fontSize: 12, color: '#747967', margin: 0, fontFamily: 'Manrope, sans-serif' }}>
          Vista previa al 75% · El PDF se generará en tamaño carta completo
        </p>
      </div>
    </div>
  </div>
)}

    </AppLayout>
  );
}
