/**
 * @fileoverview Dashboard — Balance de ventas vs compras por mes/año
 * @module client/src/pages/DashboardPage
 */
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import api from '../lib/api.js';
import AppLayout from '../components/AppLayout.jsx';

const C = {
  primary: '#476500',
  primary2: '#5d7f13',
  surface: '#fafaed',
  container: '#eeefe2',
  white: '#ffffff',
  text: '#1a1c15',
  textMuted: '#747967',
  textSub: '#444939',
  orange: '#944a00',
  border: '#e2e3d6',
  error: '#ba1a1a',
  errorBg: '#ffdad6',
  successBg: '#eef3e4',
};

const MESES = [
  { value: '', label: 'Todo el año' },
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

const MESES_NOMBRE = MESES.reduce((acc, m) => {
  if (m.value) acc[parseInt(m.value, 10)] = m.label;
  return acc;
}, {});

const fmt = (n) =>
  `$${Number(n || 0).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

function StatCard({ label, value, sub, color, bg }) {
  return (
    <div className="rounded-2xl p-4 border" style={{ backgroundColor: C.white, borderColor: C.border }}>
      <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: C.textMuted }}>{label}</p>
      <p className="text-2xl font-extrabold mt-1" style={{ color: color || C.text }}>{value}</p>
      {sub != null && (
        <p className="text-xs mt-1 font-medium" style={{ color: C.textMuted }}>{sub}</p>
      )}
      {bg && <div className="h-1 rounded-full mt-3" style={{ backgroundColor: bg }} />}
    </div>
  );
}

function BalanceAdmin() {
  const now = new Date();
  const [filtroAno, setFiltroAno] = useState(String(now.getFullYear()));
  const [filtroMes, setFiltroMes] = useState(String(now.getMonth() + 1).padStart(2, '0'));
  const [verCanceladas, setVerCanceladas] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const anos = [String(now.getFullYear() - 1), String(now.getFullYear()), String(now.getFullYear() + 1)];

  const fetchBalance = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (filtroAno) params.ano = filtroAno;
      if (filtroMes) params.mes = parseInt(filtroMes, 10);
      const { data: res } = await api.get('/dashboard/balance', { params });
      setData(res.data);
    } catch (err) {
      setData(null);
      setError(err.response?.data?.message || 'No se pudo cargar el balance.');
    } finally {
      setLoading(false);
    }
  }, [filtroAno, filtroMes]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  const periodoLabel = filtroMes
    ? `${MESES.find(m => m.value === filtroMes)?.label || ''} ${filtroAno}`
    : `Año ${filtroAno}`;

  const balance = data?.balance;
  const resultadoColor = balance?.es_perdida
    ? C.error
    : balance?.es_ganancia
      ? C.primary
      : C.textSub;

  const resultadoLabel = balance?.es_perdida
    ? 'Pérdida'
    : balance?.es_ganancia
      ? 'Ganancia'
      : 'Equilibrio';

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <div className="flex-1">
          <h2 className="font-extrabold text-2xl md:text-3xl" style={{ color: C.text }}>
            Dashboard de balance
          </h2>
          <p className="text-sm font-medium mt-1" style={{ color: C.textMuted }}>
            Compara ventas entregadas vs compras del período para detectar ganancias o pérdidas
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="rounded-2xl p-4 border grid grid-cols-1 md:grid-cols-4 gap-3"
           style={{ backgroundColor: C.white, borderColor: C.border }}>
        <div>
          <label className="text-xs font-semibold" style={{ color: C.textMuted }}>Año</label>
          <select value={filtroAno} onChange={e => setFiltroAno(e.target.value)}
            className="w-full mt-1 px-3 py-2 rounded-lg border text-sm"
            style={{ borderColor: C.border, backgroundColor: C.container }}>
            {anos.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold" style={{ color: C.textMuted }}>Mes</label>
          <select value={filtroMes} onChange={e => setFiltroMes(e.target.value)}
            className="w-full mt-1 px-3 py-2 rounded-lg border text-sm"
            style={{ borderColor: C.border, backgroundColor: C.container }}>
            {MESES.map(m => <option key={m.value || 'all'} value={m.value}>{m.label}</option>)}
          </select>
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 px-3 py-2 rounded-lg w-full cursor-pointer"
                 style={{ backgroundColor: verCanceladas ? C.errorBg : C.container }}>
            <input
              type="checkbox"
              checked={verCanceladas}
              onChange={e => setVerCanceladas(e.target.checked)}
              className="accent-[#ba1a1a]"
            />
            <span className="text-sm font-semibold" style={{ color: verCanceladas ? C.error : C.text }}>
              Ver ventas canceladas
            </span>
          </label>
        </div>
        <div className="flex items-end">
          <button type="button" onClick={() => {
            setFiltroAno(String(now.getFullYear()));
            setFiltroMes(String(now.getMonth() + 1).padStart(2, '0'));
            setVerCanceladas(false);
          }}
            className="w-full px-3 py-2 rounded-lg text-sm font-semibold"
            style={{ backgroundColor: C.container, color: C.text }}>
            Período actual
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12" style={{ color: C.textMuted }}>Calculando balance…</div>
      ) : error ? (
        <div className="rounded-xl p-4 text-sm font-medium" style={{ backgroundColor: C.errorBg, color: C.error }}>
          {error}
        </div>
      ) : data ? (
        <>
          {/* Resultado principal */}
          <div className="rounded-2xl p-5 md:p-6 border"
               style={{
                 backgroundColor: balance.es_perdida ? C.errorBg : balance.es_ganancia ? C.successBg : C.white,
                 borderColor: C.border,
               }}>
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: C.textMuted }}>
              Resultado · {periodoLabel}
            </p>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mt-2">
              <div>
                <p className="text-sm font-semibold" style={{ color: resultadoColor }}>{resultadoLabel}</p>
                <p className="text-3xl md:text-4xl font-extrabold mt-1" style={{ color: resultadoColor }}>
                  {fmt(balance.resultado)}
                </p>
              </div>
              <div className="text-sm space-y-1" style={{ color: C.textSub }}>
                <p>Ingresos (entregadas): <strong style={{ color: C.primary }}>{fmt(balance.ingresos)}</strong></p>
                <p>Egresos (compras): <strong style={{ color: C.orange }}>{fmt(balance.egresos)}</strong></p>
                <p className="text-xs" style={{ color: C.textMuted }}>
                  Solo se incluyen ventas en estado <strong>entregada</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Tarjetas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard
              label="Ventas entregadas"
              value={fmt(data.ventas_entregadas.total)}
              sub={`${data.ventas_entregadas.cantidad} venta(s) · factura ${fmt(data.ventas_entregadas.total_factura)} + domicilio ${fmt(data.ventas_entregadas.total_domicilio)}`}
              color={C.primary}
              bg={C.successBg}
            />
            <StatCard
              label="Compras"
              value={fmt(data.compras.total)}
              sub={`${data.compras.cantidad} compra(s)`}
              color={C.orange}
            />
            <StatCard
              label="Balance"
              value={fmt(balance.resultado)}
              sub={resultadoLabel}
              color={resultadoColor}
            />
            <StatCard
              label="Ventas pendientes"
              value={fmt(data.ventas_pendientes.total)}
              sub={`${data.ventas_pendientes.cantidad} (no entran al balance)`}
              color={C.textSub}
            />
          </div>

          {verCanceladas && (
            <div className="rounded-2xl p-5 border"
                 style={{ backgroundColor: C.white, borderColor: C.error, borderWidth: 1 }}>
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: C.error }}>
                Ventas canceladas · {periodoLabel}
              </p>
              <div className="flex flex-wrap gap-6 mt-3">
                <div>
                  <p className="text-xs" style={{ color: C.textMuted }}>Total cancelado</p>
                  <p className="text-2xl font-extrabold" style={{ color: C.error }}>
                    {fmt(data.ventas_canceladas.total)}
                  </p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: C.textMuted }}>Cantidad</p>
                  <p className="text-2xl font-extrabold" style={{ color: C.text }}>
                    {data.ventas_canceladas.cantidad}
                  </p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: C.textMuted }}>Factura</p>
                  <p className="text-lg font-bold" style={{ color: C.textSub }}>
                    {fmt(data.ventas_canceladas.total_factura)}
                  </p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: C.textMuted }}>Domicilios</p>
                  <p className="text-lg font-bold" style={{ color: C.textSub }}>
                    {fmt(data.ventas_canceladas.total_domicilio)}
                  </p>
                </div>
              </div>
              <p className="text-xs mt-3" style={{ color: C.textMuted }}>
                Las canceladas no afectan el balance de ganancia/pérdida; se muestran solo como referencia.
              </p>
            </div>
          )}

          {/* Tabla mensual (solo vista anual) */}
          {!filtroMes && data.por_mes?.length > 0 && (
            <div className="rounded-2xl border overflow-hidden"
                 style={{ backgroundColor: C.white, borderColor: C.border }}>
              <div className="px-4 py-3" style={{ backgroundColor: C.container }}>
                <h3 className="font-bold text-sm" style={{ color: C.text }}>
                  Desglose mensual {filtroAno}
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                      <th className="px-4 py-3 text-left font-semibold" style={{ color: C.text }}>Mes</th>
                      <th className="px-4 py-3 text-right font-semibold" style={{ color: C.text }}>Ventas entregadas</th>
                      <th className="px-4 py-3 text-right font-semibold" style={{ color: C.text }}>Compras</th>
                      <th className="px-4 py-3 text-right font-semibold" style={{ color: C.text }}>Balance</th>
                      {verCanceladas && (
                        <th className="px-4 py-3 text-right font-semibold" style={{ color: C.error }}>Canceladas</th>
                      )}
                      <th className="px-4 py-3 text-center font-semibold" style={{ color: C.text }}>Resultado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.por_mes.map(row => {
                      const perdida = row.balance < 0;
                      const ganancia = row.balance > 0;
                      return (
                        <tr key={row.mes} style={{ borderBottom: `1px solid ${C.border}` }}>
                          <td className="px-4 py-2.5 font-semibold" style={{ color: C.text }}>
                            {MESES_NOMBRE[row.mes]}
                          </td>
                          <td className="px-4 py-2.5 text-right" style={{ color: C.primary }}>
                            {fmt(row.ventas_entregadas)}
                            <span className="text-xs ml-1" style={{ color: C.textMuted }}>({row.cant_entregadas})</span>
                          </td>
                          <td className="px-4 py-2.5 text-right" style={{ color: C.orange }}>
                            {fmt(row.compras)}
                            <span className="text-xs ml-1" style={{ color: C.textMuted }}>({row.cant_compras})</span>
                          </td>
                          <td className="px-4 py-2.5 text-right font-bold"
                              style={{ color: perdida ? C.error : ganancia ? C.primary : C.text }}>
                            {fmt(row.balance)}
                          </td>
                          {verCanceladas && (
                            <td className="px-4 py-2.5 text-right" style={{ color: C.error }}>
                              {fmt(row.ventas_canceladas)}
                              <span className="text-xs ml-1" style={{ color: C.textMuted }}>({row.cant_canceladas})</span>
                            </td>
                          )}
                          <td className="px-4 py-2.5 text-center">
                            <span className="px-2 py-1 rounded-full text-xs font-semibold"
                                  style={{
                                    backgroundColor: perdida ? C.errorBg : ganancia ? C.successBg : C.container,
                                    color: perdida ? C.error : ganancia ? C.primary : C.textMuted,
                                  }}>
                              {perdida ? 'Pérdida' : ganancia ? 'Ganancia' : '—'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}

function DashboardBasico({ usuario }) {
  const navigate = useNavigate();
  const fechaHoy = new Date().toLocaleDateString('es-CO', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const mods = [
    { key: 'productos', title: 'Productos', path: '/productos' },
    { key: 'clientes', title: 'Clientes', path: '/clientes' },
    { key: 'carrito', title: 'Carrito', path: '/carrito' },
    { key: 'compras', title: 'Compras', path: '/compras' },
  ];

  return (
    <div className="space-y-5">
      <div className="rounded-2xl p-5 md:p-6 border"
           style={{ backgroundColor: C.white, borderColor: C.border }}>
        <h2 className="font-extrabold text-xl md:text-2xl" style={{ color: C.text }}>
          Bienvenido al sistema
        </h2>
        <p className="mt-1.5 text-sm" style={{ color: C.textMuted }}>
          Gestione pedidos, inventario y clientes desde un solo lugar.
        </p>
        <p className="text-xs mt-3 capitalize" style={{ color: C.textMuted }}>{fechaHoy}</p>
        <p className="text-xs mt-1 font-bold" style={{ color: C.primary }}>
          {usuario?.rol} — {usuario?.correo?.split('@')[0]}
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {mods.map(m => (
          <button key={m.key} type="button" onClick={() => navigate(m.path)}
            className="rounded-2xl p-5 text-left border transition-all"
            style={{ backgroundColor: C.white, borderColor: C.border }}>
            <h3 className="font-bold text-sm" style={{ color: C.text }}>{m.title}</h3>
            <p className="text-xs mt-2 font-semibold" style={{ color: C.primary }}>Acceder →</p>
          </button>
        ))}
      </div>
      <p className="text-sm text-center" style={{ color: C.textMuted }}>
        El balance de ventas y compras está disponible para el rol administrador.
      </p>
    </div>
  );
}

export default function DashboardPage() {
  const { usuario } = useAuth();
  const rol = (usuario?.rol || '').toLowerCase();
  const esAdmin = rol === 'admin' || rol === 'administrador';

  return (
    <AppLayout activeKey="dashboard">
      <div className="p-5 md:p-6">
        {esAdmin ? <BalanceAdmin /> : <DashboardBasico usuario={usuario} />}
      </div>
    </AppLayout>
  );
}
