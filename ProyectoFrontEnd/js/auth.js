// ── Actualizar navbar según sesión ───────────────────────────────────────────
function actualizarNavbar() {
  const usuario = sesion.obtener();
  const contenedor = document.getElementById('contenedor-auth');
  if (!contenedor) return;

  if (usuario) {
    contenedor.innerHTML = `
      <span class="text-white small me-2">Hola, <strong>${usuario.nombre}</strong></span>
      <a href="perfil.html" class="btn btn-outline-light btn-sm px-3">
        <i class="bi bi-person-circle me-1"></i>Mi Cuenta
      </a>
      <button class="btn btn-outline-danger btn-sm px-3" id="btn-cerrar-sesion">
        <i class="bi bi-box-arrow-right me-1"></i>Salir
      </button>`;

    document.getElementById('btn-cerrar-sesion')?.addEventListener('click', () => {
      sesion.cerrar();
      window.location.href = 'index.html';
    });

    // Mostrar/ocultar links según sesión
    document.getElementById('link-publicar')?.classList.remove('d-none');
    document.getElementById('link-mensajeria')?.classList.remove('d-none');
    document.getElementById('link-favoritos')?.classList.remove('d-none');

    // Enlace al panel admin — solo visible para administradores
    if (usuario.rol === 'admin') {
      document.getElementById('link-admin')?.classList.remove('d-none');
    }
  } else {
    contenedor.innerHTML = `
      <button type="button" class="btn btn-outline-light btn-sm px-3"
        data-bs-toggle="modal" data-bs-target="#loginModal">Iniciar Sesión</button>
      <button type="button" class="btn btn-primary btn-sm px-3"
        data-bs-toggle="modal" data-bs-target="#registroModal">Registrarse</button>`;
  }
}

// ── Mostrar alerta dentro de un modal ────────────────────────────────────────
function mostrarAlertaModal(idContenedor, mensaje, tipo = 'danger') {
  const el = document.getElementById(idContenedor);
  if (!el) return;
  el.innerHTML = `
    <div class="alert alert-${tipo} py-2 small mb-0" role="alert">
      <i class="bi bi-${tipo === 'danger' ? 'exclamation-triangle' : 'check-circle'}-fill me-1"></i>
      ${mensaje}
    </div>`;
}

function limpiarAlertaModal(idContenedor) {
  const el = document.getElementById(idContenedor);
  if (el) el.innerHTML = '';
}

// ── Registro ──────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  actualizarNavbar();

  // ── Formulario de registro ────────────────────────────────────────────────
  const formRegistro = document.getElementById('formRegistro');
  if (formRegistro) {
    formRegistro.addEventListener('submit', async (e) => {
      e.preventDefault();
      limpiarAlertaModal('alerta-registro');
      const btn = formRegistro.querySelector('[type="submit"]');
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Creando cuenta...';

      const d = new FormData(formRegistro);
      try {
        await apiUsuarios.registrar({
          dni:        d.get('dni'),
          nombre1:    d.get('nombre1'),
          nombre2:    d.get('nombre2') || undefined,
          apellido1:  d.get('apellido1'),
          apellido2:  d.get('apellido2') || undefined,
          correo:     d.get('correo'),
          contraseña: d.get('password'),
          telefono:   d.get('telefono'),
        });

        mostrarAlertaModal('alerta-registro', '¡Cuenta creada! Ya puedes iniciar sesión.', 'success');
        formRegistro.reset();

        setTimeout(() => {
          bootstrap.Modal.getInstance(document.getElementById('registroModal'))?.hide();
          bootstrap.Modal.getOrCreateInstance(document.getElementById('loginModal'))?.show();
        }, 1500);
      } catch (err) {
        mostrarAlertaModal('alerta-registro', err.message);
      } finally {
        btn.disabled = false;
        btn.textContent = 'Crear Cuenta';
      }
    });
  }

  // ── Formulario de login ───────────────────────────────────────────────────
  const formLogin = document.getElementById('formLogin');
  if (formLogin) {
    formLogin.addEventListener('submit', async (e) => {
      e.preventDefault();
      limpiarAlertaModal('alerta-login');
      const btn = formLogin.querySelector('[type="submit"]');
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Entrando...';

      const d = new FormData(formLogin);
      try {
        const res = await apiUsuarios.login({
          correo:     d.get('correoLogin'),
          contraseña: d.get('passLogin'),
        });

        sesion.guardar({
          id_usuario: res.usuario.id_usuario,
          nombre:     res.usuario.nombre,
          apellido:   res.usuario.apellido,
          correo:     res.usuario.correo,
          rol:        res.usuario.rol,
        });

        bootstrap.Modal.getInstance(document.getElementById('loginModal'))?.hide();
        actualizarNavbar();

        // Redirigir según la página actual
        const redirigir = new URLSearchParams(location.search).get('redir');
        if (redirigir) window.location.href = redirigir;

      } catch (err) {
        mostrarAlertaModal('alerta-login', err.message);
      } finally {
        btn.disabled = false;
        btn.textContent = 'Entrar';
      }
    });
  }
});

// ── Redirigir si no hay sesión ────────────────────────────────────────────────
function requiereLogin(ruta) {
  if (!sesion.activa()) {
    window.location.href = `index.html?redir=${ruta}`;
    return false;
  }
  return true;
}