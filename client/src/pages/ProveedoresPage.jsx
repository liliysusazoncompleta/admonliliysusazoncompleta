/**
 * @fileoverview Módulo de Proveedores — CRUD completo
 * @module client/src/pages/ProveedoresPage
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import AppLayout from '../components/AppLayout.jsx';
import api       from '../lib/api.js';

/* ── Paleta ─────────────────────────────────────────────────── */
const C = {
  primary:'#476500', primary2:'#5d7f13',
  surface:'#fafaed', container:'#eeefe2',
  white:'#ffffff',   text:'#1a1c15',
  muted:'#747967',   sub:'#444939',
  border:'#e2e3d6',  orange:'#944a00',
  error:'#ba1a1a',   errorBg:'#ffdad6',
  successBg:'#eef3e4',
};

const fmtFecha = v => v ? new Date(v).toLocaleDateString('es-CO') : '—';

/* ── Toast ───────────────────────────────────────────────────── */
function useToast() {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  }, []);
  return { toasts, toast: add };
}

/* ── Campo de formulario ─────────────────────────────────────── */
function Field({ label, name, placeholder, required, type = 'text', form, errors, onChange, children }) {
  return (
    <div>
      <label style={{ display:'block', fontSize:11, fontWeight:700, textTransform:'uppercase',
                      letterSpacing:1, color:C.sub, marginBottom:6 }}>
        {label}{required && <span style={{ color:C.error }}> *</span>}
      </label>
      {children || (
        <input type={type} value={form[name]} placeholder={placeholder}
          onChange={e => onChange(name, e.target.value)}
          style={{
            width:'100%', padding:'10px 12px', borderRadius:10, fontSize:14,
            fontFamily:'Manrope,sans-serif', outline:'none',
            backgroundColor: errors[name] ? C.errorBg : C.container,
            border: `2px solid ${errors[name] ? C.error : 'transparent'}`,
            color: C.text, boxSizing:'border-box',
          }}
          onFocus={e => { if (!errors[name]) { e.target.style.backgroundColor=C.white; e.target.style.border=`2px solid ${C.primary}`; }}}
          onBlur={e  => { if (!errors[name]) { e.target.style.backgroundColor=C.container; e.target.style.border='2px solid transparent'; }}}
        />
      )}
      {errors[name] && <p style={{ color:C.error, fontSize:11, marginTop:4 }}>{errors[name]}</p>}
    </div>
  );
}

/* ── Modal Crear / Editar ────────────────────────────────────── */
const EMPTY = { nit:'', nombre:'', direccion:'', telefono:'', estado:'Activo' };

