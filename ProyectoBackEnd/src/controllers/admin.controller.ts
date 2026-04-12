import { Request, Response } from "express";
import { listarTodosLosUsuarios, cambiarEstadoCuenta, obtenerUsuarioPorId } from "../models/usuario.model";
import { listarTodasLasPublicaciones, actualizarEstadoPublicacion } from "../models/publicacion.model";
 
//Listar todos los usuarios
export const obtenerUsuarios = async (req: Request, res: Response) => {
  try {
    const { estado_cuenta, rol, pagina, por_pagina } = req.query;
 
    const usuarios = await listarTodosLosUsuarios({
      estado_cuenta: estado_cuenta as string | undefined,
      rol:           rol           as string | undefined,
      pagina:        pagina        ? Number(pagina)     : 1,
      por_pagina:    por_pagina    ? Number(por_pagina) : 20,
    });
 
    return res.json({ usuarios });
  } catch (error: any) {
    console.error("Error obtenerUsuarios:", error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};
 
//Detalle de un usuario
export const obtenerDetalleUsuario = async (req: Request, res: Response) => {
  try {
    const { id_usuario } = req.params;
    const usuario = await obtenerUsuarioPorId(Number(id_usuario));
 
    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
 
    return res.json({ usuario });
  } catch (error: any) {
    console.error("Error obtenerDetalleUsuario:", error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};
 
//Cambiar estado de cuenta
export const gestionarCuentaUsuario = async (req: Request, res: Response) => {
  try {
    const { id_usuario } = req.params;
    const { estado_cuenta } = req.body;
 
    const estadosValidos = ["activa", "suspendida", "bloqueada"];
    if (!estado_cuenta || !estadosValidos.includes(estado_cuenta)) {
      return res.status(400).json({
        message: `Estado inválido. Debe ser: ${estadosValidos.join(", ")}`,
      });
    }
 
    await cambiarEstadoCuenta(Number(id_usuario), estado_cuenta);
 
    return res.json({
      message: `Cuenta del usuario marcada como '${estado_cuenta}'`,
    });
  } catch (error: any) {
    console.error("Error gestionarCuentaUsuario:", error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};
 
//Listar todas las publicaciones (incluyendo pausadas y eliminadas)
export const obtenerTodasLasPublicaciones = async (
  req: Request,
  res: Response
) => {
  try {
    const { estado, pagina, por_pagina } = req.query;
 
    const publicaciones = await listarTodasLasPublicaciones({
      estado:     estado     as string,
      pagina:     pagina     ? Number(pagina)     : 1,
      por_pagina: por_pagina ? Number(por_pagina) : 20,
    });
 
    return res.json({ publicaciones });
  } catch (error: any) {
    console.error("Error obtenerTodasLasPublicaciones:", error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};
 
//Admin puede cambiar estado de cualquier publicación
export const gestionarPublicacion = async (req: Request, res: Response) => {
  try {
    const { id_publicacion } = req.params;
    const { estado } = req.body;
 
    const estadosValidos = ["activa", "pausada", "vendido", "eliminada"];
    if (!estado || !estadosValidos.includes(estado)) {
      return res.status(400).json({
        message: `Estado inválido. Debe ser: ${estadosValidos.join(", ")}`,
      });
    }
 
    await actualizarEstadoPublicacion(Number(id_publicacion), estado);
 
    return res.json({ message: `Publicación marcada como '${estado}'` });
  } catch (error: any) {
    console.error("Error gestionarPublicacion:", error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};