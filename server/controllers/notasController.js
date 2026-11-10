import { getClient, query } from '../config/db.js';

const getUserId = req => Number(req.user?.id_usuario);
const DEFAULT_NOTE_COLOR = 'yellow';
const NOTE_COLORS = new Set(['yellow', 'pink', 'green', 'blue', 'orange']);

const reportError = (res, error, context) => {
  console.error(`[${context}]`, error);
  return res.status(500).json({ success: false, message: 'Error interno del servidor.' });
};

const rollback = async (client, context) => {
  if (!client) return;
  try {
    await client.query('ROLLBACK');
  } catch (error) {
    console.error(`[${context}] No fue posible revertir la transacción:`, error);
  }
};

const notifyActiveUsers = async (client, noteId, userId, action) => {
  await client.query(
    `INSERT INTO public.notificaciones_notas (nota_id, destinatario_id, actor_id, accion)
     SELECT $1, id_usuario, $2, $3
     FROM public.usuarios
     WHERE activo = TRUE AND id_usuario <> $2`,
    [noteId, userId, action]
  );
};

export const getNotas = async (_req, res) => {
  try {
    const { rows } = await query(
      `SELECT n.id, n.autor_id, n.contenido, n.created_at, n.updated_at,
              n.updated_by, n.color,
              COALESCE(autor.nombre, u.correo) AS autor_nombre,
              COALESCE(modificador.nombre, modificador_usuario.correo,
                       autor.nombre, u.correo) AS ultimo_editor_nombre
       FROM public.notas n
       JOIN public.usuarios u ON u.id_usuario = n.autor_id
       LEFT JOIN public.empleados autor ON autor.cedula = u.cedula
       LEFT JOIN public.usuarios modificador_usuario
         ON modificador_usuario.id_usuario = COALESCE(n.updated_by, n.autor_id)
       LEFT JOIN public.empleados modificador
         ON modificador.cedula = modificador_usuario.cedula
       ORDER BY n.created_at DESC, n.id DESC`
    );
    return res.json({ success: true, data: rows });
  } catch (error) {
    return reportError(res, error, 'getNotas');
  }
};

export const createNota = async (req, res) => {
  const contenido = typeof req.body.contenido === 'string' ? req.body.contenido.trim() : '';
  const color = req.body.color || DEFAULT_NOTE_COLOR;
  if (!contenido) {
    return res.status(400).json({ success: false, message: 'El contenido de la nota es requerido.' });
  }
  if (!NOTE_COLORS.has(color)) {
    return res.status(400).json({ success: false, message: 'El color seleccionado no es válido.' });
  }

  let client;
  try {
    client = await getClient();
    await client.query('BEGIN');
    const { rows } = await client.query(
      `INSERT INTO public.notas (autor_id, contenido, color, updated_by)
       VALUES ($1, $2, $3, $1)
       RETURNING id, autor_id, contenido, color, created_at, updated_at, updated_by`,
      [getUserId(req), contenido, color]
    );
    await notifyActiveUsers(client, rows[0].id, getUserId(req), 'creada');
    await client.query('COMMIT');
    return res.status(201).json({ success: true, data: rows[0] });
  } catch (error) {
    await rollback(client, 'createNota');
    return reportError(res, error, 'createNota');
  } finally {
    client?.release();
  }
};

export const updateNota = async (req, res) => {
  const contenido = typeof req.body.contenido === 'string' ? req.body.contenido.trim() : '';
  const color = req.body.color === undefined ? null : (req.body.color || DEFAULT_NOTE_COLOR);
  if (!contenido) {
    return res.status(400).json({ success: false, message: 'El contenido de la nota es requerido.' });
  }
  if (color !== null && !NOTE_COLORS.has(color)) {
    return res.status(400).json({ success: false, message: 'El color seleccionado no es válido.' });
  }

  let client;
  try {
    client = await getClient();
    await client.query('BEGIN');
    const { rows } = await client.query(
      `UPDATE public.notas
       SET contenido = $1, color = COALESCE($2, color),
           updated_at = NOW(), updated_by = $3
       WHERE id = $4
       RETURNING id, autor_id, contenido, color, created_at, updated_at, updated_by`,
      [contenido, color, getUserId(req), req.params.id]
    );
    if (!rows[0]) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Nota no encontrada.' });
    }

    await notifyActiveUsers(client, rows[0].id, getUserId(req), 'modificada');
    await client.query('COMMIT');
    return res.json({ success: true, data: rows[0] });
  } catch (error) {
    await rollback(client, 'updateNota');
    return reportError(res, error, 'updateNota');
  } finally {
    client?.release();
  }
};

export const deleteNota = async (req, res) => {
  try {
    const { rows } = await query(
      `DELETE FROM public.notas
       WHERE id = $1 AND (autor_id = $2 OR $3 = TRUE)
       RETURNING id`,
      [req.params.id, getUserId(req), req.user?.rol === 'admin']
    );
    if (!rows[0]) {
      const { rows: existsRows } = await query(
        'SELECT EXISTS (SELECT 1 FROM public.notas WHERE id = $1) AS note_exists',
        [req.params.id]
      );
      if (existsRows[0].note_exists) {
        return res.status(403).json({
          success: false,
          message: 'Solo el autor de la nota o un administrador pueden eliminarla.',
        });
      }
      return res.status(404).json({ success: false, message: 'Nota no encontrada.' });
    }
    return res.json({ success: true, message: 'Nota eliminada correctamente.' });
  } catch (error) {
    return reportError(res, error, 'deleteNota');
  }
};

export const getNotificacionesNotas = async (req, res) => {
  try {
    const userId = getUserId(req);
    const [{ rows }, { rows: countRows }] = await Promise.all([
      query(
        `SELECT nn.id, nn.nota_id, nn.actor_id, nn.accion, nn.created_at, nn.leida_en,
                n.contenido,
                COALESCE(e.nombre, u.correo, 'Usuario') AS actor_nombre
         FROM public.notificaciones_notas nn
         JOIN public.notas n ON n.id = nn.nota_id
         LEFT JOIN public.usuarios u ON u.id_usuario = nn.actor_id
         LEFT JOIN public.empleados e ON e.cedula = u.cedula
         WHERE nn.destinatario_id = $1 AND nn.leida_en IS NULL
         ORDER BY nn.created_at DESC, nn.id DESC
         LIMIT 20`,
        [userId]
      ),
      query(
        `SELECT COUNT(*)::int AS total
         FROM public.notificaciones_notas
         WHERE destinatario_id = $1 AND leida_en IS NULL`,
        [userId]
      ),
    ]);
    return res.json({
      success: true,
      data: rows,
      unreadCount: countRows[0].total,
    });
  } catch (error) {
    return reportError(res, error, 'getNotificacionesNotas');
  }
};

export const markNotificacionesNotasRead = async (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.some(id => !Number.isInteger(Number(id)) || Number(id) <= 0)) {
    return res.status(400).json({ success: false, message: 'La lista de notificaciones no es válida.' });
  }

  try {
    const userId = getUserId(req);
    await query(
      `UPDATE public.notificaciones_notas
       SET leida_en = NOW()
       WHERE destinatario_id = $1
         AND id = ANY($2::int[])
         AND leida_en IS NULL`,
      [userId, ids.map(Number)]
    );
    const { rows } = await query(
      `SELECT COUNT(*)::int AS total
       FROM public.notificaciones_notas
       WHERE destinatario_id = $1 AND leida_en IS NULL`,
      [userId]
    );
    return res.json({ success: true, unreadCount: rows[0].total });
  } catch (error) {
    return reportError(res, error, 'markNotificacionesNotasRead');
  }
};
