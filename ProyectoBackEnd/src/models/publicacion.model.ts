import { poolPromise } from "../config/baseDeDatos";
import { Publicacion } from "../Interfaces/publicacion.interface";

export const guardarPublicacion = async (publicacion: Publicacion) => {
  const conexion = await poolPromise;

  const result = await conexion.request()
    .input('titulo', publicacion.titulo)
    .input('descripcion', publicacion.descripcion || null)
    .input('precio', publicacion.precio)
    .input('id_usuario', publicacion.id_usuario)
    .input('id_vehiculo', publicacion.id_vehiculo)
    .input('id_ubicacion', publicacion.id_ubicacion)
    .input('estado', publicacion.estado || 'activa')
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

// ── Listar todas las publicaciones activas
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
 
  const req = conexion.request()
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
      v.color,
      ma.nombre  AS marca,
      mo.nombre  AS modelo,
      ci.nombre  AS ciudad,
      (SELECT TOP 1 i.url_imagen
       FROM Imagen i
       WHERE i.id_publicacion = p.id_publicacion
       ORDER BY i.orden_imagen) AS imagen_principal
    FROM Publicacion p
    JOIN Vehiculo v   ON v.id_vehiculo   = p.id_vehiculo
    JOIN Modelo   mo  ON mo.id_modelo    = v.id_modelo
    JOIN Marca    ma  ON ma.id_marca     = mo.id_marca
    JOIN Ubicacion u  ON u.id_ubicacion  = p.id_ubicacion
    JOIN Ciudad   ci  ON ci.id_ciudad    = u.id_ciudad
    ${where}
    ORDER BY p.fecha_publicacion DESC
    OFFSET @offset ROWS FETCH NEXT @por_pagina ROWS ONLY
  `);
 
  return result.recordset;
};

export const obtenerPublicacionesPorUsuario = async (id_usuario: number) => {
  const conexion = await poolPromise;

  const result = await conexion.request()
    .input('id_usuario', id_usuario)
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
      ORDER BY p.fecha_publicacion DESC
    `);
  return result.recordset;
};