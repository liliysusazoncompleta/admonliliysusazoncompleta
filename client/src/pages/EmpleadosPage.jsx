/**
 * @fileoverview Página Gestión de Empleados — CRUD completo
 * @module client/src/pages/EmpleadosPage
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

export default function EmpleadosPage() {
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [showInactivos, setShowInactivos] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { toasts, toast, removeToast } = useToast();

  const [formData, setFormData] = useState({
    nombre: '', cedula: '', telefono: '', cargo: '', salario: 0,
    direccion_principal: '', direccion_alterna: ''
  });
  const [formErrors, setFormErrors] = useState({});

  const fetchEmpleados = useCallback(async () => {
    setLoading(true);
    try {
      const params = { activos: showInactivos ? 'todos' : 'activos' };
      if (search) params.q = search;
      const { data } = await api.get('/empleados', { params });
      setEmpleados(data.data || []);
    } catch (err) {
      toast(err.response?.data?.message || 'Error al cargar empleados.', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, showInactivos, toast]);

  useEffect(() => {
    fetchEmpleados();
  }, [fetchEmpleados]);

  const resetForm = () => {
    setFormData({ nombre: '', cedula: '', telefono: '', cargo: '', salario: 0, direccion_principal: '', direccion_alterna: '' });
    setFormErrors({});
    setEditData(null);
  };

  const openEdit = (emp) => {
    setEditData(emp);
    setFormData(emp);
    setModalOpen(true);
    setFormErrors({});
  };

  const openCreate = () => {
    resetForm();
    setModalOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.nombre.trim()) errors.nombre = 'Requerido';
    if (!formData.cedula.trim()) errors.cedula = 'Requerido';
    if (!formData.telefono.trim()) errors.telefono = 'Requerido';
    if (!formData.cargo.trim()) errors.cargo = 'Requerido';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setSaving(true);
    try {
      if (editData) {
        await api.put(`/empleados/${editData.id_empleado}`, formData);
        toast('Empleado actualizado correctamente.');
      } else {
        await api.post('/empleados', formData);
        toast('Empleado creado correctamente.');
      }
      setModalOpen(false);
      fetchEmpleados();
    } catch (err) {
      toast(err.response?.data?.message || 'Error al guardar empleado.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (emp) => {
    setDeleting(true);
    try {
      await api.patch(`/empleados/${emp.id_empleado}/toggle`, { activo: !emp.activo });
      toast(`Empleado ${!emp.activo ? 'activado' : 'desactivado'} correctamente.`);
      fetchEmpleados();
    } catch (err) {
      toast(err.response?.data?.message || 'Error al cambiar estado.', 'error');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <AppLayout activeKey="empleados" searchValue={search} onSearch={setSearch}>
      <div className="p-5 md:p-6 space-y-5">
        {/* Encabezado */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="font-extrabold text-2xl md:text-3xl" style={{ color: C.text }}>
              Gestión de Empleados
            </h2>
            <p className="text-sm font-medium mt-1" style={{ color: C.textMuted }}>
              Administra los empleados de la empresa
            </p>
          </div>
          <button onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95"
            style={{ backgroundColor: C.primary, color: C.white, boxShadow: '0 4px 14px rgba(71,101,0,0.35)' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = C.primary2}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = C.primary}>
            + Nuevo Empleado
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

        {/* Tabla de empleados */}
        {loading ? (
          <div className="text-center py-10" style={{ color: C.textMuted }}>Cargando...</div>
        ) : empleados.length === 0 ? (
          <div className="text-center py-10" style={{ color: C.textMuted }}>No hay empleados</div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead style={{ backgroundColor: C.container }}>
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: C.text }}>Nombre</th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: C.text }}>Cédula</th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: C.text }}>Teléfono</th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: C.text }}>Cargo</th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: C.text }}>Salario</th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: C.text }}>Estado</th>
                    <th className="px-4 py-3 text-center font-semibold" style={{ color: C.text }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {empleados.map(emp => (
                    <tr key={emp.id_empleado} style={{ borderBottom: `1px solid ${C.border}` }}>
                      <td className="px-4 py-3" style={{ color: C.text }}>{emp.nombre}</td>
                      <td className="px-4 py-3" style={{ color: C.text }}>{emp.cedula}</td>
                      <td className="px-4 py-3" style={{ color: C.text }}>{emp.telefono}</td>
                      <td className="px-4 py-3" style={{ color: C.text }}>{emp.cargo}</td>
                      <td className="px-4 py-3" style={{ color: C.text }}>${Number(emp.salario).toLocaleString('es-CO')}</td>
                      <td className="px-4 py-3">
                        <span style={{
                          backgroundColor: emp.activo ? '#eef3e4' : '#ffdad6',
                          color: emp.activo ? C.primary : C.error,
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: '600'
                        }}>
                          {emp.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2 justify-center">
                          <button onClick={() => openEdit(emp)} className="text-blue-500 text-xs font-semibold hover:underline">Editar</button>
                          <button onClick={() => setDeleteTarget(emp)} className="text-red-500 text-xs font-semibold hover:underline">
                            {emp.activo ? 'Desactivar' : 'Activar'}
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
                {deleteTarget.activo ? 'Desactivar empleado' : 'Activar empleado'}
              </h3>
              <p style={{ color: C.textMuted }} className="mt-2 text-sm">
                ¿Estás seguro de que deseas {deleteTarget.activo ? 'desactivar' : 'activar'} a <strong>{deleteTarget.nombre}</strong>?
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
                {editData ? 'Editar empleado' : 'Nuevo empleado'}
              </h3>
              <div className="space-y-3">
                {['nombre', 'cedula', 'telefono', 'cargo'].map(key => (
                  <div key={key}>
                    <label className="text-xs font-semibold" style={{ color: C.textMuted }}>
                      {key.charAt(0).toUpperCase() + key.slice(1)} *
                    </label>
                    <input type="text" value={formData[key]} onChange={e => setFormData({ ...formData, [key]: e.target.value })}
                      placeholder={key} className="w-full mt-1 px-3 py-2 rounded-lg border"
                      style={{
                        borderColor: formErrors[key] ? C.error : C.border,
                        backgroundColor: formErrors[key] ? C.errorBg : C.container
                      }} />
                    {formErrors[key] && <p style={{ color: C.error }} className="text-xs mt-1">{formErrors[key]}</p>}
                  </div>
                ))}
                {['salario', 'direccion_principal', 'direccion_alterna'].map(key => (
                  <div key={key}>
                    <label className="text-xs font-semibold" style={{ color: C.textMuted }}>
                      {key.split('_').join(' ').charAt(0).toUpperCase() + key.split('_').join(' ').slice(1)}
                    </label>
                    <input type={key === 'salario' ? 'number' : 'text'} value={formData[key]}
                      onChange={e => setFormData({ ...formData, [key]: e.target.value })}
                      placeholder={key} className="w-full mt-1 px-3 py-2 rounded-lg border"
                      style={{ borderColor: C.border, backgroundColor: C.container }} />
                  </div>
                ))}
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
