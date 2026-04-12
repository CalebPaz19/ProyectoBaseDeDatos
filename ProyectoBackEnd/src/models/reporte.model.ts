import { poolPromise } from "../config/baseDeDatos";
import { Reporte } from "../Interfaces/reporte.interface";

//Crear reporte 
export const crearReporte = async (reporte: Reporte) => {
  const conexion = await poolPromise;

  const result = await conexion
    .request()
    .input("id_usuario_reporta",   reporte.id_usuario_reporta)
    .input("id_usuario_reportado", reporte.id_usuario_reportado || null)
    .input("id_publicacion",       reporte.id_publicacion       || null)
    .input("motivo",               reporte.motivo)
    .input("descripcion",          reporte.descripcion          || null)
    .query(`
      INSERT INTO Reporte (
        id_usuario_reporta, id_usuario_reportado,
        id_publicacion, motivo, descripcion
      )
      OUTPUT INSERTED.id_reporte, INSERTED.fecha_reporte, INSERTED.estado
      VALUES (
        @id_usuario_reporta, @id_usuario_reportado,
        @id_publicacion, @motivo, @descripcion
      )
    `);

  return result.recordset[0];
};

//Cambiar estado del reporte (admin) 
export const actualizarEstadoReporte = async (
  id_reporte: number,
  estado: string
) => {
  const conexion = await poolPromise;

  await conexion
    .request()
    .input("id_reporte", id_reporte)
    .input("estado",     estado)
    .query(`
      UPDATE Reporte
      SET estado = @estado
      WHERE id_reporte = @id_reporte
    `);
};

//Listar reportes con filtros (admin) 
export const listarReportes = async (filtros: {
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
    where += " AND r.estado = @estado";
  }

  const result = await req.query(`
    SELECT
      r.id_reporte,
      r.motivo,
      r.descripcion,
      r.estado,
      r.fecha_reporte,
      -- quien reporta
      ur.primer_nombre   AS reporta_nombre,
      ur.primer_apellido AS reporta_apellido,
      ur.correo          AS reporta_correo,
      -- usuario reportado (puede ser null)
      ud.primer_nombre   AS reportado_nombre,
      ud.primer_apellido AS reportado_apellido,
      -- publicación reportada (puede ser null)
      p.titulo           AS publicacion_titulo,
      p.id_publicacion
    FROM Reporte r
    JOIN Usuario ur         ON ur.id_usuario = r.id_usuario_reporta
    LEFT JOIN Usuario ud    ON ud.id_usuario = r.id_usuario_reportado
    LEFT JOIN Publicacion p ON p.id_publicacion = r.id_publicacion
    ${where}
    ORDER BY r.fecha_reporte DESC
    OFFSET @offset ROWS FETCH NEXT @por_pagina ROWS ONLY
  `);

  return result.recordset;
};

//Detalle de un reporte 
export const obtenerDetalleReporte = async (id_reporte: number) => {
  const conexion = await poolPromise;

  const result = await conexion
    .request()
    .input("id_reporte", id_reporte)
    .query(`
      SELECT
        r.id_reporte,
        r.motivo,
        r.descripcion,
        r.estado,
        r.fecha_reporte,
        ur.id_usuario      AS id_reporta,
        ur.primer_nombre   AS reporta_nombre,
        ur.primer_apellido AS reporta_apellido,
        ur.correo          AS reporta_correo,
        ud.id_usuario      AS id_reportado,
        ud.primer_nombre   AS reportado_nombre,
        ud.primer_apellido AS reportado_apellido,
        ud.correo          AS reportado_correo,
        p.id_publicacion,
        p.titulo           AS publicacion_titulo,
        p.estado           AS publicacion_estado
      FROM Reporte r
      JOIN Usuario ur         ON ur.id_usuario    = r.id_usuario_reporta
      LEFT JOIN Usuario ud    ON ud.id_usuario    = r.id_usuario_reportado
      LEFT JOIN Publicacion p ON p.id_publicacion = r.id_publicacion
      WHERE r.id_reporte = @id_reporte
    `);

  return result.recordset[0] || null;
};

//Reportes enviados por un usuario
export const obtenerReportesDeUsuario = async (id_usuario: number) => {
  const conexion = await poolPromise;

  const result = await conexion
    .request()
    .input("id_usuario", id_usuario)
    .query(`
      SELECT
        r.id_reporte,
        r.motivo,
        r.descripcion,
        r.estado,
        r.fecha_reporte,
        p.titulo         AS publicacion_titulo,
        p.id_publicacion
      FROM Reporte r
      LEFT JOIN Publicacion p ON p.id_publicacion = r.id_publicacion
      WHERE r.id_usuario_reporta = @id_usuario
      ORDER BY r.fecha_reporte DESC
    `);

  return result.recordset;
};