import { Router } from "express";
import {obtenerUsuarios, obtenerDetalleUsuario, gestionarCuentaUsuario, obtenerTodasLasPublicaciones, gestionarPublicacion} from "../controllers/admin.controller";
 
const router = Router();
 
router.get("/admin/usuarios", obtenerUsuarios);
router.get("/admin/usuarios/:id_usuario", obtenerDetalleUsuario);
router.patch("/admin/usuarios/:id_usuario/estado", gestionarCuentaUsuario);
 
router.get("/admin/publicaciones", obtenerTodasLasPublicaciones);
router.patch("/admin/publicaciones/:id_publicacion/estado", gestionarPublicacion);
 
export default router;