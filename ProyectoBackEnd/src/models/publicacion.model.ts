import { Transaction } from "mssql";
import { getRequest, poolPromise } from "../config/baseDeDatos";
import { Publicacion } from "../Interfaces/publicacion.interface";

//Insertar publicación
export const guardarPublicacion = async (
  publicacion: Publicacion,
  tx?: Transaction
) => {
  const request = await getRequest(tx);

  const result = await request
    .input("titulo",       publicacion.titulo)
    .input("descripcion",  publicacion.descripcion  || null)
    .input("precio",       publicacion.precio)
    .input("id_usuario",   publicacion.id_usuario)
    .input("id_vehiculo",  publicacion.id_vehiculo)
    .input("id_ubicacion", publicacion.id_ubicacion)
    .input("estado",       publicacion.estado       || "activa")
    .query(`
      INSERT INTO Publicacion (
        titulo, descripcion, precio,
        id_usuario, id_vehiculo, id_ubicacion, estado
      )
      OUTPUT INSERTED.id_publicacion
      VALUES (
        @titulo, @descripcion, @precio,
        @id_usuario, @id_vehiculo, @id_ubicacion, @estado
      )
    `);

  return result.recordset[0];
};

//Actualizar estado
export const actualizarEstadoPublicacion = async (
  id_publicacion: number,
  estado: string
) => {
  const conexion = await poolPromise;

  await conexion
    .request()
    .input("id_publicacion", id_publicacion)
    .input("estado",         estado)
    .query(`
      UPDATE Publicacion
      SET estado = @estado
      WHERE id_publicacion = @id_publicacion
    `);
};

//Listar publicaciones activas con filtros (público)
export const buscarPublicaciones = async (filtros: {
  id_marca?: number | undefined;
  id_modelo?: number | undefined;
  id_ciudad?: number | undefined;
  precio_min?: number | undefined;
  precio_max?: number | undefined;
  año_min?: number | undefined;
  año_max?: number | undefined;
  id_combustible?: number | undefined;
  id_transmision?: number | undefined;
  id_condicion?: number | undefined;
  pagina?: number | undefined;
  por_pagina?: number | undefined;
}) => {
  const conexion   = await poolPromise;
  const pagina     = filtros.pagina    ?? 1;
  const por_pagina = filtros.por_pagina ?? 10;
  const offset     = (pagina - 1) * por_pagina;

  const req = conexion
    .request()
    .input("offset",     offset)
    .input("por_pagina", por_pagina);

  let where = "WHERE p.estado = 'activa'";

  if (filtros.id_marca) {
    req.input("id_marca", filtros.id_marca);
    where += " AND mo.id_marca = @id_marca";
  }
  if (filtros.id_modelo) {
    req.input("id_modelo", filtros.id_modelo);
    where += " AND v.id_modelo = @id_modelo";
  }
  if (filtros.id_ciudad) {
    req.input("id_ciudad", filtros.id_ciudad);
    where += " AND u.id_ciudad = @id_ciudad";
  }
  if (filtros.precio_min) {
    req.input("precio_min", filtros.precio_min);
    where += " AND p.precio >= @precio_min";
  }
  if (filtros.precio_max) {
    req.input("precio_max", filtros.precio_max);
    where += " AND p.precio <= @precio_max";
  }
  if (filtros.año_min) {
    req.input("año_min", filtros.año_min);
    where += " AND v.año >= @año_min";
  }
  if (filtros.año_max) {
    req.input("año_max", filtros.año_max);
    where += " AND v.año <= @año_max";
  }
  if (filtros.id_combustible) {
    req.input("id_combustible", filtros.id_combustible);
    where += " AND v.id_combustible = @id_combustible";
  }
  if (filtros.id_transmision) {
    req.input("id_transmision", filtros.id_transmision);
    where += " AND v.id_transmision = @id_transmision";
  }
  if (filtros.id_condicion) {
    req.input("id_condicion", filtros.id_condicion);
    where += " AND v.id_condicion_vehiculo = @id_condicion";
  }

  const result = await req.query(`
    SELECT
      p.id_publicacion,
      p.titulo,
      p.precio,
      p.estado,
      p.fecha_publicacion,
      v.año,
      v.kilometraje,
      ma.nombre AS marca,
      mo.nombre AS modelo,
      ci.nombre AS ciudad,
      (SELECT TOP 1 i.url_imagen
       FROM Imagen i
       WHERE i.id_publicacion = p.id_publicacion
       ORDER BY i.orden_imagen) AS imagen_principal
    FROM Publicacion p
    JOIN Vehiculo  v  ON v.id_vehiculo  = p.id_vehiculo
    JOIN Modelo    mo ON mo.id_modelo   = v.id_modelo
    JOIN Marca     ma ON ma.id_marca    = mo.id_marca
    JOIN Ubicacion u  ON u.id_ubicacion = p.id_ubicacion
    JOIN Ciudad    ci ON ci.id_ciudad   = u.id_ciudad
    ${where}
    ORDER BY p.fecha_publicacion DESC
    OFFSET @offset ROWS FETCH NEXT @por_pagina ROWS ONLY
  `);

  return result.recordset;
};

