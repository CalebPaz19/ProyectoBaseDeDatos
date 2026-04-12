import { Request, Response } from "express";
import { eliminarImagenPorId, guardarImagen, listarImagenesPorPublicacion } from "../models/imagen.model";

//Subir una imagen a una publicación existente
export const subirImagen = async (req: Request, res: Response) => {
  try {
    const { id_publicacion } = req.body;
    
    if (!id_publicacion) {
      return res.status(400).json({
        message: "id_publicacion es requerido"
      })
    }

    if (!req.file) {
      return res.status(400).json({
        message: "No se subió imagen"
      });
    }

    // URL que se guardará en BD
    const url_imagen = `http://localhost:3000/uploads/${req.file.filename}`;

    const nueva = await guardarImagen({id_publicacion, url_imagen, orden_imagen:1});

    return res.status(201).json({
      message: "Imagen subida",
      url_imagen,
      id_imagen: nueva.id_imagen
    });

  }catch (error: any) {
    console.error("Error subirImagen:", error);

    if (error.number === 547) {
      return res.status(400).json({ message: "Publicación no existe" });
    }
    return res.status(500).json({ message: "Error al subir imagen" });
  }
};

//Listar imágenes de una publicación
export const listarImagenes = async (req: Request, res: Response) => {
  try {
    const { id_publicacion } = req.params;
 
    const imagenes = await listarImagenesPorPublicacion(Number(id_publicacion));
 
    return res.json({ imagenes });
  } catch (error: any) {
    console.error("Error listarImagenes:", error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

//Eliminar una imagen
export const eliminarImagen = async (req: Request, res: Response) => {
  try {
    const { id_imagen } = req.params;
 
    await eliminarImagenPorId(Number(id_imagen));
 
    return res.json({ message: "Imagen eliminada" });

  } catch (error: any) {
    console.error("Error eliminarImagen:", error);
    
    return res.status(500).json({ message: "Error en el servidor" });
  }
};