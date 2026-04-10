export interface Usuario {
  id_usuario?: number
  dni: string
  nombre1: string
  nombre2?: string
  apellido1: string
  apellido2?: string
  correo: string
  contraseña: string
  telefono?: string
  foto_perfil?: string
  rol?: 'admin' | 'usuario'
  estado_cuenta?: 'activa' | 'suspendida' | 'bloqueada'
}