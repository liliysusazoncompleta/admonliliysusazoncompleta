import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { query } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const applyChanges = process.argv.includes('--apply');
const imagesDir = path.resolve(__dirname, '../public/productos');
const fallbackImage = 'LOGOLILIYSUSAZONCOMPLETA.jpg';
const validExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp']);

const normalizeText = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const scoreMatch = (productNameNorm, imageNameNorm) => {
  if (!productNameNorm || !imageNameNorm) return 0;

  if (productNameNorm === imageNameNorm) return 100;
  if (imageNameNorm.includes(productNameNorm) || productNameNorm.includes(imageNameNorm)) return 80;

  const productTokens = productNameNorm.split(' ').filter(Boolean);
  const imageTokens = new Set(imageNameNorm.split(' ').filter(Boolean));

  if (!productTokens.length) return 0;

  let shared = 0;
  for (const token of productTokens) {
    if (imageTokens.has(token)) shared += 1;
  }

  return Math.round((shared / productTokens.length) * 70);
};

const listImageFiles = async () => {
  const entries = await fs.readdir(imagesDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => validExtensions.has(path.extname(name).toLowerCase()));
};

const chooseBestImage = (productName, imageFiles, usedImages) => {
  const normProduct = normalizeText(productName);
  let best = null;

  for (const imageName of imageFiles) {
    if (usedImages.has(imageName)) continue;

    const baseName = path.parse(imageName).name;
    const score = scoreMatch(normProduct, normalizeText(baseName));

    if (!best || score > best.score) {
      best = { imageName, score };
    }
  }

  // Require a minimum confidence to avoid random assignments.
  return best && best.score >= 40 ? best : null;
};

const main = async () => {
  try {
    const imageFiles = await listImageFiles();
    const imageSet = new Set(imageFiles);

    const { rows: products } = await query(
      `SELECT id_producto, nombre, imagen_url
       FROM public.productos
       WHERE activo = true
       ORDER BY id_producto ASC`,
    );

    const updates = [];
    const report = [];
    const usedImages = new Set();

    for (const product of products) {
      const best = chooseBestImage(product.nombre, imageFiles, usedImages);
      const assigned = best ? best.imageName : fallbackImage;

      if (best) usedImages.add(best.imageName);

      report.push({
        id: product.id_producto,
        nombre: product.nombre,
        actual: product.imagen_url || '(vacio)',
        nueva: assigned,
        confianza: best ? `${best.score}%` : 'fallback',
      });

      if ((product.imagen_url || '') !== assigned) {
        updates.push({
          id: product.id_producto,
          current: product.imagen_url || null,
          next: assigned,
        });
      }
    }

    const unusedImages = imageFiles.filter((imageName) => !usedImages.has(imageName) && imageName !== fallbackImage);
    const fallbackExists = imageSet.has(fallbackImage);

    console.log('\n=== Sync Images Report ===');
    console.log(`Modo: ${applyChanges ? 'APPLY' : 'DRY-RUN'}`);
    console.log(`Productos activos: ${products.length}`);
    console.log(`Archivos en carpeta: ${imageFiles.length}`);
    console.log(`Cambios detectados: ${updates.length}`);

    if (!fallbackExists) {
      console.log(`ADVERTENCIA: no existe ${fallbackImage} en la carpeta de imagenes.`);
    }

    if (report.length) {
      console.table(report);
    }

    if (unusedImages.length) {
      console.log('\nArchivos sin usar:');
      for (const fileName of unusedImages) {
        console.log(`- ${fileName}`);
      }
    }

    if (!applyChanges) {
      console.log('\nNo se aplicaron cambios (dry-run).');
      console.log('Para aplicar, ejecuta: pnpm sync-images:apply');
      return;
    }

    if (!updates.length) {
      console.log('\nNo hay cambios para aplicar.');
      return;
    }

    for (const item of updates) {
      await query(
        `UPDATE public.productos
         SET imagen_url = $1, updated_at = NOW()
         WHERE id_producto = $2`,
        [item.next, item.id],
      );
    }

    console.log(`\nCambios aplicados: ${updates.length}`);
  } catch (error) {
    console.error('\nError al sincronizar imagenes:', error.message);
    process.exitCode = 1;
  }
};

await main();
