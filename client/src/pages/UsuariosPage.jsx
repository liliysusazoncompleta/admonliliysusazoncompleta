/**
 * @fileoverview Página Gestión de Usuarios — CRUD completo
 * @module client/src/pages/UsuariosPage
 */
import { useState, useEffect, useCallback } from 'react';
import api from '../lib/api.js';
import AppLayout from '../components/AppLayout.jsx';

/*const api = axios.create({ baseURL: '/api' });
api.interceptors.request.use(cfg => {
  const t = localStorage.getItem('lili_token');
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});*/

const C = {
  primary: '#476500', primary2: '#5d7f13',
  surface: '#fafaed', container: '#eeefe2',
  white: '#ffffff', text: '#1a1c15',
  textMuted: '#747967', textSub: '#444939',
  border: '#e2e3d6', orange: '#944a00',
  error: '#ba1a1a', errorBg: '#ffdad6',
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

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [showInactivos, setShowInactivos] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { toasts, toast, removeToast } = useToast();
  const [empleadoDetalle, setEmpleadoDetalle] = useState(null);

  const [formData, setFormData] = useState({
    cedula: '', correo: '', password: '', rol: 'Operario'
  });
  const [formErrors, setFormErrors] = useState({});

  const fetchUsuarios = useCallback(async () => {
    setLoading(true);
    try {
      const params = { activos: showInactivos ? 'todos' : 'activos' };
      if (search) params.q = search;
      const { data } = await api.get('/usuarios', { params });
      setUsuarios(data.data || []);
    } catch (err) {
      toast(err.response?.data?.message || 'Error al cargar usuarios.', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, showInactivos, toast]);

  useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

  const resetForm = () => {
    setFormData({ cedula: '', correo: '', password: '', rol: 'Operario' });
    setFormErrors({});
    setEditData(null);
  };

  const openEdit = (usr) => {
    setEditData(usr);
    setFormData({ cedula: usr.cedula, correo: usr.correo, password: '', rol: usr.rol });
    setModalOpen(true);
    setFormErrors({});
  };

  const openCreate = () => {
    resetForm();
    setModalOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.correo.trim()) errors.correo = 'Requerido';
    if (!editData && !formData.password.trim()) errors.password = 'Requerido';
    if (!editData && !formData.cedula) errors.cedula = 'Requerido';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setSaving(true);
    try {
      if (editData) {
        await api.put(`/usuarios/${editData.id_usuario}`, { correo: formData.correo, rol: formData.rol });
        if (formData.password) {
          await api.post(`/usuarios/${editData.id_usuario}/change-password`, { password: formData.password });
        }
        toast('Usuario actualizado correctamente.');
      } else {
        await api.post('/usuarios', formData);
        toast('Usuario creado correctamente.');
      }
      setModalOpen(false);
      fetchUsuarios();
    } catch (err) {
      toast(err.response?.data?.message || 'Error al guardar usuario.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (usr) => {
    setDeleting(true);
    try {
      await api.patch(`/usuarios/${usr.id_usuario}/toggle`, { activo: !usr.activo });
      toast(`Usuario ${!usr.activo ? 'activado' : 'desactivado'} correctamente.`);
      fetchUsuarios();
    } catch (err) {
      toast(err.response?.data?.message || 'Error al cambiar estado.', 'error');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <AppLayout activeKey="usuarios" searchValue={search} onSearch={setSearch}>
      <div className="p-5 md:p-6 space-y-5">
        {/* Encabezado */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="font-extrabold text-2xl md:text-3xl" style={{ color: C.text }}>
              Gestión de Usuarios
            </h2>
            <p className="text-sm font-medium mt-1" style={{ color: C.textMuted }}>
              Administra los usuarios del sistema
            </p>
          </div>
          <button onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95"
            style={{ backgroundColor: C.primary, color: C.white, boxShadow: '0 4px 14px rgba(71,101,0,0.35)' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = C.primary2}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = C.primary}>
            + Nuevo Usuario
          </button>
        </div>

        {/* Filtro */}
        <div className="flex gap-2">
          <button onClick={() => setShowInactivos(!showInactivos)}
            className="px-3 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              backgroundColor: showInactivos ? C.primary : C.container,
              color: showInactivos ? C.white : C.text
            }}>
            {showInactivos ? 'Mostrando todos' : 'Solo activos'}
          </button>
        </div>

        {/* Tabla de usuarios */}
        {loading ? (
          <div className="text-center py-10" style={{ color: C.textMuted }}>Cargando...</div>
        ) : usuarios.length === 0 ? (
          <div className="text-center py-10" style={{ color: C.textMuted }}>No hay usuarios</div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead style={{ backgroundColor: C.container }}>
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: C.text }}>Correo</th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: C.text }}>Empleado</th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: C.text }}>Rol</th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: C.text }}>Estado</th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: C.text }}>Último Login</th>
                    <th className="px-4 py-3 text-center font-semibold" style={{ color: C.text }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map(usr => (
                    <tr key={usr.id_usuario} style={{ borderBottom: `1px solid ${C.border}` }}>
                      <td className="px-4 py-3" style={{ color: C.text }}>{usr.correo}</td>
                      <td className="px-4 py-3">
                        {usr.empleado_nombre ? (
                          <button
                            onClick={() => setEmpleadoDetalle(usr)}
                            className="text-left font-semibold text-sm transition-all"
                            style={{ color: C.primary, textDecoration: 'underline', textUnderlineOffset: 3, cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}>
                            {usr.empleado_nombre}
                          </button>
                        ) : (
                          <span style={{ color: C.textMuted }}>—</span>
                        )}
                      </td>
                      <td className="px-4 py-3" style={{ color: C.text }}>{usr.rol}</td>
                      <td className="px-4 py-3">
                        <span style={{
                          backgroundColor: usr.activo ? '#eef3e4' : '#ffdad6',
                          color: usr.activo ? C.primary : C.error,
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: '600'
                        }}>
                          {usr.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-4 py-3" style={{ color: C.textMuted }}>
                        {usr.ultimo_login ? new Date(usr.ultimo_login).toLocaleString('es-CO') : 'Nunca'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2 justify-center">
                          <button onClick={() => openEdit(usr)} className="text-blue-500 text-xs font-semibold hover:underline">Editar</button>
                          <button onClick={() => setDeleteTarget(usr)} className="text-red-500 text-xs font-semibold hover:underline">
                            {usr.activo ? 'Desactivar' : 'Activar'}
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

        {/* Modal de confirmación */}
        {deleteTarget && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 max-w-sm shadow-2xl">
              <h3 className="font-bold text-lg" style={{ color: C.text }}>
                {deleteTarget.activo ? 'Desactivar usuario' : 'Activar usuario'}
              </h3>
              <p style={{ color: C.textMuted }} className="mt-2 text-sm">
                ¿Estás seguro de que deseas {deleteTarget.activo ? 'desactivar' : 'activar'} a <strong>{deleteTarget.correo}</strong>?
              </p>
              <div className="flex gap-2 mt-6">
                <button onClick={() => setDeleteTarget(null)} className="flex-1 px-4 py-2 rounded-lg border" style={{ borderColor: C.border }}>
                  Cancelar
                </button>
                <button onClick={() => handleToggle(deleteTarget)} disabled={deleting}
                  className="flex-1 px-4 py-2 rounded-lg text-white font-semibold"
                  style={{ backgroundColor: C.error }}>
                  {deleting ? 'Procesando...' : deleteTarget.activo ? 'Desactivar' : 'Activar'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de edición */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="font-bold text-lg mb-4" style={{ color: C.text }}>
                {editData ? 'Editar usuario' : 'Nuevo usuario'}
              </h3>
              <div className="space-y-3">
                {!editData && (
                  <div>
                    <label className="text-xs font-semibold" style={{ color: C.textMuted }}>Cédula *</label>
                    <input type="text" value={formData.cedula} onChange={e => setFormData({ ...formData, cedula: e.target.value })}
                      placeholder="Cédula del empleado" className="w-full mt-1 px-3 py-2 rounded-lg border"
                      style={{
                        borderColor: formErrors.cedula ? C.error : C.border,
                        backgroundColor: formErrors.cedula ? C.errorBg : C.container
                      }} />
                    {formErrors.cedula && <p style={{ color: C.error }} className="text-xs mt-1">{formErrors.cedula}</p>}
                  </div>
                )}
                <div>
                  <label className="text-xs font-semibold" style={{ color: C.textMuted }}>Correo *</label>
                  <input type="email" value={formData.correo} onChange={e => setFormData({ ...formData, correo: e.target.value })}
                    placeholder="usuario@email.com" className="w-full mt-1 px-3 py-2 rounded-lg border"
                    style={{
                      borderColor: formErrors.correo ? C.error : C.border,
                      backgroundColor: formErrors.correo ? C.errorBg : C.container
                    }} />
                  {formErrors.correo && <p style={{ color: C.error }} className="text-xs mt-1">{formErrors.correo}</p>}
                </div>
                {!editData ? (
                  <div>
                    <label className="text-xs font-semibold" style={{ color: C.textMuted }}>Contraseña *</label>
                    <input type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Contraseña" className="w-full mt-1 px-3 py-2 rounded-lg border"
                      style={{
                        borderColor: formErrors.password ? C.error : C.border,
                        backgroundColor: formErrors.password ? C.errorBg : C.container
                      }} />
                    {formErrors.password && <p style={{ color: C.error }} className="text-xs mt-1">{formErrors.password}</p>}
                  </div>
                ) : formData.password && (
                  <div>
                    <label className="text-xs font-semibold" style={{ color: C.textMuted }}>Nueva Contraseña (opcional)</label>
                    <input type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Dejar vacío para no cambiar" className="w-full mt-1 px-3 py-2 rounded-lg border"
                      style={{ borderColor: C.border, backgroundColor: C.container }} />
                  </div>
                )}
                <div>
                  <label className="text-xs font-semibold" style={{ color: C.textMuted }}>Rol *</label>
                  <select value={formData.rol} onChange={e => setFormData({ ...formData, rol: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-lg border"
                    style={{ borderColor: C.border, backgroundColor: C.container }}>
                    <option value="Operario">Operario</option>
                    <option value="Admin">Admin</option>
                    <option value="Cocina">Cocina</option>
                    <option value="Vendedor">Vendedor</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button onClick={() => { setModalOpen(false); resetForm(); }} className="flex-1 px-4 py-2 rounded-lg border" style={{ borderColor: C.border }}>
                  Cancelar
                </button>
                <button onClick={handleSave} disabled={saving} className="flex-1 px-4 py-2 rounded-lg text-white font-semibold" style={{ backgroundColor: C.primary }}>
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal detalle empleado */}
      {empleadoDetalle && (
        <div className="fixed inset-0 flex items-center justify-center z-50"
             style={{ backgroundColor: 'rgba(26,28,21,0.55)' }}
             onClick={e => { if (e.target === e.currentTarget) setEmpleadoDetalle(null); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4"
                 style={{ borderBottom: `1px solid ${C.border}`, backgroundColor: C.container }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-base font-extrabold text-white"
                     style={{ background: `linear-gradient(135deg,${C.primary},${C.primary2})` }}>
                  {(empleadoDetalle.empleado_nombre?.[0] || '?').toUpperCase()}
                </div>
                <div>
                  <p className="font-extrabold text-sm" style={{ color: C.text }}>{empleadoDetalle.empleado_nombre}</p>
                  <p className="text-xs font-medium" style={{ color: C.textMuted }}>{empleadoDetalle.correo}</p>
                </div>
              </div>
              <button onClick={() => setEmpleadoDetalle(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: C.textMuted, lineHeight: 1 }}>
                ×
              </button>
            </div>

            {/* Cuerpo */}
            <div className="px-5 py-4 space-y-0">
              {[
                { label: 'Cédula',       valor: empleadoDetalle.cedula },
                { label: 'Teléfono',     valor: empleadoDetalle.empleado_telefono },
                { label: 'Cargo',        valor: empleadoDetalle.empleado_cargo },
                { label: 'Salario',      valor: empleadoDetalle.empleado_salario != null
                    ? `$${Number(empleadoDetalle.empleado_salario).toLocaleString('es-CO')}` : null },
                { label: 'Dirección',    valor: empleadoDetalle.empleado_direccion },
                { label: 'Dir. alterna', valor: empleadoDetalle.empleado_direccion_alterna },
                { label: 'Estado emp.',  valor: null, badge: empleadoDetalle.empleado_activo },
                { label: 'Rol sistema',  valor: empleadoDetalle.rol },
                { label: 'Último login', valor: empleadoDetalle.ultimo_login
                    ? new Date(empleadoDetalle.ultimo_login).toLocaleString('es-CO') : 'Nunca' },
              ].map(({ label, valor, badge }) => (
                <div key={label} className="flex items-center gap-3 py-2.5"
                     style={{ borderBottom: `1px solid ${C.border}` }}>
                  <span className="w-32 flex-shrink-0 text-xs font-bold uppercase tracking-wide"
                        style={{ color: C.textMuted }}>{label}</span>
                  {badge !== undefined ? (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: badge ? '#eef3e4' : '#ffdad6',
                                   color: badge ? C.primary : C.error }}>
                      {badge ? '✓ Activo' : '✗ Inactivo'}
                    </span>
                  ) : (
                    <span className="text-sm font-semibold" style={{ color: valor ? C.text : C.textMuted }}>
                      {valor || '—'}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-5 py-4 flex justify-end" style={{ borderTop: `1px solid ${C.border}` }}>
              <button onClick={() => setEmpleadoDetalle(null)}
                className="px-5 py-2 rounded-xl text-sm font-semibold"
                style={{ backgroundColor: C.container, color: C.textSub }}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toasts */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className="pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl shadow-xl text-sm font-medium max-w-xs"
            style={{
              backgroundColor: t.type === 'error' ? C.errorBg : '#eef3e4',
              color: t.type === 'error' ? C.error : C.primary,
              border: `1px solid ${t.type === 'error' ? '#f1b4b4' : '#b5d97a'}`
            }}>
            <span>{t.type === 'error' ? '❌' : '✅'}</span>
            <span className="flex-1">{t.message}</span>
            <button onClick={() => removeToast(t.id)} className="text-lg opacity-50 hover:opacity-100">×</button>
          </div>
        ))}
      </div>
    </AppLayout>
  );
}
