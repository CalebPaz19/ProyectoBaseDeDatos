import { Request, Response } from "express";
import { guardarPublicacion } from "../models/publicacion.model";

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