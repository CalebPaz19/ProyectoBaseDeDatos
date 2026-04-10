export interface Publicacion {
  id_publicacion?: number
  titulo: string
  descripcion?: string
  precio: number
  id_usuario: number
  id_vehiculo: number
  id_ubicacion: number
  estado?: 'activa' | 'pausada' | 'vendido' | 'eliminada'
}