import fs from 'fs';
import path from 'path';
import { query } from '../config/db.js';

const sqlFile = path.resolve('scripts/seed_users.sql');

async function run() {
  try {
    const sql = fs.readFileSync(sqlFile, 'utf8');
    console.log('[seed] Ejecutando script:', sqlFile);
    // Dividir en statements simples por 'BEGIN;'/'COMMIT;' y ejecuciones múltiples
    // Para simplicidad, ejecutar todo como un único query (pg admite múltiples sentencias).
    const res = await query(sql);
    console.log('[seed] Script ejecutado. Resultado:', res.command || 'OK');
    process.exit(0);
  } catch (err) {
    console.error('[seed] Error al ejecutar script:', err.message);
    process.exit(1);
  }
}

run();
