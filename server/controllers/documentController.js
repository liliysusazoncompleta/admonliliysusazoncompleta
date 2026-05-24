import fs from 'fs';
import path from 'path';

const DOCUMENTS_UPLOAD_PATH = path.resolve('server/uploads/documentos');

const ensureDocumentPath = () => {
  if (!fs.existsSync(DOCUMENTS_UPLOAD_PATH)) {
    fs.mkdirSync(DOCUMENTS_UPLOAD_PATH, { recursive: true });
  }
};

export async function uploadDocument(req, res) {
  const { filename, pdfBase64 } = req.body;
  if (!filename || !pdfBase64) {
    return res.status(400).json({ error: 'filename y pdfBase64 son requeridos' });
  }

  const match = pdfBase64.match(/^data:application\/pdf;base64,(.*)$/);
  const base64 = match ? match[1] : pdfBase64;
  const buffer = Buffer.from(base64, 'base64');
  const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');

  ensureDocumentPath();

  const filePath = path.join(DOCUMENTS_UPLOAD_PATH, safeFilename);
  try {
    fs.writeFileSync(filePath, buffer);
  } catch (error) {
    console.error('[DOCUMENT_SAVE_ERROR]', error);
    return res.status(500).json({ error: 'No se pudo guardar el documento en el servidor.' });
  }

  const protocol = req.protocol;
  const host = req.get('host');
  const fileUrl = `${protocol}://${host}/uploads/documentos/${encodeURIComponent(safeFilename)}`;
  return res.json({ success: true, fileUrl, filename: safeFilename });
}
