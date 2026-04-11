import { Request, Response } from "express";
import { buscarPublicaciones, guardarPublicacion, obtenerPublicacionesPorUsuario } from "../models/publicacion.model";

export const crearPublicacion = async (req: Request, res: Response) => {
  try {
    const {
      titulo,
      descripcion,
      precio,
      id_usuario,
      id_vehiculo,
      id_ubicacion
    } = req.body;

    if (!titulo || !precio || !id_usuario || !id_vehiculo || !id_ubicacion) {
      return res.status(400).json({
        message: "Faltan campos obligatorios"
      });
    }

    if (precio <= 0) {
      return res.status(400).json({
        message: "Precio inválido"
      });
    }

    const nueva = await guardarPublicacion({
      titulo,
      descripcion,
      precio,
      id_usuario,
      id_vehiculo,
      id_ubicacion
    });

    return res.status(201).json({
      message: "Publicación creada",
      id_publicacion: nueva.id_publicacion
    });

  } catch (error: any) {

    if (error.number === 547) {
      return res.status(400).json({
        message: "Error de claves foráneas (usuario, vehículo o ubicación)"
      });
    }

    return res.status(500).json({
      message: "Error en el servidor"
    });
  }
};

export const listarPublicaciones = async (req: Request, res: Response) => {
  try {
    const {
      id_marca, id_modelo, id_ciudad,
      precio_min, precio_max,
      año_min, año_max,
      id_combustible, id_transmision, id_condicion,
      pagina, por_pagina,
    } = req.query;
 
    const resultado = await buscarPublicaciones({
      id_marca:        id_marca        ? Number(id_marca)        : undefined,
      id_modelo:       id_modelo       ? Number(id_modelo)       : undefined,
      id_ciudad:       id_ciudad       ? Number(id_ciudad)       : undefined,
      precio_min:      precio_min      ? Number(precio_min)      : undefined,
      precio_max:      precio_max      ? Number(precio_max)      : undefined,
      año_min:         año_min         ? Number(año_min)         : undefined,
      año_max:         año_max         ? Number(año_max)         : undefined,
      id_combustible:  id_combustible  ? Number(id_combustible)  : undefined,
      id_transmision:  id_transmision  ? Number(id_transmision)  : undefined,
      id_condicion:    id_condicion    ? Number(id_condicion)    : undefined,
      pagina:          pagina          ? Number(pagina)          : 1,
      por_pagina:      por_pagina      ? Number(por_pagina)      : 10,
    });
 
    return res.json({ publicaciones: resultado });
 
  } catch {
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

export const listarPublicacionesDeUsuario = async (req: Request, res: Response) => {
  try {
    let {id_usuario} =req.params;

    if (!id_usuario) {
      return res.status(400).json({ message: "Id requerido" });
    }

    const publicaciones = await obtenerPublicacionesPorUsuario(Number(id_usuario));

    return res.status(200).json({ publicaciones });

  } catch (error: any) {
    return res.status(500).json({ message: "Error en el servidor" });
  }
};