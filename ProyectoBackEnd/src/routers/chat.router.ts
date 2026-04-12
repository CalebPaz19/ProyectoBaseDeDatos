import { Router } from "express";
import {
  iniciarChat,
  enviar,
  obtenerMensajes,
  misChats,
  cambiarEstadoChat,
} from "../controllers/chat.controller";

const router = Router();

//Iniciar o reabrir chat sobre una publicación
router.post("/chat/iniciar", iniciarChat);

//Enviar mensaje a un chat
router.post("/chat/:id_chat/mensaje", enviar);

//Obtener mensajes de un chat (?id_usuario=X para marcar como leídos)
router.get("/chat/:id_chat/mensajes", obtenerMensajes);

//Listar todos los chats de un usuario
router.get("/chat/misChats/:id_usuario", misChats);

//Cambiar estado del chat (cerrado | archivado | activo)
router.patch("/chat/:id_chat/estado", cambiarEstadoChat);

export default router;