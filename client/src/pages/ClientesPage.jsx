/**
 * @fileoverview Página Gestión de Clientes — CRUD completo
 * @module client/src/pages/ClientesPage
 *
 * Permite crear, editar, consultar y eliminar clientes según las
 * reglas de negocio:
 *   • Nombre, teléfono y dirección principal obligatorios.
 *   • Teléfono único.
 *   • NIT/CC opcional pero único.
 *   • Máximo 2 direcciones (principal + alterna).
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../lib/api.js';
import AppLayout from '../components/AppLayout.jsx';

/*const api = axios.create({ baseURL: '/api' });
api.interceptors.request.use(cfg => {
  const t = localStorage.getItem('lili_token');
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});*/

const C = {
  primary:'#476500', primary2:'#5d7f13',
  surface:'#fafaed', container:'#eeefe2',
  white:'#ffffff',   text:'#1a1c15',
  textMuted:'#747967', textSub:'#444939',
  border:'#e2e3d6', orange:'#944a00',
  error:'#ba1a1a', errorBg:'#ffdad6',
};

// Iniciales del cliente para el avatar
const getIniciales = (nombre = '') => {
  const partes = nombre.trim().split(/\s+/).filter(Boolean);
  if (!partes.length) return 'C';
  if (partes.length === 1) return partes[0][0]?.toUpperCase() || 'C';
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
};

