// ── Guard: solo admins ────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const usuario = sesion.obtener();
  if (!usuario) { window.location.href = 'index.html'; return; }
  if (usuario.rol !== 'admin') {
    document.getElementById('panel-admin').innerHTML =
      '<div class="alert alert-danger mt-4"><i class="bi bi-shield-x me-2"></i>Acceso denegado. Solo administradores.</div>';
    return;
  }
  cargarDashboard();
  cargarBadgeReportes();
});

document.querySelectorAll('.sidebar-link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
    link.classList.add('active');
    const s = link.dataset.seccion;
    if (s === 'dashboard')     cargarDashboard();
    if (s === 'publicaciones') cargarPublicaciones();
    if (s === 'usuarios')      cargarUsuarios();
    if (s === 'ventas')        cargarVentas();
    if (s === 'reportes')      cargarReportes();
  });
});

document.getElementById('btn-salir-admin')?.addEventListener('click', () => {
  sesion.cerrar(); window.location.href = 'index.html';
});

const panel = () => document.getElementById('panel-admin');

// ── Helpers ───────────────────────────────────────────────────────────────────
function alerta(msg, tipo = 'danger') {
  return `<div class="alert alert-${tipo} py-2 small">${msg}</div>`;
}

function badgeEstado(estado) {
  const mapa = {
    activa:     'bg-success',
    pausada:    'bg-warning text-dark',
    vendido:    'bg-primary',
    eliminada:  'bg-secondary',
    pendiente:  'bg-warning text-dark',
    revisado:   'bg-info text-dark',
    resuelto:   'bg-success',
    rechazado:  'bg-danger',
    pagado:     'bg-success',
    'en proceso': 'bg-info text-dark',
    completada: 'bg-success',
    cancelada:  'bg-danger',
  };
  return `<span class="badge ${mapa[estado] || 'bg-secondary'}">${estado}</span>`;
}

async function cargarBadgeReportes() {
  try {
    const data = await apiFetch('/admin/reportes?estado=pendiente&por_pagina=200');
    const n = data.reportes?.length || 0;
    const badge = document.getElementById('badge-reportes');
    if (n > 0) { badge.textContent = n; badge.style.display = 'inline'; }
  } catch {}
}

