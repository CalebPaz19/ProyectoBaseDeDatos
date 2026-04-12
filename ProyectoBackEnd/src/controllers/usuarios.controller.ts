import { Request, Response } from 'express';
import { actualizarPerfil, buscarUsuario, crearUsuario, obtenerUsuarioPorId } from '../models/usuario.model';
import bcrypt from "bcryptjs";

export const registrarUSuario = async (req: Request, res: Response) => {
  try {
    const { dni, nombre1, nombre2, apellido1, apellido2, correo, contraseña, telefono } = req.body;

    // validación
    if (!dni || !nombre1 || !apellido1 || !correo || !contraseña) {
      return res.status(400).json({
        message: 'Faltan campos obligatorios'
      })
    };
    
    // Normaliza email
    const correoNormalizado = String(correo).toLowerCase().trim();

    //Encriptacion de contraseña
    const contraseñaHash = await bcrypt.hash(contraseña, 10);


    const nuevoUsuario = await crearUsuario({
      dni,
      nombre1,
      nombre2,
      apellido1,
      apellido2,
      correo: correoNormalizado,
      contraseña: contraseñaHash ,
      telefono
    });

    return res.status(201).json({
      message: 'Usuario registrado',
      usuario: nuevoUsuario
    });

  } catch (error: any) {

    console.error("Error registrarUsuario:", error);
    if (error.number === 2627) {
      return res.status(400).json({
        message: 'El usuario ya existe (correo o DNI duplicado)'
      })
    };

    return res.status(500).json({
      message: 'Error en el servidor'
    })
  };
};

export const inicioSesion = async (req: Request, res: Response ) => {
  try{
    let {correo, contraseña} = req.body;

    // validación
    if (!correo) {
      return res.status(400).json({ ok: false, message: "Email requerido" });
    }
    if (!contraseña) {
        return res.status(400).json({ ok: false, message: "contraseña requerida" });
    }

    // Normaliza email para que coincida con cómo se guarda (lowercase+trim)
    correo = String(correo).toLowerCase().trim();

    const usuario = await buscarUsuario(correo);

    if (!usuario){
      return res.status(404).json({
        message: "Usuario no encontrado"
      });
    }

    //Verificar contraseña
    const ok = await bcrypt.compare(contraseña, usuario.contrasena);
    if (!ok) {
      return res.status(401).json({ ok: false, message: "Contraseña incorrecta" });
    }

    //Verificar estado de la cuanta
    if (usuario.estado_cuenta == "suspendida"){
      return res.status(403).json({
        message: "Cuenta suspendida"
      });
    }
    if (usuario.estado_cuenta == "bloqueada"){
      return res.status(403).json({
        message: "Cuenta bloqueada"
      });
    }

    // respuesta
    return res.json({
      message: "Login exitoso",
      usuario: {
        id_usuario: usuario.id_usuario,
        nombre: usuario.nombre1,
        apellido: usuario.apellido1,
        correo: usuario.correo,
        rol: usuario.rol
      }
    });

  } catch (error: any) {
    return res.status(500).json({
      message: "Error en el servidor"
    });

  }
};

export const obtenerPerfil = async (req: Request, res: Response) => {
  try {
    const { id_usuario } = req.params;
 
    const usuario = await obtenerUsuarioPorId(Number(id_usuario));
    if (!usuario){
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    return res.json({ usuario });
 
  } catch (error: any) {
    console.error("Error obtenerPerfil:", error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};
 
//Actualizar perfil
export const actualizarPerfilUsuario = async (req: Request, res: Response) => {
  try {
    const { id_usuario } = req.params;
    const { telefono, foto_perfil } = req.body;
 
    await actualizarPerfil(Number(id_usuario), { telefono, foto_perfil });
 
    return res.json({ message: "Perfil actualizado" });
 
  } catch (error: any) {
    console.error("Error actualizarPerfil:", error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};