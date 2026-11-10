import { useCallback, useEffect, useState } from 'react';
import AppLayout from '../components/AppLayout.jsx';
import { useAuth } from '../hooks/useAuth.jsx';
import api from '../lib/api.js';

const C = {
  primary: '#476500',
  surface: '#fafaed',
  container: '#eeefe2',
  white: '#ffffff',
  text: '#1a1c15',
  muted: '#747967',
  border: '#e2e3d6',
  error: '#ba1a1a',
};

const DEFAULT_NOTE_COLOR = 'yellow';
const NOTE_COLORS = [
  { value:'yellow', label:'Amarillo', background:'#fff4a8', border:'#ead76b' },
  { value:'pink', label:'Rosado', background:'#ffd9e2', border:'#efaabb' },
  { value:'green', label:'Verde', background:'#dff2c2', border:'#b9d994' },
  { value:'blue', label:'Azul', background:'#d8edff', border:'#a8d2f2' },
  { value:'orange', label:'Naranja', background:'#ffe0bd', border:'#f0bd83' },
];
const formatCreatedAt = value => new Date(value).toLocaleString('es-CO');

export default function NotasPage() {
  const { usuario } = useAuth();
  const isAdmin = String(usuario?.rol || '').toLowerCase() === 'admin';
  const [notas, setNotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [contenido, setContenido] = useState('');
  const [color, setColor] = useState(DEFAULT_NOTE_COLOR);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const fetchNotas = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/notas');
      setNotas(data.data || []);
    } catch (requestError) {
      console.error('[notas] No fue posible cargar las notas:', requestError);
      setError(requestError.response?.data?.message || 'No fue posible cargar las notas.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchNotas(); }, [fetchNotas]);

  useEffect(() => {
    if (!toast) return undefined;
    const timeout = setTimeout(() => setToast(''), 3500);
    return () => clearTimeout(timeout);
  }, [toast]);

  const openNewNote = () => {
    setEditingNote(null);
    setContenido('');
    setColor(DEFAULT_NOTE_COLOR);
    setError('');
    setModalOpen(true);
  };

  const openEditNote = note => {
    setEditingNote(note);
    setContenido(note.contenido);
    setColor(note.color || DEFAULT_NOTE_COLOR);
    setError('');
    setModalOpen(true);
  };

  const saveNote = async event => {
    event.preventDefault();
    if (!contenido.trim()) {
      setError('Escribe el contenido de la nota.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      if (editingNote) {
        await api.put(`/notas/${editingNote.id}`, { contenido, color });
        setToast('Nota modificada. Se notificó al equipo.');
      } else {
        await api.post('/notas', { contenido, color });
        setToast('Nota creada. Se notificó al equipo.');
      }
      setModalOpen(false);
      await fetchNotas();
    } catch (requestError) {
      console.error('[notas] No fue posible guardar la nota:', requestError);
      setError(requestError.response?.data?.message || 'No fue posible guardar la nota.');
    } finally {
      setSaving(false);
    }
  };

  const deleteNote = async note => {
    if (!window.confirm('¿Deseas eliminar esta nota?')) return;
    try {
      await api.delete(`/notas/${note.id}`);
      setToast('Nota eliminada correctamente.');
      await fetchNotas();
    } catch (requestError) {
      console.error('[notas] No fue posible eliminar la nota:', requestError);
      setError(requestError.response?.data?.message || 'No fue posible eliminar la nota.');
    }
  };

  return (
    <AppLayout activeKey="notas">
      <div className="min-h-full p-4 sm:p-6" style={{ backgroundColor:C.surface }}>
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-2xl font-extrabold" style={{ color:C.text }}>Notas del equipo</h2>
              <p className="text-sm mt-1" style={{ color:C.muted }}>
                Recordatorios e información importante para todos.
              </p>
            </div>
            <button onClick={openNewNote}
              className="px-4 py-2 rounded-xl text-sm font-bold text-white"
              style={{ backgroundColor:C.primary }}>
              + Nueva nota
            </button>
          </div>

          {toast && (
            <div role="status" className="mb-4 p-3 rounded-xl text-sm"
                 style={{ backgroundColor:'#eef3e4', color:C.primary }}>{toast}</div>
          )}
          {error && !modalOpen && (
            <div role="alert" className="mb-4 p-3 rounded-xl text-sm"
                 style={{ backgroundColor:'#ffdad6', color:C.error }}>{error}</div>
          )}

          {loading ? (
            <p className="py-10 text-center" style={{ color:C.muted }}>Cargando notas...</p>
          ) : notas.length === 0 ? (
            <div className="rounded-2xl p-8 text-center"
                 style={{ backgroundColor:C.white, border:`1px solid ${C.border}` }}>
              <p className="font-semibold" style={{ color:C.text }}>Aún no hay notas.</p>
              <p className="text-sm mt-1" style={{ color:C.muted }}>Crea la primera para compartirla con el equipo.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {notas.map((note, index) => {
                const noteColor = NOTE_COLORS.find(item => item.value === note.color) || NOTE_COLORS[0];
                const canDelete = isAdmin || Number(note.autor_id) === Number(usuario?.id_usuario);
                return (
                  <article key={note.id} className="relative min-h-52 p-5"
                    style={{
                      backgroundColor:noteColor.background,
                      border:`1px solid ${noteColor.border}`,
                      borderRadius:'3px 3px 14px 3px',
                      boxShadow:'2px 5px 12px rgba(48,45,20,0.16)',
                      transform:`rotate(${index % 2 === 0 ? '-0.5deg' : '0.5deg'})`,
                    }}>
                    <div aria-hidden="true" style={{
                      position:'absolute', top:0, right:0, width:24, height:24,
                      background:`linear-gradient(225deg, ${C.surface} 50%, ${noteColor.border} 51%, ${noteColor.background} 58%)`,
                    }}/>
                    <div className="flex items-start justify-between gap-2 pr-3">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold" style={{ color:C.text }}>
                          {note.autor_nombre || 'Usuario'} · {formatCreatedAt(note.created_at)}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <button onClick={() => openEditNote(note)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold"
                          style={{ backgroundColor:'rgba(255,255,255,0.55)', color:C.text }}>
                          Editar
                        </button>
                        {canDelete && (
                          <button onClick={() => deleteNote(note)}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold"
                            style={{ backgroundColor:'rgba(255,255,255,0.55)', color:C.error }}>
                            Eliminar
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="mt-4 mb-8 text-sm whitespace-pre-wrap break-words" style={{ color:C.text }}>
                      {note.contenido}
                    </p>
                    <p className="absolute bottom-4 left-5 right-5 text-[10px] leading-4"
                       style={{ color:'#555747' }}>
                      Última modificación por {note.ultimo_editor_nombre || note.autor_nombre || 'Usuario'}
                      {' · '}{formatCreatedAt(note.updated_at || note.created_at)}
                    </p>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
             style={{ backgroundColor:'rgba(26,28,21,0.55)' }}
             onClick={event => { if (event.target === event.currentTarget) setModalOpen(false); }}>
          <form onSubmit={saveNote} className="w-full max-w-xl rounded-2xl p-5 sm:p-6"
                style={{ backgroundColor:C.white }}>
            <h3 className="text-lg font-extrabold" style={{ color:C.text }}>
              {editingNote ? 'Editar nota' : 'Nueva nota'}
            </h3>
            <p className="text-xs mt-1 mb-4" style={{ color:C.muted }}>
              Autor: {usuario?.empleado_nombre || usuario?.correo || 'Usuario'}
            </p>
            <textarea autoFocus rows={6} maxLength={5000} value={contenido}
              onChange={event => { setContenido(event.target.value); setError(''); }}
              placeholder="Escribe el recordatorio o la información importante..."
              className="w-full rounded-xl p-3 text-sm outline-none"
              style={{ backgroundColor:C.container, color:C.text, border:`1px solid ${C.border}` }}/>
            <fieldset className="mt-4">
              <legend className="text-xs font-bold mb-2" style={{ color:C.text }}>Color del post-it</legend>
              <div className="flex flex-wrap gap-2">
                {NOTE_COLORS.map(noteColor => (
                  <button key={noteColor.value} type="button"
                    onClick={() => setColor(noteColor.value)}
                    aria-label={noteColor.label}
                    aria-pressed={color === noteColor.value}
                    title={noteColor.label}
                    className="w-9 h-9 rounded-full"
                    style={{
                      backgroundColor:noteColor.background,
                      border:`3px solid ${color === noteColor.value ? C.primary : noteColor.border}`,
                      boxShadow:color === noteColor.value ? '0 0 0 2px white' : 'none',
                      cursor:'pointer',
                    }}/>
                ))}
              </div>
            </fieldset>
            {error && modalOpen && (
              <p role="alert" className="mt-2 text-xs" style={{ color:C.error }}>{error}</p>
            )}
            <div className="flex justify-end gap-2 mt-4">
              <button type="button" disabled={saving} onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-xl text-sm font-semibold"
                style={{ backgroundColor:C.container, color:C.text }}>Cancelar</button>
              <button type="submit" disabled={saving}
                className="px-4 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-60"
                style={{ backgroundColor:C.primary }}>
                {saving ? 'Guardando...' : editingNote ? 'Guardar cambios' : 'Crear nota'}
              </button>
            </div>
          </form>
        </div>
      )}
    </AppLayout>
  );
}