// ── apiFetch ──────────────────────────────────────────────────────────────────
async function apiFetch(ruta, opciones = {}) {
  const res  = await fetch(`http://localhost:3000/autoDrive${ruta}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opciones,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || data.detalle || 'Error en el servidor');
  return data;
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
async function cargarDashboard() {
  panel().innerHTML = '<div class="text-center py-5"><div class="spinner-border text-danger"></div></div>';
  try {
    const [pubs, usuarios, ventas, reportesPend, reportesTodos] = await Promise.all([
      apiFetch('/admin/publicaciones?por_pagina=200'),
      apiFetch('/admin/usuarios?por_pagina=200'),
      apiFetch('/admin/ventas?por_pagina=200'),
      apiFetch('/admin/reportes?estado=pendiente&por_pagina=200'),
      apiFetch('/admin/reportes?por_pagina=200'),
    ]);

    const totalPubs    = pubs.publicaciones?.length    || 0;
    const totalUsers   = usuarios.usuarios?.length     || 0;
    const totalVentas  = ventas.ventas?.length         || 0;
    const pendReportes = reportesPend.reportes?.length || 0;
    const totalReportes= reportesTodos.reportes?.length|| 0;

    // Contar estados de publicaciones
    const estados = { activa: 0, pausada: 0, vendido: 0, eliminada: 0 };
    pubs.publicaciones?.forEach(p => { if (estados[p.estado] !== undefined) estados[p.estado]++; });

    panel().innerHTML = `
      <h4 class="fw-bold mb-4"><i class="bi bi-grid me-2"></i>Dashboard</h4>

      <div class="row g-3 mb-4">
        <div class="col-sm-6 col-xl-3">
          <div class="card border-0 shadow-sm text-center p-3 card-hover" style="cursor:pointer"
               onclick="document.querySelector('[data-seccion=publicaciones]').click()">
            <i class="bi bi-car-front display-5 text-primary mb-2"></i>
            <h3 class="fw-bold mb-0">${totalPubs}</h3>
            <p class="text-muted small mb-2">Publicaciones totales</p>
            <div class="d-flex justify-content-center gap-1 flex-wrap">
              <span class="badge bg-success small">${estados.activa} activas</span>
              <span class="badge bg-warning text-dark small">${estados.pausada} pausadas</span>
              <span class="badge bg-secondary small">${estados.eliminada} eliminadas</span>
            </div>
          </div>
        </div>
        <div class="col-sm-6 col-xl-3">
          <div class="card border-0 shadow-sm text-center p-3 card-hover" style="cursor:pointer"
               onclick="document.querySelector('[data-seccion=usuarios]').click()">
            <i class="bi bi-people display-5 text-success mb-2"></i>
            <h3 class="fw-bold mb-0">${totalUsers}</h3>
            <p class="text-muted small mb-0">Usuarios registrados</p>
          </div>
        </div>
        <div class="col-sm-6 col-xl-3">
          <div class="card border-0 shadow-sm text-center p-3 card-hover" style="cursor:pointer"
               onclick="document.querySelector('[data-seccion=ventas]').click()">
            <i class="bi bi-cash-stack display-5 text-warning mb-2"></i>
            <h3 class="fw-bold mb-0">${totalVentas}</h3>
            <p class="text-muted small mb-0">Ventas registradas</p>
          </div>
        </div>
        <div class="col-sm-6 col-xl-3">
          <div class="card border-0 shadow-sm text-center p-3 card-hover" style="cursor:pointer"
               onclick="document.querySelector('[data-seccion=reportes]').click()">
            <i class="bi bi-flag display-5 text-danger mb-2"></i>
            <h3 class="fw-bold mb-0 text-danger">${pendReportes}</h3>
            <p class="text-muted small mb-1">Reportes pendientes</p>
            <small class="text-muted">${totalReportes} en total</small>
          </div>
        </div>
      </div>

      <!-- Últimos reportes pendientes -->
      ${pendReportes > 0 ? `
      <div class="card border-0 shadow-sm">
        <div class="card-header bg-danger text-white d-flex justify-content-between">
          <span class="fw-bold"><i class="bi bi-exclamation-triangle me-2"></i>Reportes pendientes de revisión</span>
          <button class="btn btn-sm btn-outline-light" onclick="document.querySelector('[data-seccion=reportes]').click()">
            Ver todos →
          </button>
        </div>
        <div class="card-body p-2">
          ${reportesPend.reportes.slice(0,3).map(r => `
            <div class="d-flex align-items-center justify-content-between border-bottom py-2 px-2">
              <div>
                <span class="fw-bold small">${r.motivo}</span>
                <small class="text-muted d-block">
                  ${r.reporta_nombre} ${r.reporta_apellido}
                  ${r.publicacion_titulo ? ` → "${r.publicacion_titulo}"` : ''}
                </small>
              </div>
              <small class="text-muted">${new Date(r.fecha_reporte).toLocaleDateString('es-HN')}</small>
            </div>`).join('')}
        </div>
      </div>` : `
      <div class="alert alert-success">
        <i class="bi bi-check-circle me-2"></i>No hay reportes pendientes.
      </div>`}`;
  } catch (err) {
    panel().innerHTML = alerta(err.message);
  }
}

// ── Publicaciones (admin) — con buscador y filtro de estado ───────────────────
let filtroEstadoPub = '';
let filtroBusqueda  = '';

async function cargarPublicaciones(estado, busqueda) {
  if (estado   !== undefined) filtroEstadoPub = estado;
  if (busqueda !== undefined) filtroBusqueda  = busqueda;

  panel().innerHTML = '<div class="text-center py-5"><div class="spinner-border text-danger"></div></div>';

  try {
    const params = new URLSearchParams({ por_pagina: '200' });
    if (filtroEstadoPub) params.set('estado',   filtroEstadoPub);
    if (filtroBusqueda)  params.set('busqueda', filtroBusqueda);

    const data = await apiFetch(`/admin/publicaciones?${params}`);
    const pubs = data.publicaciones || [];

    panel().innerHTML = `
      <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h4 class="fw-bold mb-0">
          <i class="bi bi-car-front me-2"></i>Publicaciones
          <span class="badge bg-secondary ms-1">${pubs.length}</span>
        </h4>
        <div class="d-flex gap-2 flex-wrap align-items-center">
          <input type="text" class="form-control form-control-sm" id="input-busqueda-pub"
                 placeholder="Buscar por título, marca, modelo..." style="width:240px"
                 value="${filtroBusqueda}"
                 onkeydown="if(event.key==='Enter') cargarPublicaciones(undefined, this.value)">
          <button class="btn btn-sm btn-primary" onclick="cargarPublicaciones(undefined, document.getElementById('input-busqueda-pub').value)">
            <i class="bi bi-search"></i>
          </button>
          ${['', 'activa', 'pausada', 'vendido', 'eliminada'].map(e =>
            `<button class="btn btn-sm ${filtroEstadoPub === e ? 'btn-dark' : 'btn-outline-secondary'}"
                     onclick="cargarPublicaciones('${e}', undefined)">${e || 'Todas'}</button>`
          ).join('')}
        </div>
      </div>

      ${!pubs.length ? '<div class="alert alert-info">No se encontraron publicaciones con esos filtros.</div>' : ''}

      <div class="table-responsive">
        <table class="table table-hover align-middle small">
          <thead class="table-dark">
            <tr>
              <th>ID</th>
              <th>Imagen</th>
              <th>Título / Vehículo</th>
              <th>Vendedor</th>
              <th>Precio</th>
              <th>Estado</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${pubs.map(p => `
              <tr>
                <td class="text-muted">${p.id_publicacion}</td>
                <td>
                  <img src="${p.imagen_principal || 'https://placehold.co/60x45/e9ecef/6c757d?text=—'}"
                       style="width:60px;height:45px;object-fit:cover;border-radius:4px"
                       onerror="this.src='https://placehold.co/60x45/e9ecef/6c757d?text=—'">
                </td>
                <td>
                  <a href="detalle.html?id=${p.id_publicacion}" target="_blank"
                     class="fw-bold text-decoration-none">${p.titulo}</a><br>
                  <small class="text-muted">${p.marca || '—'} ${p.modelo || ''} ${p.año || ''}</small>
                </td>
                <td>${p.vendedor_nombre || '—'} ${p.vendedor_apellido || ''}</td>
                <td class="fw-bold text-success">$${Number(p.precio).toLocaleString()}</td>
                <td>${badgeEstado(p.estado)}</td>
                <td>${new Date(p.fecha_publicacion).toLocaleDateString('es-HN')}</td>
                <td>
                  <div class="btn-group btn-group-sm">
                    ${p.estado !== 'activa'    ? `<button class="btn btn-outline-success" title="Activar"  onclick="cambiarEstadoPub(${p.id_publicacion},'activa')"><i class="bi bi-check-circle"></i></button>` : ''}
                    ${p.estado !== 'pausada'   ? `<button class="btn btn-outline-warning" title="Pausar"   onclick="cambiarEstadoPub(${p.id_publicacion},'pausada')"><i class="bi bi-pause-circle"></i></button>` : ''}
                    ${p.estado !== 'eliminada' ? `<button class="btn btn-outline-danger"  title="Eliminar" onclick="cambiarEstadoPub(${p.id_publicacion},'eliminada')"><i class="bi bi-trash"></i></button>` : ''}
                    <a href="detalle.html?id=${p.id_publicacion}" target="_blank"
                       class="btn btn-outline-secondary" title="Ver detalle">
                      <i class="bi bi-eye"></i>
                    </a>
                  </div>
                </td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>`;
  } catch (err) { panel().innerHTML = alerta(err.message); }
}

async function cambiarEstadoPub(id, estado) {
  if (estado === 'eliminada' && !confirm('¿Eliminar esta publicación?')) return;
  try {
    await apiFetch(`/admin/publicaciones/${id}/estado`, {
      method: 'PATCH',
      body: JSON.stringify({ estado }),
    });
    cargarPublicaciones();
  } catch (err) { alert(err.message); }
}

// ── Usuarios (admin) ──────────────────────────────────────────────────────────
async function cargarUsuarios(estado_cuenta = '') {
  panel().innerHTML = '<div class="text-center py-5"><div class="spinner-border text-danger"></div></div>';
  try {
    const url  = estado_cuenta
      ? `/admin/usuarios?estado_cuenta=${estado_cuenta}&por_pagina=200`
      : '/admin/usuarios?por_pagina=200';
    const data = await apiFetch(url);
    const users = data.usuarios || [];

    panel().innerHTML = `
      <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h4 class="fw-bold mb-0">
          <i class="bi bi-people me-2"></i>Usuarios
          <span class="badge bg-secondary ms-1">${users.length}</span>
        </h4>
        <div class="d-flex gap-2 flex-wrap">
          ${['', 'activa', 'suspendida', 'bloqueada'].map(e =>
            `<button class="btn btn-sm ${estado_cuenta === e ? 'btn-dark' : 'btn-outline-secondary'}"
                     onclick="cargarUsuarios('${e}')">${e || 'Todos'}</button>`
          ).join('')}
        </div>
      </div>
      <div class="table-responsive">
        <table class="table table-hover align-middle small">
          <thead class="table-dark">
            <tr><th>ID</th><th>Nombre</th><th>Correo</th><th>Teléfono</th><th>Rol</th><th>Estado</th><th>Registro</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            ${users.map(u => `
              <tr>
                <td class="text-muted">${u.id_usuario}</td>
                <td class="fw-bold">${u.nombre1} ${u.apellido1}</td>
                <td>${u.correo}</td>
                <td>${u.telefono || '—'}</td>
                <td><span class="badge ${u.rol === 'admin' ? 'bg-danger' : 'bg-primary'}">${u.rol}</span></td>
                <td>${badgeEstado(u.estado_cuenta)}</td>
                <td>${new Date(u.fecha_registro).toLocaleDateString('es-HN')}</td>
                <td>
                  <div class="btn-group btn-group-sm">
                    ${u.estado_cuenta !== 'activa'     ? `<button class="btn btn-outline-success" title="Activar"   onclick="cambiarEstadoUsuario(${u.id_usuario},'activa')">    <i class="bi bi-check-circle"></i></button>` : ''}
                    ${u.estado_cuenta !== 'suspendida' ? `<button class="btn btn-outline-warning" title="Suspender" onclick="cambiarEstadoUsuario(${u.id_usuario},'suspendida')"><i class="bi bi-pause-circle"></i></button>` : ''}
                    ${u.estado_cuenta !== 'bloqueada'  ? `<button class="btn btn-outline-danger"  title="Bloquear"  onclick="cambiarEstadoUsuario(${u.id_usuario},'bloqueada')"> <i class="bi bi-lock"></i></button>` : ''}
                  </div>
                </td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>`;
  } catch (err) { panel().innerHTML = alerta(err.message); }
}

async function cambiarEstadoUsuario(id, estado) {
  if (!confirm(`¿Marcar cuenta como "${estado}"?`)) return;
  try {
    await apiFetch(`/admin/usuarios/${id}/estado`, {
      method: 'PATCH',
      body: JSON.stringify({ estado_cuenta: estado }),
    });
    cargarUsuarios();
  } catch (err) { alert(err.message); }
}

// ── Ventas (admin) ────────────────────────────────────────────────────────────
async function cargarVentas(filtro = '') {
  panel().innerHTML = '<div class="text-center py-5"><div class="spinner-border text-danger"></div></div>';
  try {
    const url = filtro ? `/admin/ventas?estado_venta=${filtro}&por_pagina=200` : '/admin/ventas?por_pagina=200';
    const data  = await apiFetch(url);
    const ventas = data.ventas || [];

    panel().innerHTML = `
      <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h4 class="fw-bold mb-0">
          <i class="bi bi-cash-stack me-2"></i>Ventas
          <span class="badge bg-secondary ms-1">${ventas.length}</span>
        </h4>
        <div class="d-flex gap-2 flex-wrap">
          ${['', 'en proceso', 'completada', 'cancelada'].map(e =>
            `<button class="btn btn-sm ${filtro === e ? 'btn-dark' : 'btn-outline-secondary'}"
                     onclick="cargarVentas('${e}')">${e || 'Todas'}</button>`
          ).join('')}
        </div>
      </div>
      <div class="table-responsive">
        <table class="table table-hover align-middle small">
          <thead class="table-dark">
            <tr><th>ID</th><th>Vehículo</th><th>Vendedor</th><th>Comprador</th><th>Monto</th><th>Pago</th><th>Venta</th><th>Fecha</th></tr>
          </thead>
          <tbody>
            ${ventas.map(v => `
              <tr>
                <td class="text-muted">${v.id_venta}</td>
                <td>${v.titulo}<br><small class="text-muted">${v.marca} ${v.modelo}</small></td>
                <td>${v.vendedor_nombre} ${v.vendedor_apellido}</td>
                <td>${v.comprador_nombre} ${v.comprador_apellido}</td>
                <td class="fw-bold text-success">$${Number(v.monto).toLocaleString()}</td>
                <td>${badgeEstado(v.estado_pago)}</td>
                <td>${badgeEstado(v.estado_venta)}</td>
                <td>${new Date(v.fecha_venta).toLocaleDateString('es-HN')}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>`;
  } catch (err) { panel().innerHTML = alerta(err.message); }
}

// ── Reportes (admin) — con detalle inline de la publicación ──────────────────
async function cargarReportes(estado = '') {
  panel().innerHTML = '<div class="text-center py-5"><div class="spinner-border text-danger"></div></div>';
  try {
    const url  = estado
      ? `/admin/reportes?estado=${estado}&por_pagina=200`
      : '/admin/reportes?por_pagina=200';
    const data    = await apiFetch(url);
    const reportes = data.reportes || [];

    panel().innerHTML = `
      <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h4 class="fw-bold mb-0">
          <i class="bi bi-flag me-2"></i>Reportes
          <span class="badge bg-secondary ms-1">${reportes.length}</span>
        </h4>
        <div class="d-flex gap-2 flex-wrap">
          ${['', 'pendiente', 'revisado', 'resuelto', 'rechazado'].map(e =>
            `<button class="btn btn-sm ${estado === e ? 'btn-dark' : 'btn-outline-secondary'}"
                     onclick="cargarReportes('${e}')">${e || 'Todos'}</button>`
          ).join('')}
        </div>
      </div>

      ${!reportes.length
        ? '<div class="alert alert-success"><i class="bi bi-check-circle me-2"></i>No hay reportes con ese estado.</div>'
        : ''}

      <div id="lista-reportes">
        ${reportes.map(r => `
          <div class="card border-0 shadow-sm mb-3" id="reporte-${r.id_reporte}">
            <div class="card-body">

              <!-- Cabecera del reporte -->
              <div class="d-flex justify-content-between align-items-start mb-3">
                <div class="d-flex align-items-center gap-2">
                  ${badgeEstado(r.estado)}
                  <strong class="fs-6">${r.motivo}</strong>
                </div>
                <small class="text-muted flex-shrink-0">
                  #${r.id_reporte} · ${new Date(r.fecha_reporte).toLocaleDateString('es-HN')}
                </small>
              </div>

              <div class="row g-3">
                <!-- Quien reporta -->
                <div class="col-md-4">
                  <div class="bg-light rounded p-2">
                    <p class="text-muted small mb-1 fw-bold"><i class="bi bi-person-fill me-1"></i>Reportado por</p>
                    <p class="mb-0 fw-bold">${r.reporta_nombre} ${r.reporta_apellido}</p>
                    <p class="mb-0 text-muted small">${r.reporta_correo}</p>
                  </div>
                </div>

                <!-- Usuario reportado (si aplica) -->
                ${r.reportado_nombre ? `
                <div class="col-md-4">
                  <div class="bg-light rounded p-2">
                    <p class="text-muted small mb-1 fw-bold"><i class="bi bi-person-x me-1"></i>Usuario reportado</p>
                    <p class="mb-0 fw-bold">${r.reportado_nombre} ${r.reportado_apellido}</p>
                  </div>
                </div>` : ''}

                <!-- Descripción -->
                ${r.descripcion ? `
                <div class="col-12">
                  <div class="bg-light rounded p-2">
                    <p class="text-muted small mb-1 fw-bold"><i class="bi bi-chat-text me-1"></i>Descripción del reporte</p>
                    <p class="mb-0">${r.descripcion}</p>
                  </div>
                </div>` : ''}

                <!-- Publicación reportada — con card de vista previa -->
                ${r.id_publicacion ? `
                <div class="col-12">
                  <div class="border border-warning rounded p-2">
                    <p class="text-muted small mb-2 fw-bold">
                      <i class="bi bi-car-front me-1 text-warning"></i>Publicación reportada
                    </p>
                    <div class="d-flex align-items-center gap-3">
                      <div id="thumb-pub-${r.id_reporte}" class="flex-shrink-0">
                        <div class="bg-secondary rounded" style="width:80px;height:60px"></div>
                      </div>
                      <div class="flex-grow-1">
                        <p class="fw-bold mb-0">${r.publicacion_titulo || 'Cargando...'}</p>
                        <p class="text-muted small mb-1" id="info-pub-${r.id_reporte}">ID: ${r.id_publicacion}</p>
                        <div class="d-flex gap-2 flex-wrap">
                          <a href="detalle.html?id=${r.id_publicacion}" target="_blank"
                             class="btn btn-outline-dark btn-sm">
                            <i class="bi bi-eye me-1"></i>Ver publicación
                          </a>
                          <button class="btn btn-outline-secondary btn-sm"
                                  onclick="cargarPreviewPub(${r.id_publicacion}, ${r.id_reporte})">
                            <i class="bi bi-card-text me-1"></i>Ver detalles aquí
                          </button>
                        </div>
                      </div>
                    </div>
                    <!-- Preview expandible -->
                    <div id="preview-pub-${r.id_reporte}" class="mt-2" style="display:none"></div>
                  </div>
                </div>` : ''}
              </div>

              <!-- Acciones -->
              ${r.estado === 'pendiente' || r.estado === 'revisado' ? `
              <div class="border-top mt-3 pt-3 d-flex gap-2 flex-wrap">
                ${r.estado === 'pendiente' ? `
                <button class="btn btn-sm btn-outline-secondary"
                        onclick="gestionarReporte(${r.id_reporte},'revisado',false,false)">
                  <i class="bi bi-eye me-1"></i>Marcar Revisado
                </button>` : ''}
                <button class="btn btn-sm btn-success"
                        onclick="gestionarReporte(${r.id_reporte},'resuelto',false,false)">
                  <i class="bi bi-check me-1"></i>Resolver sin acción
                </button>
                ${r.id_publicacion ? `
                <button class="btn btn-sm btn-warning"
                        onclick="gestionarReporte(${r.id_reporte},'resuelto',false,true)">
                  <i class="bi bi-trash me-1"></i>Resolver + Eliminar publicación
                </button>` : ''}
                ${r.reportado_nombre ? `
                <button class="btn btn-sm btn-danger"
                        onclick="gestionarReporte(${r.id_reporte},'resuelto',true,${!!r.id_publicacion})">
                  <i class="bi bi-person-x me-1"></i>Resolver + Suspender usuario
                </button>` : ''}
                <button class="btn btn-sm btn-outline-danger"
                        onclick="gestionarReporte(${r.id_reporte},'rechazado',false,false)">
                  <i class="bi bi-x me-1"></i>Rechazar reporte
                </button>
              </div>` : ''}

            </div>
          </div>`).join('')}
      </div>`;

    // Cargar imagen principal de cada publicación reportada en segundo plano
    reportes.filter(r => r.id_publicacion).forEach(r => cargarThumbPub(r.id_publicacion, r.id_reporte));

  } catch (err) { panel().innerHTML = alerta(err.message); }
}

// Carga la imagen miniatura de la publicación en el reporte
async function cargarThumbPub(id_pub, id_reporte) {
  try {
    const data = await apiFetch(`/publicacion/detalles/${id_pub}`);
    const thumb = document.getElementById(`thumb-pub-${id_reporte}`);
    const info  = document.getElementById(`info-pub-${id_reporte}`);
    if (thumb && data) {
      const img = data.imagenes?.[0]?.url_imagen;
      thumb.innerHTML = `<img src="${img || 'https://placehold.co/80x60/e9ecef/6c757d?text=—'}"
        style="width:80px;height:60px;object-fit:cover;border-radius:4px"
        onerror="this.src='https://placehold.co/80x60/e9ecef/6c757d?text=—'">`;
    }
    if (info && data) {
      info.textContent = `$${Number(data.precio).toLocaleString()} · ${data.marca} ${data.modelo} ${data.año} · ${badgeEstado(data.estado).replace(/<[^>]*>/g, '')}`;
    }
  } catch {}
}

// Muestra un preview inline expandible de la publicación
async function cargarPreviewPub(id_pub, id_reporte) {
  const container = document.getElementById(`preview-pub-${id_reporte}`);
  if (!container) return;

  if (container.style.display !== 'none') {
    container.style.display = 'none';
    return;
  }

  container.style.display = 'block';
  container.innerHTML = '<div class="text-center py-2"><div class="spinner-border spinner-border-sm text-secondary"></div></div>';

  try {
    const p = await apiFetch(`/publicacion/detalles/${id_pub}`);
    container.innerHTML = `
      <div class="row g-2 small mt-1 pt-2 border-top">
        <div class="col-6 col-md-3"><strong>Precio</strong><br><span class="text-success">$${Number(p.precio).toLocaleString()}</span></div>
        <div class="col-6 col-md-3"><strong>Estado</strong><br>${badgeEstado(p.estado)}</div>
        <div class="col-6 col-md-3"><strong>Vehículo</strong><br>${p.marca} ${p.modelo} ${p.año}</div>
        <div class="col-6 col-md-3"><strong>Vendedor</strong><br>${p.vendedor_nombre} ${p.vendedor_apellido}</div>
        <div class="col-6 col-md-3"><strong>VIN</strong><br><code>${p.vin || 'N/D'}</code></div>
        <div class="col-6 col-md-3"><strong>Placa</strong><br>${p.placa || 'N/D'}</div>
        <div class="col-6 col-md-3"><strong>Kilometraje</strong><br>${p.kilometraje ? p.kilometraje.toLocaleString()+' km' : 'N/D'}</div>
        <div class="col-6 col-md-3"><strong>Ciudad</strong><br>${p.ciudad || 'N/D'}</div>
        ${p.descripcion ? `<div class="col-12"><strong>Descripción</strong><br>${p.descripcion}</div>` : ''}
        ${p.imagenes?.length ? `
        <div class="col-12">
          <strong>Imágenes (${p.imagenes.length})</strong><br>
          <div class="d-flex gap-2 mt-1 flex-wrap">
            ${p.imagenes.map(i => `<img src="${i.url_imagen}" style="width:80px;height:60px;object-fit:cover;border-radius:4px">`).join('')}
          </div>
        </div>` : ''}
      </div>`;
  } catch (err) {
    container.innerHTML = `<div class="alert alert-warning small py-1 mt-2">${err.message}</div>`;
  }
}

async function gestionarReporte(id, estado, suspender, eliminarPub) {
  try {
    await apiFetch(`/admin/reportes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        estado,
        suspender_usuario:    suspender,
        eliminar_publicacion: eliminarPub,
      }),
    });
    cargarReportes();
    cargarBadgeReportes();
  } catch (err) { alert(err.message); }
}
