import { Transaction } from "mssql";
import { getRequest, poolPromise } from "../config/baseDeDatos";
import { Venta } from "../Interfaces/venta.interface";

//Registrar una venta
export const registrarVenta = async (venta: Venta, tx?: Transaction) => {
  const request = await getRequest(tx);

  const result = await request
    .input("id_publicacion", venta.id_publicacion)
    .input("id_comprador",   venta.id_comprador)
    .input("id_vendedor",    venta.id_vendedor)
    .input("monto",          venta.monto)
    .input("observaciones",  venta.observaciones || null)
    .query(`
      INSERT INTO Venta (id_publicacion, id_comprador, id_vendedor, monto, observaciones)
      OUTPUT
        INSERTED.id_venta,
        INSERTED.fecha_venta,
        INSERTED.estado_pago,
        INSERTED.estado_venta
      VALUES (@id_publicacion, @id_comprador, @id_vendedor, @monto, @observaciones)
    `);

  return result.recordset[0];
};

//Obtener publicación para validar antes de comprar
export const obtenerPublicacionParaCompra = async (
  id_publicacion: number,
  tx?: Transaction
) => {
  const request = await getRequest(tx);

  const result = await request
    .input("id_publicacion", id_publicacion)
    .query(`
      SELECT
        id_publicacion,
        estado,
        precio,
        id_usuario AS id_vendedor,
        titulo
      FROM Publicacion
      WHERE id_publicacion = @id_publicacion
    `);

  return result.recordset[0] || null;
};

//Obtener venta por id (para saber su id_publicacion)
export const obtenerVentaPorId = async (id_venta: number, tx?: Transaction) => {
  const request = await getRequest(tx);

  const result = await request
    .input("id_venta", id_venta)
    .query(`
      SELECT id_venta, id_publicacion, estado_venta, estado_pago
      FROM Venta
      WHERE id_venta = @id_venta
    `);

  return result.recordset[0] || null;
};

//Actualizar estado de pago
export const actualizarEstadoPago = async (
  id_venta: number,
  estado_pago: string
) => {
  const conexion = await poolPromise;

  await conexion
    .request()
    .input("id_venta",    id_venta)
    .input("estado_pago", estado_pago)
    .query(`
      UPDATE Venta
      SET estado_pago = @estado_pago
      WHERE id_venta = @id_venta
    `);
};

//Actualizar estado de venta
export const actualizarEstadoVenta = async (
  id_venta: number,
  estado_venta: string,
  observaciones?: string
) => {
  const conexion = await poolPromise;

  await conexion
    .request()
    .input("id_venta",      id_venta)
    .input("estado_venta",  estado_venta)
    .input("observaciones", observaciones || null)
    .query(`
      UPDATE Venta
      SET
        estado_venta  = @estado_venta,
        observaciones = COALESCE(@observaciones, observaciones)
      WHERE id_venta = @id_venta
    `);
};

//Historial de compras de un usuario
export const obtenerComprasDeUsuario = async (id_comprador: number) => {
  const conexion = await poolPromise;

  const result = await conexion
    .request()
    .input("id_comprador", id_comprador)
    .query(`
      SELECT
        v.id_venta,
        v.monto,
        v.estado_pago,
        v.estado_venta,
        v.observaciones,
        v.fecha_venta,
        p.id_publicacion,
        p.titulo,
        ma.nombre AS marca,
        mo.nombre AS modelo,
        ve.año,
        ve.color,
        uv.primer_nombre   AS vendedor_nombre,
        uv.primer_apellido AS vendedor_apellido,
        uv.telefono        AS vendedor_telefono,
        (SELECT TOP 1 i.url_imagen
         FROM Imagen i
         WHERE i.id_publicacion = p.id_publicacion
         ORDER BY i.orden_imagen) AS imagen_principal
      FROM Venta v
      JOIN Publicacion p   ON p.id_publicacion = v.id_publicacion
      JOIN Vehiculo    ve  ON ve.id_vehiculo    = p.id_vehiculo
      JOIN Modelo      mo  ON mo.id_modelo      = ve.id_modelo
      JOIN Marca       ma  ON ma.id_marca       = mo.id_marca
      JOIN Usuario     uv  ON uv.id_usuario     = v.id_vendedor
      WHERE v.id_comprador = @id_comprador
      ORDER BY v.fecha_venta DESC
    `);

  return result.recordset;
};

