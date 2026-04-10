import { Router } from 'express'
import { registrarUSuario } from '../controllers/usuarios.controller'

const router = Router()

router.post('/registro', registrarUSuario)

export default router