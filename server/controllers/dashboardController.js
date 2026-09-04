/**
 * @fileoverview Controlador Dashboard — Balance ventas vs compras
 * @module server/controllers/dashboardController
 */
import { query } from '../config/db.js';

const fmtError = (res, err, ctx) => {
  console.error(`[${ctx}]`, err.message);
  return res.status(500).json({ success: false, message: `Error interno: ${err.message}` });
};

/**
 * GET /api/dashboard/balance?ano=&mes=
 * - Ventas entregadas: base del balance (ingresos)
 * - Ventas canceladas: informativas / filtrables
 * - Compras del período
 * - Balance = ingresos entregadas − compras
 */
export const getBalance = async (req, res) => {
  try {
    const now = new Date();
    const ano = req.query.ano ? parseInt(req.query.ano, 10) : now.getFullYear();
    const mes = req.query.mes ? parseInt(req.query.mes, 10) : null;

    if (!Number.isFinite(ano) || ano < 2000 || ano > 2100) {
      return res.status(400).json({ success: false, message: 'Año inválido.' });
    }
    if (mes != null && (!Number.isFinite(mes) || mes < 1 || mes > 12)) {
      return res.status(400).json({ success: false, message: 'Mes inválido.' });
    }

    const ventaParams = [ano];
    let ventaPeriodo = `EXTRACT(YEAR FROM v.fecha_factura) = $1 AND v.activo = true`;
    if (mes != null) {
      ventaParams.push(mes);
      ventaPeriodo += ` AND EXTRACT(MONTH FROM v.fecha_factura) = $2`;
    }

    const compraParams = [ano];
    let compraPeriodo = `EXTRACT(YEAR FROM c.fecha_compra) = $1`;
    if (mes != null) {
      compraParams.push(mes);
      compraPeriodo += ` AND EXTRACT(MONTH FROM c.fecha_compra) = $2`;
    }

    const [ventasByEstado, comprasAgg, mensual] = await Promise.all([
      query(
        `SELECT v.estado,
                COUNT(*)::int AS cantidad,
                COALESCE(SUM(v.valor_factura), 0)::float AS total_factura,
                COALESCE(SUM(COALESCE(v.valor_domicilio, 0)), 0)::float AS total_domicilio,
                COALESCE(SUM(v.valor_factura + COALESCE(v.valor_domicilio, 0)), 0)::float AS total
         FROM public.ventas v
         WHERE ${ventaPeriodo}
         GROUP BY v.estado`,
        ventaParams
      ),
      query(
        `SELECT COUNT(*)::int AS cantidad,
                COALESCE(SUM(c.valor), 0)::float AS total
         FROM public."TblCompras" c
         WHERE ${compraPeriodo}`,
        compraParams
      ),
      // Desglose mensual solo cuando no hay filtro de mes (vista anual)
      mes == null
        ? query(
            `SELECT m.mes,
                    COALESCE(ve.total, 0)::float AS ventas_entregadas,
                    COALESCE(ve.cantidad, 0)::int AS cant_entregadas,
                    COALESCE(vc.total, 0)::float AS ventas_canceladas,
                    COALESCE(vc.cantidad, 0)::int AS cant_canceladas,
                    COALESCE(co.total, 0)::float AS compras,
                    COALESCE(co.cantidad, 0)::int AS cant_compras
             FROM generate_series(1, 12) AS m(mes)
             LEFT JOIN (
               SELECT EXTRACT(MONTH FROM fecha_factura)::int AS mes,
                      SUM(valor_factura + COALESCE(valor_domicilio, 0)) AS total,
                      COUNT(*) AS cantidad
               FROM public.ventas
               WHERE activo = true
                 AND estado = 'entregada'
                 AND EXTRACT(YEAR FROM fecha_factura) = $1
               GROUP BY 1
             ) ve ON ve.mes = m.mes
             LEFT JOIN (
               SELECT EXTRACT(MONTH FROM fecha_factura)::int AS mes,
                      SUM(valor_factura + COALESCE(valor_domicilio, 0)) AS total,
                      COUNT(*) AS cantidad
               FROM public.ventas
               WHERE activo = true
                 AND estado = 'cancelada'
                 AND EXTRACT(YEAR FROM fecha_factura) = $1
               GROUP BY 1
             ) vc ON vc.mes = m.mes
             LEFT JOIN (
               SELECT EXTRACT(MONTH FROM fecha_compra)::int AS mes,
                      SUM(valor) AS total,
                      COUNT(*) AS cantidad
               FROM public."TblCompras"
               WHERE EXTRACT(YEAR FROM fecha_compra) = $1
               GROUP BY 1
             ) co ON co.mes = m.mes
             ORDER BY m.mes`,
            [ano]
          )
        : Promise.resolve({ rows: [] }),
    ]);

    const byEstado = Object.fromEntries(
      (ventasByEstado.rows || []).map(r => [r.estado, r])
    );

    const empty = { cantidad: 0, total_factura: 0, total_domicilio: 0, total: 0 };
    const entregadas = byEstado.entregada || empty;
    const canceladas = byEstado.cancelada || empty;
    const pendientes = byEstado.pendiente || empty;
    const compras = comprasAgg.rows[0] || { cantidad: 0, total: 0 };

    const ingresos = Number(entregadas.total) || 0;
    const egresos = Number(compras.total) || 0;
    const balance = ingresos - egresos;

    res.json({
      success: true,
      data: {
        filtros: { ano, mes },
        ventas_entregadas: {
          cantidad: entregadas.cantidad,
          total_factura: Number(entregadas.total_factura) || 0,
          total_domicilio: Number(entregadas.total_domicilio) || 0,
          total: ingresos,
        },
        ventas_canceladas: {
          cantidad: canceladas.cantidad,
          total_factura: Number(canceladas.total_factura) || 0,
          total_domicilio: Number(canceladas.total_domicilio) || 0,
          total: Number(canceladas.total) || 0,
        },
        ventas_pendientes: {
          cantidad: pendientes.cantidad,
          total: Number(pendientes.total) || 0,
        },
        compras: {
          cantidad: compras.cantidad,
          total: egresos,
        },
        balance: {
          ingresos,
          egresos,
          resultado: balance,
          es_ganancia: balance > 0,
          es_perdida: balance < 0,
          es_equilibrio: balance === 0,
        },
        por_mes: (mensual.rows || []).map(r => ({
          mes: Number(r.mes),
          ventas_entregadas: Number(r.ventas_entregadas) || 0,
          cant_entregadas: r.cant_entregadas,
          ventas_canceladas: Number(r.ventas_canceladas) || 0,
          cant_canceladas: r.cant_canceladas,
          compras: Number(r.compras) || 0,
          cant_compras: r.cant_compras,
          balance: (Number(r.ventas_entregadas) || 0) - (Number(r.compras) || 0),
        })),
      },
    });
  } catch (e) {
    fmtError(res, e, 'getBalance');
  }
};
