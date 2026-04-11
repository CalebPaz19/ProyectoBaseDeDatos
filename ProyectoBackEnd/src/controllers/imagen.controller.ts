import { Request, Response } from "express";
import { guardarImagen } from "../models/imagen.model";

// export const agregarImagen = async (req: Request, res: Response) => {
//   try {
//     const { id_publicacion, url_imagen, orden_imagen } = req.body;

//     if (!id_publicacion || !url_imagen) {
//       return res.status(400).json({
//         message: "Faltan datos"
//       });
//     }

//     const nueva = await guardarImagen({
//       id_publicacion,
//       url_imagen,
//       orden_imagen
//     });

//     return res.status(201).json({
//       message: "Imagen agregada",
//       id_imagen: nueva.id_imagen
//     });

//   } catch (error: any) {

//     if (error.number === 547) {
//       return res.status(400).json({
//         message: "Publicación no existe"
//       });
//     }

//     return res.status(500).json({
//       message: "Error en el servidor"
//     });
//   }
// };

export const subirImagen = async (req: Request, res: Response) => {
  try {
    const { id_publicacion } = req.body;

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

  } catch (error) {
    return res.status(500).json({
      message: "Error al subir imagen"
    });
  }
};