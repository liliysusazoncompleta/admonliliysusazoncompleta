/**
 * @fileoverview Carta de Productos — Descarga en PDF
 * Toma precios y categorías de la tabla public.productos
 * Genera PDF multipágina con portada y tablas por categoría
 */
import { useState, useEffect, useRef } from 'react';
import { jsPDF }       from 'jspdf';
import html2canvas     from 'html2canvas';
import AppLayout       from '../components/AppLayout.jsx';
import logoLili        from '../assets/LOGO_LILI.jpg';
import api             from '../lib/api.js';

/* ── Colores carta (crema artesanal) ─────────────────────────── */
const CC = {
  bg:       '#FAF0E6',   // crema
  primary:  '#476500',   // verde oliva
  title:    '#6B2D1F',   // marrón oscuro (títulos categoría)
  header:   '#D4651F',   // naranja/rust (encabezados tabla)
  rowAlt:   '#FAEBD7',   // crema clara (filas alternas)
  border:   '#E8C9A0',   // borde suave
  text:     '#2C1810',   // texto oscuro
  muted:    '#7A5C4E',   // texto secundario
  white:    '#FFFFFF',
};

/* ── Dimensiones carta a 780px ──────────────────────────────── */
const PAGE_W  = 780;
const PAGE_H  = Math.round(PAGE_W * (279 / 216)); // ≈ 1008px

/* ── Formatear precio ────────────────────────────────────────── */
const fmtP = v => `$${Number(v).toLocaleString('es-CO', { minimumFractionDigits: 2 })}`;

/* ══════════════════════════════════════════════════════════════
   PORTADA
══════════════════════════════════════════════════════════════ */
function Portada() {
  return (
    <div style={{
      width: PAGE_W, minHeight: PAGE_H,
      backgroundColor: CC.bg,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '60px 60px 40px',
      fontFamily: 'Georgia, serif',
      position: 'relative',
      boxSizing: 'border-box',
    }}>
      {/* Decoración superior */}
      <div style={{ width: '100%', textAlign: 'center', marginBottom: 30 }}>
        <div style={{
          fontSize: 11, letterSpacing: 4, color: CC.title,
          fontWeight: 700, textTransform: 'uppercase', lineHeight: 2,
        }}>
          S A B O R &nbsp; D E &nbsp; F A M I L I A
        </div>
      </div>

      {/* Título principal */}
      <h1 style={{
        fontFamily: 'Georgia, "Times New Roman", serif',
        fontSize: 52, color: CC.title, margin: '0 0 40px',
        textAlign: 'center', fontWeight: 400,
        letterSpacing: 6,
      }}>
        NUESTRA CARTA
      </h1>

      {/* Logo */}
      <div style={{
        width: 200, height: 200, borderRadius: '50%',
        overflow: 'hidden', border: `4px solid ${CC.border}`,
        marginBottom: 40,
        backgroundColor: CC.white,
      }}>
        <img src={logoLili} alt="Logo"
             style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
      </div>

      {/* Eslogan */}
      <p style={{
        fontSize: 12, color: CC.title, fontWeight: 700,
        letterSpacing: 3, textAlign: 'center', lineHeight: 1.8,
        textTransform: 'uppercase', margin: '0 0 50px',
        maxWidth: 500,
      }}>
        Cocinamos con amor para ti y tu familia
      </p>

      {/* Divisor */}
      <div style={{
        width: 80, height: 2, backgroundColor: CC.header,
        margin: '0 auto 40px',
      }}/>

      {/* Redes sociales */}
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 16, fontWeight: 700, color: CC.title, margin: '0 0 20px' }}>
          Visítanos en nuestras páginas
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 40 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 22, marginBottom: 4 }}>📸</div>
            <p style={{ fontSize: 14, fontWeight: 700, color: CC.header, margin: 0 }}>
              @liliysusazoncompleta
            </p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 22, marginBottom: 4 }}>💬</div>
            <p style={{ fontSize: 14, fontWeight: 700, color: CC.primary, margin: 0 }}>
              (+57) 3177719249
            </p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 22, marginBottom: 4 }}>👥</div>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#1877F2', margin: 0 }}>
              LILI Y SU SAZON COMPLETA
            </p>
          </div>
        </div>
      </div>

      {/* Logo pie */}
      <div style={{ position: 'absolute', bottom: 16, left: 20, opacity: 0.5 }}>
        <img src={logoLili} style={{ width: 40, height: 40, borderRadius: '50%' }}/>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   TABLA DE PRODUCTOS (2 columnas)
