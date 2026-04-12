import { Router } from 'express';
import { actualizarPerfilUsuario, inicioSesion, obtenerPerfil, registrarUSuario } from '../controllers/usuarios.controller';

const router = Router();

router.post('/usuario/registro', registrarUSuario);
router.post('/usuario/inicioSesion', inicioSesion);
router.get("/usuario/perfil/:id_usuario", obtenerPerfil);
router.patch("/usuario/perfil/:id_usuario", actualizarPerfilUsuario);

export default router