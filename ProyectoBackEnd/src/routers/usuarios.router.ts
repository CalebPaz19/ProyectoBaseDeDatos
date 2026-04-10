import { Router } from 'express';
import { inicioSesion, registrarUSuario } from '../controllers/usuarios.controller';

const router = Router();

router.post('/usuario/registro', registrarUSuario);
router.post('/usuario/inicioSesion', inicioSesion);

export default router