import 'dotenv/config';
import express  from 'express';
import cors     from 'cors';
import helmet   from 'helmet';
import authRoutes       from './routes/authRoutes.js';
import { testConnection } from './config/db.js';

const app  = express();
const PORT = process.env.PORT || 3001;

// ── Seguridad ─────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin:      [
    process.env.CLIENT_URL || 'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
  ],
  credentials: true,
  methods:     ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Health check (no requiere BD) ─────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    status:    'ok',
    service:   'Lili y su Sazón Completa API',
    timestamp: new Date().toISOString(),
    port:      PORT,
  });
});

app.get('/', (req, res) => {
  res.json({
    status: "ok",
    service: "Lili y su Sazón Completa API",
    message: "Servidor funcionando correctamente. Usa las rutas de /api para realizar peticiones."
  });
});

// ── Rutas de autenticación ────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// ── Error global ──────────────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[ERROR]', err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// ── Arranque ──────────────────────────────────────────────────────────────────
app.listen(PORT, async () => {
  console.log('\n══════════════════════════════════════════════');
  console.log(`🍽️   Lili y su Sazón Completa — API`);
  console.log(`     http://localhost:${PORT}`);
  console.log(`     http://localhost:${PORT}/api/health`);
  console.log('══════════════════════════════════════════════');
  await testConnection();
});

export default app;
