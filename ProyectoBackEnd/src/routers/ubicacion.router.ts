import { Router } from "express";
import { crearUbicacion } from "../controllers/ubicacion.controller";

const router = Router();

router.post('/ubicacion/crear', crearUbicacion);

export default router;