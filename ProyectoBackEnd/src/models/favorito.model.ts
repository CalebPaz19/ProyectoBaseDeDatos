import { poolPromise } from "../config/baseDeDatos";
import { Favorito } from "../Interfaces/favorito.interface";

//Agregar a favoritos
export const agregarFavorito = async (favorito: Favorito) => {
  const conexion = await poolPromise;

  const result = await conexion
    .request()
    .input("id_usuario",     favorito.id_usuario)
    .input("id_publicacion", favorito.id_publicacion)
    .query(`
      INSERT INTO Favorito (id_usuario, id_publicacion)
      OUTPUT INSERTED.id_favorito, INSERTED.fecha_agregado
      VALUES (@id_usuario, @id_publicacion)
    `);

  return result.recordset[0];
};

//Eliminar de favoritos
export const eliminarFavorito = async (id_usuario: number, id_publicacion: number) => {
  const conexion = await poolPromise;

  await conexion
    .request()
    .input("id_usuario",     id_usuario)
    .input("id_publicacion", id_publicacion)
    .query(`
      DELETE FROM Favorito
      WHERE id_usuario = @id_usuario
        AND id_publicacion = @id_publicacion
    `);
};

//Verificar si una publicacion ya es favorita
export const esFavorito = async (id_usuario: number, id_publicacion: number) => {
  const conexion = await poolPromise;

  const result = await conexion
    .request()
    .input("id_usuario",     id_usuario)
    .input("id_publicacion", id_publicacion)
    .query(`
      SELECT id_favorito
      FROM Favorito
      WHERE id_usuario = @id_usuario
        AND id_publicacion = @id_publicacion
    `);

  return result.recordset.length > 0;
};

//Listar favoritos de usuario
export const obtenerFavoritosDeUsuario = async (id_usuario: number) => {
  const conexion = await poolPromise;

  const result = await conexion
    .request()
    .input("id_usuario", id_usuario)
    .query(`
      SELECT
        f.id_favorito,
        f.fecha_agregado,
        p.id_publicacion,
        p.titulo,
        p.precio,
        p.estado,
        v.año,
        v.kilometraje,
        v.color,
        ma.nombre AS marca,
        mo.nombre AS modelo,
        ci.nombre AS ciudad,
        (SELECT TOP 1 i.url_imagen
         FROM Imagen i
         WHERE i.id_publicacion = p.id_publicacion
         ORDER BY i.orden_imagen) AS imagen_principal
      FROM Favorito f
      JOIN Publicacion p   ON p.id_publicacion = f.id_publicacion
      JOIN Vehiculo    v   ON v.id_vehiculo     = p.id_vehiculo
      JOIN Modelo      mo  ON mo.id_modelo      = v.id_modelo
      JOIN Marca       ma  ON ma.id_marca       = mo.id_marca
      JOIN Ubicacion   u   ON u.id_ubicacion    = p.id_ubicacion
      JOIN Ciudad      ci  ON ci.id_ciudad      = u.id_ciudad
      WHERE f.id_usuario = @id_usuario
        AND p.estado = 'activa'
      ORDER BY f.fecha_agregado DESC
    `);

  return result.recordset;
};