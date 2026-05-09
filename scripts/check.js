/**
 * Script de diagnóstico — ejecutar con: node scripts/check.js
 * Verifica: Node.js, variables de entorno, PostgreSQL y dependencias
 */

import { readFileSync, existsSync } from 'fs';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require   = createRequire(import.meta.url);

console.log('\n══════════════════════════════════════════════════');
console.log('  🔍  Diagnóstico — Lili y su Sazón Completa');
console.log('══════════════════════════════════════════════════\n');

// 1. Node.js version
const nodeVersion = process.version;
const nodeMajor   = parseInt(nodeVersion.slice(1));
const nodeOk      = nodeMajor >= 18;
console.log(`[1] Node.js: ${nodeVersion} ${nodeOk ? '✅' : '❌ (requiere >= 18)'}`);

// 2. .env file
const envPath = path.join(__dirname, '../server/.env');
const envExists = existsSync(envPath);
console.log(`[2] server/.env: ${envExists ? '✅ encontrado' : '❌ NO encontrado'}`);

if (envExists) {
  // Cargar manualmente sin dotenv
  const envContent = readFileSync(envPath, 'utf8');
  const envVars = {};
  for (const line of envContent.split('\n')) {
    const [key, ...rest] = line.split('=');
    if (key && !key.startsWith('#')) envVars[key.trim()] = rest.join('=').trim();
  }
  const required = ['DATABASE_URL', 'JWT_SECRET', 'PORT'];
  for (const v of required) {
    console.log(`    ${v}: ${envVars[v] ? '✅' : '❌ FALTA'}`);
  }
}

// 3. Dependencias del servidor
console.log('\n[3] Dependencias server/node_modules:');
const deps = ['express', 'pg', 'bcrypt', 'jsonwebtoken', 'nodemailer', 'dotenv', 'cors', 'helmet'];
const serverNM = path.join(__dirname, '../server/node_modules');
let missingDeps = [];

for (const dep of deps) {
  const depPath = path.join(serverNM, dep);
  const exists  = existsSync(depPath);
  if (!exists) missingDeps.push(dep);
  console.log(`    ${dep}: ${exists ? '✅' : '❌ NO instalado'}`);
}

// 4. PostgreSQL
console.log('\n[4] Probando conexión a PostgreSQL…');
try {
  const { default: pg }   = await import('pg');
  const { Pool } = pg;

  let connStr = 'postgresql://postgres:5241271@localhost:5432/LiliysuSazonCompleta_DB';
  if (existsSync(envPath)) {
    const content = readFileSync(envPath, 'utf8');
    const match   = content.match(/DATABASE_URL=(.+)/);
    if (match) connStr = match[1].trim();
  }

  const pool = new Pool({ connectionString: connStr, connectionTimeoutMillis: 4000 });
  const client = await pool.connect();
  const { rows } = await client.query('SELECT version()');
  client.release();
  await pool.end();
  console.log(`    ✅ Conectado: ${rows[0].version.split(' ').slice(0,2).join(' ')}`);
} catch (err) {
  console.log(`    ❌ Error: ${err.message}`);
  console.log(`    → Verifica que PostgreSQL esté corriendo`);
  console.log(`    → Verifica usuario/contraseña en server/.env`);
}

// 5. Resumen
console.log('\n══════════════════════════════════════════════════');
if (missingDeps.length > 0) {
  console.log('⚠️  SOLUCIÓN — ejecuta estos comandos:\n');
  console.log('  cd server');
  console.log('  pnpm install');
  console.log('  cd ..');
} else {
  console.log('✅ Dependencias OK. Si el servidor no inicia, ejecuta:');
  console.log('  cd server && node index.js');
  console.log('  (observa el error exacto en la terminal)');
}
console.log('══════════════════════════════════════════════════\n');
