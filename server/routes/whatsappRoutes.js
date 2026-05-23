import express from 'express';
import { sendQuotationViaWhatsApp, testWhatsAppConfig } from '../controllers/whatsappController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(verifyToken);
router.post('/send', sendQuotationViaWhatsApp);
router.get('/config', testWhatsAppConfig);

export default router;
