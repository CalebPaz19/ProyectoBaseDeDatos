import { Router } from "express";
import { agregar, eliminar, listar, verificar } from "../controllers/favorito.controller";

const router = Router();

//Agregar publicación a favoritos
router.post("/favorito/agregar", agregar);

//Eliminar publicación de favoritos
router.delete("/favorito/:id_usuario/:id_publicacion", eliminar);

//Listar todos los favoritos de un usuario
router.get("/favorito/listar/:id_usuario", listar);

//Verificar si una publicación es favorita para un usuario
router.get("/favorito/verificar/:id_usuario/:id_publicacion", verificar);

export default router;