import { Request, Response } from "express";
import { guardarUbicacion } from "../models/ubicacion.model";

export const crearUbicacion = async (req: Request, res: Response) => {
  try {
    const { id_ciudad, direccion } = req.body;

    if (!id_ciudad) {
      return res.status(400).json({
        message: "Ciudad requerida"
      });
    }

    const nueva = await guardarUbicacion(id_ciudad, direccion);

    return res.status(201).json({
      id_ubicacion: nueva.id_ubicacion
    });

  } catch (error: any) {

    if (error.number === 547) {
      return res.status(400).json({
        message: "Ciudad no válida"
      });
    }

    return res.status(500).json({
      message: "Error en el servidor"
    });
  }
};