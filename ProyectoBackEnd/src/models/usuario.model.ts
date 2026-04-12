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

export const obtenerUsuarioPorId = async (id_usuario: number) => {
  const conexion = await poolPromise;
 
  const result = await conexion
    .request()
    .input("id_usuario", id_usuario)
    .query(`
      SELECT
        id_usuario,
        dni,
        primer_nombre    AS nombre1,
        segundo_nombre   AS nombre2,
        primer_apellido  AS apellido1,
        segundo_apellido AS apellido2,
        correo,
        telefono,
        foto_perfil,
        rol,
        estado_cuenta,
        fecha_registro
      FROM Usuario
      WHERE id_usuario = @id_usuario
    `);
 
  return result.recordset[0] || null;
};

export const actualizarPerfil = async (
  id_usuario: number,
  datos: { telefono?: string; foto_perfil?: string }
) => {
  const conexion = await poolPromise;
 
  await conexion
    .request()
    .input("id_usuario",  id_usuario)
    .input("telefono",    datos.telefono    || null)
    .input("foto_perfil", datos.foto_perfil || null)
    .query(`
      UPDATE Usuario
      SET
        telefono = COALESCE(@telefono, telefono),
        foto_perfil = COALESCE(@foto_perfil, foto_perfil)
      WHERE id_usuario = @id_usuario
    `);
};

//Cambiar estado de cuenta (solo admin)
export const cambiarEstadoCuenta = async (id_usuario: number, estado: string) => {
  const conexion = await poolPromise;
 
  await conexion
    .request()
    .input("id_usuario", id_usuario)
    .input("estado_cuenta", estado)
    .query(`
      UPDATE Usuario
      SET estado_cuenta = @estado_cuenta
      WHERE id_usuario = @id_usuario
    `);
};

//Listar todos los usuarios con filtros (solo admin)
export const listarTodosLosUsuarios = async (filtros: {
  estado_cuenta?: string | undefined;
  rol?:           string | undefined;
  pagina?:        number | undefined;
  por_pagina?:    number | undefined;
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
 
  if (filtros.estado_cuenta) {
    req.input("estado_cuenta", filtros.estado_cuenta);
    where += " AND estado_cuenta = @estado_cuenta";
  }
  if (filtros.rol) {
    req.input("rol", filtros.rol);
    where += " AND rol = @rol";
  }
 
  const result = await req.query(`
    SELECT
      id_usuario,
      dni,
      primer_nombre    AS nombre1,
      primer_apellido  AS apellido1,
      correo,
      telefono,
      rol,
      estado_cuenta,
      fecha_registro
    FROM Usuario
    ${where}
    ORDER BY fecha_registro DESC
    OFFSET @offset ROWS FETCH NEXT @por_pagina ROWS ONLY
  `);
 
  return result.recordset;
};