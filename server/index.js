import 'dotenv/config';
import express  from 'express';
import cors     from 'cors';
import helmet   from 'helmet';
import authRoutes       from './routes/authRoutes.js';
import productosRoutes  from './routes/productosRoutes.js';
import clientesRoutes   from './routes/clientesRoutes.js';
import whatsappRoutes   from './routes/whatsappRoutes.js';
import documentRoutes   from './routes/documentRoutes.js';
import empleadosRoutes  from './routes/empleadosRoutes.js';
import usuariosRoutes   from './routes/usuariosRoutes.js';
import ventasRoutes     from './routes/ventasRoutes.js';
import { testConnection } from './config/db.js';
import tipoProductoRoutes from "./routes/tipoProductoRoutes.js";
import path from 'path';


const app  = express();
app.use(
  '/uploads',
  express.static(path.resolve('server/uploads'))
);
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
app.use('/api/auth',      authRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/clientes',  clientesRoutes);
app.use('/api/whatsapp',  whatsappRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/ventas',     ventasRoutes);
app.use('/api/empleados', empleadosRoutes);
app.use('/api/usuarios',  usuariosRoutes);
app.use("/api/tipo-producto", tipoProductoRoutes);
app.use(
  '/uploads',
  express.static(path.resolve('server/uploads'))
);

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
