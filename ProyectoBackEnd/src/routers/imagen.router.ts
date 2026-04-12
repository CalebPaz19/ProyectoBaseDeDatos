import { Router } from "express";
import { eliminarImagen, listarImagenes, subirImagen } from "../controllers/imagen.controller";
import { upload } from "../config/multer";

const router = Router();

router.post('/imagenes/subir', upload.array("imagenes", 10));
router.get("/imagenes/:id_publicacion", listarImagenes);
router.delete("/imagenes/:id_imagen", eliminarImagen);

export default router;