══════════════════════════════════════════════════════════════ */
function TablaProductos({ productos }) {
  const mitad   = Math.ceil(productos.length / 2);
  const col1    = productos.slice(0, mitad);
  const col2    = productos.slice(mitad);

  const ColTable = ({ items }) => (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
      <thead>
        <tr style={{ backgroundColor: CC.header }}>
          <th style={{ padding: '7px 8px', textAlign: 'left', color: CC.white,
                       fontWeight: 700, fontSize: 10, textTransform: 'uppercase',
                       letterSpacing: 0.5 }}>NOMBRE</th>
          <th style={{ padding: '7px 6px', textAlign: 'center', color: CC.white,
                       fontWeight: 700, fontSize: 10, textTransform: 'uppercase',
                       letterSpacing: 0.5, width: 80 }}>TIPO</th>
          <th style={{ padding: '7px 6px', textAlign: 'center', color: CC.white,
                       fontWeight: 700, fontSize: 10, textTransform: 'uppercase',
                       letterSpacing: 0.5, width: 70 }}>CANTIDAD</th>
          <th style={{ padding: '7px 8px', textAlign: 'right', color: CC.white,
                       fontWeight: 700, fontSize: 10, textTransform: 'uppercase',
                       letterSpacing: 0.5, width: 80 }}>VALOR</th>
        </tr>
      </thead>
      <tbody>
        {items.map((p, i) => (
          <tr key={p.id_producto}
              style={{ backgroundColor: i % 2 === 0 ? CC.white : CC.rowAlt,
                       borderBottom: `1px solid ${CC.border}` }}>
            <td style={{ padding: '6px 8px', color: CC.text, fontSize: 10.5, lineHeight: 1.3 }}>
              {p.nombre.toUpperCase()}
            </td>
            <td style={{ padding: '6px 6px', color: CC.muted, fontSize: 10,
                         textAlign: 'center', textTransform: 'uppercase' }}>
              {p.tipo_nombre}
            </td>
            <td style={{ padding: '6px 6px', color: CC.muted, fontSize: 10, textAlign: 'center' }}>
              {p.presentacion}
            </td>
            <td style={{ padding: '6px 8px', color: CC.text, fontSize: 10.5,
                         textAlign: 'right', fontWeight: 600 }}>
              {fmtP(p.valor)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
      <ColTable items={col1}/>
      <ColTable items={col2}/>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   PÁGINA DE CATEGORÍA
══════════════════════════════════════════════════════════════ */
function PaginaCategoria({ categoria, productos }) {
  return (
    <div style={{
      width: PAGE_W, minHeight: PAGE_H,
      backgroundColor: CC.bg,
      padding: '30px 32px 40px',
      boxSizing: 'border-box',
      fontFamily: 'Arial, sans-serif',
      position: 'relative',
      pageBreakBefore: 'always',
    }}>
      {/* Encabezado de página */}
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <p style={{ fontSize: 13, color: CC.title, fontStyle: 'italic',
                    fontFamily: 'Georgia, serif', margin: '0 0 4px' }}>
          Menú
        </p>
        <div style={{ width: 40, height: 1, backgroundColor: CC.border, margin: '0 auto' }}/>
      </div>

      {/* Título categoría */}
      <h2 style={{
        fontFamily: 'Georgia, serif',
        fontSize: 36, color: CC.title,
        margin: '0 0 20px', fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: 2,
      }}>
        {categoria}
      </h2>

      {/* Tabla de productos */}
      <TablaProductos productos={productos}/>

      {/* Logo pie */}
      <div style={{ position: 'absolute', bottom: 14, left: 18, opacity: 0.4 }}>
        <img src={logoLili} style={{ width: 36, height: 36, borderRadius: '50%' }}/>
      </div>

      {/* Línea pie */}
      <div style={{
        position: 'absolute', bottom: 14, right: 20,
        fontSize: 9, color: CC.muted, fontStyle: 'italic',
      }}>
        Lili y su Sazón Completa · (+57) 3177719249
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   PÁGINA PRINCIPAL
══════════════════════════════════════════════════════════════ */
export default function CartaPage() {
  const [grouped,    setGrouped]    = useState({});
  const [loading,    setLoading]    = useState(true);
  const [generating, setGenerating] = useState(false);
  const [msg,        setMsg]        = useState('');
  const cartaRef = useRef(null);

  /* Cargar productos agrupados por tipo */
  useEffect(() => {
   // Categorías que NO deben aparecer en la carta
const EXCLUIR = ['negocio', 'otros', 'domicilio', 'combos'];

api.get('/productos?limit=500&activo=true')
  .then(({ data }) => {
    const map = {};
    (data.data || []).forEach(p => {
      // Excluir categorías no deseadas (comparación sin importar mayúsculas)
      if (EXCLUIR.some(ex => p.tipo_nombre?.toLowerCase().includes(ex))) return;
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
    const container = cartaRef.current;
    if (!container) return;

    setGenerating(true);
    setMsg('Generando carta PDF...');

    try {
      /* Capturar todo el contenido */
      const canvas = await html2canvas(container, {
        scale: 2, useCORS: true, allowTaint: true,
        logging: false, backgroundColor: CC.bg,
        width: PAGE_W, windowWidth: PAGE_W,
      });

      const pdf = new jsPDF('p', 'mm', 'letter');
      const PW  = 216; // mm carta
      const PH  = 279;

      /* Altura en px de una página a escala 2 */
      const pageHpx = Math.round(canvas.width * (PH / PW));
      const total   = Math.ceil(canvas.height / pageHpx);

      for (let i = 0; i < total; i++) {
        if (i > 0) pdf.addPage('letter', 'p');

        const sliceH = Math.min(pageHpx, canvas.height - i * pageHpx);
        const slice  = document.createElement('canvas');
        slice.width  = canvas.width;
        slice.height = sliceH;

        const ctx = slice.getContext('2d');
        ctx.fillStyle = CC.bg;
        ctx.fillRect(0, 0, slice.width, slice.height);
        ctx.drawImage(canvas, 0, -(i * pageHpx));

        const dataUrl = slice.toDataURL('image/jpeg', 0.93);
        pdf.addImage(dataUrl, 'JPEG', 0, 0, PW, PH * (sliceH / pageHpx));
      }

      pdf.save('carta-lili-sazon-completa.pdf');
      setMsg(`✅ Carta descargada (${total} página${total !== 1 ? 's' : ''})`);
    } catch (e) {
      setMsg(`❌ Error: ${e.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const categorias  = Object.entries(grouped);
  const totalProds  = Object.values(grouped).reduce((s, a) => s + a.length, 0);

  return (
    <AppLayout activeKey="carta">
      <div style={{ padding: '24px', fontFamily: 'Manrope, sans-serif' }}>

        {/* Encabezado */}
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: '#1a1c15',
                       letterSpacing: '-0.02em', margin: 0 }}>
            Carta de Productos
          </h2>
          <p style={{ color: '#747967', fontSize: 14, marginTop: 4 }}>
            Genera y descarga la carta completa en formato PDF
          </p>
        </div>

        {/* Info + Botón */}
        <div style={{
          backgroundColor: '#fff', border: '1px solid #e2e3d6',
          borderRadius: 16, padding: '20px 24px',
          display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap',
          marginBottom: 24,
        }}>
          {loading ? (
            <p style={{ color: '#747967', fontSize: 14 }}>Cargando productos...</p>
          ) : (
            <>
              <div>
                <p style={{ fontSize: 13, color: '#747967', margin: 0 }}>
                  <strong style={{ color: '#1a1c15' }}>{categorias.length}</strong> categorías ·&nbsp;
                  <strong style={{ color: '#1a1c15' }}>{totalProds}</strong> productos activos
                </p>
                <p style={{ fontSize: 12, color: '#a0a890', margin: '4px 0 0' }}>
                  {categorias.map(([c]) => c).join(' · ')}
                </p>
              </div>

              <button onClick={generarPDF} disabled={generating || totalProds === 0}
                style={{
                  backgroundColor: generating ? '#9aae5a' : '#476500',
                  color: '#fff', border: 'none', borderRadius: 12,
                  padding: '12px 28px', fontSize: 14, fontWeight: 700,
                  cursor: generating ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: 8,
                  boxShadow: '0 4px 14px rgba(71,101,0,0.35)',
                  fontFamily: 'Manrope, sans-serif',
                }}>
                {generating ? '⏳ Generando...' : '📄 Descargar Carta PDF'}
              </button>

              {msg && (
                <p style={{
                  fontSize: 13, fontWeight: 600, margin: 0,
                  color: msg.startsWith('✅') ? '#476500' : msg.startsWith('❌') ? '#ba1a1a' : '#747967',
                }}>
                  {msg}
                </p>
              )}
            </>
          )}
        </div>

        {/* Vista previa de categorías */}
        {!loading && categorias.length > 0 && (
          <div style={{
            backgroundColor: '#fff', border: '1px solid #e2e3d6',
            borderRadius: 16, padding: '16px 24px',
          }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#444939',
                        textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 12px' }}>
              Vista previa por categoría
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
              {categorias.map(([cat, prods]) => (
                <div key={cat} style={{
                  backgroundColor: '#fafaed', borderRadius: 10,
                  padding: '10px 14px', border: '1px solid #e2e3d6',
                }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#476500', margin: '0 0 2px' }}>
                    {cat}
                  </p>
                  <p style={{ fontSize: 12, color: '#747967', margin: 0 }}>
                    {prods.length} producto{prods.length !== 1 ? 's' : ''}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Template oculto para captura PDF ───────────────────── */}
      <div ref={cartaRef} style={{
        position: 'fixed', top: '-99999px', left: '-99999px',
        width: PAGE_W, backgroundColor: CC.bg,
        fontFamily: 'Arial, sans-serif',
        pointerEvents: 'none',
      }}>
        {/* Portada */}
        <Portada/>

        {/* Páginas por categoría */}
        {categorias.map(([cat, prods]) => (
          <PaginaCategoria key={cat} categoria={cat} productos={prods}/>
        ))}
      </div>

    </AppLayout>
  );
}
