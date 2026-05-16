import express from "express";

import {
  obtenerTiposProducto
} from "../controllers/tipoProductoController.js";

const router = express.Router();

console.log("✅ tipoProductoRoutes cargado");

router.get("/", obtenerTiposProducto);

export default router;