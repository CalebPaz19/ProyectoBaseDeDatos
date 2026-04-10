import { poolPromise } from "../config/baseDeDatos";
import { Usuario } from "../Interfaces/usuario.interface";

export const crearUsuario = async (usuario: Usuario) => {
  const conexion = await poolPromise;

  const result = await conexion.request()
    .input('dni', usuario.dni)
    .input('primer_nombre', usuario.nombre1)
    .input('segundo_nombre', usuario.nombre2 || null)
    .input('primer_apellido', usuario.apellido1)
    .input('segundo_apellido', usuario.apellido2 || null)
    .input('correo', usuario.correo)
    .input('contrasena', usuario.contraseña) // luego puedes hashearla
    .input('telefono', usuario.telefono)
    .input('foto_perfil', usuario.foto_perfil || null)
    .input('rol', usuario.rol || 'usuario')
    .input('estado_cuenta', usuario.estado_cuenta || 'activa')
    .query(`
      INSERT INTO Usuario (
        dni, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido,
        correo, contrasena, telefono, foto_perfil,
        rol, estado_cuenta
      )
      OUTPUT INSERTED.id_usuario
      VALUES (
        @dni, @primer_nombre, @segundo_nombre, @primer_apellido, @segundo_apellido,
        @correo, @contrasena, @telefono, @foto_perfil,
        @rol, @estado_cuenta
      )
    `)

  return result.recordset[0]
}

export const buscarUsuario = async (correo: string) =>{
  const conexion = await poolPromise

  const result = await conexion.request()
  .input('correo', correo)
  .query(`
    SELECT
      id_usuario,
      primer_nombre AS nombre1,
      primer_apellido AS apellido1,
      correo,
      contrasena,
      rol,
      estado_cuenta
    FROM Usuario
    WHERE @correo = correo
    `);

  return result.recordset[0] || null;
};