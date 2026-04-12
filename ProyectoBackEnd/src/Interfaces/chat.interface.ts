export interface Chat {
  id_chat?: number;
  id_publicacion: number;
  id_comprador: number;
  id_vendedor: number;
  fecha_inicio?: Date;
  estado?:         'activo' | 'cerrado' | 'archivado';
}

export interface Mensaje {
  id_mensaje?: number;
  id_chat: number;
  id_usuario: number;
  contenido: string;
  tipo?: 'texto' | 'imagen' | 'sistema';
  leido?: boolean;
  fecha_envio?: Date;
  fecha_lectura?: Date;
}