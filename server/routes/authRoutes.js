import { Router } from 'express';
import { login, getMe, logout, getPerfil }                    from '../controllers/authController.js';
import { forgotPassword, changePassword, validateResetToken } from '../controllers/passwordResetController.js';
import { verifyToken }                                        from '../middleware/authMiddleware.js';

const router = Router();

// Autenticación
router.post('/login',   login);
router.get ('/me',      verifyToken, getMe);
router.post('/logout',  verifyToken, logout);
router.get ('/perfil',  verifyToken, getPerfil);  // ← solo una vez

// Recuperación de contraseña
router.post('/forgot-password',       forgotPassword);
router.get ('/validate-token/:token', validateResetToken);
router.post('/change-password',       changePassword);

export default router;