//Historial de ventas de un usuario (como vendedor)
export const obtenerVentasDeUsuario = async (id_vendedor: number) => {
  const conexion = await poolPromise;

  const result = await conexion
    .request()
    .input("id_vendedor", id_vendedor)
    .query(`
      SELECT
        v.id_venta,
        v.monto,
        v.estado_pago,
        v.estado_venta,
        v.observaciones,
        v.fecha_venta,
        p.id_publicacion,
        p.titulo,
        ma.nombre AS marca,
        mo.nombre AS modelo,
        ve.año,
        ve.color,
        uc.primer_nombre   AS comprador_nombre,
        uc.primer_apellido AS comprador_apellido,
        uc.telefono        AS comprador_telefono,
        (SELECT TOP 1 i.url_imagen
         FROM Imagen i
         WHERE i.id_publicacion = p.id_publicacion
         ORDER BY i.orden_imagen) AS imagen_principal
      FROM Venta v
      JOIN Publicacion p   ON p.id_publicacion = v.id_publicacion
      JOIN Vehiculo    ve  ON ve.id_vehiculo    = p.id_vehiculo
      JOIN Modelo      mo  ON mo.id_modelo      = ve.id_modelo
      JOIN Marca       ma  ON ma.id_marca       = mo.id_marca
      JOIN Usuario     uc  ON uc.id_usuario     = v.id_comprador
      WHERE v.id_vendedor = @id_vendedor
      ORDER BY v.fecha_venta DESC
    `);

  return result.recordset;
};

//Detalle de una venta
export const obtenerDetalleVenta = async (id_venta: number) => {
  const conexion = await poolPromise;

  const result = await conexion
    .request()
    .input("id_venta", id_venta)
    .query(`
      SELECT
        v.id_venta,
        v.monto,
        v.estado_pago,
        v.estado_venta,
        v.observaciones,
        v.fecha_venta,
        p.id_publicacion,
        p.titulo,
        p.descripcion,
        ma.nombre  AS marca,
        mo.nombre  AS modelo,
        ve.año,
        ve.color,
        ve.kilometraje,
        ve.vin,
        ve.placa,
        uv.id_usuario      AS id_vendedor,
        uv.primer_nombre   AS vendedor_nombre,
        uv.primer_apellido AS vendedor_apellido,
        uv.correo          AS vendedor_correo,
        uv.telefono        AS vendedor_telefono,
        uc.id_usuario      AS id_comprador,
        uc.primer_nombre   AS comprador_nombre,
        uc.primer_apellido AS comprador_apellido,
        uc.correo          AS comprador_correo,
        uc.telefono        AS comprador_telefono
      FROM Venta v
      JOIN Publicacion p   ON p.id_publicacion = v.id_publicacion
      JOIN Vehiculo    ve  ON ve.id_vehiculo    = p.id_vehiculo
      JOIN Modelo      mo  ON mo.id_modelo      = ve.id_modelo
      JOIN Marca       ma  ON ma.id_marca       = mo.id_marca
      JOIN Usuario     uv  ON uv.id_usuario     = v.id_vendedor
      JOIN Usuario     uc  ON uc.id_usuario     = v.id_comprador
      WHERE v.id_venta = @id_venta
    `);

  return result.recordset[0] || null;
};

//Todas las ventas (admin)
export const listarTodasLasVentas = async (filtros: {
  estado_venta?: string | undefined;
  estado_pago?:  string | undefined;
  pagina?:       number | undefined;
  por_pagina?:   number | undefined;
}) => {
  const conexion   = await poolPromise;
  const pagina     = filtros.pagina    ?? 1;
  const por_pagina = filtros.por_pagina ?? 20;
  const offset     = (pagina - 1) * por_pagina;

  const req = conexion
    .request()
    .input("offset",     offset)
    .input("por_pagina", por_pagina);

  let where = "WHERE 1 = 1";

  if (filtros.estado_venta) {
    req.input("estado_venta", filtros.estado_venta);
    where += " AND v.estado_venta = @estado_venta";
  }
  if (filtros.estado_pago) {
    req.input("estado_pago", filtros.estado_pago);
    where += " AND v.estado_pago = @estado_pago";
  }

  const result = await req.query(`
    SELECT
      v.id_venta,
      v.monto,
      v.estado_pago,
      v.estado_venta,
      v.fecha_venta,
      p.titulo,
      ma.nombre  AS marca,
      mo.nombre  AS modelo,
      uv.primer_nombre   AS vendedor_nombre,
      uv.primer_apellido AS vendedor_apellido,
      uc.primer_nombre   AS comprador_nombre,
      uc.primer_apellido AS comprador_apellido
    FROM Venta v
    JOIN Publicacion p   ON p.id_publicacion = v.id_publicacion
    JOIN Vehiculo    ve  ON ve.id_vehiculo    = p.id_vehiculo
    JOIN Modelo      mo  ON mo.id_modelo      = ve.id_modelo
    JOIN Marca       ma  ON ma.id_marca       = mo.id_marca
    JOIN Usuario     uv  ON uv.id_usuario     = v.id_vendedor
    JOIN Usuario     uc  ON uc.id_usuario     = v.id_comprador
    ${where}
    ORDER BY v.fecha_venta DESC
    OFFSET @offset ROWS FETCH NEXT @por_pagina ROWS ONLY
  `);

  return result.recordset;
};