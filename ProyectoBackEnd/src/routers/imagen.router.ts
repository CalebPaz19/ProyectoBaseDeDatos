import { Router } from "express";
import { subirImagen } from "../controllers/imagen.controller";
import { upload } from "../config/multer";

const router = Router();

router.post('/imagenes/subir', upload.single('imagen'), subirImagen);

export default router;