//Publicaciones de un usuario
export const obtenerPublicacionesPorUsuario = async (id_usuario: number) => {
  const conexion = await poolPromise;

  const result = await conexion
    .request()
    .input("id_usuario", id_usuario)
    .query(`
      SELECT
        p.id_publicacion,
        p.titulo,
        p.descripcion,
        p.precio,
        p.estado,
        p.fecha_publicacion,
        v.año,
        v.kilometraje,
        v.color,
        ma.nombre AS marca,
        mo.nombre AS modelo,
        (SELECT TOP 1 i.url_imagen
         FROM Imagen i
         WHERE i.id_publicacion = p.id_publicacion
         ORDER BY i.orden_imagen) AS imagen_principal
      FROM Publicacion p
      JOIN Vehiculo v  ON v.id_vehiculo = p.id_vehiculo
      JOIN Modelo   mo ON mo.id_modelo  = v.id_modelo
      JOIN Marca    ma ON ma.id_marca   = mo.id_marca
      WHERE p.id_usuario = @id_usuario
        AND p.estado <> 'eliminada'
      ORDER BY p.fecha_publicacion DESC
    `);

  return result.recordset;
};

//Detalle completo de una publicaciónexport 
export const obtenerDetalle = async (id_publicacion: number) => {
  const conexion = await poolPromise;

  // Query principal sin FOR JSON PATH (más compatible con todas las versiones)
  const result = await conexion
    .request()
    .input("id_publicacion", id_publicacion)
    .query(`
      SELECT
        p.id_publicacion,
        p.titulo,
        p.descripcion,
        p.precio,
        p.estado,
        p.fecha_publicacion,
        v.kilometraje,
        v.color,
        v.num_puertas,
        v.cilindraje,
        v.vin,
        v.placa,
        v.descripcion_general,
        v.año,
        ma.nombre        AS marca,
        mo.nombre        AS modelo,
        cb.nombre        AS combustible,
        tr.nombre        AS transmision,
        tc.nombre        AS carroceria,
        cv.nombre        AS condicion,
        ci.nombre        AS ciudad,
        pa.nombre        AS pais,
        u.direccion,
        p.id_usuario     AS id_vendedor,
        us.primer_nombre   AS vendedor_nombre,
        us.primer_apellido AS vendedor_apellido,
        us.correo          AS vendedor_correo,
        us.telefono        AS vendedor_telefono
      FROM Publicacion p
      JOIN  Vehiculo          v  ON v.id_vehiculo            = p.id_vehiculo
      JOIN  Modelo            mo ON mo.id_modelo             = v.id_modelo
      JOIN  Marca             ma ON ma.id_marca              = mo.id_marca
      LEFT JOIN Combustible   cb ON cb.id_combustible        = v.id_combustible
      LEFT JOIN Transmision   tr ON tr.id_transmision        = v.id_transmision
      LEFT JOIN TipoCarroceria tc ON tc.id_carroceria        = v.id_carroceria
      LEFT JOIN CondicionVehiculo cv ON cv.id_condicion_vehiculo = v.id_condicion_vehiculo
      JOIN  Ubicacion         u  ON u.id_ubicacion           = p.id_ubicacion
      LEFT JOIN Ciudad        ci ON ci.id_ciudad             = u.id_ciudad
      LEFT JOIN Pais          pa ON pa.id_pais               = ci.id_pais
      JOIN  Usuario           us ON us.id_usuario            = p.id_usuario
      WHERE p.id_publicacion = @id_publicacion
    `);

  const row = result.recordset[0];
  if (!row) return null;

  // Query separada para imágenes (evita FOR JSON PATH dentro de subquery)
  const imgResult = await conexion
    .request()
    .input("id_publicacion", id_publicacion)
    .query(`
      SELECT id_imagen, url_imagen, orden_imagen
      FROM Imagen
      WHERE id_publicacion = @id_publicacion
      ORDER BY orden_imagen
    `);

  return {
    ...row,
    imagenes: imgResult.recordset,
  };
};

//Listar TODAS las publicaciones (solo admin)
export const listarTodasLasPublicaciones = async (filtros: {
  estado?:     string;
  pagina?:     number;
  por_pagina?: number;
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

  if (filtros.estado) {
    req.input("estado", filtros.estado);
    where += " AND p.estado = @estado";
  }

  const result = await req.query(`
    SELECT
      p.id_publicacion,
      p.titulo,
      p.precio,
      p.estado,
      p.fecha_publicacion,
      v.año,
      v.kilometraje,
      ma.nombre  AS marca,
      mo.nombre  AS modelo,
      ci.nombre  AS ciudad,
      us.primer_nombre   AS vendedor_nombre,
      us.primer_apellido AS vendedor_apellido,
      (SELECT TOP 1 i.url_imagen
       FROM Imagen i
       WHERE i.id_publicacion = p.id_publicacion
       ORDER BY i.orden_imagen) AS imagen_principal
    FROM Publicacion p
    JOIN Vehiculo  v  ON v.id_vehiculo  = p.id_vehiculo
    JOIN Modelo    mo ON mo.id_modelo   = v.id_modelo
    JOIN Marca     ma ON ma.id_marca    = mo.id_marca
    JOIN Ubicacion u  ON u.id_ubicacion = p.id_ubicacion
    JOIN Ciudad    ci ON ci.id_ciudad   = u.id_ciudad
    JOIN Usuario   us ON us.id_usuario  = p.id_usuario
    ${where}
    ORDER BY p.fecha_publicacion DESC
    OFFSET @offset ROWS FETCH NEXT @por_pagina ROWS ONLY
  `);

  return result.recordset;
};