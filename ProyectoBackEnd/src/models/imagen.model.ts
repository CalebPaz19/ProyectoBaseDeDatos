import { Transaction } from "mssql";
import { getRequest, poolPromise } from "../config/baseDeDatos";
import { Imagen } from "../Interfaces/imagen.interface";

export const guardarImagen = async (imagen: Imagen, tx?: Transaction) => {
  
  const request = await getRequest(tx);

  const result = await request
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

//Listar imágenes de una publicación
export const listarImagenesPorPublicacion = async (id_publicacion: number) => {
  const conexion = await poolPromise;
 
  const result = await conexion
    .request()
    .input("id_publicacion", id_publicacion)
    .query(`
      SELECT id_imagen, url_imagen, orden_imagen
      FROM Imagen
      WHERE id_publicacion = @id_publicacion
      ORDER BY orden_imagen
    `);
 
  return result.recordset;
};

//Eliminar imagen por id
export const eliminarImagenPorId = async (id_imagen: number) => {
  const conexion = await poolPromise;
 
  await conexion
    .request()
    .input("id_imagen", id_imagen)
    .query(`
      DELETE FROM Imagen
      WHERE id_imagen = @id_imagen
    `);
};