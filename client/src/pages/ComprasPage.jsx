/**
 * @fileoverview Gestión de Compras — CRUD enlazado a TblCompras y TblProveedores
 */
import { useState, useEffect, useCallback } from 'react';
import AppLayout from '../components/AppLayout.jsx';
import api       from '../lib/api.js';

const C = {
  primary:'#476500', primary2:'#5d7f13',
  surface:'#fafaed', container:'#eeefe2',
  white:'#ffffff',   text:'#1a1c15',
  textMuted:'#747967', textSub:'#444939',
  border:'#e2e3d6',  orange:'#944a00',
  error:'#ba1a1a',   errorBg:'#ffdad6',
  successBg:'#eef3e4',
};

const fmtFecha = v => {
  if (!v) return '—';
  // Si ya tiene hora (ISO completo de PostgreSQL), usarlo directo
  // Si es solo fecha (YYYY-MM-DD), agregar hora para evitar desfase de zona horaria
  const d = v.includes('T') ? new Date(v) : new Date(v + 'T12:00:00');
  return isNaN(d) ? v : d.toLocaleDateString('es-CO');
};
const fmtValor = v => `$${Number(v).toLocaleString('es-CO')}`;

/* ── Toast ──────────────────────────────────────────────────── */
function useToast() {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((msg, type='success') => {
    const id = Date.now();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  }, []);
  return { toasts, toast: add };
}

/* ── Modal ──────────────────────────────────────────────────── */
const EMPTY = { num_factura:'', fecha_compra:'', proveedor_nit:'', producto:'', valor:'' };

