import { poolPromise } from "../config/baseDeDatos";
import { Chat, Mensaje } from "../Interfaces/chat.interface";

//Crear chat o devolver el existente activo
//El índice único UQ_Chat_Activo (id_comprador, id_publicacion) WHERE estado='activo'
//previene duplicados, por eso usamos MERGE
export const obtenerOCrearChat = async (chat: Chat) => {
  const conexion = await poolPromise;

  const result = await conexion
    .request()
    .input("id_publicacion", chat.id_publicacion)
    .input("id_comprador",   chat.id_comprador)
    .input("id_vendedor",    chat.id_vendedor)
    .query(`
      -- Si ya existe un chat activo para este comprador+publicación lo devuelve
      -- Si no existe lo crea
      MERGE Chat AS target
      USING (
        SELECT @id_publicacion AS id_publicacion,
               @id_comprador   AS id_comprador,
               @id_vendedor    AS id_vendedor
      ) AS source
      ON (
        target.id_comprador   = source.id_comprador   AND
        target.id_publicacion = source.id_publicacion AND
        target.estado         = 'activo'
      )
      WHEN NOT MATCHED THEN
        INSERT (id_publicacion, id_comprador, id_vendedor)
        VALUES (source.id_publicacion, source.id_comprador, source.id_vendedor)
      OUTPUT
        INSERTED.id_chat,
        INSERTED.id_publicacion,
        INSERTED.id_comprador,
        INSERTED.id_vendedor,
        INSERTED.estado,
        INSERTED.fecha_inicio;
    `);

  // Si el chat ya existía el MERGE no devuelve nada en OUTPUT, lo buscamos
  if (result.recordset.length > 0) {
    return result.recordset[0];
  }

  const existe = await conexion
    .request()
    .input("id_publicacion", chat.id_publicacion)
    .input("id_comprador",   chat.id_comprador)
    .query(`
      SELECT id_chat, id_publicacion, id_comprador, id_vendedor, estado, fecha_inicio
      FROM Chat
      WHERE id_comprador   = @id_comprador
        AND id_publicacion = @id_publicacion
        AND estado         = 'activo'
    `);

  return existe.recordset[0];
};

//Enviar mensaje
export const enviarMensaje = async (mensaje: Mensaje) => {
  const conexion = await poolPromise;

  const result = await conexion
    .request()
    .input("id_chat",    mensaje.id_chat)
    .input("id_usuario", mensaje.id_usuario)
    .input("contenido",  mensaje.contenido)
    .input("tipo",       mensaje.tipo || "texto")
    .query(`
      INSERT INTO Mensaje (id_chat, id_usuario, contenido, tipo)
      OUTPUT
        INSERTED.id_mensaje,
        INSERTED.fecha_envio,
        INSERTED.leido,
        INSERTED.tipo
      VALUES (@id_chat, @id_usuario, @contenido, @tipo)
    `);

  return result.recordset[0];
};

//Obtener mensajes de un chat
export const obtenerMensajesDeChat = async (id_chat: number) => {
  const conexion = await poolPromise;

  const result = await conexion
    .request()
    .input("id_chat", id_chat)
    .query(`
      SELECT
        m.id_mensaje,
        m.contenido,
        m.tipo,
        m.leido,
        m.fecha_envio,
        m.fecha_lectura,
        m.id_usuario,
        u.primer_nombre   AS remitente_nombre,
        u.primer_apellido AS remitente_apellido
      FROM Mensaje m
      JOIN Usuario u ON u.id_usuario = m.id_usuario
      WHERE m.id_chat = @id_chat
      ORDER BY m.fecha_envio ASC
    `);

  return result.recordset;
};

//Marcar mensajes como leídos
export const marcarMensajesLeidos = async (
  id_chat: number,
  id_usuario: number   // el usuario que está leyendo (no el remitente)
) => {
  const conexion = await poolPromise;

  await conexion
    .request()
    .input("id_chat",    id_chat)
    .input("id_usuario", id_usuario)
    .query(`
      UPDATE Mensaje
      SET leido        = 1,
          fecha_lectura = GETDATE()
      WHERE id_chat    = @id_chat
        AND id_usuario != @id_usuario   -- solo los mensajes del otro
        AND leido       = 0
    `);
};

//Chats de un usuario
export const obtenerChatsDeUsuario = async (id_usuario: number) => {
  const conexion = await poolPromise;

  const result = await conexion
    .request()
    .input("id_usuario", id_usuario)
    .query(`
      SELECT
        c.id_chat,
        c.estado,
        c.fecha_inicio,
        p.id_publicacion,
        p.titulo         AS publicacion_titulo,
        ma.nombre        AS marca,
        mo.nombre        AS modelo,
        -- comprador
        uc.id_usuario    AS id_comprador,
        uc.primer_nombre   AS comprador_nombre,
        uc.primer_apellido AS comprador_apellido,
        -- vendedor
        uv.id_usuario    AS id_vendedor,
        uv.primer_nombre   AS vendedor_nombre,
        uv.primer_apellido AS vendedor_apellido,
        -- último mensaje
        (SELECT TOP 1 m.contenido
         FROM Mensaje m
         WHERE m.id_chat = c.id_chat
         ORDER BY m.fecha_envio DESC) AS ultimo_mensaje,
        (SELECT TOP 1 m.fecha_envio
         FROM Mensaje m
         WHERE m.id_chat = c.id_chat
         ORDER BY m.fecha_envio DESC) AS fecha_ultimo_mensaje,
        -- mensajes no leídos para este usuario
        (SELECT COUNT(*)
         FROM Mensaje m
         WHERE m.id_chat    = c.id_chat
           AND m.id_usuario != @id_usuario
           AND m.leido       = 0) AS mensajes_no_leidos
      FROM Chat c
      JOIN Publicacion p  ON p.id_publicacion = c.id_publicacion
      JOIN Vehiculo    v  ON v.id_vehiculo     = p.id_vehiculo
      JOIN Modelo      mo ON mo.id_modelo      = v.id_modelo
      JOIN Marca       ma ON ma.id_marca       = mo.id_marca
      JOIN Usuario     uc ON uc.id_usuario     = c.id_comprador
      JOIN Usuario     uv ON uv.id_usuario     = c.id_vendedor
      WHERE (c.id_comprador = @id_usuario OR c.id_vendedor = @id_usuario)
      ORDER BY fecha_ultimo_mensaje DESC
    `);

  return result.recordset;
};

//Obtener chat por id
export const obtenerChatPorId = async (id_chat: number) => {
  const conexion = await poolPromise;

  const result = await conexion
    .request()
    .input("id_chat", id_chat)
    .query(`
      SELECT id_chat, id_publicacion, id_comprador, id_vendedor, estado, fecha_inicio
      FROM Chat
      WHERE id_chat = @id_chat
    `);

  return result.recordset[0] || null;
};

//Cambiar estado del chat
export const actualizarEstadoChat = async (
  id_chat: number,
  estado: string
) => {
  const conexion = await poolPromise;

  await conexion
    .request()
    .input("id_chat", id_chat)
    .input("estado",  estado)
    .query(`
      UPDATE Chat
      SET estado = @estado
      WHERE id_chat = @id_chat
    `);
};