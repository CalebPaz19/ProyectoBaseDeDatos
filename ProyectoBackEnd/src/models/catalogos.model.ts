import { poolPromise } from "../config/baseDeDatos";

export const traerMarcas = async () => {
  const conexion = await poolPromise;
  const result = await conexion.request().query(`
    SELECT id_marca, nombre FROM Marca
  `);
  return result.recordset;
};

export const traerModelosSegunMarca = async (id_marca: number) => {
  const conexion = await poolPromise;
  const result = await conexion.request()
    .input('id_marca', id_marca)
    .query(`
      SELECT id_modelo, nombre 
      FROM Modelo 
      WHERE id_marca = @id_marca
    `);
  return result.recordset;
};


export const traerCatalogosVehiculo = async () => {
  const conexion = await poolPromise;

  const result = await conexion.request().query(`
    SELECT id_combustible, nombre FROM Combustible;
    SELECT id_transmision, nombre FROM Transmision;
    SELECT id_carroceria, nombre FROM TipoCarroceria;
    SELECT id_condicion_vehiculo, nombre FROM CondicionVehiculo;
  `);

  const recordsets = result.recordsets as any[];

  return {
    combustibles: recordsets[0],
    transmisiones: recordsets[1],
    carrocerias: recordsets[2],
    condiciones: recordsets[3],
  };
};

export const traerContinentes = async () => {
  const conexion = await poolPromise;
  const result = await conexion.request().query(`
    SELECT id_continente, nombre FROM Continente
  `);
  return result.recordset;
};

export const traerPaisesSegunContinente = async (id_continente: number) => {
  const conexion = await poolPromise;
  const result = await conexion.request()
    .input('id_continente', id_continente)
    .query(`
      SELECT id_pais, nombre 
      FROM Pais 
      WHERE id_continente = @id_continente
    `);
  return result.recordset;
};

export const traerCiudadesSegunPais = async (id_pais: number) => {
  const conexion = await poolPromise;
  const result = await conexion.request()
    .input('id_pais', id_pais)
    .query(`
      SELECT id_ciudad, nombre 
      FROM Ciudad 
      WHERE id_pais = @id_pais
    `);
  return result.recordset;
};

