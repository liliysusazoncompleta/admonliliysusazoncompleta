/**
 * @fileoverview Controlador de Ventas
 * @module server/controllers/ventasController
 */
import { query } from '../config/db.js';

const fmtError = (res, err, ctx) => {
  console.error(`[${ctx}]`, err.message);
  return res.status(500).json({ success: false, message: `Error interno: ${err.message}` });
};

export const createVenta = async (req, res) => {
  const {
    id_cliente,
    id_empleado_comision,
    fecha_entrega,
    hora_entrega,
    valor_factura,
    valor_domicilio,
    observaciones,
  } = req.body;

  if (!id_cliente || !id_empleado_comision || !fecha_entrega || !hora_entrega || valor_factura == null) {
    return res.status(400).json({
      success: false,
      message: 'id_cliente, id_empleado_comision, fecha_entrega, hora_entrega y valor_factura son requeridos.',
    });
  }

  try {
    const { rows } = await query(
      `INSERT INTO public.ventas
         (id_cliente, id_usuario, id_empleado_comision, fecha_factura, fecha_entrega, hora_entrega,
          valor_factura, porcentaje_comision, valor_comision, valor_domicilio, observaciones,
          created_by, updated_by, activo)
       VALUES
         ($1, $2, $3, NOW(), $4, $5, $6, 0, 0, $7, $8, $9, $9, true)
       RETURNING id_venta, id_cliente, id_usuario, id_empleado_comision, fecha_factura,
                 fecha_entrega, hora_entrega, valor_factura, valor_domicilio, observaciones,
                 created_by, updated_by, activo`,
      [
        id_cliente,
        req.user.id_usuario,
        id_empleado_comision,
        fecha_entrega,
        hora_entrega,
        valor_factura,
        valor_domicilio,
        observaciones,
        req.user.id_usuario,
      ],
    );

    return res.status(201).json({ success: true, data: rows[0] });
  } catch (error) {
    return fmtError(res, error, 'createVenta');
  }
};
