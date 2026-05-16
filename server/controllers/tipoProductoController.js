import pool from "../config/db.js";

export const obtenerTiposProducto = async (req, res) => {
  try {

    const result = await pool.query(`
      SELECT
        id_tipo_producto,
        nombre
      FROM tipo_producto
      WHERE activo = true
      ORDER BY nombre ASC
    `);

    res.json(result.rows);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Error obteniendo tipos de producto"
    });
  }
};