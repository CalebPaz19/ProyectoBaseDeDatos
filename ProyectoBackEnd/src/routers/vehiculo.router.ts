import { Router } from "express";
import { crearVehiculo } from "../controllers/vehiculo.cotroller";

const router = Router();

router.post('/vehiculo/crear', crearVehiculo);

export default router;