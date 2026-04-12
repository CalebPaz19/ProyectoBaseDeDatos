const API = 'http://localhost:3000/autoDrive';

// ── Sesión ────────────────────────────────────────────────────────────────────
const sesion = {
  guardar: (usuario) => localStorage.setItem('usuario', JSON.stringify(usuario)),
  obtener: () => JSON.parse(localStorage.getItem('usuario') || 'null'),
  cerrar:  () => localStorage.removeItem('usuario'),
  activa:  () => !!localStorage.getItem('usuario')
};

// ── Fetch genérico ────────────────────────────────────────────────────────────
async function apiFetch(ruta, opciones = {}) {
  try {
    const res = await fetch(`${API}${ruta}`, {
      headers: { 'Content-Type': 'application/json' },
      ...opciones
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error en el servidor');
    return data;
  } catch (err) {
    throw err;
  }
}

// ── Usuarios ──────────────────────────────────────────────────────────────────
const apiUsuarios = {
  registrar:  (body)       => apiFetch('/usuario/registro',     { method: 'POST', body: JSON.stringify(body) }),
  login:      (body)       => apiFetch('/usuario/inicioSesion', { method: 'POST', body: JSON.stringify(body) }),
  perfil:     (id)         => apiFetch(`/usuario/perfil/${id}`),
  actualizar: (id, body)   => apiFetch(`/usuario/perfil/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
};

// ── Catálogos ─────────────────────────────────────────────────────────────────
const apiCatalogos = {
  vehiculo:   ()   => apiFetch('/catalogos/vehiculo'),
  marcas:     ()   => apiFetch('/catalogos/marcas'),
  modelos:    (id) => apiFetch(`/catalogos/modelos/${id}`),
  continentes:()   => apiFetch('/catalogos/continentes'),
  paises:     (id) => apiFetch(`/catalogos/paises/${id}`),
  ciudades:   (id) => apiFetch(`/catalogos/ciudades/${id}`),
};

// ── Publicaciones ─────────────────────────────────────────────────────────────
const apiPublicaciones = {
  listar: (filtros = {}) => {
    const params = new URLSearchParams(
      Object.fromEntries(Object.entries(filtros).filter(([, v]) => v !== undefined && v !== ''))
    );
    return apiFetch(`/publicacion/listarPublicaciones?${params}`);
  },
  detalle:      (id)     => apiFetch(`/publicacion/detalles/${id}`),
  misPublicaciones: (id) => apiFetch(`/publicacion/listarSegunUsuario/${id}`),
  cambiarEstado:(id, est)=> apiFetch(`/publicacion/${id}/estado`, { method: 'PATCH', body: JSON.stringify({ estado: est }) }),
  eliminar:     (id)     => apiFetch(`/publicacion/${id}`,         { method: 'DELETE' }),

  crearCompleta: (formData) =>
    fetch(`${API}/publicacion/crear/completa`, { method: 'POST', body: formData })
      .then(r => r.json().then(d => { if (!r.ok) throw new Error(d.message); return d; })),
};

// ── Ventas ────────────────────────────────────────────────────────────────────
const apiVentas = {
  comprar:         (body)    => apiFetch('/venta/comprar',              { method: 'POST', body: JSON.stringify(body) }),
  misCompras:      (id)      => apiFetch(`/venta/misCompras/${id}`),
  misVentas:       (id)      => apiFetch(`/venta/misVentas/${id}`),
  detalle:         (id)      => apiFetch(`/venta/detalle/${id}`),
  estadoPago:      (id, est) => apiFetch(`/venta/${id}/estadoPago`,    { method: 'PATCH', body: JSON.stringify({ estado_pago: est }) }),
  estadoVenta:     (id, est, obs) => apiFetch(`/venta/${id}/estadoVenta`, { method: 'PATCH', body: JSON.stringify({ estado_venta: est, observaciones: obs }) }),
};

// ── Favoritos ─────────────────────────────────────────────────────────────────
const apiFavoritos = {
  agregar:   (id_usuario, id_publicacion) => apiFetch('/favorito/agregar', { method: 'POST', body: JSON.stringify({ id_usuario, id_publicacion }) }),
  eliminar:  (id_usuario, id_publicacion) => apiFetch(`/favorito/${id_usuario}/${id_publicacion}`, { method: 'DELETE' }),
  listar:    (id)                         => apiFetch(`/favorito/listar/${id}`),
  verificar: (id_usuario, id_pub)         => apiFetch(`/favorito/verificar/${id_usuario}/${id_pub}`),
};

// ── Reportes ──────────────────────────────────────────────────────────────────
const apiReportes = {
  crear: (body) => apiFetch('/reporte/crear', { method: 'POST', body: JSON.stringify(body) }),
};

// ── Chat ──────────────────────────────────────────────────────────────────────
const apiChat = {
  iniciar:       (body)            => apiFetch('/chat/iniciar',              { method: 'POST', body: JSON.stringify(body) }),
  enviar:        (id_chat, body)   => apiFetch(`/chat/${id_chat}/mensaje`,   { method: 'POST', body: JSON.stringify(body) }),
  mensajes:      (id_chat, id_usr) => apiFetch(`/chat/${id_chat}/mensajes?id_usuario=${id_usr}`),
  misChats:      (id)              => apiFetch(`/chat/misChats/${id}`),
  cambiarEstado: (id_chat, estado) => apiFetch(`/chat/${id_chat}/estado`,    { method: 'PATCH', body: JSON.stringify({ estado }) }),
};