function ProveedorModal({ open, onClose, onSaved, editData, toast }) {
  const [form,   setForm]   = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const isEdit = !!editData;

  useEffect(() => {
    if (!open) return;
    setForm(editData
      ? { nit: editData.nit, nombre: editData.nombre,
          direccion: editData.direccion || '', telefono: editData.telefono || '',
          estado: editData.estado || 'Activo' }
      : EMPTY);
    setErrors({});
  }, [open, editData]);

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: '' })); };

  const validate = () => {
    const e = {};
    if (!form.nit.trim())    e.nit    = 'El NIT es requerido';
    if (!form.nombre.trim()) e.nombre = 'El nombre es requerido';
    return e;
  };

  const handleSubmit = async ev => {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      if (isEdit) {
        await api.put(`/proveedores/${editData.id}`, form);
        toast('Proveedor actualizado correctamente.');
      } else {
        await api.post('/proveedores', form);
        toast('Proveedor creado correctamente.');
      }
      onSaved(); onClose();
    } catch (err) {
      toast(err.response?.data?.message || 'Error al guardar.', 'error');
    } finally { setSaving(false); }
  };

  if (!open) return null;

  return (
    <div style={{ position:'fixed', inset:0, zIndex:50, backgroundColor:'rgba(26,28,21,0.55)',
                  display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}
         onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ backgroundColor:C.white, borderRadius:20, width:'100%', maxWidth:480,
                    maxHeight:'90vh', overflowY:'auto', boxShadow:'0 24px 60px rgba(0,0,0,0.2)' }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
                      padding:'18px 24px', borderBottom:`1px solid ${C.border}` }}>
          <div>
            <h3 style={{ fontWeight:800, fontSize:17, color:C.text, margin:0 }}>
              {isEdit ? 'Editar Proveedor' : 'Nuevo Proveedor'}
            </h3>
            <p style={{ fontSize:12, color:C.muted, margin:'2px 0 0' }}>
              {isEdit ? `Editando: ${editData.nit}` : 'Completa los datos del proveedor'}
            </p>
          </div>
          <button onClick={onClose}
            style={{ background:'none', border:'none', fontSize:20, cursor:'pointer',
                     color:C.muted, lineHeight:1 }}>×</button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding:'20px 24px', display:'flex', flexDirection:'column', gap:14 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <Field label="NIT" name="nit" placeholder="900123456-1" required form={form} errors={errors} onChange={set}/>
            <Field label="Estado" name="estado" form={form} errors={errors} onChange={set}>
              <select value={form.estado} onChange={e => set('estado', e.target.value)}
                style={{ width:'100%', padding:'10px 12px', borderRadius:10, fontSize:14,
                         fontFamily:'Manrope,sans-serif', outline:'none', cursor:'pointer',
                         backgroundColor:C.container, border:'2px solid transparent', color:C.text,
                         boxSizing:'border-box' }}>
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </Field>
          </div>
          <Field label="Nombre del Proveedor" name="nombre" placeholder="Nombre o razón social" required form={form} errors={errors} onChange={set}/>
          <Field label="Dirección" name="direccion" placeholder="Calle, ciudad..." form={form} errors={errors} onChange={set}/>
          <Field label="Teléfono" name="telefono" placeholder="300 123 4567" form={form} errors={errors} onChange={set}/>

          <div style={{ display:'flex', gap:10, paddingTop:4 }}>
            <button type="button" onClick={onClose} disabled={saving}
              style={{ flex:1, padding:'11px', borderRadius:12, fontSize:14, fontWeight:600,
                       border:'none', cursor:'pointer', backgroundColor:C.container, color:C.sub,
                       fontFamily:'Manrope,sans-serif' }}>
              Cancelar
            </button>
            <button type="submit" disabled={saving}
              style={{ flex:1, padding:'11px', borderRadius:12, fontSize:14, fontWeight:700,
                       border:'none', cursor:saving?'not-allowed':'pointer', fontFamily:'Manrope,sans-serif',
                       backgroundColor:C.primary, color:C.white, opacity:saving?0.7:1 }}>
              {saving ? 'Guardando…' : isEdit ? 'Actualizar' : 'Crear Proveedor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Modal Confirmar Eliminar ────────────────────────────────── */
function ConfirmModal({ open, proveedor, onConfirm, onClose, deleting }) {
  if (!open || !proveedor) return null;
  return (
    <div style={{ position:'fixed', inset:0, zIndex:60, backgroundColor:'rgba(26,28,21,0.6)',
                  display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <div style={{ backgroundColor:C.white, borderRadius:20, padding:28, width:'100%',
                    maxWidth:360, textAlign:'center', boxShadow:'0 24px 60px rgba(0,0,0,0.25)' }}>
        <div style={{ fontSize:40, marginBottom:12 }}>🗑️</div>
        <h3 style={{ fontWeight:800, fontSize:17, color:C.text, margin:'0 0 8px' }}>
          ¿Eliminar proveedor?
        </h3>
        <p style={{ fontSize:13, color:C.muted, margin:'0 0 20px', lineHeight:1.6 }}>
          Se eliminará <strong style={{ color:C.text }}>{proveedor.nombre}</strong> (NIT: {proveedor.nit}).
          Esta acción no se puede deshacer.
        </p>
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={onClose} disabled={deleting}
            style={{ flex:1, padding:'11px', borderRadius:12, fontSize:14, fontWeight:600,
                     border:'none', cursor:'pointer', backgroundColor:C.container, color:C.sub,
                     fontFamily:'Manrope,sans-serif' }}>
            Cancelar
          </button>
          <button onClick={onConfirm} disabled={deleting}
            style={{ flex:1, padding:'11px', borderRadius:12, fontSize:14, fontWeight:700,
                     border:'none', cursor:deleting?'not-allowed':'pointer', fontFamily:'Manrope,sans-serif',
                     backgroundColor:C.error, color:C.white, opacity:deleting?0.7:1 }}>
            {deleting ? 'Eliminando…' : 'Sí, eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   PÁGINA PRINCIPAL
══════════════════════════════════════════════════════════════ */
export default function ProveedoresPage() {
  const [proveedores,  setProveedores]  = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [modalOpen,    setModalOpen]    = useState(false);
  const [editData,     setEditData]     = useState(null);
  const [delTarget,    setDelTarget]    = useState(null);
  const [deleting,     setDeleting]     = useState(false);
  const [toggling,     setToggling]     = useState(null);
  const { toasts, toast }              = useToast();
  const searchTimer                    = useRef(null);

  /* ── Fetch ─────────────────────────────────────────────────── */
  const fetchProveedores = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search)       params.q      = search;
      if (filtroEstado) params.estado = filtroEstado;
      const { data } = await api.get('/proveedores', { params });
      setProveedores(data.data || []);
    } catch (err) {
      toast(err.response?.data?.message || 'Error al cargar proveedores.', 'error');
    } finally { setLoading(false); }
  }, [search, filtroEstado]);

  useEffect(() => { fetchProveedores(); }, [fetchProveedores]);

  const handleSearch = v => {
    setSearch(v);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(fetchProveedores, 400);
  };

  /* ── Acciones ──────────────────────────────────────────────── */
  const openCreate = ()  => { setEditData(null); setModalOpen(true); };
  const openEdit   = (p) => { setEditData(p);    setModalOpen(true); };

  const handleToggle = async (p) => {
    setToggling(p.id);
    try {
      const { data } = await api.patch(`/proveedores/${p.id}/estado`);
      toast(`Proveedor ${data.data.estado.toLowerCase()}.`);
      fetchProveedores();
    } catch (err) {
      toast(err.response?.data?.message || 'Error al cambiar estado.', 'error');
    } finally { setToggling(null); }
  };

  const confirmDelete = async () => {
    if (!delTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/proveedores/${delTarget.id}`);
      toast(`"${delTarget.nombre}" eliminado correctamente.`);
      setDelTarget(null);
      fetchProveedores();
    } catch (err) {
      toast(err.response?.data?.message || 'Error al eliminar.', 'error');
    } finally { setDeleting(false); }
  };

  /* ── Stats ─────────────────────────────────────────────────── */
  const activos   = proveedores.filter(p => p.estado === 'Activo').length;
  const inactivos = proveedores.filter(p => p.estado === 'Inactivo').length;

  return (
    <AppLayout activeKey="proveedores" searchValue={search} onSearch={handleSearch}>

      {/* Toasts */}
      <div style={{ position:'fixed', top:16, right:16, zIndex:70, display:'flex', flexDirection:'column', gap:8 }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            padding:'12px 18px', borderRadius:12, fontSize:13, fontWeight:600,
            backgroundColor: t.type==='error' ? C.errorBg : C.successBg,
            color: t.type==='error' ? C.error : C.primary,
            border: `1px solid ${t.type==='error' ? '#f1b4b4' : '#b5d97a'}`,
            boxShadow:'0 8px 24px rgba(0,0,0,0.1)', minWidth:260,
          }}>
            {t.type==='error' ? '❌' : '✅'} {t.message}
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
              Proveedores
            </h2>
            <p style={{ fontSize:14, color:C.muted, margin:0 }}>
              Gestiona el catálogo de proveedores de la empresa
            </p>
          </div>
          <button onClick={openCreate}
            style={{ backgroundColor:C.primary, color:C.white, border:'none',
                     borderRadius:12, padding:'11px 24px', fontSize:14, fontWeight:700,
                     cursor:'pointer', fontFamily:'Manrope,sans-serif',
                     boxShadow:'0 4px 14px rgba(71,101,0,0.35)',
                     display:'flex', alignItems:'center', gap:8 }}
            onMouseEnter={e=>e.currentTarget.style.backgroundColor=C.primary2}
            onMouseLeave={e=>e.currentTarget.style.backgroundColor=C.primary}>
            + Nuevo Proveedor
          </button>
        </div>

        {/* Estadísticas */}
        {!loading && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',
                        gap:12, marginBottom:20 }}>
            {[
              { label:'Total',     value:proveedores.length, color:C.primary  },
              { label:'Activos',   value:activos,            color:'#22863a'  },
              { label:'Inactivos', value:inactivos,          color:C.orange   },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ backgroundColor:C.white, border:`1px solid ${C.border}`,
                                        borderRadius:14, padding:'14px 18px' }}>
                <p style={{ fontSize:12, color:C.muted, margin:'0 0 4px', fontWeight:600 }}>{label}</p>
                <p style={{ fontSize:24, fontWeight:800, color, margin:0 }}>{value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Filtros */}
        <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:16 }}>
          {/* Buscador */}
          <div style={{ position:'relative', flex:1, minWidth:200 }}>
            <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)',
                           pointerEvents:'none', color:C.muted, fontSize:15 }}>🔍</span>
            <input value={search} onChange={e => handleSearch(e.target.value)}
              placeholder="Buscar por nombre o NIT..."
              style={{ width:'100%', padding:'10px 12px 10px 36px', borderRadius:12,
                       border:'2px solid transparent', backgroundColor:C.container,
                       fontSize:14, fontFamily:'Manrope,sans-serif', outline:'none',
                       color:C.text, boxSizing:'border-box' }}
              onFocus={e=>{e.target.style.backgroundColor=C.white;e.target.style.border=`2px solid ${C.primary}`;}}
              onBlur={e=>{e.target.style.backgroundColor=C.container;e.target.style.border='2px solid transparent';}}
            />
          </div>
          {/* Filtro estado */}
          <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}
            style={{ padding:'10px 14px', borderRadius:12, border:'2px solid transparent',
                     backgroundColor:C.container, fontSize:14, fontFamily:'Manrope,sans-serif',
                     outline:'none', cursor:'pointer', color:C.text }}>
            <option value="">Todos los estados</option>
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>
          {/* Limpiar */}
          {(search || filtroEstado) && (
            <button onClick={() => { setSearch(''); setFiltroEstado(''); }}
              style={{ padding:'10px 16px', borderRadius:12, border:'none', cursor:'pointer',
                       backgroundColor:C.container, color:C.muted, fontSize:13, fontWeight:600,
                       fontFamily:'Manrope,sans-serif' }}>
              ✕ Limpiar
            </button>
          )}
        </div>

        {/* Tabla */}
        {loading ? (
          <div style={{ textAlign:'center', padding:'60px 0', color:C.muted }}>
            <div style={{ width:32, height:32, border:`2px solid ${C.primary}`,
                          borderTopColor:'transparent', borderRadius:'50%',
                          animation:'spin 0.8s linear infinite', margin:'0 auto 12px' }}/>
            Cargando proveedores…
          </div>
        ) : proveedores.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px 0' }}>
            <div style={{ fontSize:48, marginBottom:12 }}>📦</div>
            <p style={{ fontWeight:700, fontSize:16, color:C.text, margin:'0 0 6px' }}>
              {search || filtroEstado ? 'Sin resultados' : 'No hay proveedores registrados'}
            </p>
            <p style={{ fontSize:13, color:C.muted }}>
              {search || filtroEstado ? 'Intenta con otro filtro.' : 'Crea el primer proveedor.'}
            </p>
          </div>
        ) : (
          <div style={{ backgroundColor:C.white, border:`1px solid ${C.border}`,
                        borderRadius:16, overflow:'hidden' }}>
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:14 }}>
                <thead>
                  <tr style={{ backgroundColor:C.container }}>
                    {['NIT','Nombre','Dirección','Teléfono','Estado','Creado','Acciones'].map(h => (
                      <th key={h} style={{ padding:'12px 16px', textAlign:'left', fontSize:11,
                                           fontWeight:700, textTransform:'uppercase', letterSpacing:0.8,
                                           color:C.sub, whiteSpace:'nowrap' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {proveedores.map((p, i) => (
                    <tr key={p.id}
                        style={{ borderBottom:`1px solid ${C.border}`,
                                 backgroundColor: i%2===0 ? C.white : C.surface }}
                        onMouseEnter={e=>e.currentTarget.style.backgroundColor='#f0f5e8'}
                        onMouseLeave={e=>e.currentTarget.style.backgroundColor=i%2===0?C.white:C.surface}>
                      <td style={{ padding:'12px 16px', fontWeight:700, color:C.muted, fontSize:13 }}>
                        {p.nit}
                      </td>
                      <td style={{ padding:'12px 16px', fontWeight:600, color:C.text }}>
                        {p.nombre}
                      </td>
                      <td style={{ padding:'12px 16px', color:C.muted, fontSize:13 }}>
                        {p.direccion || '—'}
                      </td>
                      <td style={{ padding:'12px 16px', color:C.muted, fontSize:13 }}>
                        {p.telefono || '—'}
                      </td>
                      <td style={{ padding:'12px 16px' }}>
                        <button onClick={() => handleToggle(p)} disabled={toggling === p.id}
                          style={{
                            padding:'4px 12px', borderRadius:20, border:'none', cursor:'pointer',
                            fontSize:12, fontWeight:700, fontFamily:'Manrope,sans-serif',
                            backgroundColor: p.estado==='Activo' ? '#eef3e4' : '#fff3eb',
                            color: p.estado==='Activo' ? C.primary : C.orange,
                            opacity: toggling===p.id ? 0.6 : 1,
                          }}>
                          {toggling===p.id ? '…' : p.estado}
                        </button>
                      </td>
                      <td style={{ padding:'12px 16px', color:C.muted, fontSize:12 }}>
                        {fmtFecha(p.created_at)}
                      </td>
                      <td style={{ padding:'12px 16px' }}>
                        <div style={{ display:'flex', gap:6 }}>
                          <button onClick={() => openEdit(p)}
                            style={{ padding:'6px 12px', borderRadius:8, border:'none', cursor:'pointer',
                                     fontSize:12, fontWeight:600, backgroundColor:'#eef3e4',
                                     color:C.primary, fontFamily:'Manrope,sans-serif' }}
                            onMouseEnter={e=>e.currentTarget.style.backgroundColor='#dcecc5'}
                            onMouseLeave={e=>e.currentTarget.style.backgroundColor='#eef3e4'}>
                            ✏️ Editar
                          </button>
                          <button onClick={() => setDelTarget(p)}
                            style={{ padding:'6px 12px', borderRadius:8, border:'none', cursor:'pointer',
                                     fontSize:12, fontWeight:600, backgroundColor:C.errorBg,
                                     color:C.error, fontFamily:'Manrope,sans-serif' }}
                            onMouseEnter={e=>e.currentTarget.style.backgroundColor='#ffbab4'}
                            onMouseLeave={e=>e.currentTarget.style.backgroundColor=C.errorBg}>
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ padding:'10px 16px', borderTop:`1px solid ${C.border}`,
                          backgroundColor:C.surface, textAlign:'right' }}>
              <span style={{ fontSize:12, color:C.muted }}>
                {proveedores.length} proveedor{proveedores.length!==1?'es':''}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Modales */}
      <ProveedorModal
        open={modalOpen} onClose={() => setModalOpen(false)}
        onSaved={fetchProveedores} editData={editData} toast={toast}
      />
      <ConfirmModal
        open={!!delTarget} proveedor={delTarget}
        onConfirm={confirmDelete} onClose={() => setDelTarget(null)}
        deleting={deleting}
      />

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </AppLayout>
  );
}
