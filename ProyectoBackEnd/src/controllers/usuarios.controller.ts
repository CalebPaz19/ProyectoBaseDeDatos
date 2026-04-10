import { Request, Response } from 'express'
import { crearUsuario } from '../models/usuario.model'

export const registrarUSuario = async (req: Request, res: Response) => {
  try {
    const {
      dni,
      nombre1,
      nombre2,
      apellido1,
      apellido2,
      correo,
      contraseña,
      telefono
    } = req.body

    // validación básica
    if (!dni || !nombre1 || !apellido1 || !correo || !contraseña) {
      return res.status(400).json({
        message: 'Faltan campos obligatorios'
      })
    }

    const nuevoUsuario = await crearUsuario({
      dni,
      nombre1,
      nombre2,
      apellido1,
      apellido2,
      correo,
      contraseña,
      telefono
    })

    return res.status(201).json({
      message: 'Usuario registrado',
      usuario: nuevoUsuario
    })

  } catch (error: any) {

    // error por duplicados (correo o dni)
    if (error.number === 2627) {
      return res.status(400).json({
        message: 'El usuario ya existe (correo o DNI duplicado)'
      })
    }

    return res.status(500).json({
      message: 'Error en el servidor'
    })
  }
}