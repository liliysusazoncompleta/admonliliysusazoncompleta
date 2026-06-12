/**
 * @fileoverview Controlador de Empleados
 * @module server/controllers/empleadosController
 */
import { query } from '../config/db.js';

const fmtError = (res, err, ctx) => {
  console.error(`[${ctx}]`, err.message);
  return res.status(500).json({ success: false, message: `Error interno: ${err.message}` });
};

export const getEmpleados = async (req, res) => {
  try {
    const { q, activos } = req.query;
    const params = [];
    const conds = [];

    if (activos !== 'todos') {
      conds.push(`activo = true`);
    }

    if (q) {
      params.push(`%${q}%`);
      conds.push(`(nombre ILIKE $${params.length} OR cedula ILIKE $${params.length} OR telefono ILIKE $${params.length})`);
    }

    const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';

    const { rows } = await query(
      `SELECT id_empleado,
              nombre,
              cedula,
              telefono,
              direccion_principal,
              direccion_alterna,
              cargo,
              salario,
              activo
       FROM public.empleados
       ${where}
       ORDER BY nombre`,
      params
    );
    res.json({ success: true, data: rows });
  } catch (e) {
    fmtError(res, e, 'getEmpleados');
  }
};

export const createEmpleado = async (req, res) => {
  try {
    const { nombre, cedula, telefono, direccion_principal, direccion_alterna, cargo, salario } = req.body;

    if (!nombre || !cedula || !telefono || !cargo) {
      return res.status(400).json({
        success: false,
        message: 'nombre, cedula, telefono y cargo son requeridos.'
      });
    }

    const { rows } = await query(
      `INSERT INTO public.empleados
        (nombre, cedula, telefono, direccion_principal, direccion_alterna, cargo, salario, activo)
       VALUES ($1, $2, $3, $4, $5, $6, $7, true)
       RETURNING id_empleado, nombre, cedula, telefono, direccion_principal, direccion_alterna, cargo, salario, activo`,
      [nombre, cedula, telefono, direccion_principal || null, direccion_alterna || null, cargo, salario || 0]
    );

    res.status(201).json({ success: true, data: rows[0] });
  } catch (e) {
    if (e.code === '23505') {
      return res.status(409).json({ success: false, message: 'Ya existe un empleado con esa cédula o teléfono.' });
    }
    fmtError(res, e, 'createEmpleado');
  }
};

export const updateEmpleado = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, cedula, telefono, direccion_principal, direccion_alterna, cargo, salario } = req.body;

    if (!nombre || !cedula || !telefono || !cargo) {
      return res.status(400).json({
        success: false,
        message: 'nombre, cedula, telefono y cargo son requeridos.'
      });
    }

    const { rows } = await query(
      `UPDATE public.empleados
       SET nombre = $1, cedula = $2, telefono = $3, direccion_principal = $4,
           direccion_alterna = $5, cargo = $6, salario = $7
       WHERE id_empleado = $8
       RETURNING id_empleado, nombre, cedula, telefono, direccion_principal, direccion_alterna, cargo, salario, activo`,
      [nombre, cedula, telefono, direccion_principal || null, direccion_alterna || null, cargo, salario || 0, id]
    );

    if (!rows[0]) {
      return res.status(404).json({ success: false, message: 'Empleado no encontrado.' });
    }

    res.json({ success: true, data: rows[0] });
  } catch (e) {
    if (e.code === '23505') {
      return res.status(409).json({ success: false, message: 'Ya existe un empleado con esa cédula o teléfono.' });
    }
    fmtError(res, e, 'updateEmpleado');
  }
};

export const toggleEmpleado = async (req, res) => {
  try {
    const { id } = req.params;
    const { activo } = req.body;

    const { rows } = await query(
      `UPDATE public.empleados
       SET activo = $1
       WHERE id_empleado = $2
       RETURNING id_empleado, nombre, activo`,
      [activo, id]
    );

    if (!rows[0]) {
      return res.status(404).json({ success: false, message: 'Empleado no encontrado.' });
    }

    res.json({ success: true, data: rows[0] });
  } catch (e) {
    fmtError(res, e, 'toggleEmpleado');
  }
};
