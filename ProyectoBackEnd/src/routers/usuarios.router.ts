import { Router } from 'express';
import { inicioSesion, registrarUSuario } from '../controllers/usuarios.controller';

const router = Router();

router.post('/registro', registrarUSuario);
router.post('/inicioSesion', inicioSesion);

export default router