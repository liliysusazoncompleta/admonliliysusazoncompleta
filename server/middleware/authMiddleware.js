/**
 * @fileoverview Middleware de autenticación JWT
 * @module server/middleware/authMiddleware
 */

import jwt from 'jsonwebtoken';

const JWT_SECRET  = process.env.JWT_SECRET  || 'lili_sazon_dev_secret_changeme_in_production';

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
  if (!roles.includes(req.user?.rol)) {
    return res.status(403).json({
      success: false,
      message: 'No tienes permisos para acceder a este recurso.',
    });
  }
  next();
};
