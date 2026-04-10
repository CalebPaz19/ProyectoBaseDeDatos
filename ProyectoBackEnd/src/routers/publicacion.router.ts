import { Router } from "express";
import { crearPublicacion } from "../controllers/publicacion.controller";

const router = Router();

router.post('/publicacion/crear', crearPublicacion);

export default router;