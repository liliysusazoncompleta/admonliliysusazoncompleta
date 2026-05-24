/**
 * @fileoverview Controlador de Empleados
 * @module server/controllers/empleadosController
 */
import { query } from '../config/db.js';

const fmtError = (res, err, ctx) => {
  console.error(`[${ctx}]`, err.message);
  return res.status(500).json({ success: false, message: `Error interno: ${err.message}` });
};

export const getEmpleados = async (_req, res) => {
  try {
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
       WHERE activo = true
       ORDER BY nombre`,
    );
    res.json({ success: true, data: rows });
  } catch (e) {
    fmtError(res, e, 'getEmpleados');
  }
};
