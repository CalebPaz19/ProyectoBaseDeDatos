let chatActivo = null;
let intervalActualizar = null;

// ── Renderizar lista de chats ─────────────────────────────────────────────────
function renderizarListaChats(chats) {
  const lista = document.getElementById('lista-chats');
  if (!chats.length) {
    lista.innerHTML = '<p class="text-muted text-center py-4 small">No tienes conversaciones aún.</p>';
    return;
  }
  const usuario = sesion.obtener();

  lista.innerHTML = chats.map(c => {
    const esComprador = c.id_comprador === usuario.id_usuario;
    const contacto = esComprador
      ? `${c.vendedor_nombre} ${c.vendedor_apellido}`
      : `${c.comprador_nombre} ${c.comprador_apellido}`;

    return `
      <div class="chat-item p-3 border-bottom ${chatActivo?.id_chat === c.id_chat ? 'activo' : ''}"
           data-id="${c.id_chat}" onclick="abrirChat(${c.id_chat})">
        <div class="d-flex justify-content-between align-items-start">
          <div class="flex-grow-1 overflow-hidden">
            <div class="d-flex align-items-center gap-1">
              <i class="bi bi-person-circle text-muted"></i>
              <span class="fw-bold small text-truncate">${contacto}</span>
            </div>
            <div class="text-muted small text-truncate">${c.publicacion_titulo}</div>
            <div class="text-muted small text-truncate opacity-75">${c.ultimo_mensaje || 'Sin mensajes'}</div>
          </div>
          <div class="text-end ms-2 flex-shrink-0">
            ${c.mensajes_no_leidos > 0
              ? `<span class="badge bg-primary rounded-pill badge-no-leidos">${c.mensajes_no_leidos}</span>`
              : ''}
            <div class="text-muted" style="font-size:10px">${c.fecha_ultimo_mensaje ? new Date(c.fecha_ultimo_mensaje).toLocaleDateString('es-HN') : ''}</div>
          </div>
        </div>
      </div>`;
  }).join('');
}

// ── Renderizar mensajes ───────────────────────────────────────────────────────
function renderizarMensajes(mensajes) {
  const usuario = sesion.obtener();
  const area = document.getElementById('mensajes-area');

  if (!mensajes.length) {
    area.innerHTML = '<p class="text-muted text-center py-4 small">Sé el primero en enviar un mensaje.</p>';
    return;
  }

  area.innerHTML = mensajes.map(m => {
    const esMio = m.id_usuario === usuario.id_usuario;
    const hora = new Date(m.fecha_envio).toLocaleTimeString('es-HN', { hour: '2-digit', minute: '2-digit' });
    return `
      <div class="d-flex mb-2 ${esMio ? 'justify-content-end' : 'justify-content-start'}">
        <div>
          ${!esMio ? `<small class="text-muted ms-1">${m.remitente_nombre}</small><br>` : ''}
          <span class="${esMio ? 'burbuja-yo' : 'burbuja-otro'}">${m.contenido}</span>
          <div class="text-muted mt-1 ${esMio ? 'text-end' : ''}" style="font-size:11px">
            ${hora} ${esMio && m.leido ? '<i class="bi bi-check2-all text-primary"></i>' : ''}
          </div>
        </div>
      </div>`;
  }).join('');

  area.scrollTop = area.scrollHeight;
}

