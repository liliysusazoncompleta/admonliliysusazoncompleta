/**
 * @fileoverview Controlador de Clientes — CRUD completo
 * @module server/controllers/clientesController
 *
 * Reglas:
 *   • Teléfono obligatorio y único
 *   • NIT/CC opcional pero único
 *   • Máximo 2 direcciones (principal obligatoria, alterna opcional)
 *   • Soft delete (activo=false)
 */
import { query } from '../config/db.js';

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtError = (res, err, ctx) => {
  console.error(`[${ctx}]`, err.message);
  return res.status(500).json({ success: false, message: `Error interno: ${err.message}` });
};

const norm = (v) => (typeof v === 'string' ? v.trim() : v);
const optional = (v) => {
  const s = norm(v);
  return s == null || s === '' ? null : s;
};

// Mapeo de errores de constraint únicos a mensajes amigables
const handleUniqueError = (res, err) => {
  if (err.code === '23505') {
    if (err.constraint?.includes('telefono'))
      return res.status(409).json({ success: false, message: 'Ya existe un cliente con ese teléfono.' });
    if (err.constraint?.includes('nit'))
      return res.status(409).json({ success: false, message: 'Ya existe un cliente con ese NIT/CC.' });
    return res.status(409).json({ success: false, message: 'Registro duplicado.' });
  }
  return null;
};

// ── GET /api/clientes ─────────────────────────────────────────────────────────
export const getClientes = async (req, res) => {
  try {
    const { q, page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const params = [];
    const conds  = ['activo = true'];

    if (q) {
      params.push(`%${q}%`);
      conds.push(`(nombre ILIKE $${params.length} OR nit_cc ILIKE $${params.length} OR telefono ILIKE $${params.length})`);
    }

    const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';
    params.push(parseInt(limit), offset);

    const sql = `
      SELECT id_cliente, nombre, nit_cc, telefono, telefono_alt,
             direccion_principal, direccion_alterna, observaciones,
             created_at, updated_at
      FROM public.clientes
      ${where}
      ORDER BY nombre ASC
      LIMIT $${params.length - 1} OFFSET $${params.length}`;

    const countSql = `SELECT COUNT(*) FROM public.clientes ${where}`;

    const [data, total] = await Promise.all([
      query(sql, params),
      query(countSql, params.slice(0, -2)),
    ]);

    res.json({
      success: true,
      data:    data.rows,
      total:   parseInt(total.rows[0].count),
      page:    parseInt(page),
    });
  } catch (e) { fmtError(res, e, 'getClientes'); }
};

// ── GET /api/clientes/:id ─────────────────────────────────────────────────────
export const getClienteById = async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT * FROM public.clientes
       WHERE id_cliente = $1 AND activo = true`,
      [req.params.id],
    );
    if (!rows[0])
      return res.status(404).json({ success: false, message: 'Cliente no encontrado.' });
    res.json({ success: true, data: rows[0] });
  } catch (e) { fmtError(res, e, 'getClienteById'); }
};

// ── POST /api/clientes ────────────────────────────────────────────────────────
export const createCliente = async (req, res) => {
  try {
    const nombre              = norm(req.body.nombre);
    const telefono            = norm(req.body.telefono);
    const direccion_principal = norm(req.body.direccion_principal);
    const nit_cc              = optional(req.body.nit_cc);
    const telefono_alt        = optional(req.body.telefono_alt);
    const direccion_alterna   = optional(req.body.direccion_alterna);
    const observaciones       = optional(req.body.observaciones);

    if (!nombre || !telefono || !direccion_principal)
      return res.status(400).json({
        success: false,
        message: 'Nombre, teléfono y dirección principal son requeridos.',
      });

    const { rows } = await query(
      `INSERT INTO public.clientes
         (nombre, nit_cc, telefono, telefono_alt,
          direccion_principal, direccion_alterna,
          observaciones, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING *`,
      [nombre, nit_cc, telefono, telefono_alt,
       direccion_principal, direccion_alterna,
       observaciones, req.user?.id_usuario || null],
    );

    console.log(`[createCliente] ✅ ${rows[0].id_cliente} — ${rows[0].nombre}`);
    res.status(201).json({
      success: true,
      message: 'Cliente creado correctamente.',
      data:    rows[0],
    });
  } catch (e) {
    const dup = handleUniqueError(res, e);
    if (dup) return dup;
    fmtError(res, e, 'createCliente');
  }
};

// ── PUT /api/clientes/:id ─────────────────────────────────────────────────────
export const updateCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const nombre              = norm(req.body.nombre);
    const telefono            = norm(req.body.telefono);
    const direccion_principal = norm(req.body.direccion_principal);
    const nit_cc              = optional(req.body.nit_cc);
    const telefono_alt        = optional(req.body.telefono_alt);
    const direccion_alterna   = optional(req.body.direccion_alterna);
    const observaciones       = optional(req.body.observaciones);

    if (!nombre || !telefono || !direccion_principal)
      return res.status(400).json({
        success: false,
        message: 'Nombre, teléfono y dirección principal son requeridos.',
      });

    const { rows } = await query(
      `UPDATE public.clientes
       SET nombre=$1, nit_cc=$2, telefono=$3, telefono_alt=$4,
           direccion_principal=$5, direccion_alterna=$6,
           observaciones=$7, updated_at=NOW(), updated_by=$8
       WHERE id_cliente=$9 AND activo=true
       RETURNING *`,
      [nombre, nit_cc, telefono, telefono_alt,
       direccion_principal, direccion_alterna,
       observaciones, req.user?.id_usuario || null, id],
    );

    if (!rows[0])
      return res.status(404).json({ success: false, message: 'Cliente no encontrado.' });

    console.log(`[updateCliente] ✅ ID ${id}`);
    res.json({
      success: true,
      message: 'Cliente actualizado correctamente.',
      data:    rows[0],
    });
  } catch (e) {
    const dup = handleUniqueError(res, e);
    if (dup) return dup;
    fmtError(res, e, 'updateCliente');
  }
};

// ── DELETE /api/clientes/:id  (soft delete) ───────────────────────────────────
export const deleteCliente = async (req, res) => {
  try {
    const { rows } = await query(
      `UPDATE public.clientes
       SET activo=false, updated_at=NOW(), updated_by=$1
       WHERE id_cliente=$2 AND activo=true
       RETURNING id_cliente, nombre`,
      [req.user?.id_usuario || null, req.params.id],
    );
    if (!rows[0])
      return res.status(404).json({ success: false, message: 'Cliente no encontrado.' });

    console.log(`[deleteCliente] ✅ ID ${req.params.id} — ${rows[0].nombre}`);
    res.json({
      success: true,
      message: `Cliente "${rows[0].nombre}" eliminado correctamente.`,
    });
  } catch (e) { fmtError(res, e, 'deleteCliente'); }
};
