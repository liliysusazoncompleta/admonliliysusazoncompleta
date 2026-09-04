/**
 * @fileoverview Página Gestión de Ventas — Visualización, edición y eliminación
 * @module client/src/pages/VentasPage
 */
import { useState, useEffect, useCallback } from 'react';
import api from '../lib/api.js';
import AppLayout from '../components/AppLayout.jsx';

const C = {
  primary: '#476500', primary2: '#5d7f13',
  surface: '#fafaed', container: '#eeefe2',
  white: '#ffffff', text: '#1a1c15',
  textMuted: '#747967', textSub: '#444939',
  border: '#e2e3d6', orange: '#944a00',
  error: '#ba1a1a', errorBg: '#ffdad6',
  gray: '#999999',
};

function useToast() {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
  }, []);
  const remove = useCallback(id => setToasts(p => p.filter(t => t.id !== id)), []);
  return { toasts, toast: add, removeToast: remove };
}

function toDateInput(value) {
  if (!value) return '';
  const s = String(value);
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function Field({ label, required, error, as = 'input', children, ...props }) {
  const Comp = as;
  return (
    <div>
      <label className="text-xs font-semibold block mb-1" style={{ color: C.textMuted }}>
        {label}{required ? ' *' : ''}
      </label>
      {children || (
        <Comp
          className="w-full px-3 py-2 rounded-lg border text-sm"
          style={{
            borderColor: error ? C.error : C.border,
            backgroundColor: C.container,
            color: C.text,
          }}
          {...props}
        />
      )}
      {error && <p className="text-xs mt-1" style={{ color: C.error }}>{error}</p>}
    </div>
  );
}

const EMPTY_VENTA_FORM = {
  id_cliente: '',
  id_empleado_comision: '',
  fecha_entrega: '',
  valor_factura: '',
  porcentaje_comision: '0',
  valor_domicilio: '0',
  observaciones: '',
  estado: 'pendiente',
};

function VentaFormModal({ open, venta, clientes, vendedores, onClose, onSaved, toast }) {
  const isEdit = !!venta;
  const [form, setForm] = useState(EMPTY_VENTA_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (venta) {
      setForm({
        id_cliente: String(venta.id_cliente || ''),
        id_empleado_comision: String(venta.id_empleado_comision || ''),
        fecha_entrega: toDateInput(venta.fecha_entrega),
        valor_factura: String(venta.valor_factura ?? ''),
        porcentaje_comision: String(venta.porcentaje_comision ?? 0),
        valor_domicilio: String(venta.valor_domicilio ?? 0),
        observaciones: venta.observaciones || '',
        estado: venta.estado || 'pendiente',
      });
    } else {
      setForm({
        ...EMPTY_VENTA_FORM,
        fecha_entrega: toDateInput(new Date()),
      });
    }
    setErrors({});
  }, [open, venta]);

  const set = (k, v) => {
    setForm(p => ({ ...p, [k]: v }));
    setErrors(p => ({ ...p, [k]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.id_cliente) e.id_cliente = 'Selecciona un cliente';
    if (!form.id_empleado_comision) e.id_empleado_comision = 'Selecciona un vendedor';
    if (!form.fecha_entrega) e.fecha_entrega = 'La fecha de entrega es requerida';
    if (form.valor_factura === '' || Number(form.valor_factura) < 0) {
      e.valor_factura = 'Ingresa un valor válido';
    }
    if (Number(form.porcentaje_comision) < 0) e.porcentaje_comision = 'Debe ser ≥ 0';
    if (Number(form.valor_domicilio) < 0) e.valor_domicilio = 'Debe ser ≥ 0';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const payload = {
      id_cliente: Number(form.id_cliente),
      id_empleado_comision: Number(form.id_empleado_comision),
      fecha_entrega: form.fecha_entrega,
      valor_factura: Number(form.valor_factura),
      porcentaje_comision: Number(form.porcentaje_comision) || 0,
      valor_domicilio: Number(form.valor_domicilio) || 0,
      observaciones: form.observaciones.trim() || null,
      estado: form.estado,
    };

    setSaving(true);
    try {
      if (isEdit) {
        await api.put(`/ventas/${venta.id_venta}`, payload);
        toast('Venta actualizada correctamente.');
      } else {
        await api.post('/ventas', payload);
        toast('Venta creada correctamente.');
      }
      await onSaved();
      onClose();
    } catch (err) {
      toast(
        err.response?.data?.message ||
          (isEdit ? 'Error al actualizar la venta.' : 'Error al crear la venta.'),
        'error'
      );
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  const clienteOptions = [...clientes];
  if (
    venta?.id_cliente &&
    !clienteOptions.some(c => Number(c.id_cliente) === Number(venta.id_cliente))
  ) {
    clienteOptions.unshift({
      id_cliente: venta.id_cliente,
      nombre: venta.cliente_nombre || `Cliente #${venta.id_cliente}`,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
         style={{ backgroundColor: 'rgba(26,28,21,0.5)' }}
         onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl"
           style={{ backgroundColor: C.white, maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="flex items-center justify-between px-6 py-4"
             style={{ borderBottom: `1px solid ${C.border}` }}>
          <div>
            <h2 className="font-extrabold text-lg" style={{ color: C.text }}>
              {isEdit ? 'Editar venta' : 'Nueva venta'}
            </h2>
            <p className="text-xs font-medium mt-0.5" style={{ color: C.textMuted }}>
              {isEdit
                ? `Venta #${venta.id_venta} · ${venta.cliente_nombre || 'Sin cliente'}`
                : 'Completa los datos para registrar la venta'}
            </p>
          </div>
          <button type="button" onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
            style={{ color: C.textMuted }}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Cliente" required error={errors.id_cliente}>
              <select value={form.id_cliente} onChange={e => set('id_cliente', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border text-sm"
                style={{ borderColor: errors.id_cliente ? C.error : C.border, backgroundColor: C.container }}>
                <option value="">Seleccionar…</option>
                {clienteOptions.map(c => (
                  <option key={c.id_cliente} value={c.id_cliente}>{c.nombre}</option>
                ))}
              </select>
            </Field>
            <Field label="Vendedor" required error={errors.id_empleado_comision}>
              <select value={form.id_empleado_comision}
                onChange={e => set('id_empleado_comision', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border text-sm"
                style={{ borderColor: errors.id_empleado_comision ? C.error : C.border, backgroundColor: C.container }}>
                <option value="">Seleccionar…</option>
                {vendedores.map(v => (
                  <option key={v.id_empleado} value={v.id_empleado}>{v.nombre}</option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Fecha de entrega" required type="date"
              value={form.fecha_entrega} error={errors.fecha_entrega}
              onChange={e => set('fecha_entrega', e.target.value)} />
            <Field label="Estado" required>
              <select value={form.estado} onChange={e => set('estado', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border text-sm"
                style={{ borderColor: C.border, backgroundColor: C.container }}>
                <option value="pendiente">Pendiente</option>
                <option value="entregada">Entregada</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Valor factura" required type="number" min="0" step="0.01"
              value={form.valor_factura} error={errors.valor_factura}
              onChange={e => set('valor_factura', e.target.value)} />
            <Field label="% Comisión" type="number" min="0" step="0.01"
              value={form.porcentaje_comision} error={errors.porcentaje_comision}
              onChange={e => set('porcentaje_comision', e.target.value)} />
            <Field label="Domicilio" type="number" min="0" step="0.01"
              value={form.valor_domicilio} error={errors.valor_domicilio}
              onChange={e => set('valor_domicilio', e.target.value)} />
          </div>

          <Field label="Observaciones" as="textarea" rows={3}
            value={form.observaciones}
            onChange={e => set('observaciones', e.target.value)}
            placeholder="Notas de la venta…" />

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold"
              style={{ backgroundColor: C.container, color: C.textSub }}>
              Cancelar
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-60"
              style={{ backgroundColor: C.primary, color: C.white }}>
              {saving ? 'Guardando…' : isEdit ? 'Actualizar venta' : 'Crear venta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ConfirmDeleteModal({ open, venta, onConfirm, onClose, deleting }) {
  if (!open || !venta) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
         style={{ backgroundColor: 'rgba(26,28,21,0.5)' }}>
      <div className="w-full max-w-sm rounded-2xl p-6 shadow-2xl"
           style={{ backgroundColor: C.white }}>
        <div className="text-center mb-5">
          <div className="text-4xl mb-3">🗑️</div>
          <h3 className="font-extrabold text-lg" style={{ color: C.text }}>¿Eliminar venta?</h3>
          <p className="text-sm mt-2 leading-relaxed" style={{ color: C.textMuted }}>
            Se eliminará la venta de{' '}
            <strong style={{ color: C.text }}>{venta.cliente_nombre || `#${venta.id_venta}`}</strong>
            {' '}por ${Number(venta.valor_factura || 0).toLocaleString('es-CO')}.
            Esta acción no se puede deshacer.
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} disabled={deleting}
            className="flex-1 py-2.5 rounded-lg text-sm font-semibold"
            style={{ backgroundColor: C.container, color: C.textSub }}>
            Cancelar
          </button>
          <button onClick={onConfirm} disabled={deleting}
            className="flex-1 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-60"
            style={{ backgroundColor: C.error, color: C.white }}>
            {deleting ? 'Eliminando…' : 'Sí, eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VentasPage() {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroAno, setFiltroAno] = useState('');
  const [filtroMes, setFiltroMes] = useState('');
  const [filtroVendedor, setFiltroVendedor] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [vendedores, setVendedores] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [updating, setUpdating] = useState(null);
  const [preview, setPreview] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editVenta, setEditVenta] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const { toasts, toast } = useToast();

  const openCreate = () => { setEditVenta(null); setModalOpen(true); };
  const openEdit = (venta) => { setEditVenta(venta); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditVenta(null); };

  const fetchVendedores = useCallback(async () => {
    try {
      const { data } = await api.get('/empleados', { params: { activos: 'todos' } });
      setVendedores(data.data || []);
    } catch (err) {
      console.error('Error al cargar vendedores:', err);
    }
  }, []);

  const fetchClientes = useCallback(async () => {
    try {
      const { data } = await api.get('/clientes', { params: { limit: 500 } });
      setClientes(data.data || []);
    } catch (err) {
      console.error('Error al cargar clientes:', err);
    }
  }, []);

  const fetchVentas = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filtroAno) params.ano = filtroAno;
      if (filtroMes) params.mes = filtroMes;
      if (filtroVendedor) params.vendedor = filtroVendedor;
      if (filtroEstado) params.estado = filtroEstado;
      const { data } = await api.get('/ventas', { params });
      setVentas(data.data || []);
    } catch (err) {
      toast(err.response?.data?.message || 'Error al cargar ventas.', 'error');
    } finally {
      setLoading(false);
    }
  }, [filtroAno, filtroMes, filtroVendedor, filtroEstado, toast]);

  useEffect(() => {
    fetchVendedores();
    fetchClientes();
  }, [fetchVendedores, fetchClientes]);

  useEffect(() => {
    fetchVentas();
  }, [fetchVentas]);

  const exportarCSV = () => {
    if (!ventas.length) return;

    const encabezados = [
      'Fecha Factura', 'Cliente', 'Vendedor',
      'Valor Factura', 'Comisión', 'Domicilio',
      'Fecha Entrega', 'Hora Entrega', 'Estado',
    ];

    const filas = ventas.map(v => [
      v.fecha_factura ? new Date(v.fecha_factura).toLocaleDateString('es-CO') : '',
      v.cliente_nombre || '',
      v.empleado_nombre || '',
      Number(v.valor_factura || 0).toLocaleString('es-CO'),
      Number(v.valor_comision || 0).toLocaleString('es-CO'),
      Number(v.valor_domicilio || 0).toLocaleString('es-CO'),
      v.fecha_entrega ? new Date(v.fecha_entrega).toLocaleDateString('es-CO') : '',
      v.hora_entrega || '',
      v.estado || '',
    ]);

    const contenido = [encabezados, ...filas]
      .map(fila => fila.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob(['\uFEFF' + contenido], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ventas_${filtroAno || 'todos'}_${filtroMes || 'todos'}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast(`✅ CSV exportado con ${ventas.length} ventas.`);
  };

  const handleChangeEstado = async (venta) => {
    setUpdating(venta.id_venta);
    try {
      let nuevoEstado;
      if (venta.estado === 'entregada') {
        nuevoEstado = 'pendiente';
      } else if (venta.estado === 'pendiente') {
        nuevoEstado = 'cancelada';
      } else {
        nuevoEstado = 'entregada';
      }

      await api.patch(`/ventas/${venta.id_venta}/estado`, { estado: nuevoEstado });
      toast(`Venta marcada como ${nuevoEstado}.`);
      fetchVentas();
    } catch (err) {
      toast(err.response?.data?.message || 'Error al actualizar venta.', 'error');
    } finally {
      setUpdating(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/ventas/${deleteTarget.id_venta}`);
      toast('Venta eliminada correctamente.');
      setDeleteTarget(null);
      fetchVentas();
    } catch (err) {
      toast(err.response?.data?.message || 'Error al eliminar la venta.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const anos = ['2025', '2026'];
  const meses = [
    { value: '01', label: 'Enero' },
    { value: '02', label: 'Febrero' },
    { value: '03', label: 'Marzo' },
    { value: '04', label: 'Abril' },
    { value: '05', label: 'Mayo' },
    { value: '06', label: 'Junio' },
    { value: '07', label: 'Julio' },
    { value: '08', label: 'Agosto' },
    { value: '09', label: 'Septiembre' },
    { value: '10', label: 'Octubre' },
    { value: '11', label: 'Noviembre' },
    { value: '12', label: 'Diciembre' },
  ];

  const getEstadoColor = (estado) => {
    if (estado === 'entregada') return { bg: '#eef3e4', text: C.primary };
    if (estado === 'pendiente') return { bg: '#fff3eb', text: C.orange };
    if (estado === 'cancelada') return { bg: '#fdddd6', text: C.error };
    return { bg: C.container, text: C.text };
  };

  const getEstadoLabel = (estado) => {
    if (estado === 'entregada') return 'Entregada';
    if (estado === 'pendiente') return 'Pendiente';
    if (estado === 'cancelada') return 'Cancelada';
    return estado;
  };

  return (
    <AppLayout activeKey="ventas">
      <div className="p-5 md:p-6 space-y-5">
        <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
          {toasts.map(t => (
            <div
              key={t.id}
              className="px-4 py-3 rounded-lg text-sm font-medium text-white transition-all"
              style={{ backgroundColor: t.type === 'error' ? C.error : C.primary }}
            >
              {t.message}
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="flex-1">
            <h2 className="font-extrabold text-2xl md:text-3xl" style={{ color: C.text }}>
              Gestión de Ventas
            </h2>
            <p className="text-sm font-medium mt-1" style={{ color: C.textMuted }}>
              Crea, modifica o elimina ventas
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0 flex-wrap">
            <button onClick={openCreate}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{ backgroundColor: C.primary, color: C.white,
                       boxShadow: '0 4px 12px rgba(71,101,0,0.3)' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = C.primary2}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = C.primary}>
              + Nueva venta
            </button>
            {ventas.length > 0 && (
              <>
              <button onClick={() => setPreview(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{ backgroundColor: C.container, color: C.text,
                         border: `1px solid ${C.border}` }}>
                👁️ Vista Previa
              </button>
              <button onClick={exportarCSV}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{ backgroundColor: '#1B3A0F', color: C.white,
                         boxShadow: '0 4px 12px rgba(27,58,15,0.3)' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#2C5418'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#1B3A0F'}>
                📥 Descargar CSV
              </button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div>
            <label className="text-xs font-semibold" style={{ color: C.textMuted }}>Año</label>
            <select value={filtroAno} onChange={e => setFiltroAno(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-lg border"
              style={{ borderColor: C.border, backgroundColor: C.container }}>
              <option value="">Todos los años</option>
              {anos.map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold" style={{ color: C.textMuted }}>Mes</label>
            <select value={filtroMes} onChange={e => setFiltroMes(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-lg border"
              style={{ borderColor: C.border, backgroundColor: C.container }}>
              <option value="">Todos los meses</option>
              {meses.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold" style={{ color: C.textMuted }}>Vendedor</label>
            <select value={filtroVendedor} onChange={e => setFiltroVendedor(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-lg border"
              style={{ borderColor: C.border, backgroundColor: C.container }}>
              <option value="">Todos los vendedores</option>
              {vendedores.map(v => (
                <option key={v.id_empleado} value={v.id_empleado}>{v.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold" style={{ color: C.textMuted }}>Estado</label>
            <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-lg border"
              style={{ borderColor: C.border, backgroundColor: C.container }}>
              <option value="">Todos los estados</option>
              <option value="entregada">Entregada</option>
              <option value="pendiente">Pendiente</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={() => { setFiltroAno(''); setFiltroMes(''); setFiltroVendedor(''); setFiltroEstado(''); }}
              className="w-full px-3 py-2 rounded-lg text-sm font-semibold transition-all"
              style={{ backgroundColor: C.container, color: C.text }}>
              Limpiar filtros
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10" style={{ color: C.textMuted }}>Cargando...</div>
        ) : ventas.length === 0 ? (
          <div className="text-center py-10" style={{ color: C.textMuted }}>No hay ventas</div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead style={{ backgroundColor: C.container }}>
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: C.text }}>Fecha</th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: C.text }}>Cliente</th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: C.text }}>Vendedor</th>
                    <th className="px-4 py-3 text-right font-semibold" style={{ color: C.text }}>Valor</th>
                    <th className="px-4 py-3 text-right font-semibold" style={{ color: C.text }}>Comisión</th>
                    <th className="px-4 py-3 text-right font-semibold" style={{ color: C.text }}>Domicilio</th>
                    <th className="px-4 py-3 text-center font-semibold" style={{ color: C.text }}>Entrega</th>
                    <th className="px-4 py-3 text-center font-semibold" style={{ color: C.text }}>Estado</th>
                    <th className="px-4 py-3 text-center font-semibold" style={{ color: C.text }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {ventas.map(venta => (
                    <tr key={venta.id_venta} style={{ borderBottom: `1px solid ${C.border}` }}>
                      <td className="px-4 py-3" style={{ color: C.text }}>
                        {new Date(venta.fecha_factura).toLocaleDateString('es-CO')}
                      </td>
                      <td className="px-4 py-3" style={{ color: C.text }}>{venta.cliente_nombre}</td>
                      <td className="px-4 py-3" style={{ color: C.text }}>{venta.empleado_nombre}</td>
                      <td className="px-4 py-3 text-right" style={{ color: C.text }}>
                        ${Number(venta.valor_factura).toLocaleString('es-CO')}
                      </td>
                      <td className="px-4 py-3 text-right" style={{ color: C.text }}>
                        ${Number(venta.valor_comision).toLocaleString('es-CO')}
                      </td>
                      <td className="px-4 py-3 text-right" style={{ color: C.text }}>
                        ${Number(venta.valor_domicilio || 0).toLocaleString('es-CO')}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {venta.fecha_entrega ? new Date(venta.fecha_entrega).toLocaleDateString('es-CO') : '—'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => handleChangeEstado(venta)} disabled={updating === venta.id_venta}
                          className="px-3 py-1 rounded text-xs font-semibold transition-all"
                          style={{
                            backgroundColor: getEstadoColor(venta.estado).bg,
                            color: getEstadoColor(venta.estado).text
                          }}>
                          {updating === venta.id_venta ? '...' : getEstadoLabel(venta.estado)}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEdit(venta)}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all"
                            style={{ backgroundColor: '#eef3e4', color: C.primary }}
                            title="Modificar venta">
                            ✏️ Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(venta)}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all"
                            style={{ backgroundColor: C.errorBg, color: C.error }}
                            title="Eliminar venta">
                            🗑️ Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!loading && ventas.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <p className="text-xs font-semibold" style={{ color: C.textMuted }}>Total Ventas</p>
              <p className="text-xl font-extrabold mt-1" style={{ color: C.primary }}>
                ${ventas.reduce((sum, v) => sum + Number(v.valor_factura), 0).toLocaleString('es-CO')}
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <p className="text-xs font-semibold" style={{ color: C.textMuted }}>Domicilios</p>
              <p className="text-xl font-extrabold mt-1" style={{ color: C.textSub }}>
                ${ventas.reduce((sum, v) => sum + Number(v.valor_domicilio || 0), 0).toLocaleString('es-CO')}
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <p className="text-xs font-semibold" style={{ color: C.textMuted }}>Comisiones</p>
              <p className="text-xl font-extrabold mt-1" style={{ color: C.primary }}>
                ${ventas.reduce((sum, v) => sum + Number(v.valor_comision), 0).toLocaleString('es-CO')}
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <p className="text-xs font-semibold" style={{ color: C.textMuted }}>Entregadas</p>
              <p className="text-xl font-extrabold mt-1" style={{ color: C.primary }}>
                {ventas.filter(v => v.estado === 'entregada').length}/{ventas.length}
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <p className="text-xs font-semibold" style={{ color: C.textMuted }}>Pendientes</p>
              <p className="text-xl font-extrabold mt-1" style={{ color: C.orange }}>
                {ventas.filter(v => v.estado === 'pendiente').length}/{ventas.length}
              </p>
            </div>
          </div>
        )}
      </div>

      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
             style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
             onClick={e => { if (e.target === e.currentTarget) setPreview(false); }}>
          <div className="w-full rounded-2xl overflow-hidden flex flex-col"
               style={{ maxWidth: 900, maxHeight: '90vh',
                        backgroundColor: C.white, boxShadow: '0 24px 60px rgba(0,0,0,0.3)' }}>
            <div className="flex items-center justify-between px-6 py-4"
                 style={{ backgroundColor: C.primary }}>
              <div>
                <p className="text-xs font-bold tracking-widest uppercase"
                   style={{ color: 'rgba(255,255,255,0.7)', letterSpacing: 3 }}>
                  VISTA PREVIA
                </p>
                <p className="text-base font-bold text-white mt-0.5">
                  {ventas.length} venta{ventas.length !== 1 ? 's' : ''} con los filtros actuales
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setPreview(false); exportarCSV(); }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all"
                  style={{ backgroundColor: '#C8973A', color: '#1B3A0F' }}>
                  📥 Descargar CSV
                </button>
                <button onClick={() => setPreview(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold"
                  style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: C.white }}>
                  ✕ Cerrar
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto">
              <table className="w-full text-sm">
                <thead style={{ backgroundColor: C.container, position: 'sticky', top: 0 }}>
                  <tr>
                    {['Fecha', 'Cliente', 'Vendedor', 'Valor', 'Comisión', 'Domicilio', 'Entrega', 'Estado'].map(h => (
                      <th key={h} className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wide"
                          style={{ color: C.textSub }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ventas.map((v, i) => (
                    <tr key={v.id_venta}
                        style={{ borderBottom: `1px solid ${C.border}`,
                                 backgroundColor: i % 2 === 0 ? C.white : C.surface }}>
                      <td className="px-4 py-2.5 text-xs" style={{ color: C.text }}>
                        {v.fecha_factura ? new Date(v.fecha_factura).toLocaleDateString('es-CO') : '—'}
                      </td>
                      <td className="px-4 py-2.5 text-xs font-semibold" style={{ color: C.text }}>
                        {v.cliente_nombre}
                      </td>
                      <td className="px-4 py-2.5 text-xs" style={{ color: C.textMuted }}>
                        {v.empleado_nombre || '—'}
                      </td>
                      <td className="px-4 py-2.5 text-xs font-bold text-right" style={{ color: C.primary }}>
                        ${Number(v.valor_factura || 0).toLocaleString('es-CO')}
                      </td>
                      <td className="px-4 py-2.5 text-xs text-right" style={{ color: C.textMuted }}>
                        ${Number(v.valor_comision || 0).toLocaleString('es-CO')}
                      </td>
                      <td className="px-4 py-2.5 text-xs text-right" style={{ color: C.textMuted }}>
                        ${Number(v.valor_domicilio || 0).toLocaleString('es-CO')}
                      </td>
                      <td className="px-4 py-2.5 text-xs text-center" style={{ color: C.text }}>
                        {v.fecha_entrega ? new Date(v.fecha_entrega).toLocaleDateString('es-CO') : '—'}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span className="px-2 py-1 rounded-full text-xs font-semibold"
                              style={{ backgroundColor: getEstadoColor(v.estado).bg,
                                       color: getEstadoColor(v.estado).text }}>
                          {getEstadoLabel(v.estado)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between px-6 py-3 flex-wrap gap-3"
                 style={{ borderTop: `1px solid ${C.border}`, backgroundColor: C.surface }}>
              <div className="flex gap-6">
                <div>
                  <p className="text-xs" style={{ color: C.textMuted }}>Total facturado</p>
                  <p className="text-base font-extrabold" style={{ color: C.primary }}>
                    ${ventas.reduce((s, v) => s + Number(v.valor_factura || 0), 0).toLocaleString('es-CO')}
                  </p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: C.textMuted }}>Total comisiones</p>
                  <p className="text-base font-extrabold" style={{ color: C.orange }}>
                    ${ventas.reduce((s, v) => s + Number(v.valor_comision || 0), 0).toLocaleString('es-CO')}
                  </p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: C.textMuted }}>Total domicilios</p>
                  <p className="text-base font-extrabold" style={{ color: C.textSub }}>
                    ${ventas.reduce((s, v) => s + Number(v.valor_domicilio || 0), 0).toLocaleString('es-CO')}
                  </p>
                </div>
              </div>
              <p className="text-xs font-medium" style={{ color: C.textMuted }}>
                {ventas.length} registro{ventas.length !== 1 ? 's' : ''} · exporta solo lo visible
              </p>
            </div>
          </div>
        </div>
      )}

      <VentaFormModal
        open={modalOpen}
        venta={editVenta}
        clientes={clientes}
        vendedores={vendedores}
        onClose={closeModal}
        onSaved={fetchVentas}
        toast={toast}
      />

      <ConfirmDeleteModal
        open={!!deleteTarget}
        venta={deleteTarget}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
        deleting={deleting}
      />
    </AppLayout>
  );
}
