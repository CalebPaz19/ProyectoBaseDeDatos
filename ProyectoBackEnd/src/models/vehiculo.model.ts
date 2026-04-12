import { Transaction } from "mssql";
import { getRequest } from "../config/baseDeDatos";
import { Vehiculo } from "../Interfaces/vehiculo.interface";

export const guardarVehiculo = async (data: Vehiculo, tx?: Transaction) => {

  const request = await getRequest(tx);

  const result = await request
    .input('id_modelo', data.id_modelo)
    .input('id_combustible', data.id_combustible)
    .input('id_transmision', data.id_transmision)
    .input('id_carroceria', data.id_carroceria)
    .input('id_condicion_vehiculo', data.id_condicion_vehiculo)
    .input('año', data.año)
    .input('kilometraje', data.kilometraje || null)
    .input('color', data.color || null)
    .input('num_puertas', data.num_puertas || null)
    .input('cilindraje', data.cilindraje || null)
    .input('vin', data.vin)
    .input('placa', data.placa || null)
    .input('descripcion_general', data.descripcion_general || null)
    .query(`
      INSERT INTO Vehiculo (
        id_modelo,
        id_combustible,
        id_transmision,
        id_carroceria,
        id_condicion_vehiculo,
        año,
        kilometraje,
        color,
        num_puertas,
        cilindraje,
        vin,
        placa,
        descripcion_general
      )
      OUTPUT INSERTED.id_vehiculo
      VALUES (
        @id_modelo,
        @id_combustible,
        @id_transmision,
        @id_carroceria,
        @id_condicion_vehiculo,
        @año,
        @kilometraje,
        @color,
        @num_puertas,
        @cilindraje,
        @vin,
        @placa,
        @descripcion_general
      )
    `);

  return result.recordset[0];
};
