import { Request, Response } from "express";
import { crearReporte, actualizarEstadoReporte, listarReportes, obtenerDetalleReporte, obtenerReportesDeUsuario } from "../models/reporte.model";
import { actualizarEstadoPublicacion } from "../models/publicacion.model";
import { cambiarEstadoCuenta } from "../models/usuario.model";

//Crear reporte (usuario reporta publicación o usuario)
export const reportar = async (req: Request, res: Response) => {
  try {
    const {
      id_usuario_reporta,
      id_usuario_reportado,
      id_publicacion,
      motivo,
      descripcion,
    } = req.body;

    if (!id_usuario_reporta || !motivo) {
      return res.status(400).json({
        message: "Se requieren id_usuario_reporta y motivo",
      });
    }

    if (!id_usuario_reportado && !id_publicacion) {
      return res.status(400).json({
        message: "Debes reportar al menos una publicación o un usuario",
      });
    }

    const reporte = await crearReporte({
      id_usuario_reporta:   Number(id_usuario_reporta),
      id_usuario_reportado: id_usuario_reportado ? Number(id_usuario_reportado) : null,
      id_publicacion:       id_publicacion       ? Number(id_publicacion)       : null,
      motivo,
      descripcion,
    });

    return res.status(201).json({
      message:     "Reporte enviado, será revisado por un administrador",
      id_reporte:  reporte.id_reporte,
      estado:      reporte.estado,
      fecha:       reporte.fecha_reporte,
    });

  } catch (error: any) {
    console.error("Error reportar:", error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

//Mis reportes enviados
export const misReportes = async (req: Request, res: Response) => {
  try {
    const { id_usuario } = req.params;

    const reportes = await obtenerReportesDeUsuario(Number(id_usuario));

    return res.json({ reportes });

  } catch (error: any) {
    console.error("Error misReportes:", error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

//Listar todos los reportes (admin)
export const listarTodos = async (req: Request, res: Response) => {
  try {
    const { estado, pagina, por_pagina } = req.query;

    const filtros: { estado?: string; pagina?: number; por_pagina?: number } = {
      pagina:     pagina     ? Number(pagina)     : 1,
      por_pagina: por_pagina ? Number(por_pagina) : 20,
    };
    if (estado) filtros.estado = estado as string;

    const reportes = await listarReportes(filtros);

    return res.json({ reportes });

  } catch (error: any) {
    console.error("Error listarTodos reportes:", error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

//Detalle de un reporte (admin)
export const detalle = async (req: Request, res: Response) => {
  try {
    const { id_reporte } = req.params;

    const reporte = await obtenerDetalleReporte(Number(id_reporte));

    if (!reporte) {
      return res.status(404).json({ message: "Reporte no encontrado" });
    }

    return res.json({ reporte });

  } catch (error: any) {
    console.error("Error detalle reporte:", error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

//Gestionar reporte (admin)
// Al resolver puede opcionalmente suspender al usuario o eliminar la publicación
export const gestionarReporte = async (req: Request, res: Response) => {
  try {
    const { id_reporte } = req.params;
    const {
      estado,
      suspender_usuario,   // true/false: suspender al usuario reportado
      eliminar_publicacion // true/false: eliminar la publicación reportada
    } = req.body;

    const estadosValidos = ["pendiente", "revisado", "rechazado", "resuelto"];
    if (!estado || !estadosValidos.includes(estado)) {
      return res.status(400).json({
        message: `estado debe ser: ${estadosValidos.join(", ")}`,
      });
    }

    // Obtener detalle para saber qué usuario/publicación afectar
    const reporte = await obtenerDetalleReporte(Number(id_reporte));
    if (!reporte) {
      return res.status(404).json({ message: "Reporte no encontrado" });
    }

    // Actualizar estado del reporte
    await actualizarEstadoReporte(Number(id_reporte), estado);

    const acciones: string[] = [];

    // Acción opcional: suspender usuario reportado
    if (suspender_usuario && reporte.id_reportado) {
      await cambiarEstadoCuenta(reporte.id_reportado, "suspendida");
      acciones.push("usuario suspendido");
    }

    // Acción opcional: eliminar publicación reportada
    if (eliminar_publicacion && reporte.id_publicacion) {
      await actualizarEstadoPublicacion(reporte.id_publicacion, "eliminada");
      acciones.push("publicación eliminada");
    }

    return res.json({
      message: `Reporte marcado como '${estado}'`,
      ...(acciones.length > 0 && { acciones }),
    });

  } catch (error: any) {
    console.error("Error gestionarReporte:", error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};