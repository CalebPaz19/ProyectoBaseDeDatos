import { poolPromise } from "../config/baseDeDatos";
import { Publicacion } from "../Interfaces/publicacion.interface";

export const guardarPublicacion = async (data: Publicacion) => {
  const conexion = await poolPromise;

  const result = await conexion.request()
    .input('titulo', data.titulo)
    .input('descripcion', data.descripcion || null)
    .input('precio', data.precio)
    .input('id_usuario', data.id_usuario)
    .input('id_vehiculo', data.id_vehiculo)
    .input('id_ubicacion', data.id_ubicacion)
    .input('estado', data.estado || 'activa')
    .query(`
      INSERT INTO Publicacion (
        titulo,
        descripcion,
        precio,
        id_usuario,
        id_vehiculo,
        id_ubicacion,
        estado
      )
      OUTPUT INSERTED.id_publicacion
      VALUES (
        @titulo,
        @descripcion,
        @precio,
        @id_usuario,
        @id_vehiculo,
        @id_ubicacion,
        @estado
      )
    `);

  return result.recordset[0];
};