function CompraModal({ open, onClose, onSaved, editData, proveedores, toast }) {
  const [form,   setForm]   = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const isEdit = !!editData;

  useEffect(() => {
    if (!open) return;
    if (editData) {
      setForm({
        num_factura:  editData.num_factura,
        fecha_compra: editData.fecha_compra?.slice(0,10) || '',
        proveedor_nit: editData.proveedor_nit,
        producto:     editData.producto,
        valor:        editData.valor,
      });
    } else {
      setForm(EMPTY);
    }
    setErrors({});
  }, [open, editData]);

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]:'' })); };

  const validate = () => {
    const e = {};
    if (!form.num_factura.trim())  e.num_factura  = 'Requerido';
    if (!form.fecha_compra)        e.fecha_compra = 'Requerido';
    if (!form.proveedor_nit)       e.proveedor_nit= 'Selecciona un proveedor';
    if (!form.producto.trim())     e.producto     = 'Requerido';
    if (!form.valor || Number(form.valor) <= 0) e.valor = 'Debe ser mayor a 0';
    return e;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      if (isEdit) {
        await api.put(`/compras/${editData.id}`, { ...form, valor: Number(form.valor) });
        toast('Compra actualizada correctamente.');
      } else {
        await api.post('/compras', { ...form, valor: Number(form.valor) });
        toast('Compra registrada correctamente.');
      }
      onSaved(); onClose();
    } catch (err) {
      toast(err.response?.data?.message || 'Error al guardar.', 'error');
    } finally { setSaving(false); }
  };

  if (!open) return null;

  const inp = (label, name, type='text', extra={}) => (
    <div>
      <label style={{ display:'block', fontSize:11, fontWeight:700, textTransform:'uppercase',
                      letterSpacing:1, color:C.textSub, marginBottom:5 }}>{label}</label>
      <input type={type} value={form[name]} {...extra}
        onChange={e => set(name, e.target.value)}
        disabled={isEdit && name==='num_factura'}
        style={{ width:'100%', padding:'10px 12px', borderRadius:10, fontSize:14,
                 fontFamily:'Manrope,sans-serif', outline:'none', boxSizing:'border-box',
                 backgroundColor: (isEdit && name==='num_factura') ? C.container
                   : errors[name] ? C.errorBg : C.container,
                 border:`2px solid ${errors[name] ? C.error : 'transparent'}`, color:C.text }}
        onFocus={e => { if (!errors[name] && !(isEdit && name==='num_factura')) {
          e.target.style.backgroundColor=C.white; e.target.style.border=`2px solid ${C.primary}`;
        }}}
        onBlur={e => { if (!(isEdit && name==='num_factura')) {
          e.target.style.backgroundColor=errors[name]?C.errorBg:C.container;
          e.target.style.border=`2px solid ${errors[name]?C.error:'transparent'}`;
        }}}
      />
      {errors[name] && <p style={{ color:C.error, fontSize:11, margin:'3px 0 0' }}>{errors[name]}</p>}
    </div>
  );

  return (
    <div style={{ position:'fixed', inset:0, zIndex:50, backgroundColor:'rgba(26,28,21,0.55)',
                  display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}
         onClick={e => { if (e.target===e.currentTarget) onClose(); }}>
      <div style={{ backgroundColor:C.white, borderRadius:20, width:'100%', maxWidth:500,
                    maxHeight:'90vh', overflowY:'auto', boxShadow:'0 24px 60px rgba(0,0,0,0.2)' }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
                      padding:'18px 24px', borderBottom:`1px solid ${C.border}` }}>
          <div>
            <h3 style={{ fontWeight:800, fontSize:17, color:C.text, margin:0 }}>
              {isEdit ? `Editar Factura ${editData.num_factura}` : 'Registrar Compra'}
            </h3>
            <p style={{ fontSize:12, color:C.textMuted, margin:'2px 0 0' }}>
              {isEdit ? 'Modifica los datos de la compra' : 'Completa todos los campos requeridos'}
            </p>
          </div>
          <button onClick={onClose}
            style={{ background:'none', border:'none', fontSize:22, cursor:'pointer', color:C.textMuted }}>×</button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding:'20px 24px', display:'flex', flexDirection:'column', gap:14 }}>

          {inp('N° Factura', 'num_factura', 'text', { placeholder:'FAC-001' })}

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            {inp('Fecha de Compra', 'fecha_compra', 'date')}
            {inp('Valor Total ($)', 'valor', 'number', { min:1, placeholder:'0' })}
          </div>

          {/* Proveedor */}
          <div>
            <label style={{ display:'block', fontSize:11, fontWeight:700, textTransform:'uppercase',
                            letterSpacing:1, color:C.textSub, marginBottom:5 }}>
              Proveedor
            </label>
            <select value={form.proveedor_nit} onChange={e => set('proveedor_nit', e.target.value)}
              style={{ width:'100%', padding:'10px 12px', borderRadius:10, fontSize:14,
                       fontFamily:'Manrope,sans-serif', outline:'none', cursor:'pointer',
                       backgroundColor: errors.proveedor_nit ? C.errorBg : C.container,
                       border:`2px solid ${errors.proveedor_nit ? C.error : 'transparent'}`,
                       color: form.proveedor_nit ? C.text : C.textMuted }}>
              <option value="">Selecciona un proveedor...</option>
              {proveedores.map(p => (
                <option key={p.nit} value={p.nit}>{p.nombre} — {p.nit}</option>
              ))}
            </select>
            {errors.proveedor_nit && <p style={{ color:C.error, fontSize:11, margin:'3px 0 0' }}>{errors.proveedor_nit}</p>}
          </div>

          {/* Descripción */}
          <div>
            <label style={{ display:'block', fontSize:11, fontWeight:700, textTransform:'uppercase',
                            letterSpacing:1, color:C.textSub, marginBottom:5 }}>
              Descripción de Insumos
            </label>
            <textarea rows={3} value={form.producto}
              onChange={e => set('producto', e.target.value)}
              placeholder="Detalla los productos adquiridos..."
              style={{ width:'100%', padding:'10px 12px', borderRadius:10, fontSize:14,
                       fontFamily:'Manrope,sans-serif', outline:'none', resize:'vertical',
                       boxSizing:'border-box',
                       backgroundColor: errors.producto ? C.errorBg : C.container,
                       border:`2px solid ${errors.producto ? C.error : 'transparent'}`, color:C.text }}
              onFocus={e=>{ e.target.style.backgroundColor=C.white; e.target.style.border=`2px solid ${C.primary}`; }}
              onBlur={e=>{ e.target.style.backgroundColor=errors.producto?C.errorBg:C.container;
                           e.target.style.border=`2px solid ${errors.producto?C.error:'transparent'}`; }}
            />
            {errors.producto && <p style={{ color:C.error, fontSize:11, margin:'3px 0 0' }}>{errors.producto}</p>}
          </div>

          <div style={{ display:'flex', gap:10, paddingTop:4 }}>
            <button type="button" onClick={onClose} disabled={saving}
              style={{ flex:1, padding:'11px', borderRadius:12, fontSize:14, fontWeight:600,
                       border:'none', cursor:'pointer', backgroundColor:C.container, color:C.textSub,
                       fontFamily:'Manrope,sans-serif' }}>
              Cancelar
            </button>
            <button type="submit" disabled={saving}
              style={{ flex:1, padding:'11px', borderRadius:12, fontSize:14, fontWeight:700,
                       border:'none', cursor:saving?'not-allowed':'pointer', fontFamily:'Manrope,sans-serif',
                       backgroundColor:C.primary, color:C.white, opacity:saving?0.7:1 }}>
              {saving ? 'Guardando…' : isEdit ? 'Actualizar' : 'Registrar Compra'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   PÁGINA PRINCIPAL
══════════════════════════════════════════════════════════════ */
export default function ComprasPage() {
  const [compras,      setCompras]      = useState([]);
  const [proveedores,  setProveedores]  = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [modalOpen,    setModalOpen]    = useState(false);
  const [editData,     setEditData]     = useState(null);
  const [filtroTexto,  setFiltroTexto]  = useState('');
  const [filtroProv,   setFiltroProv]   = useState('');
  const [filtroFecha,  setFiltroFecha]  = useState('');
  const [filtroMes,    setFiltroMes]    = useState('');
  const [filtroAno,    setFiltroAno]    = useState('');
  const [deleting,     setDeleting]     = useState(null);
  const [preview, setPreview] = useState(false);
  const { toasts, toast }              = useToast();

  /* ── Fetch ─────────────────────────────────────────────────── */
  const fetchCompras = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filtroTexto) params.q         = filtroTexto;
      if (filtroProv)  params.proveedor = filtroProv;
      if (filtroFecha)  params.fecha_desde = params.fecha_hasta = filtroFecha;
      if (filtroMes)    params.mes = filtroMes;
      if (filtroAno)    params.ano = filtroAno;
      const { data } = await api.get('/compras', { params });
      setCompras(data.data || []);
    } catch (err) {
      toast(err.response?.data?.message || 'Error al cargar compras.', 'error');
    } finally { setLoading(false); }
  }, [filtroTexto, filtroProv, filtroFecha, filtroMes, filtroAno]);

  useEffect(() => {
    // Cargar proveedores activos una sola vez
    api.get('/proveedores', { params: { estado:'Activo', limit:200 } })
      .then(({ data }) => setProveedores(data.data || []))
      .catch(() => toast('Error al cargar proveedores.', 'error'));
  }, []);

  useEffect(() => { fetchCompras(); }, [fetchCompras]);

  /* ── Acciones ──────────────────────────────────────────────── */
  const handleDelete = async compra => {
    if (!window.confirm(`¿Eliminar la factura "${compra.num_factura}"?`)) return;
    setDeleting(compra.id);
    try {
      await api.delete(`/compras/${compra.id}`);
      toast(`Factura "${compra.num_factura}" eliminada.`);
      fetchCompras();
    } catch (err) {
      toast(err.response?.data?.message || 'Error al eliminar.', 'error');
    } finally { setDeleting(null); }
  };
  const exportarCSV = () => {
  if (!compras.length) return;

  const encabezados = ['N° Factura','Fecha','Proveedor','NIT','Descripción','Valor'];

  const filas = compras.map(c => [
    c.num_factura || '',
    fmtFecha(c.fecha_compra),
    c.proveedor_nombre || c.proveedor_nit || '',
    c.proveedor_nit || '',
    c.producto || '',
    Number(c.valor || 0).toLocaleString('es-CO'),
  ]);

  const contenido = [encabezados, ...filas]
    .map(f => f.map(v => `"${String(v).replace(/"/g,'""')}"`).join(','))
    .join('\n');

  const blob = new Blob(['\uFEFF' + contenido], { type:'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href     = url;
  link.download = `compras_${filtroAno||'todos'}_${filtroMes||'todos'}.csv`;
  link.click();
  URL.revokeObjectURL(url);
  toast(`✅ CSV exportado con ${compras.length} registros.`);
};

  /* ── Totales ───────────────────────────────────────────────── */
  const totalValor = compras.reduce((s, c) => s + Number(c.valor||0), 0);

  return (
    <AppLayout activeKey="compras">

      {/* Toasts */}
      <div style={{ position:'fixed', top:16, right:16, zIndex:70, display:'flex', flexDirection:'column', gap:8 }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            padding:'12px 18px', borderRadius:12, fontSize:13, fontWeight:600,
            backgroundColor: t.type==='error' ? C.errorBg : C.successBg,
            color: t.type==='error' ? C.error : C.primary,
            border:`1px solid ${t.type==='error'?'#f1b4b4':'#b5d97a'}`,
            boxShadow:'0 8px 24px rgba(0,0,0,0.1)', minWidth:260,
          }}>
            {t.type==='error' ? '❌' : '✅'} {t.msg}
          </div>
        ))}
      </div>

      <div style={{ padding:24, fontFamily:'Manrope,sans-serif' }}>

        {/* Encabezado */}
