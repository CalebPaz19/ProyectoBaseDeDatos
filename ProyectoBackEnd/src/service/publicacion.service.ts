import { poolPromise } from "../config/baseDeDatos";
import { guardarVehiculo } from "../models/vehiculo.model";
import { guardarUbicacion } from "../models/ubicacion.model";
import { guardarPublicacion } from "../models/publicacion.model";
import { guardarImagen } from "../models/imagen.model";

export const crearPublicacionCompletaService = async (
  data: {
    vehiculo:    any;
    ubicacion:   any;
    publicacion: any;
  },
  files: Express.Multer.File[]) => {

  const pool = await poolPromise;
  const tx = pool.transaction();

  try {
    await tx.begin();

    // 1. Guardar vehículo
    const vehiculo = await guardarVehiculo(data.vehiculo, tx);
 
    // 2. Guardar ubicación
    const ubicacion = await guardarUbicacion(data.ubicacion, tx);
 
    // 3. Guardar publicación con los ids recién creados
    const publicacion = await guardarPublicacion(
      {
        ...data.publicacion,
        id_vehiculo:  vehiculo.id_vehiculo,
        id_ubicacion: ubicacion.id_ubicacion,
      },
      tx
    );
 
    // 4. Guardar imágenes si las hay
    if (files && files.length > 0) {
      let orden = 1;
      for (const file of files) {
        await guardarImagen(
          {
            id_publicacion: publicacion.id_publicacion,
            url_imagen:     `http://localhost:3000/uploads/${file.filename}`,
            orden_imagen:   orden++,
          },
          tx
        );
      }
    }
 
    await tx.commit();
    return publicacion;
 
  } catch (error) {
    await tx.rollback();
    throw error;
  }
};