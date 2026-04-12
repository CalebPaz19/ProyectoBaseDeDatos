import { Request, Response } from "express";
import { obtenerOCrearChat, enviarMensaje, obtenerMensajesDeChat, marcarMensajesLeidos, obtenerChatsDeUsuario, obtenerChatPorId, actualizarEstadoChat } from "../models/chat.model";

//Iniciar o abrir chat sobre una publicación
export const iniciarChat = async (req: Request, res: Response) => {
  try {
    const { id_publicacion, id_comprador, id_vendedor } = req.body;

    if (!id_publicacion || !id_comprador || !id_vendedor) {
      return res.status(400).json({
        message: "Se requieren id_publicacion, id_comprador e id_vendedor",
      });
    }

    if (Number(id_comprador) === Number(id_vendedor)) {
      return res.status(400).json({
        message: "No puedes abrir un chat contigo mismo",
      });
    }

    const chat = await obtenerOCrearChat({
      id_publicacion: Number(id_publicacion),
      id_comprador:   Number(id_comprador),
      id_vendedor:    Number(id_vendedor),
    });

    return res.status(201).json({
      message: "Chat listo",
      chat,
    });

  } catch (error: any) {
    console.error("Error iniciarChat:", error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

//Enviar mensaje
export const enviar = async (req: Request, res: Response) => {
  try {
    const { id_chat }              = req.params;
    const { id_usuario, contenido, tipo } = req.body;

    if (!id_usuario || !contenido) {
      return res.status(400).json({
        message: "Se requieren id_usuario y contenido",
      });
    }

    if (contenido.trim().length === 0) {
      return res.status(400).json({ message: "El mensaje no puede estar vacío" });
    }

    // Verificar que el chat exista y esté activo
    const chat = await obtenerChatPorId(Number(id_chat));
    if (!chat) {
      return res.status(404).json({ message: "Chat no encontrado" });
    }
    if (chat.estado !== "activo") {
      return res.status(400).json({
        message: `No puedes enviar mensajes, el chat está ${chat.estado}`,
      });
    }

    // Verificar que el usuario pertenezca al chat
    const perteneceAlChat =
      chat.id_comprador === Number(id_usuario) ||
      chat.id_vendedor  === Number(id_usuario);

    if (!perteneceAlChat) {
      return res.status(403).json({
        message: "No tienes permiso para enviar mensajes en este chat",
      });
    }

    const mensaje = await enviarMensaje({
      id_chat:    Number(id_chat),
      id_usuario: Number(id_usuario),
      contenido:  contenido.trim(),
      tipo:       tipo || "texto",
    });

    return res.status(201).json({ mensaje });

  } catch (error: any) {
    console.error("Error enviar mensaje:", error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

//Obtener mensajes de un chat
export const obtenerMensajes = async (req: Request, res: Response) => {
  try {
    const { id_chat }    = req.params;
    const { id_usuario } = req.query;

    const chat = await obtenerChatPorId(Number(id_chat));
    if (!chat) {
      return res.status(404).json({ message: "Chat no encontrado" });
    }

    // Marcar como leídos los mensajes del otro usuario
    if (id_usuario) {
      await marcarMensajesLeidos(Number(id_chat), Number(id_usuario));
    }

    const mensajes = await obtenerMensajesDeChat(Number(id_chat));

    return res.json({ mensajes });

  } catch (error: any) {
    console.error("Error obtenerMensajes:", error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

//Chats de un usuario
export const misChats = async (req: Request, res: Response) => {
  try {
    const { id_usuario } = req.params;

    if (!id_usuario) {
      return res.status(400).json({ message: "Id de usuario requerido" });
    }

    const chats = await obtenerChatsDeUsuario(Number(id_usuario));

    return res.json({ chats });

  } catch (error: any) {
    console.error("Error misChats:", error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

//Cerrar o archivar un chat
export const cambiarEstadoChat = async (req: Request, res: Response) => {
  try {
    const { id_chat }  = req.params;
    const { estado }   = req.body;

    const validos = ["activo", "cerrado", "archivado"];
    if (!estado || !validos.includes(estado)) {
      return res.status(400).json({
        message: `estado debe ser: ${validos.join(", ")}`,
      });
    }

    const chat = await obtenerChatPorId(Number(id_chat));
    if (!chat) {
      return res.status(404).json({ message: "Chat no encontrado" });
    }

    await actualizarEstadoChat(Number(id_chat), estado);

    return res.json({ message: `Chat marcado como '${estado}'` });

  } catch (error: any) {
    console.error("Error cambiarEstadoChat:", error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};