import { Request, Response } from "express";
import { actualizarEstadoPublicacion, buscarPublicaciones, guardarPublicacion, obtenerDetalle, obtenerPublicacionesPorUsuario } from "../models/publicacion.model";
import { crearPublicacionCompletaService } from "../service/publicacion.service";

export const crearPublicacion = async (req: Request, res: Response) => {
  try {

    const { titulo, descripcion, precio, id_usuario, id_vehiculo, id_ubicacion } = req.body;

    if (!titulo || !precio || !id_usuario || !id_vehiculo || !id_ubicacion) {
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }
 
    if (Number(precio) <= 0) {
      return res.status(400).json({ message: "Precio inválido" });
    }
 
    const nueva = await guardarPublicacion({
      titulo,
      descripcion,
      precio:       Number(precio),
      id_usuario:   Number(id_usuario),
      id_vehiculo:  Number(id_vehiculo),
      id_ubicacion: Number(id_ubicacion),
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
 
  } catch (error: any) {
    console.error("Error listarPublicaciones:", error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

export const listarPublicacionesDeUsuario = async (req: Request, res: Response) => {
  try {
    const {id_usuario} =req.params;

    if (!id_usuario) {
      return res.status(400).json({ message: "Id requerido" });
    }

    const publicaciones = await obtenerPublicacionesPorUsuario(Number(id_usuario));

    return res.status(200).json({ publicaciones });

  } catch (error: any) {
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

//Detalle de una publicación
export const traerDetallePublicacion = async (req: Request, res: Response) => {
  try {
    const { id_publicacion } = req.params;
    const resultado = await obtenerDetalle(Number(id_publicacion));
 
    if (!resultado) {
      return res.status(404).json({ message: "Publicación no encontrada" });
    }
 
    return res.json(resultado);
 
  } catch (error: any) {
    console.error("Error traerDetallePublicacion:", error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};


export const crearPublicacionCompleta = async (req: Request, res: Response) => {
  try {
    const { vehiculo, ubicacion, publicacion } = req.body;

    if (!vehiculo || !ubicacion || !publicacion) {
      return res.status(400).json({
        message:
          "Se requieren los campos: vehiculo, ubicacion, publicacion",
      });
    }

    const data = {
      vehiculo:    JSON.parse(vehiculo),
      ubicacion:   JSON.parse(ubicacion),
      publicacion: JSON.parse(publicacion),
    };

    const files = req.files as Express.Multer.File[];

    const result = await crearPublicacionCompletaService(data, files);

    return res.status(201).json({
      message: "Publicación creada exitosamente",
      id_publicacion: result.id_publicacion
    });

  } catch (error: any) {
    
    console.error("Error crearPublicacionCompleta:", error);

 
    if (error.number === 547) {
      return res.status(400).json({
        message:
          "Error de referencia: verifique los ids de catálogos (modelo, ciudad, etc.)",
      });
    }
    if (error.number === 2627) {
      return res.status(400).json({ message: "VIN o placa ya registrados" });
    }
 
    return res.status(500).json({
      message: error?.message || "Error en el servidor",
    });
  }
};

export const cambiarEstadoPublicacion = async (req: Request, res: Response) => {
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

    console.error("Error cambiarEstadoPublicacion:", error);

    return res.status(500).json({ message: "Error en el servidor" });
  }
};
 
//Eliminación lógica
export const eliminarPublicacion = async (req: Request, res: Response) => {
  try {
    const { id_publicacion } = req.params;
 
    await actualizarEstadoPublicacion(Number(id_publicacion), "eliminada");
 
    return res.json({ message: "Publicación eliminada" });

  } catch (error: any) {

    console.error("Error eliminarPublicacion:", error);
    
    return res.status(500).json({ message: "Error en el servidor" });
  }
};