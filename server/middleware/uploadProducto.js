import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Crear carpeta automáticamente
const uploadPath = 'server/uploads/productos';

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// Configuración del almacenamiento
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadPath);
  },

  filename: (_req, file, cb) => {
    const uniqueName =
      Date.now() + '-' + Math.round(Math.random() * 1e9);

    cb(
      null,
      uniqueName + path.extname(file.originalname)
    );
  },
});

// Validar imágenes
const fileFilter = (_req, file, cb) => {
  const allowed = /jpg|jpeg|png|webp/;

  const validExt = allowed.test(
    path.extname(file.originalname).toLowerCase()
  );

  const validMime = allowed.test(file.mimetype);

  if (validExt && validMime) {
    cb(null, true);
  } else {
    cb(new Error('Solo imágenes JPG, PNG o WEBP'));
  }
};

export const uploadProducto = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});