<div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between',
              flexWrap:'wrap', gap:16, marginBottom:20 }}>
  <div>
    <h2 style={{ fontWeight:800, fontSize:28, color:C.text,
                 letterSpacing:'-0.02em', margin:'0 0 4px' }}>
      Gestión de Compras
    </h2>
    <p style={{ fontSize:14, color:C.textMuted, margin:0 }}>
      Registros de compras a proveedores
    </p>
  </div>
  <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
    {/* Vista Previa */}
    {compras.length > 0 && (
      <button onClick={() => setPreview(true)}
        style={{ backgroundColor:C.primary, color:C.white, border:'none',
                 borderRadius:12, padding:'11px 20px', fontSize:14, fontWeight:700,
                 cursor:'pointer', fontFamily:'Manrope,sans-serif',
                 boxShadow:'0 4px 14px rgba(71,101,0,0.3)',
                 display:'flex', alignItems:'center', gap:8 }}
        onMouseEnter={e=>e.currentTarget.style.backgroundColor=C.primary2}
        onMouseLeave={e=>e.currentTarget.style.backgroundColor=C.primary}>
        👁️ Vista Previa
      </button>
    )}
    {/* Descargar CSV */}
    {compras.length > 0 && (
      <button onClick={exportarCSV}
        style={{ backgroundColor:'#1B3A0F', color:C.white, border:'none',
                 borderRadius:12, padding:'11px 20px', fontSize:14, fontWeight:700,
                 cursor:'pointer', fontFamily:'Manrope,sans-serif',
                 boxShadow:'0 4px 14px rgba(27,58,15,0.3)',
                 display:'flex', alignItems:'center', gap:8 }}
        onMouseEnter={e=>e.currentTarget.style.backgroundColor='#2C5418'}
        onMouseLeave={e=>e.currentTarget.style.backgroundColor='#1B3A0F'}>
        📥 Descargar CSV
      </button>
    )}
    {/* Nueva compra */}
    <button onClick={() => { setEditData(null); setModalOpen(true); }}
      style={{ backgroundColor:C.primary2, color:C.white, border:'none',
               borderRadius:12, padding:'11px 20px', fontSize:14, fontWeight:700,
               cursor:'pointer', fontFamily:'Manrope,sans-serif',
               boxShadow:'0 4px 14px rgba(71,101,0,0.25)',
               display:'flex', alignItems:'center', gap:8 }}
      onMouseEnter={e=>e.currentTarget.style.backgroundColor=C.primary}
      onMouseLeave={e=>e.currentTarget.style.backgroundColor=C.primary2}>
      + Registrar Compra
    </button>
  </div>
