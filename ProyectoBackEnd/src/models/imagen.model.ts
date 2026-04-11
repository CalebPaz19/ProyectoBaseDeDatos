import { poolPromise } from "../config/baseDeDatos";
import { Imagen } from "../Interfaces/imagen.interface";

export const guardarImagen = async (imagen: Imagen) => {
  const conexion = await poolPromise;

  const result = await conexion.request()
    .input('id_publicacion', imagen.id_publicacion)
    .input('url_imagen', imagen.url_imagen)
    .input('orden_imagen', imagen.orden_imagen)
    .query(`
      INSERT INTO Imagen (id_publicacion, url_imagen, orden_imagen)
      OUTPUT INSERTED.id_imagen
      VALUES (@id_publicacion, @url_imagen, @orden_imagen)
    `);

  return result.recordset[0];
};