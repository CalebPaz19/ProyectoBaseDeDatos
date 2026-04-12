import { Router } from "express";
import { cambiarEstadoPublicacion, crearPublicacion, crearPublicacionCompleta, eliminarPublicacion, listarPublicaciones, listarPublicacionesDeUsuario, traerDetallePublicacion } from "../controllers/publicacion.controller";
import { upload } from "../config/multer";

const router = Router();

router.post('/publicacion/crear', crearPublicacion);
router.post('/publicacion/crear/completa', upload.array("imagenes", 10), crearPublicacionCompleta);
router.get('/publicacion/listarPublicaciones', listarPublicaciones);
router.get('/publicacion/listarSegunUsuario/:id_usuario', listarPublicacionesDeUsuario);
router.get('/publicacion/detalles/:id_publicacion', traerDetallePublicacion);
router.patch("/publicacion/:id_publicacion/estado", cambiarEstadoPublicacion);
router.delete("/publicacion/:id_publicacion", eliminarPublicacion);

export default router;