// ── Abrir chat ────────────────────────────────────────────────────────────────
async function abrirChat(id_chat) {
  const usuario = sesion.obtener();
  if (intervalActualizar) clearInterval(intervalActualizar);

  // Marcar activo en la lista
  document.querySelectorAll('.chat-item').forEach(el => {
    el.classList.toggle('activo', Number(el.dataset.id) === id_chat);
  });

  try {
    // Obtener mensajes y marcar como leídos
    const data = await apiChat.mensajes(id_chat, usuario.id_usuario);
    const chats = await apiChat.misChats(usuario.id_usuario);
    chatActivo = chats.chats?.find(c => c.id_chat === id_chat);

    if (chatActivo) {
      document.getElementById('chat-titulo').textContent = chatActivo.publicacion_titulo;
      const esComprador = chatActivo.id_comprador === usuario.id_usuario;
      const contacto = esComprador
        ? `${chatActivo.vendedor_nombre} ${chatActivo.vendedor_apellido}`
        : `${chatActivo.comprador_nombre} ${chatActivo.comprador_apellido}`;
      document.getElementById('chat-subtitulo').textContent = `con ${contacto}`;
      document.getElementById('chat-link-publicacion').href = `detalle.html?id=${chatActivo.id_publicacion}`;
      document.getElementById('chat-acciones').classList.remove('d-none');
    }

    document.getElementById('input-area').classList.remove('d-none');
    renderizarMensajes(data.mensajes || []);
    renderizarListaChats(chats.chats || []);

    // Polling cada 5 segundos para nuevos mensajes
    intervalActualizar = setInterval(async () => {
      try {
        const nuevos = await apiChat.mensajes(id_chat, usuario.id_usuario);
        renderizarMensajes(nuevos.mensajes || []);
      } catch {}
    }, 5000);

  } catch (err) {
    console.error('Error abriendo chat:', err);
  }
}

// ── Enviar mensaje ────────────────────────────────────────────────────────────
document.getElementById('formMensaje')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!chatActivo) return;

  const input = document.getElementById('input-mensaje');
  const contenido = input.value.trim();
  if (!contenido) return;

  const usuario = sesion.obtener();
  input.value = '';

  try {
    await apiChat.enviar(chatActivo.id_chat, {
      id_usuario: usuario.id_usuario,
      contenido,
    });
    const data = await apiChat.mensajes(chatActivo.id_chat, usuario.id_usuario);
    renderizarMensajes(data.mensajes || []);
  } catch (err) {
    console.error('Error enviando mensaje:', err);
    input.value = contenido; // restaurar si falla
  }
});

// ── Archivar chat ─────────────────────────────────────────────────────────────
document.getElementById('btn-archivar')?.addEventListener('click', async () => {
  if (!chatActivo || !confirm('¿Archivar esta conversación?')) return;
  try {
    await apiChat.cambiarEstado(chatActivo.id_chat, 'archivado');
    chatActivo = null;
    document.getElementById('chat-header').querySelector('h6').textContent = 'Selecciona una conversación';
    document.getElementById('chat-subtitulo').textContent = '';
    document.getElementById('chat-acciones').classList.add('d-none');
    document.getElementById('input-area').classList.add('d-none');
    document.getElementById('mensajes-area').innerHTML =
      '<div class="text-center text-muted py-5"><i class="bi bi-chat-square display-3 opacity-25"></i></div>';
    await cargarChats();
  } catch (err) { alert(err.message); }
});

// ── Cerrar sesión ─────────────────────────────────────────────────────────────
// Mostrar enlace admin si corresponde
const _u = sesion.obtener();
if (_u?.rol === 'admin') {
  document.getElementById('link-admin')?.classList.remove('d-none');
}

document.getElementById('btn-salir')?.addEventListener('click', () => {
  sesion.cerrar();
  window.location.href = 'index.html';
});

// ── Cargar lista inicial ──────────────────────────────────────────────────────
async function cargarChats() {
  const usuario = sesion.obtener();
  try {
    const data = await apiChat.misChats(usuario.id_usuario);
    renderizarListaChats(data.chats || []);
  } catch (err) {
    document.getElementById('lista-chats').innerHTML =
      `<p class="text-danger text-center py-4 small">${err.message}</p>`;
  }
}

// ── Inicializar ───────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  if (!requiereLogin('mensajeria.html')) return;

  cargarChats().then(() => {
    // Si viene con ?id_chat=X abrir ese chat directamente
    const id_chat = new URLSearchParams(location.search).get('id_chat');
    if (id_chat) abrirChat(Number(id_chat));
  });
});