import { Request, Response } from "express";
import {
  agregarFavorito,
  eliminarFavorito,
  esFavorito,
  obtenerFavoritosDeUsuario,
} from "../models/favorito.model";

//Agregar a favoritos
export const agregar = async (req: Request, res: Response) => {
  try {
    const { id_usuario, id_publicacion } = req.body;

    if (!id_usuario || !id_publicacion) {
      return res.status(400).json({
        message: "Se requieren id_usuario e id_publicacion",
      });
    }

    // Verificar si ya existe
    const yaExiste = await esFavorito(Number(id_usuario), Number(id_publicacion));
    if (yaExiste) {
      return res.status(400).json({ message: "Esta publicación ya está en favoritos" });
    }

    const favorito = await agregarFavorito({
      id_usuario:     Number(id_usuario),
      id_publicacion: Number(id_publicacion),
    });

    return res.status(201).json({
      message:      "Agregado a favoritos",
      id_favorito:  favorito.id_favorito,
      fecha:        favorito.fecha_agregado,
    });

  } catch (error: any) {
    console.error("Error agregar favorito:", error);
    // Error por constraint UNIQUE (doble click)
    if (error.number === 2627) {
      return res.status(400).json({ message: "Esta publicación ya está en favoritos" });
    }
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

//Eliminar de favoritos
export const eliminar = async (req: Request, res: Response) => {
  try {
    const { id_usuario, id_publicacion } = req.params;

    await eliminarFavorito(Number(id_usuario), Number(id_publicacion));

    return res.json({ message: "Eliminado de favoritos" });

  } catch (error: any) {
    console.error("Error eliminar favorito:", error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

//Listar favoritos de u usuario
export const listar = async (req: Request, res: Response) => {
  try {
    const { id_usuario } = req.params;

    if (!id_usuario) {
      return res.status(400).json({ message: "Id de usuario requerido" });
    }

    const favoritos = await obtenerFavoritosDeUsuario(Number(id_usuario));

    return res.json({ favoritos });

  } catch (error: any) {
    console.error("Error listar favoritos:", error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

//Verificar si una publicació es favorita
export const verificar = async (req: Request, res: Response) => {
  try {
    const { id_usuario, id_publicacion } = req.params;

    const resultado = await esFavorito(
      Number(id_usuario),
      Number(id_publicacion)
    );

    return res.json({ es_favorito: resultado });

  } catch (error: any) {
    console.error("Error verificar favorito:", error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};