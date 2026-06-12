/**
 * @fileoverview Página Gestión de Ventas — Visualización y actualización de estado
 * @module client/src/pages/VentasPage
 */
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import AppLayout from '../components/AppLayout.jsx';

const api = axios.create({ baseURL: '/api' });
api.interceptors.request.use(cfg => {
  const t = localStorage.getItem('lili_token');
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

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

export default function VentasPage() {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroAno, setFiltroAno] = useState('');
  const [filtroMes, setFiltroMes] = useState('');
  const [filtroVendedor, setFiltroVendedor] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [vendedores, setVendedores] = useState([]);
  const [updating, setUpdating] = useState(null);
  const { toasts, toast, removeToast } = useToast();

  const fetchVendedores = useCallback(async () => {
    try {
      const { data } = await api.get('/empleados', { params: { activos: 'todos' } });
      setVendedores(data.data || []);
    } catch (err) {
      console.error('Error al cargar vendedores:', err);
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
  }, [fetchVendedores]);

  useEffect(() => {
    fetchVentas();
  }, [fetchVentas]);

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
        {/* Toast Notifications */}
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

        {/* Encabezado */}
        <div>
          <h2 className="font-extrabold text-2xl md:text-3xl" style={{ color: C.text }}>
            Gestión de Ventas
          </h2>
          <p className="text-sm font-medium mt-1" style={{ color: C.textMuted }}>
            Visualiza y actualiza el estado de las ventas
          </p>
        </div>

        {/* Filtros */}
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

        {/* Tabla de ventas */}
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
                    <th className="px-4 py-3 text-center font-semibold" style={{ color: C.text }}>Entrega</th>
                    <th className="px-4 py-3 text-center font-semibold" style={{ color: C.text }}>Acción</th>
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Resumen */}
        {!loading && ventas.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <p className="text-xs font-semibold" style={{ color: C.textMuted }}>Total Ventas</p>
              <p className="text-xl font-extrabold mt-1" style={{ color: C.primary }}>
                ${ventas.reduce((sum, v) => sum + Number(v.valor_factura), 0).toLocaleString('es-CO')}
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
    </AppLayout>
  );
}
