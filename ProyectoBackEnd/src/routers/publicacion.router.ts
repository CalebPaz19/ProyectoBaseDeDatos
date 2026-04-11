import { Router } from "express";
import { crearPublicacion, listarPublicaciones, listarPublicacionesDeUsuario } from "../controllers/publicacion.controller";

const router = Router();

router.post('/publicacion/crear', crearPublicacion);
router.get('/publicacion/listarPublicaciones', listarPublicaciones);
router.get('/puLlicacion/listarSegunUsuario/:id_usuario', listarPublicacionesDeUsuario);

export default router;