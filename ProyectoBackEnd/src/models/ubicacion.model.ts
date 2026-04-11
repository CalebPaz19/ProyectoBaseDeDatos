import { poolPromise } from "../config/baseDeDatos";

export const guardarUbicacion = async (id_ciudad: number, direccion?: string) => {
  const conexion = await poolPromise;

  const result = await conexion.request()
    .input('id_ciudad', id_ciudad)
    .input('direccion', direccion || null)
    .query(`
      INSERT INTO Ubicacion (id_ciudad, direccion)
      OUTPUT INSERTED.id_ubicacion
      VALUES (@id_ciudad, @direccion)
    `);

  return result.recordset[0];
};