import { Transaction } from "mssql";
import { getRequest } from "../config/baseDeDatos";
import { Ubicacion } from "../Interfaces/ubiacio.interface";

export const guardarUbicacion = async (ubicacion:Ubicacion, tx?: Transaction) => {

  const request = await getRequest(tx);

  const result = await request
    .input('id_ciudad', ubicacion.id_ciudad)
    .input('direccion', ubicacion.direccion || null)
    .query(`
      INSERT INTO Ubicacion (id_ciudad, direccion)
      OUTPUT INSERTED.id_ubicacion
      VALUES (@id_ciudad, @direccion)
    `);

  return result.recordset[0];
};