</div>

{/* ── Modal Vista Previa ──────────────────────────────────── */}
{preview && (
  <div style={{ position:'fixed', inset:0, zIndex:60, backgroundColor:'rgba(0,0,0,0.6)',
                display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}
       onClick={e => { if (e.target===e.currentTarget) setPreview(false); }}>
    <div style={{ backgroundColor:C.white, borderRadius:16, width:'95vw', maxWidth:900,
                  maxHeight:'90vh', display:'flex', flexDirection:'column', overflow:'hidden',
                  boxShadow:'0 24px 60px rgba(0,0,0,0.3)' }}>

      {/* Header modal */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
                    padding:'14px 20px', backgroundColor:C.primary }}>
        <div>
          <p style={{ color:'rgba(255,255,255,0.7)', fontSize:10, letterSpacing:3,
                      margin:'0 0 2px', textTransform:'uppercase', fontFamily:'Manrope,sans-serif' }}>
            VISTA PREVIA
          </p>
          <p style={{ color:C.white, fontSize:15, fontWeight:700, margin:0,
                      fontFamily:'Manrope,sans-serif' }}>
            {compras.length} compra{compras.length!==1?'s':''} con los filtros actuales
          </p>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={() => { setPreview(false); exportarCSV(); }}
            style={{ background:'linear-gradient(135deg,#C8973A,#E8C06A)', color:'#1B3A0F',
                     border:'none', borderRadius:10, padding:'8px 18px', fontSize:13,
                     fontWeight:700, cursor:'pointer', fontFamily:'Manrope,sans-serif' }}>
            📥 Descargar CSV
          </button>
          <button onClick={() => setPreview(false)}
            style={{ background:'rgba(255,255,255,0.15)', color:C.white,
                     border:'1px solid rgba(255,255,255,0.3)', borderRadius:10,
                     padding:'8px 16px', fontSize:13, fontWeight:600,
                     cursor:'pointer', fontFamily:'Manrope,sans-serif' }}>
            ✕ Cerrar
          </button>
        </div>
      </div>

      {/* Tabla scrollable */}
      <div style={{ flex:1, overflowY:'auto' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
          <thead style={{ backgroundColor:C.container, position:'sticky', top:0 }}>
            <tr>
              {['N° Factura','Fecha','Proveedor','Descripción','Valor'].map(h => (
                <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:10,
                                     fontWeight:700, textTransform:'uppercase', letterSpacing:0.8,
                                     color:C.textSub }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {compras.map((c, i) => (
              <tr key={c.id}
                  style={{ borderBottom:`1px solid ${C.border}`,
                           backgroundColor: i%2===0 ? C.white : C.surface }}>
                <td style={{ padding:'10px 14px', fontWeight:700, color:C.text }}>{c.num_factura}</td>
                <td style={{ padding:'10px 14px', color:C.textMuted, fontSize:12 }}>{fmtFecha(c.fecha_compra)}</td>
                <td style={{ padding:'10px 14px' }}>
                  <p style={{ fontWeight:600, color:C.text, margin:0, fontSize:12 }}>
                    {c.proveedor_nombre || c.proveedor_nit}
                  </p>
                  <p style={{ fontSize:10, color:C.textMuted, margin:'1px 0 0' }}>NIT: {c.proveedor_nit}</p>
                </td>
                <td style={{ padding:'10px 14px', color:C.textMuted, fontSize:12, maxWidth:200 }}>
                  <span style={{ display:'block', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {c.producto}
                  </span>
                </td>
                <td style={{ padding:'10px 14px', fontWeight:700, color:C.primary }}>
                  {fmtValor(c.valor)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer resumen */}
      <div style={{ padding:'10px 20px', borderTop:`1px solid ${C.border}`,
                    backgroundColor:C.surface, display:'flex',
                    justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:8 }}>
        <p style={{ fontSize:12, color:C.textMuted, margin:0, fontFamily:'Manrope,sans-serif' }}>
          {compras.length} registro{compras.length!==1?'s':''} · exporta solo lo filtrado
        </p>
        <p style={{ fontSize:14, fontWeight:800, color:C.primary, margin:0,
                    fontFamily:'Manrope,sans-serif' }}>
          Total: {fmtValor(compras.reduce((s,c)=>s+Number(c.valor||0),0))}
        </p>
      </div>
    </div>
  </div>
)}

        {/* Resumen */}
        {!loading && compras.length > 0 && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',
                        gap:12, marginBottom:20 }}>
            {[
              { label:'Total Compras', value:compras.length,  color:C.primary,  fmt: v=>v },
              { label:'Total Invertido', value:totalValor,    color:'#22863a',  fmt: fmtValor },
            ].map(({ label, value, color, fmt }) => (
              <div key={label} style={{ backgroundColor:C.white, border:`1px solid ${C.border}`,
                                        borderRadius:14, padding:'14px 18px' }}>
                <p style={{ fontSize:12, color:C.textMuted, margin:'0 0 4px', fontWeight:600 }}>{label}</p>
                <p style={{ fontSize:22, fontWeight:800, color, margin:0 }}>{fmt(value)}</p>
              </div>
            ))}
          </div>
        )}

        {/* Filtros */}
        <div style={{ backgroundColor:C.white, border:`1px solid ${C.border}`, borderRadius:14,
                      padding:16, marginBottom:20,
                      display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:12 }}>
          {/* Búsqueda */}
          <div>
            <label style={{ fontSize:11, fontWeight:700, color:C.textMuted, display:'block', marginBottom:5 }}>
              Búsqueda
            </label>
            <input value={filtroTexto} onChange={e=>setFiltroTexto(e.target.value)}
              placeholder="Factura, producto o proveedor..."
              style={{ width:'100%', padding:'9px 12px', borderRadius:8, border:`1px solid ${C.border}`,
                       backgroundColor:C.container, fontSize:13, fontFamily:'Manrope,sans-serif',
                       outline:'none', boxSizing:'border-box' }}/>
          </div>
          {/* Proveedor */}
          <div>
            <label style={{ fontSize:11, fontWeight:700, color:C.textMuted, display:'block', marginBottom:5 }}>
              Proveedor
            </label>
            <select value={filtroProv} onChange={e=>setFiltroProv(e.target.value)}
              style={{ width:'100%', padding:'9px 12px', borderRadius:8, border:`1px solid ${C.border}`,
                       backgroundColor:C.container, fontSize:13, fontFamily:'Manrope,sans-serif', outline:'none' }}>
              <option value="">Todos</option>
              {proveedores.map(p => <option key={p.nit} value={p.nit}>{p.nombre}</option>)}
            </select>
          </div>
{/* Año */}
<div>
  <label style={{ fontSize:11, fontWeight:700, color:C.textMuted, display:'block', marginBottom:5 }}>
    Año
  </label>
  <select value={filtroAno} onChange={e => setFiltroAno(e.target.value)}
    style={{ width:'100%', padding:'9px 12px', borderRadius:8, border:`1px solid ${C.border}`,
             backgroundColor:C.container, fontSize:13, fontFamily:'Manrope,sans-serif', outline:'none' }}>
    <option value="">Todos los años</option>
    {['2024','2025','2026','2027'].map(a => (
      <option key={a} value={a}>{a}</option>
    ))}
  </select>
</div>

{/* Mes */}
<div>
  <label style={{ fontSize:11, fontWeight:700, color:C.textMuted, display:'block', marginBottom:5 }}>
    Mes
  </label>
  <select value={filtroMes} onChange={e => setFiltroMes(e.target.value)}
    style={{ width:'100%', padding:'9px 12px', borderRadius:8, border:`1px solid ${C.border}`,
             backgroundColor:C.container, fontSize:13, fontFamily:'Manrope,sans-serif', outline:'none' }}>
    <option value="">Todos los meses</option>
    {[
      ['01','Enero'],['02','Febrero'],['03','Marzo'],['04','Abril'],
      ['05','Mayo'],['06','Junio'],['07','Julio'],['08','Agosto'],
      ['09','Septiembre'],['10','Octubre'],['11','Noviembre'],['12','Diciembre'],
    ].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
  </select>
</div>

          {/* Fecha */}
          <div>
            <label style={{ fontSize:11, fontWeight:700, color:C.textMuted, display:'block', marginBottom:5 }}>
              Fecha de Compra
            </label>
            <input type="date" value={filtroFecha} onChange={e=>setFiltroFecha(e.target.value)}
              style={{ width:'100%', padding:'9px 12px', borderRadius:8, border:`1px solid ${C.border}`,
                       backgroundColor:C.container, fontSize:13, fontFamily:'Manrope,sans-serif', outline:'none' }}/>
          </div>
          {/* Limpiar */}
          {(filtroTexto || filtroProv || filtroFecha || filtroMes || filtroAno) && (
            <div style={{ display:'flex', alignItems:'flex-end' }}>
              <button onClick={()=>{ setFiltroTexto(''); setFiltroProv(''); setFiltroFecha(''); setFiltroMes(''); setFiltroAno(''); }}
                style={{ width:'100%', padding:'9px 12px', borderRadius:8, border:'none', cursor:'pointer',
                         backgroundColor:C.container, color:C.textMuted, fontSize:13, fontWeight:600,
                         fontFamily:'Manrope,sans-serif' }}>
                ✕ Limpiar
              </button>
            </div>
          )}
        </div>

        {/* Tabla */}
        {loading ? (
          <div style={{ textAlign:'center', padding:'60px 0', color:C.textMuted }}>
            <div style={{ width:32, height:32, border:`2px solid ${C.primary}`,
                          borderTopColor:'transparent', borderRadius:'50%', margin:'0 auto 12px',
                          animation:'spin 0.8s linear infinite' }}/>
            Consultando base de datos…
          </div>
        ) : compras.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px 0' }}>
            <div style={{ fontSize:48, marginBottom:12 }}>🛒</div>
            <p style={{ fontWeight:700, fontSize:16, color:C.text, margin:'0 0 6px' }}>
              {filtroTexto||filtroProv||filtroFecha ? 'Sin resultados' : 'No hay compras registradas'}
            </p>
            <p style={{ fontSize:13, color:C.textMuted }}>
              {filtroTexto||filtroProv||filtroFecha ? 'Intenta con otro filtro.' : 'Registra la primera compra.'}
            </p>
          </div>
        ) : (
          <div style={{ backgroundColor:C.white, border:`1px solid ${C.border}`,
                        borderRadius:16, overflow:'hidden' }}>
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:14 }}>
                <thead>
                  <tr style={{ backgroundColor:C.container }}>
                    {['N° Factura','Fecha','Proveedor','Descripción','Valor','Acciones'].map(h => (
                      <th key={h} style={{ padding:'12px 16px', textAlign:'left', fontSize:11,
                                           fontWeight:700, textTransform:'uppercase', letterSpacing:0.8,
                                           color:C.textSub, whiteSpace:'nowrap' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {compras.map((c, i) => (
                    <tr key={c.id}
                        style={{ borderBottom:`1px solid ${C.border}`,
                                 backgroundColor: i%2===0 ? C.white : C.surface }}
                        onMouseEnter={e=>e.currentTarget.style.backgroundColor='#f0f5e8'}
                        onMouseLeave={e=>e.currentTarget.style.backgroundColor=i%2===0?C.white:C.surface}>
                      <td style={{ padding:'12px 16px', fontWeight:700, color:C.text }}>{c.num_factura}</td>
                      <td style={{ padding:'12px 16px', color:C.textMuted, fontSize:13 }}>{fmtFecha(c.fecha_compra)}</td>
                      <td style={{ padding:'12px 16px' }}>
                        <p style={{ fontWeight:600, color:C.text, margin:0, fontSize:13 }}>
                          {c.proveedor_nombre || c.proveedor_nit}
                        </p>
                        <p style={{ fontSize:11, color:C.textMuted, margin:'2px 0 0' }}>NIT: {c.proveedor_nit}</p>
                      </td>
                      <td style={{ padding:'12px 16px', color:C.textMuted, fontSize:13, maxWidth:220 }}>
                        <span title={c.producto} style={{ display:'block', overflow:'hidden',
                          textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                          {c.producto}
                        </span>
                      </td>
                      <td style={{ padding:'12px 16px', fontWeight:700, color:C.primary }}>{fmtValor(c.valor)}</td>
                      <td style={{ padding:'12px 16px' }}>
                        <div style={{ display:'flex', gap:6 }}>
                          <button onClick={() => { setEditData(c); setModalOpen(true); }}
                            style={{ padding:'6px 12px', borderRadius:8, border:'none', cursor:'pointer',
                                     fontSize:12, fontWeight:600, backgroundColor:'#eef3e4',
                                     color:C.primary, fontFamily:'Manrope,sans-serif' }}>
                            ✏️ Editar
                          </button>
                          <button onClick={() => handleDelete(c)} disabled={deleting===c.id}
                            style={{ padding:'6px 12px', borderRadius:8, border:'none',
                                     cursor:deleting===c.id?'not-allowed':'pointer',
                                     fontSize:12, fontWeight:600, backgroundColor:C.errorBg,
                                     color:C.error, fontFamily:'Manrope,sans-serif',
                                     opacity:deleting===c.id?0.6:1 }}>
                            {deleting===c.id ? '…' : '🗑️'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ padding:'10px 16px', borderTop:`1px solid ${C.border}`,
                          backgroundColor:C.surface,
                          display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontSize:12, color:C.textMuted }}>
                {compras.length} registro{compras.length!==1?'s':''}
              </span>
              <span style={{ fontSize:13, fontWeight:700, color:C.primary }}>
                Total: {fmtValor(totalValor)}
              </span>
            </div>
          </div>
        )}
      </div>

      <CompraModal
        open={modalOpen} onClose={() => setModalOpen(false)}
        onSaved={fetchCompras} editData={editData}
        proveedores={proveedores} toast={toast}
      />

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </AppLayout>
  );
}
