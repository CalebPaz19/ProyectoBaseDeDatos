export interface Reporte {
  id_reporte?: number;
  id_usuario_reporta: number;
  id_usuario_reportado?: number | null;   // puede ser null
  id_publicacion?: number | null;   // puede ser null
  motivo: string;
  descripcion?: string | null;   // puede ser null
  estado?: 'pendiente' | 'revisado' | 'rechazado' | 'resuelto';
  fecha_reporte?: Date;
}