// Paleta determinística para el avatar (basada en el id)
const AVATAR_COLORS = [
  { bg:'#eef3e4', color:'#476500' },
  { bg:'#fff3eb', color:'#944a00' },
  { bg:'#e0f2fe', color:'#0369a1' },
  { bg:'#fef3c7', color:'#92400e' },
  { bg:'#ede9fe', color:'#5b21b6' },
  { bg:'#fce7f3', color:'#9d174d' },
];
const getAvatarColor = (id) => AVATAR_COLORS[Math.abs(Number(id) || 0) % AVATAR_COLORS.length];

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
// CAMPO REUTILIZABLE (componente externo para no perder foco entre renders)
// ══════════════════════════════════════════════════════════════════════════════
function Field({ label, value, onChange, error, placeholder, required, type='text', as='input', rows=2, autoFocus }) {
  const baseStyle = {
    backgroundColor: error ? C.errorBg : C.container,
    color: C.text,
    fontFamily: 'Manrope,sans-serif',
    border: `2px solid ${error ? C.error : 'transparent'}`,
  };
  const handleFocus = (e) => {
    if (!error) {
      e.target.style.backgroundColor = C.white;
      e.target.style.border = `2px solid ${C.primary}`;
    }
  };
  const handleBlur = (e) => {
    if (!error) {
      e.target.style.backgroundColor = C.container;
      e.target.style.border = '2px solid transparent';
    }
  };

  return (
    <div>
      <label className="block text-xs font-bold tracking-wider uppercase mb-1.5"
             style={{ color: C.textSub }}>
        {label}{required && <span style={{ color: C.error }}> *</span>}
      </label>
      {as === 'textarea' ? (
        <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows}
          autoFocus={autoFocus}
          className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none transition-all"
          style={baseStyle} onFocus={handleFocus} onBlur={handleBlur}/>
      ) : (
        <input type={type} value={value} onChange={onChange} placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-all"
          style={baseStyle} onFocus={handleFocus} onBlur={handleBlur}/>
      )}
      {error && <p className="mt-1 text-xs font-medium" style={{ color: C.error }}>{error}</p>}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MODAL: CREAR / EDITAR CLIENTE
// ══════════════════════════════════════════════════════════════════════════════
const EMPTY_FORM = {
  nombre: '', nit_cc: '',
  telefono: '', telefono_alt: '',
  direccion_principal: '', direccion_alterna: '',
  observaciones: '',
};

function ClienteModal({ open, onClose, onSaved, editData, toast }) {
  const [form, setForm]     = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const isEdit = !!editData;

  useEffect(() => {
    if (!open) return;
    if (editData) {
      setForm({
        nombre:              editData.nombre              || '',
        nit_cc:              editData.nit_cc              || '',
        telefono:            editData.telefono            || '',
        telefono_alt:        editData.telefono_alt        || '',
        direccion_principal: editData.direccion_principal || '',
        direccion_alterna:   editData.direccion_alterna   || '',
        observaciones:       editData.observaciones       || '',
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
  }, [open, editData]);

  const set = (k, v) => {
    setForm(p => ({ ...p, [k]: v }));
    setErrors(p => ({ ...p, [k]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.nombre.trim())              e.nombre              = 'El nombre es requerido';
    if (!form.telefono.trim())            e.telefono            = 'El teléfono es requerido';
    else if (!/^\+?[0-9 \-]{6,20}$/.test(form.telefono.trim()))
                                          e.telefono            = 'Teléfono inválido';
    if (form.telefono_alt && !/^\+?[0-9 \-]{6,20}$/.test(form.telefono_alt.trim()))
                                          e.telefono_alt        = 'Teléfono alterno inválido';
    if (!form.direccion_principal.trim()) e.direccion_principal = 'La dirección principal es requerida';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSaving(true);
    try {
      const payload = {
        nombre:              form.nombre.trim(),
        nit_cc:              form.nit_cc.trim() || null,
        telefono:            form.telefono.trim(),
        telefono_alt:        form.telefono_alt.trim() || null,
        direccion_principal: form.direccion_principal.trim(),
        direccion_alterna:   form.direccion_alterna.trim() || null,
        observaciones:       form.observaciones.trim() || null,
      };

      if (isEdit) {
        await api.put(`/clientes/${editData.id_cliente}`, payload);
        toast('Cliente actualizado correctamente.');
      } else {
        await api.post('/clientes', payload);
        toast('Cliente creado correctamente.');
      }
      await onSaved();
      onClose();
    } catch (err) {
      console.error(err);
      toast(err.response?.data?.message || 'Error al guardar el cliente.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4"
         style={{ backgroundColor:'rgba(26,28,21,0.5)' }}
         onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl animate-scale-in"
           style={{ backgroundColor:C.white, maxHeight:'90vh', overflowY:'auto' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4"
             style={{ borderBottom:`1px solid ${C.border}` }}>
          <div>
            <h2 className="font-extrabold text-lg" style={{ color:C.text }}>
              {isEdit ? 'Editar Cliente' : 'Nuevo Cliente'}
            </h2>
            <p className="text-xs font-medium mt-0.5" style={{ color:C.textMuted }}>
              {isEdit ? `Editando: ${editData.nombre}` : 'Completa los datos del cliente'}
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

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

          {/* Identificación */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Nombre" required autoFocus
              value={form.nombre} error={errors.nombre}
              onChange={e => set('nombre', e.target.value)}
              placeholder="Ej: María Pérez González"/>
            <Field label="NIT / CC"
              value={form.nit_cc} error={errors.nit_cc}
              onChange={e => set('nit_cc', e.target.value)}
              placeholder="Opcional. Único si se diligencia."/>
          </div>

          {/* Teléfonos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Teléfono principal" required
              value={form.telefono} error={errors.telefono}
              onChange={e => set('telefono', e.target.value)}
              placeholder="Ej: 3001234567"/>
            <Field label="Teléfono alterno"
              value={form.telefono_alt} error={errors.telefono_alt}
              onChange={e => set('telefono_alt', e.target.value)}
              placeholder="Opcional"/>
          </div>

          {/* Direcciones */}
          <Field label="Dirección principal" required as="textarea"
            value={form.direccion_principal} error={errors.direccion_principal}
            onChange={e => set('direccion_principal', e.target.value)}
            placeholder="Ej: Cra. 10 # 20-30, Barrio Centro, Bogotá"/>

          <Field label="Dirección alterna" as="textarea"
            value={form.direccion_alterna} error={errors.direccion_alterna}
            onChange={e => set('direccion_alterna', e.target.value)}
            placeholder="Opcional — máximo 2 direcciones por cliente"/>

          {/* Observaciones */}
          <Field label="Observaciones" as="textarea"
            value={form.observaciones} error={errors.observaciones}
            onChange={e => set('observaciones', e.target.value)}
            placeholder="Notas o preferencias del cliente..."/>

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
              {saving ? 'Guardando…' : isEdit ? 'Actualizar' : 'Crear Cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MODAL: DETALLE
// ══════════════════════════════════════════════════════════════════════════════
function DetalleModal({ cliente, onClose, onEdit }) {
  if (!cliente) return null;
  const av = getAvatarColor(cliente.id_cliente);
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4"
         style={{ backgroundColor:'rgba(26,28,21,0.5)' }}
         onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl animate-scale-in"
           style={{ backgroundColor:C.white, maxHeight:'90vh', overflowY:'auto' }}>

        <div className="flex items-center justify-between px-6 py-4"
             style={{ borderBottom:`1px solid ${C.border}` }}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center font-extrabold text-base"
                 style={{ backgroundColor:av.bg, color:av.color }}>
              {getIniciales(cliente.nombre)}
            </div>
            <div>
              <h2 className="font-extrabold text-lg leading-tight" style={{ color:C.text }}>
                {cliente.nombre}
              </h2>
              <p className="text-xs font-medium" style={{ color:C.textMuted }}>
                {cliente.nit_cc ? `NIT/CC: ${cliente.nit_cc}` : 'Sin NIT/CC registrado'}
              </p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
            style={{ color:C.textMuted }}
            onMouseEnter={e=>e.currentTarget.style.backgroundColor=C.container}
            onMouseLeave={e=>e.currentTarget.style.backgroundColor='transparent'}>
            ×
          </button>
        </div>

        <div className="px-6 py-5 space-y-4 text-sm">
          <DetailRow label="Teléfono principal" value={cliente.telefono}/>
          <DetailRow label="Teléfono alterno"   value={cliente.telefono_alt || '—'}/>
          <DetailRow label="Dirección principal" value={cliente.direccion_principal} multi/>
          <DetailRow label="Dirección alterna"   value={cliente.direccion_alterna || '—'} multi/>
          <DetailRow label="Observaciones"       value={cliente.observaciones || '—'} multi/>
        </div>

        <div className="flex gap-3 px-6 pb-5">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-lg text-sm font-semibold"
            style={{ backgroundColor:C.container, color:C.textSub }}>
            Cerrar
          </button>
          <button onClick={() => onEdit(cliente)}
            className="flex-1 py-2.5 rounded-lg text-sm font-semibold"
            style={{ backgroundColor:C.primary, color:C.white }}>
            ✏️ Editar
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value, multi }) {
  return (
    <div>
      <p className="text-xs font-bold tracking-wider uppercase mb-1" style={{ color:C.textSub }}>{label}</p>
      <p className={`text-sm font-medium ${multi?'leading-relaxed':''}`} style={{ color:C.text }}>
        {value}
      </p>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MODAL: CONFIRMAR ELIMINACIÓN
// ══════════════════════════════════════════════════════════════════════════════
function ConfirmModal({ open, cliente, onConfirm, onClose, deleting }) {
  if (!open || !cliente) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
         style={{ backgroundColor:'rgba(26,28,21,0.5)' }}>
      <div className="w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-scale-in"
           style={{ backgroundColor:C.white }}>
        <div className="text-center mb-5">
          <div className="text-4xl mb-3">🗑️</div>
          <h3 className="font-extrabold text-lg" style={{ color:C.text }}>¿Eliminar cliente?</h3>
          <p className="text-sm mt-2 leading-relaxed" style={{ color:C.textMuted }}>
            Se eliminará <strong style={{ color:C.text }}>{cliente.nombre}</strong>.
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
// TARJETA DE CLIENTE
// ══════════════════════════════════════════════════════════════════════════════
function ClienteCard({ c, onView, onEdit, onDelete }) {
  const av = getAvatarColor(c.id_cliente);
  return (
    <div className="rounded-2xl flex flex-col transition-all duration-200"
         style={{ backgroundColor:C.white, border:`1px solid ${C.border}`, boxShadow:'0 2px 8px rgba(26,28,21,0.05)' }}
         onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(26,28,21,0.10)';}}
         onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='0 2px 8px rgba(26,28,21,0.05)';}}>

      <div className="p-5 flex-1">
        {/* Avatar + nombre */}
        <div className="flex items-start gap-3 mb-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center font-extrabold text-base flex-shrink-0"
               style={{ backgroundColor:av.bg, color:av.color }}>
            {getIniciales(c.nombre)}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-extrabold text-base leading-snug truncate" style={{ color:C.text }}>
              {c.nombre}
            </h3>
            <p className="text-xs font-medium mt-0.5" style={{ color:C.textMuted }}>
              {c.nit_cc ? `NIT/CC: ${c.nit_cc}` : 'Sin NIT/CC'}
            </p>
          </div>
        </div>

        {/* Info */}
        <div className="space-y-2 text-xs">
          <InfoLine icon="📞" value={c.telefono} muted={false}/>
          {c.telefono_alt && <InfoLine icon="📱" value={c.telefono_alt}/>}
          <InfoLine icon="📍" value={c.direccion_principal} clamp/>
          {c.direccion_alterna && <InfoLine icon="🏠" value={c.direccion_alterna} clamp/>}
        </div>
      </div>

      {/* Acciones */}
      <div className="flex border-t" style={{ borderColor:C.border }}>
        <button onClick={()=>onView(c)}
          className="flex-1 py-2.5 text-xs font-semibold transition-colors"
          style={{ color:C.textSub }}
          onMouseEnter={e=>e.currentTarget.style.backgroundColor=C.container}
          onMouseLeave={e=>e.currentTarget.style.backgroundColor='transparent'}>
          👁️ Ver
        </button>
        <div style={{ width:1, backgroundColor:C.border }}/>
        <button onClick={()=>onEdit(c)}
          className="flex-1 py-2.5 text-xs font-semibold transition-colors"
          style={{ color:C.primary }}
          onMouseEnter={e=>e.currentTarget.style.backgroundColor='#eef3e4'}
          onMouseLeave={e=>e.currentTarget.style.backgroundColor='transparent'}>
          ✏️ Editar
        </button>
        <div style={{ width:1, backgroundColor:C.border }}/>
        <button onClick={()=>onDelete(c)}
          className="flex-1 py-2.5 text-xs font-semibold transition-colors"
          style={{ color:'#ba1a1a' }}
          onMouseEnter={e=>e.currentTarget.style.backgroundColor='#fff0f0'}
          onMouseLeave={e=>e.currentTarget.style.backgroundColor='transparent'}>
          🗑️ Eliminar
        </button>
      </div>
    </div>
  );
}

function InfoLine({ icon, value, clamp }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-sm leading-none mt-0.5">{icon}</span>
      <p className={`font-medium ${clamp?'line-clamp-2':''}`} style={{ color:C.textSub }}>{value}</p>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// VISTA TABLA
// ══════════════════════════════════════════════════════════════════════════════
function TablaClientes({ clientes, onView, onEdit, onDelete }) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ border:`1px solid ${C.border}` }}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm" style={{ backgroundColor:C.white }}>
          <thead>
            <tr style={{ backgroundColor:C.container }}>
              {['Cliente','NIT/CC','Teléfono','Dirección principal','Acciones'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-bold tracking-wider uppercase"
                    style={{ color:C.textSub }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y" style={{ '--tw-divide-color':C.border }}>
            {clientes.map(c => {
              const av = getAvatarColor(c.id_cliente);
              return (
                <tr key={c.id_cliente} className="transition-colors"
                    onMouseEnter={e=>e.currentTarget.style.backgroundColor=C.surface}
                    onMouseLeave={e=>e.currentTarget.style.backgroundColor='transparent'}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-extrabold"
                           style={{ backgroundColor:av.bg, color:av.color }}>
                        {getIniciales(c.nombre)}
                      </div>
                      <div className="font-semibold" style={{ color:C.text }}>{c.nombre}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs font-medium" style={{ color:C.textSub }}>
                    {c.nit_cc || '—'}
                  </td>
                  <td className="px-4 py-3 text-xs font-semibold" style={{ color:C.text }}>
                    {c.telefono}
                    {c.telefono_alt && (
                      <div className="text-[10px] font-medium mt-0.5" style={{ color:C.textMuted }}>
                        alt: {c.telefono_alt}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs font-medium max-w-xs" style={{ color:C.textSub }}>
                    <div className="truncate">{c.direccion_principal}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={()=>onView(c)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                        style={{ backgroundColor:C.container, color:C.textSub }}>
                        Ver
                      </button>
                      <button onClick={()=>onEdit(c)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                        style={{ backgroundColor:'#eef3e4', color:C.primary }}>
                        Editar
                      </button>
                      <button onClick={()=>onDelete(c)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold"
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
export default function ClientesPage() {
  const [clientes,     setClientes]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState('');
  const [vista,        setVista]        = useState('cards'); // 'cards' | 'tabla'
  const [modalOpen,    setModalOpen]    = useState(false);
  const [editData,     setEditData]     = useState(null);
  const [detalle,      setDetalle]      = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting,     setDeleting]     = useState(false);
  const { toasts, toast, removeToast }  = useToast();
  const searchTimer                     = useRef(null);

  // ── Cargar clientes ────────────────────────────────────────────────────────
  const fetchClientes = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.q = search;
      const { data } = await api.get('/clientes', { params });
      setClientes(data.data || []);
    } catch (err) {
      toast(err.response?.data?.message || 'Error al cargar clientes.', 'error');
    } finally { setLoading(false); }
  }, [search]);

  useEffect(() => { fetchClientes(); }, [fetchClientes]);

  // ── Búsqueda con debounce ──────────────────────────────────────────────────
  const handleSearch = (val) => {
    setSearch(val);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {}, 400);
  };

  // ── CRUD handlers ──────────────────────────────────────────────────────────
  const openCreate = ()  => { setEditData(null); setModalOpen(true); };
  const openEdit   = (c) => { setEditData(c);    setModalOpen(true); setDetalle(null); };
  const openView   = (c) => setDetalle(c);
  const openDelete = (c) => setDeleteTarget(c);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/clientes/${deleteTarget.id_cliente}`);
      toast(`"${deleteTarget.nombre}" eliminado correctamente.`);
      setDeleteTarget(null);
      fetchClientes();
    } catch (err) {
      toast(err.response?.data?.message || 'Error al eliminar.', 'error');
    } finally { setDeleting(false); }
  };

  return (
    <>
      <AppLayout activeKey="clientes" searchValue={search} onSearch={handleSearch}>
        <div className="p-5 md:p-6 space-y-5">

          {/* Encabezado */}
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <div className="flex-1">
              <h2 className="font-extrabold text-2xl md:text-3xl"
                  style={{ color:C.text, letterSpacing:'-0.02em' }}>
                Gestión de Clientes
              </h2>
              <p className="mt-1 text-sm font-medium" style={{ color:C.textMuted }}>
                Directorio de clientes con historial, teléfonos y direcciones de entrega.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={() => setVista(v => v==='cards'?'tabla':'cards')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{ backgroundColor:C.white, color:C.primary, border:`1.5px solid ${C.primary}` }}>
                Vista {vista==='cards' ? 'Tabla' : 'Tarjetas'}
              </button>
              <button onClick={openCreate}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95"
                style={{ backgroundColor:C.primary, color:C.white, boxShadow:'0 4px 14px rgba(71,101,0,0.35)' }}
                onMouseEnter={e=>e.currentTarget.style.backgroundColor=C.primary2}
                onMouseLeave={e=>e.currentTarget.style.backgroundColor=C.primary}>
                <span className="text-base leading-none">+</span>
                Nuevo Cliente
              </button>
            </div>
          </div>

          {/* Contenido */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-8 h-8 border-2 rounded-full animate-spin"
                   style={{ borderColor:C.primary, borderTopColor:'transparent' }}/>
              <p className="text-sm font-medium" style={{ color:C.textMuted }}>Cargando clientes…</p>
            </div>
          ) : clientes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="text-5xl">👥</div>
              <p className="font-bold text-lg" style={{ color:C.text }}>
                {search ? 'Sin resultados' : 'No hay clientes registrados'}
              </p>
              <p className="text-sm font-medium" style={{ color:C.textMuted }}>
                {search ? 'Intenta con otro nombre, teléfono o NIT.' : 'Crea el primer cliente con el botón "Nuevo Cliente".'}
              </p>
            </div>
          ) : vista === 'cards' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {clientes.map(c => (
                <ClienteCard key={c.id_cliente} c={c}
                  onView={openView} onEdit={openEdit} onDelete={openDelete}/>
              ))}
            </div>
          ) : (
            <TablaClientes clientes={clientes}
              onView={openView} onEdit={openEdit} onDelete={openDelete}/>
          )}

          {/* Contador */}
          {!loading && clientes.length > 0 && (
            <p className="text-xs font-medium text-center" style={{ color:C.textMuted }}>
              Mostrando <strong>{clientes.length}</strong> cliente{clientes.length !== 1 ? 's' : ''}
              {search ? ` — búsqueda: "${search}"` : ''}
            </p>
          )}

          {/* Footer */}
          <footer className="text-center py-4">
            <p className="text-xs font-semibold italic" style={{ color:C.textMuted }}>
              ❤️ Cocinamos con amor para tu familia
            </p>
          </footer>

        </div>
      </AppLayout>

      {/* Modales */}
      <ClienteModal
        open={modalOpen} onClose={() => setModalOpen(false)}
        onSaved={fetchClientes} editData={editData} toast={toast}
      />
      <DetalleModal
        cliente={detalle}
        onClose={() => setDetalle(null)}
        onEdit={openEdit}
      />
      <ConfirmModal
        open={!!deleteTarget} cliente={deleteTarget}
        onConfirm={confirmDelete} onClose={() => setDeleteTarget(null)}
        deleting={deleting}
      />

      <ToastContainer toasts={toasts} onRemove={removeToast}/>
    </>
  );
}
