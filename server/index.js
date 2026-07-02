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
import seedRoutes       from './routes/seedRoutes.js';
import { testConnection } from './config/db.js';
import tipoProductoRoutes from "./routes/tipoProductoRoutes.js";
import proveedoresRoutes from './routes/proveedoresRoutes.js';
import comprasRoutes from './routes/comprasRoutes.js';

import path from 'path';

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors({
  origin: [
    process.env.CLIENT_URL || 'http://localhost:5173',
    'https://liliysusazoncompleta.github.io',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
  ],
  credentials: true,
  methods:     ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.resolve('uploads')));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'Lili y su Sazón Completa API', timestamp: new Date().toISOString(), port: PORT });
});

app.get('/', (_req, res) => {
  res.json({ status: 'ok', service: 'Lili y su Sazón Completa API', message: 'Servidor funcionando correctamente. Usa las rutas de /api para realizar peticiones.' });
});

app.use('/api/auth',         authRoutes);
app.use('/api/productos',    productosRoutes);
app.use('/api/clientes',     clientesRoutes);
app.use('/api/whatsapp',     whatsappRoutes);
app.use('/api/documents',    documentRoutes);
app.use('/api/ventas',       ventasRoutes);
app.use('/api/empleados',    empleadosRoutes);
app.use('/api/usuarios',     usuariosRoutes);
app.use('/api/proveedores', proveedoresRoutes);
app.use('/api/compras', comprasRoutes);
app.use('/api/tipo-producto', tipoProductoRoutes);
app.use('/api/admin', seedRoutes);

app.use((_req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));
app.use((err, _req, res, _next) => {
  console.error('[ERROR]', err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(PORT, async () => {
  console.log(`\n🍽️  Lili y su Sazón Completa — API → http://localhost:${PORT}`);
  await testConnection();
});

export default app;