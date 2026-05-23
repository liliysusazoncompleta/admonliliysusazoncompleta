/**
 * @fileoverview Página Gestión de Productos — CRUD completo
 * @module client/src/pages/ProductosPage
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import AppLayout, { Ic, IK } from '../components/AppLayout.jsx';
import { useCart } from '../hooks/useCart.jsx';

const api = axios.create({ baseURL: '/api' });
api.interceptors.request.use(cfg => {
  const t = localStorage.getItem('lili_token');
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

const C = {
  primary:'#476500', primary2:'#5d7f13',
  surface:'#fafaed', container:'#eeefe2',
  white:'#ffffff', text:'#1a1c15',
  textMuted:'#747967', textSub:'#444939',
  border:'#e2e3d6', orange:'#944a00',
  error:'#ba1a1a', errorBg:'#ffdad6',
};

// Colores de badge por tipo
const BADGE_COLORS = {
  Arroz:       { bg:'#fff3eb', color:'#944a00' },
  Carne:       { bg:'#e8e9dc', color:'#444939' },
  Entradas:    { bg:'#fce7f3', color:'#9d174d' },
  Refrigerios: { bg:'#e0f2fe', color:'#0369a1' },
  Sopas:       { bg:'#fef3c7', color:'#92400e' },
  Postres:     { bg:'#ede9fe', color:'#5b21b6' },
};
const getBadge = (tipo) => BADGE_COLORS[tipo] || { bg:'#e8e9dc', color:'#444939' };

// Imágenes placeholder por tipo
const IMG_BY_TYPE = {
  Arroz:       'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&q=75&fit=crop',
  Carne:       'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=400&q=75&fit=crop',
  Entradas:    'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&q=75&fit=crop',
  Refrigerios: 'https://images.unsplash.com/photo-1504387432042-8aca549e4729?w=400&q=75&fit=crop',
  Sopas:       'https://images.unsplash.com/photo-1547592180-85f173990554?w=400&q=75&fit=crop',
  Postres:     'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&q=75&fit=crop',
};
const getImg = (tipo, url) => url || IMG_BY_TYPE[tipo] || IMG_BY_TYPE.Carne;

// Formato de precio colombiano
const fmtPrecio = (v) => `$${Number(v).toLocaleString('es-CO')}`;

// ══════════════════════════════════════════════════════════════════════════════
// TOAST NOTIFICATIONS
// ══════════════════════════════════════════════════════════════════════════════
function ToastContainer({ toasts, onRemove }) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id}
          className="pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl shadow-xl text-sm font-medium max-w-xs animate-fade-up"
          style={{
            backgroundColor: t.type==='error' ? C.errorBg : t.type==='warning' ? '#fff3eb' : '#eef3e4',
            color: t.type==='error' ? C.error : t.type==='warning' ? C.orange : C.primary,
            border: `1px solid ${t.type==='error'?'#f1b4b4':t.type==='warning'?'#fbbf80':'#b5d97a'}`,
          }}>
          <span className="text-base leading-none mt-0.5">
            {t.type==='error'?'❌':t.type==='warning'?'⚠️':'✅'}
          </span>
          <span className="flex-1 leading-snug">{t.message}</span>
          <button onClick={()=>onRemove(t.id)} className="text-lg leading-none opacity-50 hover:opacity-100">×</button>
        </div>
      ))}
    </div>
  );
}

function useToast() {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((message, type='success') => {
    const id = Date.now();
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  }, []);
  const remove = useCallback(id => setToasts(p => p.filter(t => t.id !== id)), []);
  return { toasts, toast: add, removeToast: remove };
}

// ══════════════════════════════════════════════════════════════════════════════
// MODAL: CREAR / EDITAR PRODUCTO
// ══════════════════════════════════════════════════════════════════════════════
const EMPTY_FORM = { codigo:'', nombre:'', id_tipo_producto:'', presentacion:'', valor:'', descripcion:'', imagen_url:'' };

function ProductoModal({ open, onClose, onSaved, editData, tipos, toast }) {
 // const [form, setForm]       = useState(EMPTY_FORM);
 const EMPTY_FORM = {
  codigo: '',
  nombre: '',
  id_tipo_producto: '',
  presentacion: '',
  valor: '',
  descripcion: '',
  imagen: null,
  imagen_url: '',
};

const [form, setForm] = useState(EMPTY_FORM);
const [preview, setPreview] = useState(null);

  const [errors, setErrors]   = useState({});
  const [saving, setSaving]   = useState(false);
  const isEdit = !!editData;

 useEffect(() => {
  if (!open) return;

  if (editData) {
    setForm({
      codigo: editData.codigo || '',
      nombre: editData.nombre || '',
      id_tipo_producto: String(editData.id_tipo_producto || ''),
      presentacion: editData.presentacion || '',
      valor: String(editData.valor || ''),
      descripcion: editData.descripcion || '',
      imagen: null,
      imagen_url: editData.imagen_url || '',
    });

    setPreview(editData.imagen_url || null);

  } else {

    api.get('/productos/siguiente-codigo')
      .then(({ data }) => {
        setForm({
          ...EMPTY_FORM,
          codigo: data.codigo,
        });
      })
      .catch(() => {
        setForm(EMPTY_FORM);
      });

    setPreview(null);
  }

  setErrors({});
}, [open, editData]);

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: '' })); };

  const validate = () => {
    const e = {};
    if (!form.codigo.trim())         e.codigo       = 'Requerido';
    if (!form.nombre.trim())         e.nombre       = 'Requerido';
    if (!form.id_tipo_producto)      e.tipo         = 'Requerido';
    if (!form.presentacion.trim())   e.presentacion = 'Requerido';
    if (!form.valor || isNaN(Number(form.valor)) || Number(form.valor) < 0)
                                     e.valor        = 'Ingresa un valor válido ≥ 0';
    return e;
  };

const handleSubmit = async e => {
   e.preventDefault();

  const errs = validate();

  if (Object.keys(errs).length) {
    setErrors(errs);
    return;
  }

  setSaving(true);

  try {

    // FORM DATA
    const formData = new FormData();

    formData.append('codigo', form.codigo);
    formData.append('nombre', form.nombre);
    formData.append('id_tipo_producto', Number(form.id_tipo_producto));
    formData.append('presentacion', form.presentacion);
    formData.append('valor', Number(form.valor));
    formData.append('descripcion', form.descripcion || '');

    // Imagen
    if (form.imagen) {
      formData.append('imagen', form.imagen);
    }

    if (isEdit) {

      await api.put(
        `/productos/${editData.id_producto}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      toast('Producto actualizado correctamente.');

    } else {

      await api.post(
        '/productos',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      toast('Producto creado correctamente.');
    }

    await onSaved();

    onClose();

  } catch (err) {

    console.error(err);

    toast(
      err.response?.data?.message ||
      'Error al guardar el producto.',
      'error'
    );

  } finally {
    setSaving(false);
  }
};

  if (!open) return null;

  const Field = ({ label, name, type='text', placeholder, required, children }) => (
    <div>
      <label className="block text-xs font-bold tracking-wider uppercase mb-1.5"
             style={{ color: C.textSub }}>
        {label}{required && <span style={{ color: C.error }}> *</span>}
      </label>
      {children || (
        <input type={type} value={form[name]} placeholder={placeholder}
          onChange={e => set(name, e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-all"
          style={{
            backgroundColor: errors[name] ? C.errorBg : C.container,
            color: C.text, fontFamily:'Manrope,sans-serif',
            border: `2px solid ${errors[name] ? C.error : 'transparent'}`,
          }}
          onFocus={e => { if (!errors[name]) { e.target.style.backgroundColor=C.white; e.target.style.border=`2px solid ${C.primary}`; }}}
          onBlur={e =>  { if (!errors[name]) { e.target.style.backgroundColor=C.container; e.target.style.border='2px solid transparent'; }}}
        />
      )}
      {errors[name] && <p className="mt-1 text-xs font-medium" style={{ color:C.error }}>{errors[name]}</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4"
         style={{ backgroundColor:'rgba(26,28,21,0.5)' }}
         onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl animate-scale-in"
           style={{ backgroundColor:C.white, maxHeight:'90vh', overflowY:'auto' }}>

        {/* Header modal */}
        <div className="flex items-center justify-between px-6 py-4"
             style={{ borderBottom:`1px solid ${C.border}` }}>
          <div>
            <h2 className="font-extrabold text-lg" style={{ color:C.text }}>
              {isEdit ? 'Editar Producto' : 'Nuevo Producto'}
            </h2>
            <p className="text-xs font-medium mt-0.5" style={{ color:C.textMuted }}>
              {isEdit ? `Editando: ${editData.codigo}` : 'Completa los campos del producto'}
            </p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-colors"
            style={{ color:C.textMuted }}
            onMouseEnter={e=>e.currentTarget.style.backgroundColor=C.container}
            onMouseLeave={e=>e.currentTarget.style.backgroundColor='transparent'}>
            ×
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

          <div className="grid grid-cols-2 gap-4">
            <Field label="Código" name="codigo" placeholder="PRD-001" required/>
            <Field label="Tipo de Producto" name="id_tipo_producto" required>
              <select value={form.id_tipo_producto} onChange={e=>set('id_tipo_producto',e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-all appearance-none"
                style={{
                  backgroundColor: errors.tipo ? C.errorBg : C.container,
                  color: form.id_tipo_producto ? C.text : C.textMuted,
                  fontFamily:'Manrope,sans-serif',
                  border:`2px solid ${errors.tipo ? C.error : 'transparent'}`,
                }}>
                <option value="">Seleccionar…</option>
                {tipos.map(t => <option key={t.id_tipo_producto} value={t.id_tipo_producto}>{t.nombre}</option>)}
              </select>
              {errors.tipo && <p className="mt-1 text-xs font-medium" style={{ color:C.error }}>{errors.tipo}</p>}
            </Field>
          </div>

          <Field label="Nombre del Producto" name="nombre" placeholder="Ej: Arroz con Pollo Tradicional" required/>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Presentación" name="presentacion" placeholder="Ej: Bandeja 10 pax" required/>
            <div>
  <label
    className="block text-xs font-bold tracking-wider uppercase mb-1.5"
    style={{ color: C.textSub }}
  >
    Valor (COP) <span style={{ color: C.error }}> *</span>
  </label>

  <div
    className="flex items-center rounded-lg overflow-hidden"
    style={{
      backgroundColor: C.container,
      border: '2px solid transparent',
    }}
  >
    <span
      className="px-3 text-sm font-bold"
      style={{ color: C.primary }}
    >
      $
    </span>

    <input
      type="number"
      value={form.valor}
      placeholder="120000"
      onChange={e => set('valor', e.target.value)}
      className="w-full px-2 py-2.5 bg-transparent outline-none text-sm"
      style={{
        color: C.text,
        fontFamily: 'Manrope,sans-serif',
      }}
    />
  </div>

  {errors.valor && (
    <p className="mt-1 text-xs font-medium" style={{ color: C.error }}>
      {errors.valor}
    </p>
  )}
</div>
          </div>

          <Field label="Descripción" name="descripcion" placeholder="Descripción del producto...">
            <textarea value={form.descripcion} onChange={e=>set('descripcion',e.target.value)}
              rows={3} placeholder="Descripción del producto..."
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none transition-all"
              style={{ backgroundColor:C.container, color:C.text, fontFamily:'Manrope,sans-serif', border:'2px solid transparent' }}
              onFocus={e=>{e.target.style.backgroundColor=C.white;e.target.style.border=`2px solid ${C.primary}`;}}
              onBlur={e=>{e.target.style.backgroundColor=C.container;e.target.style.border='2px solid transparent';}}/>
          </Field>

          <div>
  <label
    className="block text-xs font-bold tracking-wider uppercase mb-1.5"
    style={{ color: C.textSub }}
  >
    Imagen del Producto
  </label>

  <input
    type="file"
    accept="image/*"
    onChange={(e) => {

      const file = e.target.files[0];

      if (!file) return;

      set('imagen', file);

      setPreview(URL.createObjectURL(file));
    }}
    className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
    style={{
      backgroundColor: C.container,
      color: C.text,
    }}
  />

  {preview && (
    <div className="mt-3">
      <img
        src={preview}
        alt="preview"
        className="w-full h-48 object-cover rounded-xl border"
      />
    </div>
  )}
</div>

          {/* Botones */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all"
              style={{ backgroundColor:C.container, color:C.textSub }}>
              Cancelar
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-60"
              style={{ backgroundColor:C.primary, color:C.white }}>
              {saving ? 'Guardando…' : isEdit ? 'Actualizar' : 'Crear Producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MODAL: CONFIRMAR ELIMINACIÓN
// ══════════════════════════════════════════════════════════════════════════════
function ConfirmModal({ open, producto, onConfirm, onClose, deleting }) {
  if (!open || !producto) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
         style={{ backgroundColor:'rgba(26,28,21,0.5)' }}>
      <div className="w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-scale-in"
           style={{ backgroundColor:C.white }}>
        <div className="text-center mb-5">
          <div className="text-4xl mb-3">🗑️</div>
          <h3 className="font-extrabold text-lg" style={{ color:C.text }}>¿Eliminar producto?</h3>
          <p className="text-sm mt-2 leading-relaxed" style={{ color:C.textMuted }}>
            Se eliminará <strong style={{ color:C.text }}>{producto.nombre}</strong> ({producto.codigo}).
            Esta acción no se puede deshacer.
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} disabled={deleting}
            className="flex-1 py-2.5 rounded-lg text-sm font-semibold"
            style={{ backgroundColor:C.container, color:C.textSub }}>
            Cancelar
          </button>
          <button onClick={onConfirm} disabled={deleting}
            className="flex-1 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-60"
            style={{ backgroundColor:'#ba1a1a', color:C.white }}>
            {deleting ? 'Eliminando…' : 'Sí, eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TARJETA DE PRODUCTO
// ══════════════════════════════════════════════════════════════════════════════
function ProductCard({ p, onEdit, onDelete, onAddToCart }) {
  const badge = getBadge(p.tipo_nombre);
  const [imgError, setImgError] = useState(false);

  return (
    <div className="rounded-2xl overflow-hidden flex flex-col transition-all duration-200"
         style={{ backgroundColor:C.white, border:`1px solid ${C.border}`, boxShadow:'0 2px 8px rgba(26,28,21,0.05)' }}
         onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(26,28,21,0.10)';}}
         onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='0 2px 8px rgba(26,28,21,0.05)';}}>

      {/* Imagen */}
      <div className="relative h-44 overflow-hidden bg-gray-100">
        <img
          src={imgError ? IMG_BY_TYPE[p.tipo_nombre] || IMG_BY_TYPE.Carne : getImg(p.tipo_nombre, p.imagen_url)}
          alt={p.nombre}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
        {/* Acciones hover */}
        <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 transition-opacity duration-200"
             style={{ backgroundColor:'rgba(26,28,21,0.4)' }}
             onMouseEnter={e=>e.currentTarget.style.opacity='1'}
             onMouseLeave={e=>e.currentTarget.style.opacity='0'}>
          <button onClick={()=>onEdit(p)}
            className="px-4 py-2 rounded-lg text-xs font-bold transition-all"
            style={{ backgroundColor:C.white, color:C.primary }}>
            ✏️ Editar
          </button>
          <button onClick={()=>onDelete(p)}
            className="px-4 py-2 rounded-lg text-xs font-bold transition-all"
            style={{ backgroundColor:'#ba1a1a', color:C.white }}>
            🗑️ Eliminar
          </button>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-4 flex flex-col flex-1">
        {/* Código + Badge */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold" style={{ color:C.textMuted }}>{p.codigo}</span>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ backgroundColor:badge.bg, color:badge.color }}>
            {p.tipo_nombre}
          </span>
        </div>

        {/* Nombre */}
        <h3 className="font-extrabold text-base leading-snug mb-2"
            style={{ color:C.text, letterSpacing:'-0.01em' }}>
          {p.nombre}
        </h3>

        {/* Descripción */}
        <p className="text-xs leading-relaxed mb-3 flex-1 line-clamp-2"
           style={{ color:C.textMuted }}>
          {p.descripcion || 'Sin descripción'}
        </p>

        {/* Separador */}
        <div className="mb-3" style={{ borderTop:`1px solid ${C.border}` }}/>

        {/* Presentación + Precio */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-medium" style={{ color:C.textMuted }}>Presentación</p>
            <p className="text-xs font-semibold mt-0.5" style={{ color:C.textSub }}>{p.presentacion}</p>
          </div>
          <span className="font-extrabold text-xl" style={{ color:C.primary, letterSpacing:'-0.02em' }}>
            {fmtPrecio(p.valor)}
          </span>
        </div>
      </div>

      {/* Botón principal: agregar al carrito */}
      <button onClick={()=>onAddToCart(p)}
        className="w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
        style={{ backgroundColor:C.primary, color:C.white, borderTop:`1px solid ${C.border}` }}
        onMouseEnter={e=>e.currentTarget.style.backgroundColor=C.primary2}
        onMouseLeave={e=>e.currentTarget.style.backgroundColor=C.primary}>
        🛒 Agregar al carrito
      </button>

      {/* Botones inferiores */}
      <div className="flex border-t" style={{ borderColor:C.border }}>
        <button onClick={()=>onEdit(p)}
          className="flex-1 py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          style={{ color:C.primary }}
          onMouseEnter={e=>e.currentTarget.style.backgroundColor='#eef3e4'}
          onMouseLeave={e=>e.currentTarget.style.backgroundColor='transparent'}>
          ✏️ Editar
        </button>
        <div style={{ width:1, backgroundColor:C.border }}/>
        <button onClick={()=>onDelete(p)}
          className="flex-1 py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          style={{ color:'#ba1a1a' }}
          onMouseEnter={e=>e.currentTarget.style.backgroundColor='#fff0f0'}
          onMouseLeave={e=>e.currentTarget.style.backgroundColor='transparent'}>
          🗑️ Eliminar
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// VISTA TABLA
// ══════════════════════════════════════════════════════════════════════════════
function TablaProductos({ productos, onEdit, onDelete, onAddToCart }) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ border:`1px solid ${C.border}` }}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm" style={{ backgroundColor:C.white }}>
          <thead>
            <tr style={{ backgroundColor:C.container }}>
              {['Código','Producto','Tipo','Presentación','Valor','Acciones'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-bold tracking-wider uppercase"
                    style={{ color:C.textSub }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y" style={{ '--tw-divide-color':C.border }}>
            {productos.map(p => {
              const badge = getBadge(p.tipo_nombre);
              return (
                <tr key={p.id_producto} className="transition-colors"
                    onMouseEnter={e=>e.currentTarget.style.backgroundColor=C.surface}
                    onMouseLeave={e=>e.currentTarget.style.backgroundColor='transparent'}>
                  <td className="px-4 py-3 font-bold text-xs" style={{ color:C.textMuted }}>{p.codigo}</td>
                  <td className="px-4 py-3 font-semibold max-w-xs" style={{ color:C.text }}>
                    <div className="truncate">{p.nombre}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{ backgroundColor:badge.bg, color:badge.color }}>
                      {p.tipo_nombre}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs font-medium" style={{ color:C.textSub }}>{p.presentacion}</td>
                  <td className="px-4 py-3 font-extrabold text-sm" style={{ color:C.primary }}>{fmtPrecio(p.valor)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={()=>onAddToCart(p)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                        style={{ backgroundColor:C.primary, color:C.white }}>
                        🛒 Agregar
                      </button>
                      <button onClick={()=>onEdit(p)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                        style={{ backgroundColor:'#eef3e4', color:C.primary }}>
                        Editar
                      </button>
                      <button onClick={()=>onDelete(p)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                        style={{ backgroundColor:C.errorBg, color:C.error }}>
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PÁGINA PRINCIPAL
// ══════════════════════════════════════════════════════════════════════════════
export default function ProductosPage() {
  const [productos,    setProductos]    = useState([]);
  const [tipos,        setTipos]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [filtroTipo,   setFiltroTipo]   = useState('');
  const [search,       setSearch]       = useState('');
  const [vista,        setVista]        = useState('cards'); // 'cards' | 'tabla'
  const [modalOpen,    setModalOpen]    = useState(false);
  const [editData,     setEditData]     = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting,     setDeleting]     = useState(false);
  const { toasts, toast, removeToast }  = useToast();
  const searchTimer                     = useRef(null);
  const { addItem }                     = useCart();

  const handleAddToCart = useCallback((p) => {
    addItem(p, 1);
    toast(`"${p.nombre}" agregado al carrito.`);
  }, [addItem, toast]);

  // ── Cargar tipos ───────────────────────────────────────────────────────────
  useEffect(() => {
    api.get('/productos/tipos')
      .then(({ data }) => setTipos(data.data || []))
      .catch(() => toast('No se pudieron cargar los tipos de producto.', 'error'));
  }, []);

  // ── Cargar productos ───────────────────────────────────────────────────────
  const fetchProductos = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filtroTipo) params.tipo = filtroTipo;
      if (search)     params.q   = search;
      const { data } = await api.get('/productos', { params });
      setProductos(data.data || []);
    } catch (err) {
      toast(err.response?.data?.message || 'Error al cargar productos.', 'error');
    } finally { setLoading(false); }
  }, [filtroTipo, search]);

  useEffect(() => { fetchProductos(); }, [fetchProductos]);

  // ── Búsqueda con debounce ──────────────────────────────────────────────────
  const handleSearch = (val) => {
    setSearch(val);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {}, 400);
  };

  // ── CRUD handlers ──────────────────────────────────────────────────────────
  const openCreate = ()     => { setEditData(null); setModalOpen(true); };
  const openEdit   = (p)    => { setEditData(p);    setModalOpen(true); };
  const openDelete = (p)    => setDeleteTarget(p);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/productos/${deleteTarget.id_producto}`);
      toast(`"${deleteTarget.nombre}" eliminado correctamente.`);
      setDeleteTarget(null);
      fetchProductos();
    } catch (err) {
      toast(err.response?.data?.message || 'Error al eliminar.', 'error');
    } finally { setDeleting(false); }
  };

  // Filtros disponibles
  const filtros = [{ key:'', label:'Todos' }, ...tipos.map(t => ({ key:t.nombre, label:t.nombre }))];

  return (
    <>
      <AppLayout activeKey="productos" searchValue={search} onSearch={handleSearch}>
        <div className="p-5 md:p-6 space-y-5">

          {/* ── Encabezado ─────────────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <div className="flex-1">
              <h2 className="font-extrabold text-2xl md:text-3xl" style={{ color:'#1a1c15', letterSpacing:'-0.02em' }}>
                Gestión de Productos
              </h2>
              <p className="mt-1 text-sm font-medium" style={{ color:'#747967' }}>
                Administra el catálogo visual y el inventario de Lili y su Sazón Completa.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Vista tabla */}
              <button onClick={() => setVista(v => v==='cards'?'tabla':'cards')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{ backgroundColor:'#ffffff', color:'#476500', border:`1.5px solid #476500` }}>
                <Ic d={vista==='cards'
                  ? ['M3 3h7v7H3z','M14 3h7v7h-7z','M3 14h7v7H3z','M14 14h7v7h-7z']
                  : ['M3 3h7v7H3z','M14 3h7v7h-7z','M3 14h7v7H3z','M14 14h7v7h-7z']}
                  size={16} stroke="#476500"/>
                Vista {vista==='cards' ? 'Tabla' : 'Tarjetas'}
              </button>
              {/* Nuevo producto */}
              <button onClick={openCreate}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95"
                style={{ backgroundColor:'#476500', color:'#ffffff', boxShadow:'0 4px 14px rgba(71,101,0,0.35)' }}
                onMouseEnter={e=>e.currentTarget.style.backgroundColor='#5d7f13'}
                onMouseLeave={e=>e.currentTarget.style.backgroundColor='#476500'}>
                <span className="text-base leading-none">+</span>
                Nuevo Producto
              </button>
            </div>
          </div>

          {/* ── Filtros por tipo ────────────────────────────────────────── */}
          <div className="flex flex-wrap gap-2">
            {filtros.map(f => {
              const on = filtroTipo === f.key;
              return (
                <button key={f.key} onClick={() => setFiltroTipo(f.key)}
                  className="px-4 py-1.5 rounded-full text-sm font-semibold transition-all"
                  style={{
                    backgroundColor: on ? '#476500' : '#ffffff',
                    color: on ? '#ffffff' : '#444939',
                    border: `1.5px solid ${on ? '#476500' : '#e2e3d6'}`,
                  }}>
                  {f.label}
                </button>
              );
            })}
          </div>

          {/* ── Contenido ──────────────────────────────────────────────── */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
                   style={{ borderColor:'#476500', borderTopColor:'transparent' }}/>
              <p className="text-sm font-medium" style={{ color:'#747967' }}>Cargando productos…</p>
            </div>
          ) : productos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="text-5xl">📦</div>
              <p className="font-bold text-lg" style={{ color:'#1a1c15' }}>
                {search || filtroTipo ? 'Sin resultados' : 'No hay productos registrados'}
              </p>
              <p className="text-sm font-medium" style={{ color:'#747967' }}>
                {search || filtroTipo ? 'Intenta con otro filtro o búsqueda.' : 'Crea el primer producto con el botón "Nuevo Producto".'}
              </p>
            </div>
          ) : vista === 'cards' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {productos.map(p => (
                <ProductCard key={p.id_producto} p={p}
                  onEdit={openEdit} onDelete={openDelete} onAddToCart={handleAddToCart}/>
              ))}
            </div>
          ) : (
            <TablaProductos productos={productos}
              onEdit={openEdit} onDelete={openDelete} onAddToCart={handleAddToCart}/>
          )}

          {/* ── Contador ───────────────────────────────────────────────── */}
          {!loading && productos.length > 0 && (
            <p className="text-xs font-medium text-center" style={{ color:'#747967' }}>
              Mostrando <strong>{productos.length}</strong> producto{productos.length !== 1 ? 's' : ''}
              {filtroTipo ? ` en "${filtroTipo}"` : ''}
              {search ? ` — búsqueda: "${search}"` : ''}
            </p>
          )}

          {/* Footer */}
          <footer className="text-center py-4">
            <Ic d={['M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z']}
              size={16} fill="#fca5a5" stroke="#ef4444" sw={1.5}/>
            <p className="text-xs font-semibold italic mt-1" style={{ color:'#747967' }}>
              Cocinamos con amor para tu familia
            </p>
          </footer>

        </div>
      </AppLayout>

      {/* Modales */}
      <ProductoModal
        open={modalOpen} onClose={() => setModalOpen(false)}
        onSaved={fetchProductos} editData={editData}
        tipos={tipos} toast={toast}
      />
      <ConfirmModal
        open={!!deleteTarget} producto={deleteTarget}
        onConfirm={confirmDelete} onClose={() => setDeleteTarget(null)}
        deleting={deleting}
      />

      {/* Notificaciones */}
      <ToastContainer toasts={toasts} onRemove={removeToast}/>
    </>
  );
}
