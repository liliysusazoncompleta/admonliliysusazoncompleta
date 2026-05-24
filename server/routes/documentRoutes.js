import express from 'express';
import { uploadDocument } from '../controllers/documentController.js';

const router = express.Router();

router.post('/upload', uploadDocument);

export default router;
