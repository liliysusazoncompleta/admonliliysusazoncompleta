/**
 * @fileoverview Configuración y pool de conexiones PostgreSQL
 * @module server/config/db
 */

import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://postgres:5241271@localhost:5432/LiliysuSazonCompleta_DB';

const pool = new Pool({
  connectionString,
  max:                    parseInt(process.env.DB_POOL_MAX || '10'),
  idleTimeoutMillis:      30_000,
  connectionTimeoutMillis: 5_000,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,

});
// ✅ SOLUCIÓN CORRECTA: Forzar el search_path cada vez que un cliente se conecta
pool.on('connect', (client) => {
  client.query('SET search_path TO public;');
});

pool.on('error', (err) => {
  console.error('[DB] Error en cliente idle:', err.message);
});

// Verificación de conexión — NO bloquea el arranque del servidor
export const testConnection = async () => {
  try {
    const client = await pool.connect();
    const { rows } = await client.query('SELECT NOW() AS now');
    client.release();
    console.log(`[DB] ✅  PostgreSQL conectado → ${rows[0].now}`);
    return true;
  } catch (err) {
    console.error('[DB] ❌  Error de conexión:', err.message);
    console.error('         Verifica que PostgreSQL esté activo y la DB exista.');
    return false;
  }
};

export const query     = (text, params) => pool.query(text, params);
export const getClient = ()             => pool.connect();
export default pool;
