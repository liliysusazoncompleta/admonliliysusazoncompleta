/**
 * @fileoverview Middleware de autenticación JWT
 * @module server/middleware/authMiddleware
 */

import jwt from 'jsonwebtoken';

const JWT_SECRET  = process.env.JWT_SECRET  || 'lili_sazon_dev_secret_changeme_in_production';

const normalizeRole = (r) => {
  if (!r) return r;
  const rr = String(r).toLowerCase();
  if (rr === 'ventas') return 'vendedor';
  if (rr === 'operador') return 'operario';
  if (rr === 'administrador' || rr === 'adm' || rr === 'admin' || rr === 'administrator') return 'admin';
  return rr;
};

/**
 * Verifica el Bearer token en el header Authorization.
 * Adjunta el payload decodificado en `req.user` si es válido.
 */
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  // Log minimal info for debugging token issues (remove in production)
  if (authHeader) console.debug('[authMiddleware] Authorization header received length=', authHeader.length);
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"
  if (token) console.debug('[authMiddleware] token length=', token.length);

  if (!token) {
    return res.status(401).json({ success: false, message: 'Token de acceso requerido.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // Normalizar rol dentro de la petición para comparaciones consistentes
    decoded.rol = normalizeRole(decoded.rol);
    req.user = decoded;
    next();
  } catch (err) {
    const message = err.name === 'TokenExpiredError'
      ? 'Tu sesión ha expirado. Inicia sesión nuevamente.'
      : 'Token inválido.';
    return res.status(401).json({ success: false, message });
  }
};

/**
 * Verifica que el usuario tenga uno de los roles permitidos.
 *
 * @param {...string} roles - Roles autorizados (ej: 'admin', 'operador')
 */
export const requireRole = (...roles) => (req, res, next) => {
  const userRol = normalizeRole(req.user?.rol);
  const wanted = roles.map(r => normalizeRole(r));
  if (!wanted.includes(userRol)) {
    return res.status(403).json({
      success: false,
      message: 'No tienes permisos para acceder a este recurso.',
    });
  }
  next();
};
