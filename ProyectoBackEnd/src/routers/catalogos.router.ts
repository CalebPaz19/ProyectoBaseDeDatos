import { obtenerCatalogosVehiculo, obtenerCiudades, obtenerContinentes, obtenerMarcas, obtenerModelos, obtenerPaises } from "../controllers/catalogos.controller";
import { Router} from "express";

const router = Router();

router.get('/catalogos/vehiculo', obtenerCatalogosVehiculo);
router.get('/catalogos/marcas', obtenerMarcas);
router.get('/catalogos/modelos/:id_marca', obtenerModelos);

router.get('/catalogos/continentes', obtenerContinentes);
router.get('/catalogos/paises/:id_continente', obtenerPaises);
router.get('/catalogos/ciudades/:id_pais', obtenerCiudades);

export default router;