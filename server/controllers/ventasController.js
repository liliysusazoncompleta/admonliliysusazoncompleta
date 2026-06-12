/**
 * @fileoverview Controlador de Ventas
 * @module server/controllers/ventasController
 */
import { query } from '../config/db.js';

const fmtError = (res, err, ctx) => {
  console.error(`[${ctx}]`, err.message);
  return res.status(500).json({ success: false, message: `Error interno: ${err.message}` });
};

export const getVentas = async (req, res) => {
  try {
    const { ano, mes, vendedor, estado } = req.query;
    const params = [];
    const conds = ['v.activo = true'];

    if (ano && mes) {
      params.push(`${ano}-${String(mes).padStart(2, '0')}`);
      conds.push(`TO_CHAR(v.fecha_factura, 'YYYY-MM') = $${params.length}`);
    } else if (ano) {
      params.push(ano);
      conds.push(`TO_CHAR(v.fecha_factura, 'YYYY') = $${params.length}`);
    } else if (mes) {
      params.push(`%${String(mes).padStart(2, '0')}%`);
      conds.push(`TO_CHAR(v.fecha_factura, 'MM') = $${params.length}`);
    }

    if (vendedor) {
      params.push(parseInt(vendedor));
      conds.push(`v.id_empleado_comision = $${params.length}`);
    }

    if (estado) {
      params.push(estado);
      conds.push(`v.estado = $${params.length}`);
    }

    const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';

    const { rows } = await query(
      `SELECT v.id_venta, v.id_cliente, v.id_empleado_comision, v.fecha_factura,
              v.fecha_entrega, v.valor_factura, v.valor_comision, v.valor_domicilio,
              v.estado, v.observaciones, v.created_at,
              c.nombre AS cliente_nombre, e.nombre AS empleado_nombre
       FROM public.ventas v
       LEFT JOIN public.clientes c ON v.id_cliente = c.id_cliente
       LEFT JOIN public.empleados e ON v.id_empleado_comision = e.id_empleado
       ${where}
       ORDER BY v.fecha_factura DESC`,
      params
    );

    res.json({ success: true, data: rows });
  } catch (e) {
    fmtError(res, e, 'getVentas');
  }
};

export const updateVentaEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    if (!estado || !['entregada', 'pendiente', 'cancelada'].includes(estado)) {
      return res.status(400).json({ success: false, message: 'Estado inválido. Valores válidos: entregada, pendiente, cancelada' });
    }

    const { rows } = await query(
      `UPDATE public.ventas
       SET estado = $1
       WHERE id_venta = $2
       RETURNING id_venta, estado`,
      [estado, id]
    );

    if (!rows[0]) {
      return res.status(404).json({ success: false, message: 'Venta no encontrada.' });
    }

    res.json({ success: true, data: rows[0] });
  } catch (e) {
    fmtError(res, e, 'updateVentaEstado');
  }
};

export const createVenta = async (req, res) => {
  const {
    id_cliente,
    id_empleado_comision,
    fecha_entrega,
    valor_factura,
    porcentaje_comision = 0,
    valor_comision = 0,
    valor_domicilio,
    observaciones,
  } = req.body;

  console.log('[createVenta] Payload recibido:', {
    id_cliente,
    id_empleado_comision,
    fecha_entrega,
    valor_factura,
    porcentaje_comision,
    valor_comision,
    valor_domicilio,
    observaciones,
    user: req.user,
  });

  if (!id_cliente || !id_empleado_comision || !fecha_entrega || valor_factura == null) {
    console.log('[createVenta] Validación fallida');
    return res.status(400).json({
      success: false,
      message: 'id_cliente, id_empleado_comision, fecha_entrega y valor_factura son requeridos.',
    });
  }

  try {
    const { rows } = await query(
      `INSERT INTO public.ventas
         (id_cliente, id_usuario, id_empleado_comision, fecha_factura, fecha_entrega,
          valor_factura, porcentaje_comision, valor_comision, valor_domicilio, observaciones,
          created_by, updated_by, activo)
       VALUES
         ($1, $2, $3, NOW(), $4, $5, $6, $7, $8, $9, $10, $10, true)
       RETURNING id_venta, id_cliente, id_usuario, id_empleado_comision, fecha_factura,
                 fecha_entrega, valor_factura, porcentaje_comision, valor_comision, valor_domicilio, observaciones,
                 created_by, updated_by, activo`,
      [
        id_cliente,
        req.user.id_usuario,
        id_empleado_comision,
        fecha_entrega,
        valor_factura,
        porcentaje_comision,
        valor_comision,
        valor_domicilio,
        observaciones,
        req.user.id_usuario,
      ],
    );

    console.log('[createVenta] Venta insertada correctamente:', rows[0]);
    return res.status(201).json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('[createVenta] Error en la inserción:', error.message, error.detail);
    return fmtError(res, error, 'createVenta');
  }
};
