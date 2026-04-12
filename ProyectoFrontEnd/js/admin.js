// ── Guard: solo admins ────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const usuario = sesion.obtener();
  if (!usuario) { window.location.href = 'index.html'; return; }
  if (usuario.rol !== 'admin') {
    document.getElementById('panel-admin').innerHTML =
      '<div class="alert alert-danger mt-4">Acceso denegado. Solo administradores.</div>';
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
function alerta(msg, tipo='danger') {
  return `<div class="alert alert-${tipo} py-2 small">${msg}</div>`;
}

async function cargarBadgeReportes() {
  try {
    const filtros = {};
    filtros.estado = 'pendiente';
    const data = await fetch(`http://localhost:3000/autoDrive/admin/reportes?estado=pendiente`)
      .then(r => r.json());
    const n = data.reportes?.length || 0;
    const badge = document.getElementById('badge-reportes');
    if (n > 0) { badge.textContent = n; badge.style.display = 'inline'; }
  } catch {}
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
async function cargarDashboard() {
  panel().innerHTML = '<div class="text-center py-5"><div class="spinner-border text-danger"></div></div>';
  try {
    const [pubs, usuarios, ventas, reportes] = await Promise.all([
      apiFetch('/admin/publicaciones?por_pagina=1'),
      apiFetch('/admin/usuarios?por_pagina=1'),
      apiFetch('/admin/ventas?por_pagina=1'),
      apiFetch('/admin/reportes?estado=pendiente&por_pagina=100'),
    ]);

    panel().innerHTML = `
      <h4 class="fw-bold mb-4">Dashboard</h4>
      <div class="row g-3 mb-4">
        <div class="col-sm-6 col-xl-3">
          <div class="card border-0 shadow-sm text-center p-3 card-hover" style="cursor:pointer"
               onclick="document.querySelector('[data-seccion=publicaciones]').click()">
            <i class="bi bi-car-front display-5 text-primary mb-2"></i>
            <h5 class="fw-bold">${pubs.publicaciones?.length ?? '—'}</h5>
            <p class="text-muted small mb-0">Publicaciones</p>
          </div>
        </div>
        <div class="col-sm-6 col-xl-3">
          <div class="card border-0 shadow-sm text-center p-3 card-hover" style="cursor:pointer"
               onclick="document.querySelector('[data-seccion=usuarios]').click()">
            <i class="bi bi-people display-5 text-success mb-2"></i>
            <h5 class="fw-bold">${usuarios.usuarios?.length ?? '—'}</h5>
            <p class="text-muted small mb-0">Usuarios</p>
          </div>
        </div>
        <div class="col-sm-6 col-xl-3">
          <div class="card border-0 shadow-sm text-center p-3 card-hover" style="cursor:pointer"
               onclick="document.querySelector('[data-seccion=ventas]').click()">
            <i class="bi bi-cash-stack display-5 text-warning mb-2"></i>
            <h5 class="fw-bold">${ventas.ventas?.length ?? '—'}</h5>
            <p class="text-muted small mb-0">Ventas</p>
          </div>
        </div>
        <div class="col-sm-6 col-xl-3">
          <div class="card border-0 shadow-sm text-center p-3 card-hover" style="cursor:pointer"
               onclick="document.querySelector('[data-seccion=reportes]').click()">
            <i class="bi bi-flag display-5 text-danger mb-2"></i>
            <h5 class="fw-bold">${reportes.reportes?.length ?? 0}</h5>
            <p class="text-muted small mb-0">Reportes pendientes</p>
          </div>
        </div>
      </div>
      <div class="alert alert-info small">
        <i class="bi bi-info-circle me-2"></i>
        Haz clic en cualquier tarjeta para ir a esa sección.
      </div>`;
  } catch (err) {
    panel().innerHTML = alerta(err.message);
  }
}

// ── Publicaciones (admin) ─────────────────────────────────────────────────────
async function cargarPublicaciones(estado = '') {
  panel().innerHTML = '<div class="text-center py-5"><div class="spinner-border text-danger"></div></div>';
  try {
    const url = estado ? `/admin/publicaciones?estado=${estado}` : '/admin/publicaciones';
    const data = await apiFetch(url);
    const pubs = data.publicaciones || [];

    panel().innerHTML = `
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h4 class="fw-bold mb-0">Publicaciones <span class="badge bg-secondary">${pubs.length}</span></h4>
        <div class="d-flex gap-2">
          ${['','activa','pausada','vendido','eliminada'].map(e =>
            `<button class="btn btn-sm ${estado===e?'btn-dark':'btn-outline-secondary'}"
                     onclick="cargarPublicaciones('${e}')">${e||'Todas'}</button>`
          ).join('')}
        </div>
      </div>
      <div class="table-responsive">
        <table class="table table-hover align-middle small">
          <thead class="table-dark">
            <tr><th>ID</th><th>Título</th><th>Vendedor</th><th>Precio</th><th>Estado</th><th>Fecha</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            ${pubs.map(p => `
              <tr>
                <td>${p.id_publicacion}</td>
                <td>
                  <a href="detalle.html?id=${p.id_publicacion}" target="_blank" class="text-decoration-none fw-bold">
                    ${p.titulo}
                  </a><br>
                  <span class="text-muted">${p.marca} ${p.modelo} ${p.año}</span>
                </td>
                <td>${p.vendedor_nombre} ${p.vendedor_apellido}</td>
                <td class="text-success fw-bold">$${Number(p.precio).toLocaleString()}</td>
                <td>
                  <span class="badge ${
                    p.estado==='activa'?'bg-success':
                    p.estado==='pausada'?'bg-warning text-dark':
                    p.estado==='vendido'?'bg-primary':'bg-secondary'
                  }">${p.estado}</span>
                </td>
                <td>${new Date(p.fecha_publicacion).toLocaleDateString('es-HN')}</td>
                <td>
                  <div class="btn-group btn-group-sm">
                    ${p.estado!=='activa'   ? `<button class="btn btn-outline-success" onclick="cambiarEstadoPub(${p.id_publicacion},'activa')"   title="Activar"><i class="bi bi-check-circle"></i></button>`:''}
                    ${p.estado!=='pausada'  ? `<button class="btn btn-outline-warning" onclick="cambiarEstadoPub(${p.id_publicacion},'pausada')"  title="Pausar"><i class="bi bi-pause-circle"></i></button>`:''}
                    ${p.estado!=='eliminada'? `<button class="btn btn-outline-danger"  onclick="cambiarEstadoPub(${p.id_publicacion},'eliminada')" title="Eliminar"><i class="bi bi-trash"></i></button>`:''}
                  </div>
                </td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>`;
  } catch (err) { panel().innerHTML = alerta(err.message); }
}

async function cambiarEstadoPub(id, estado) {
  const confirmar = estado === 'eliminada' ? confirm('¿Eliminar esta publicación?') : true;
  if (!confirmar) return;
  try {
    await apiFetch(`/admin/publicaciones/${id}/estado`, { method: 'PATCH', body: JSON.stringify({ estado }) });
    cargarPublicaciones();
  } catch (err) { alert(err.message); }
}

// ── Usuarios (admin) ──────────────────────────────────────────────────────────
async function cargarUsuarios(estado_cuenta = '') {
  panel().innerHTML = '<div class="text-center py-5"><div class="spinner-border text-danger"></div></div>';
  try {
    const url  = estado_cuenta ? `/admin/usuarios?estado_cuenta=${estado_cuenta}` : '/admin/usuarios';
    const data = await apiFetch(url);
    const users = data.usuarios || [];

    panel().innerHTML = `
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h4 class="fw-bold mb-0">Usuarios <span class="badge bg-secondary">${users.length}</span></h4>
        <div class="d-flex gap-2">
          ${['','activa','suspendida','bloqueada'].map(e =>
            `<button class="btn btn-sm ${estado_cuenta===e?'btn-dark':'btn-outline-secondary'}"
                     onclick="cargarUsuarios('${e}')">${e||'Todos'}</button>`
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
                <td>${u.id_usuario}</td>
                <td class="fw-bold">${u.nombre1} ${u.apellido1}</td>
                <td>${u.correo}</td>
                <td>${u.telefono||'—'}</td>
                <td><span class="badge ${u.rol==='admin'?'bg-danger':'bg-primary'}">${u.rol}</span></td>
                <td>
                  <span class="badge ${
                    u.estado_cuenta==='activa'?'bg-success':
                    u.estado_cuenta==='suspendida'?'bg-warning text-dark':'bg-danger'
                  }">${u.estado_cuenta}</span>
                </td>
                <td>${new Date(u.fecha_registro).toLocaleDateString('es-HN')}</td>
                <td>
                  <div class="btn-group btn-group-sm">
                    ${u.estado_cuenta!=='activa'     ? `<button class="btn btn-outline-success" title="Activar"    onclick="cambiarEstadoUsuario(${u.id_usuario},'activa')">       <i class="bi bi-check-circle"></i></button>`:''}
                    ${u.estado_cuenta!=='suspendida' ? `<button class="btn btn-outline-warning" title="Suspender"  onclick="cambiarEstadoUsuario(${u.id_usuario},'suspendida')">   <i class="bi bi-pause-circle"></i></button>`:''}
                    ${u.estado_cuenta!=='bloqueada'  ? `<button class="btn btn-outline-danger"  title="Bloquear"   onclick="cambiarEstadoUsuario(${u.id_usuario},'bloqueada')">   <i class="bi bi-lock"></i></button>`:''}
                  </div>
                </td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>`;
  } catch (err) { panel().innerHTML = alerta(err.message); }
}

async function cambiarEstadoUsuario(id, estado) {
  if (!confirm(`¿${estado} esta cuenta?`)) return;
  try {
    await apiFetch(`/admin/usuarios/${id}/estado`, { method: 'PATCH', body: JSON.stringify({ estado_cuenta: estado }) });
    cargarUsuarios();
  } catch (err) { alert(err.message); }
}

// ── Ventas (admin) ────────────────────────────────────────────────────────────
async function cargarVentas() {
  panel().innerHTML = '<div class="text-center py-5"><div class="spinner-border text-danger"></div></div>';
  try {
    const data  = await apiFetch('/admin/ventas?por_pagina=50');
    const ventas = data.ventas || [];

    panel().innerHTML = `
      <h4 class="fw-bold mb-3">Ventas <span class="badge bg-secondary">${ventas.length}</span></h4>
      <div class="table-responsive">
        <table class="table table-hover align-middle small">
          <thead class="table-dark">
            <tr><th>ID</th><th>Vehículo</th><th>Vendedor</th><th>Comprador</th><th>Monto</th><th>Pago</th><th>Venta</th><th>Fecha</th></tr>
          </thead>
          <tbody>
            ${ventas.map(v => `
              <tr>
                <td>${v.id_venta}</td>
                <td class="fw-bold">${v.titulo}<br><small class="text-muted">${v.marca} ${v.modelo}</small></td>
                <td>${v.vendedor_nombre} ${v.vendedor_apellido}</td>
                <td>${v.comprador_nombre} ${v.comprador_apellido}</td>
                <td class="text-success fw-bold">$${Number(v.monto).toLocaleString()}</td>
                <td><span class="badge ${v.estado_pago==='pagado'?'bg-success':v.estado_pago==='rechazado'?'bg-danger':'bg-warning text-dark'}">${v.estado_pago}</span></td>
                <td><span class="badge bg-secondary">${v.estado_venta}</span></td>
                <td>${new Date(v.fecha_venta).toLocaleDateString('es-HN')}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>`;
  } catch (err) { panel().innerHTML = alerta(err.message); }
}

// ── Reportes (admin) ──────────────────────────────────────────────────────────
async function cargarReportes(estado = 'pendiente') {
  panel().innerHTML = '<div class="text-center py-5"><div class="spinner-border text-danger"></div></div>';
  try {
    const url  = `/admin/reportes?estado=${estado}&por_pagina=50`;
    const data = await apiFetch(url);
    const reportes = data.reportes || [];

    panel().innerHTML = `
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h4 class="fw-bold mb-0">Reportes <span class="badge bg-secondary">${reportes.length}</span></h4>
        <div class="d-flex gap-2">
          ${['pendiente','revisado','resuelto','rechazado'].map(e =>
            `<button class="btn btn-sm ${estado===e?'btn-dark':'btn-outline-secondary'}"
                     onclick="cargarReportes('${e}')">${e}</button>`
          ).join('')}
        </div>
      </div>
      ${!reportes.length ? '<p class="text-muted">No hay reportes con ese estado.</p>' : ''}
      <div id="lista-reportes">
        ${reportes.map(r => `
          <div class="card border-0 shadow-sm mb-3">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <span class="badge ${
                    r.estado==='pendiente'?'bg-warning text-dark':
                    r.estado==='resuelto' ?'bg-success':
                    r.estado==='rechazado'?'bg-danger':'bg-secondary'
                  } me-2">${r.estado}</span>
                  <strong>${r.motivo}</strong>
                </div>
                <small class="text-muted">${new Date(r.fecha_reporte).toLocaleDateString('es-HN')}</small>
              </div>

              <div class="row g-3 small">
                <div class="col-md-4">
                  <p class="text-muted mb-0">Reportado por</p>
                  <p class="mb-0 fw-bold">${r.reporta_nombre} ${r.reporta_apellido}</p>
                  <p class="mb-0 text-muted">${r.reporta_correo}</p>
                </div>
                ${r.reportado_nombre ? `
                <div class="col-md-4">
                  <p class="text-muted mb-0">Usuario reportado</p>
                  <p class="mb-0 fw-bold">${r.reportado_nombre} ${r.reportado_apellido}</p>
                </div>` : ''}
                ${r.publicacion_titulo ? `
                <div class="col-md-4">
                  <p class="text-muted mb-0">Publicación</p>
                  <a href="detalle.html?id=${r.id_publicacion}" target="_blank" class="fw-bold text-decoration-none">
                    ${r.publicacion_titulo}
                  </a>
                </div>` : ''}
                ${r.descripcion ? `
                <div class="col-12">
                  <p class="text-muted mb-1">Descripción</p>
                  <p class="mb-0 bg-light rounded p-2">${r.descripcion}</p>
                </div>` : ''}
              </div>

              ${r.estado === 'pendiente' ? `
              <div class="border-top mt-3 pt-3 d-flex gap-2 flex-wrap">
                <button class="btn btn-sm btn-outline-secondary"
                        onclick="gestionarReporte(${r.id_reporte},'revisado',false,false)">
                  <i class="bi bi-eye me-1"></i>Marcar Revisado
                </button>
                <button class="btn btn-sm btn-success"
                        onclick="gestionarReporte(${r.id_reporte},'resuelto',false,false)">
                  <i class="bi bi-check me-1"></i>Resolver
                </button>
                ${r.id_publicacion ? `
                <button class="btn btn-sm btn-warning"
                        onclick="gestionarReporte(${r.id_reporte},'resuelto',false,true)">
                  <i class="bi bi-car-front me-1"></i>Resolver + Eliminar publicación
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
  } catch (err) { panel().innerHTML = alerta(err.message); }
}

async function gestionarReporte(id, estado, suspender, eliminarPub) {
  try {
    await apiFetch(`/admin/reportes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        estado,
        suspender_usuario:   suspender,
        eliminar_publicacion: eliminarPub,
      }),
    });
    cargarReportes();
    cargarBadgeReportes();
  } catch (err) { alert(err.message); }
}

// ── apiFetch local (sin depender de auth.js) ─────────────────────────────────
async function apiFetch(ruta, opciones = {}) {
  const res  = await fetch(`http://localhost:3000/autoDrive${ruta}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opciones,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Error en el servidor');
  return data;
}
