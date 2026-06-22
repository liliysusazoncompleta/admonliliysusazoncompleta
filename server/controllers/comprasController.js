import { query } from '../config/db.js';

const err500 = (res, e, ctx) => {
  console.error(`[${ctx}]`, e.message);
  res.status(500).json({ success: false, message: e.message });
};
const getUser = req => req.user?.correo || req.user?.id_usuario?.toString() || 'sistema';

// GET /api/compras
export const getCompras = async (req, res) => {
  try {
    const { q, proveedor, fecha_desde, fecha_hasta } = req.query;
    const params = [], conds = [];

    if (q) {
      params.push(`%${q}%`);
      conds.push(`(c.num_factura ILIKE $${params.length} OR c.producto ILIKE $${params.length} OR p.nombre ILIKE $${params.length})`);
    }
    if (proveedor) { params.push(proveedor); conds.push(`c.proveedor_nit = $${params.length}`); }
    if (fecha_desde) { params.push(fecha_desde); conds.push(`c.fecha_compra >= $${params.length}`); }
    if (fecha_hasta) { params.push(fecha_hasta); conds.push(`c.fecha_compra <= $${params.length}`); }
    const { mes, ano } = req.query;
    if (mes) { params.push(parseInt(mes)); conds.push(`EXTRACT(MONTH FROM c.fecha_compra) = $${params.length}`); }
    if (ano) { params.push(parseInt(ano)); conds.push(`EXTRACT(YEAR  FROM c.fecha_compra) = $${params.length}`); }

    const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';
    const { rows } = await query(
      `SELECT c.*, p.nombre AS proveedor_nombre
       FROM public."TblCompras" c
       LEFT JOIN public."TblProveedores" p ON c.proveedor_nit = p.nit
       ${where}
       ORDER BY c.fecha_compra DESC, c.id DESC`,
      params
    );
    res.json({ success: true, data: rows });
  } catch (e) { err500(res, e, 'getCompras'); }
};

// POST /api/compras
export const createCompra = async (req, res) => {
  try {
    const { num_factura, fecha_compra, proveedor_nit, producto, valor } = req.body;
    if (!num_factura?.trim() || !fecha_compra || !proveedor_nit || !producto?.trim() || !valor)
      return res.status(400).json({ success: false, message: 'Todos los campos son requeridos.' });

    const { rows: dup } = await query(
      `SELECT id FROM public."TblCompras" WHERE num_factura = $1`, [num_factura.trim()]
    );
    if (dup[0]) return res.status(409).json({ success: false, message: `La factura ${num_factura} ya existe.` });

    const usuario = getUser(req);
    const { rows } = await query(
      `INSERT INTO public."TblCompras" (num_factura,fecha_compra,proveedor_nit,producto,valor,created_by,updated_by)
       VALUES ($1,$2,$3,$4,$5,$6,$6) RETURNING *`,
      [num_factura.trim(), fecha_compra, proveedor_nit, producto.trim(), Number(valor), usuario]
    );
    res.status(201).json({ success: true, message: 'Compra registrada correctamente.', data: rows[0] });
  } catch (e) { err500(res, e, 'createCompra'); }
};

// PUT /api/compras/:id
export const updateCompra = async (req, res) => {
  try {
    const { fecha_compra, proveedor_nit, producto, valor } = req.body;
    const { rows } = await query(
      `UPDATE public."TblCompras"
       SET fecha_compra=$1, proveedor_nit=$2, producto=$3, valor=$4, updated_at=NOW(), updated_by=$5
       WHERE id=$6 RETURNING *`,
      [fecha_compra, proveedor_nit, producto.trim(), Number(valor), getUser(req), req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ success: false, message: 'Compra no encontrada.' });
    res.json({ success: true, message: 'Compra actualizada correctamente.', data: rows[0] });
  } catch (e) { err500(res, e, 'updateCompra'); }
};

// DELETE /api/compras/:id
export const deleteCompra = async (req, res) => {
  try {
    const { rows } = await query(
      `DELETE FROM public."TblCompras" WHERE id=$1 RETURNING id, num_factura`, [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ success: false, message: 'Compra no encontrada.' });
    res.json({ success: true, message: `Factura "${rows[0].num_factura}" eliminada correctamente.` });
  } catch (e) { err500(res, e, 'deleteCompra'); }
};
