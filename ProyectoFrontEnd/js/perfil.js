// ── Sidebar navegación ────────────────────────────────────────────────────────
document.querySelectorAll('.sidebar-link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
    link.classList.add('active');
    const s = link.dataset.seccion;
    if (s === 'perfil')        renderizarPerfil();
    if (s === 'publicaciones') renderizarMisPublicaciones();
    if (s === 'compras')       renderizarMisCompras();
    if (s === 'ventas')        renderizarMisVentas();
  });
});

document.getElementById('btn-cerrar-sesion-perfil')?.addEventListener('click', (e) => {
  e.preventDefault();
  sesion.cerrar();
  window.location.href = 'index.html';
});

// ── Perfil ────────────────────────────────────────────────────────────────────
async function renderizarPerfil() {
  const usuario = sesion.obtener();
  const panel   = document.getElementById('contenido-panel');
  panel.innerHTML = '<div class="text-center py-5"><div class="spinner-border text-primary"></div></div>';
  try {
    const data = await apiUsuarios.perfil(usuario.id_usuario);
    const u = data.usuario;
    panel.innerHTML = `
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h4 class="fw-bold mb-0">Información de mi Cuenta</h4>
        <a href="publicar.html" class="btn btn-success btn-sm"><i class="bi bi-plus-lg me-1"></i>Publicar Auto</a>
      </div>
      <div class="card border-0 shadow-sm p-4" style="max-width:640px">
        <div id="alerta-perfil"></div>
        <div class="row g-3">
          <div class="col-sm-6">
            <p class="text-muted small mb-0">DNI</p>
            <p class="fw-bold">${u.dni}</p>
          </div>
          <div class="col-sm-6">
            <p class="text-muted small mb-0">Nombre completo</p>
            <p class="fw-bold">${u.nombre1} ${u.nombre2||''} ${u.apellido1} ${u.apellido2||''}</p>
          </div>
          <div class="col-sm-6">
            <p class="text-muted small mb-0">Correo</p>
            <p class="fw-bold">${u.correo}</p>
          </div>
          <div class="col-sm-6">
            <p class="text-muted small mb-0">Rol</p>
            <p><span class="badge ${u.rol==='admin'?'bg-danger':'bg-primary'}">${u.rol}</span></p>
          </div>
          <div class="col-sm-6">
            <label class="form-label small fw-bold">Teléfono</label>
            <input type="tel" class="form-control form-control-sm" id="edit-telefono" value="${u.telefono||''}">
          </div>
          <div class="col-12">
            <button class="btn btn-primary btn-sm" id="btn-guardar-perfil">
              <i class="bi bi-save me-1"></i>Guardar cambios
            </button>
          </div>
        </div>
      </div>`;

    document.getElementById('btn-guardar-perfil')?.addEventListener('click', async () => {
      const btn = document.getElementById('btn-guardar-perfil');
      btn.disabled = true;
      try {
        await apiUsuarios.actualizar(usuario.id_usuario, {
          telefono: document.getElementById('edit-telefono').value || undefined,
        });
        document.getElementById('alerta-perfil').innerHTML =
          '<div class="alert alert-success py-2 small mb-3">Perfil actualizado.</div>';
      } catch (err) {
        document.getElementById('alerta-perfil').innerHTML =
          `<div class="alert alert-danger py-2 small mb-3">${err.message}</div>`;
      } finally { btn.disabled = false; }
    });
  } catch (err) {
    panel.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
  }
}

// ── Mis Publicaciones ─────────────────────────────────────────────────────────
async function renderizarMisPublicaciones() {
  const usuario = sesion.obtener();
  const panel   = document.getElementById('contenido-panel');
  panel.innerHTML = '<div class="text-center py-5"><div class="spinner-border text-primary"></div></div>';
  try {
    const data = await apiPublicaciones.misPublicaciones(usuario.id_usuario);
    const pubs = data.publicaciones || [];
    panel.innerHTML = `
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h4 class="fw-bold mb-0">Mis Publicaciones <span class="badge bg-secondary">${pubs.length}</span></h4>
        <a href="publicar.html" class="btn btn-success btn-sm"><i class="bi bi-plus-lg me-1"></i>Nueva</a>
      </div>
      <div id="lista-mis-pubs"></div>`;

    const lista = document.getElementById('lista-mis-pubs');
    if (!pubs.length) {
      lista.innerHTML = '<p class="text-muted">Aún no has publicado ningún vehículo.</p>'; return;
    }

    lista.innerHTML = pubs.map(p => `
      <div class="card border-0 shadow-sm mb-3">
        <div class="row g-0 align-items-center">
          <div class="col-3 col-md-2">
            <img src="${p.imagen_principal||'https://placehold.co/150x100/e9ecef/6c757d?text=Auto'}"
                 class="img-fluid rounded-start" style="height:100px;object-fit:cover;width:100%"
                 onerror="this.src='https://placehold.co/150x100/e9ecef/6c757d?text=Auto'">
          </div>
          <div class="col-9 col-md-10">
            <div class="card-body py-2">
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <h6 class="card-title mb-0 fw-bold">${p.titulo}</h6>
                  <p class="text-primary fw-bold mb-1 small">$${Number(p.precio).toLocaleString()}</p>
                  <small class="text-muted">${p.año} · ${p.marca} ${p.modelo} · ${p.kilometraje?p.kilometraje.toLocaleString()+' km':'N/D'}</small>
                </div>
                <span class="badge ms-2 flex-shrink-0 ${
                  p.estado==='activa'?'bg-success':p.estado==='pausada'?'bg-warning text-dark':p.estado==='vendido'?'bg-primary':'bg-secondary'
                }">${p.estado}</span>
              </div>
              <div class="btn-group btn-group-sm mt-2">
                <a href="detalle.html?id=${p.id_publicacion}" class="btn btn-outline-dark">Ver</a>
                ${p.estado==='activa'  ? `<button class="btn btn-outline-warning" onclick="pausarPub(${p.id_publicacion})">Pausar</button>` : ''}
                ${p.estado==='pausada' ? `<button class="btn btn-outline-success" onclick="activarPub(${p.id_publicacion})">Activar</button>` : ''}
                ${p.estado!=='vendido' ? `<button class="btn btn-outline-danger"  onclick="eliminarPub(${p.id_publicacion})">Eliminar</button>` : ''}
              </div>
            </div>
          </div>
        </div>
      </div>`).join('');
  } catch (err) {
    panel.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
  }
}

async function pausarPub(id)  { try { await apiPublicaciones.cambiarEstado(id,'pausada'); renderizarMisPublicaciones(); } catch(e){alert(e.message);} }
async function activarPub(id) { try { await apiPublicaciones.cambiarEstado(id,'activa');  renderizarMisPublicaciones(); } catch(e){alert(e.message);} }
async function eliminarPub(id){ if(!confirm('¿Eliminar?'))return; try{await apiPublicaciones.eliminar(id);renderizarMisPublicaciones();}catch(e){alert(e.message);} }

// ── Mis Compras ───────────────────────────────────────────────────────────────
async function renderizarMisCompras() {
  const usuario = sesion.obtener();
  const panel   = document.getElementById('contenido-panel');
  panel.innerHTML = '<div class="text-center py-5"><div class="spinner-border text-primary"></div></div>';
  try {
    const data   = await apiVentas.misCompras(usuario.id_usuario);
    const compras = data.compras || [];
    panel.innerHTML = `
      <h4 class="fw-bold mb-4">Mis Compras <span class="badge bg-secondary">${compras.length}</span></h4>
      <div id="lista-compras"></div>`;

    const lista = document.getElementById('lista-compras');
    if (!compras.length) {
      lista.innerHTML = '<p class="text-muted">No has realizado compras aún.</p>'; return;
    }

    lista.innerHTML = compras.map(c => `
      <div class="card border-0 shadow-sm mb-3 compra-card"
           style="cursor:pointer" onclick="verDetalleCompra(${c.id_venta})">
        <div class="card-body">
          <div class="row align-items-center">
            <div class="col-auto">
              <img src="${c.imagen_principal||'https://placehold.co/90x70/e9ecef/6c757d?text=Auto'}"
                   class="rounded" style="width:90px;height:70px;object-fit:cover"
                   onerror="this.src='https://placehold.co/90x70/e9ecef/6c757d?text=Auto'">
            </div>
            <div class="col">
              <h6 class="fw-bold mb-0">${c.titulo}</h6>
              <small class="text-muted">${c.marca} ${c.modelo} ${c.año}</small><br>
              <small class="text-muted"><i class="bi bi-person me-1"></i>Vendedor: ${c.vendedor_nombre} ${c.vendedor_apellido}</small>
            </div>
            <div class="col-auto text-end">
              <p class="fw-bold text-success mb-1">$${Number(c.monto).toLocaleString()}</p>
              <span class="badge ${c.estado_pago==='pagado'?'bg-success':c.estado_pago==='rechazado'?'bg-danger':'bg-warning text-dark'} small d-block mb-1">${c.estado_pago}</span>
              <span class="badge bg-secondary small">${c.estado_venta}</span>
            </div>
            <div class="col-auto">
              <i class="bi bi-chevron-right text-muted"></i>
            </div>
          </div>
          <small class="text-muted d-block mt-1">${new Date(c.fecha_venta).toLocaleDateString('es-HN')}</small>
        </div>
      </div>`).join('');

  } catch (err) {
    panel.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
  }
}

// ── Modal detalle de compra ───────────────────────────────────────────────────
async function verDetalleCompra(id_venta) {
  // Crear modal dinámicamente si no existe
  if (!document.getElementById('modalDetalleCompra')) {
    document.body.insertAdjacentHTML('beforeend', `
      <div class="modal fade" id="modalDetalleCompra" tabindex="-1">
        <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
          <div class="modal-content">
            <div class="modal-header bg-dark text-white">
              <h5 class="modal-title fw-bold"><i class="bi bi-receipt me-2"></i>Detalle de Compra</h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body" id="cuerpo-detalle-compra">
              <div class="text-center py-4"><div class="spinner-border text-primary"></div></div>
            </div>
          </div>
        </div>
      </div>`);
  }

  const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('modalDetalleCompra'));
  document.getElementById('cuerpo-detalle-compra').innerHTML =
    '<div class="text-center py-4"><div class="spinner-border text-primary"></div></div>';
  modal.show();

  try {
    const data = await apiVentas.detalle(id_venta);
    const v = data.venta;
    document.getElementById('cuerpo-detalle-compra').innerHTML = `
      <!-- Estados -->
      <div class="row g-2 mb-3">
        <div class="col-6">
          <div class="rounded p-2 text-center ${v.estado_pago==='pagado'?'bg-success text-white':v.estado_pago==='rechazado'?'bg-danger text-white':'bg-warning'}">
            <div class="small fw-bold">Estado de Pago</div>
            <div class="fw-bold text-uppercase">${v.estado_pago}</div>
          </div>
        </div>
        <div class="col-6">
          <div class="rounded p-2 text-center bg-light">
            <div class="small fw-bold text-muted">Estado de Venta</div>
            <div class="fw-bold text-uppercase">${v.estado_venta}</div>
          </div>
        </div>
      </div>

      <!-- Vehículo -->
      <h6 class="fw-bold border-bottom pb-2 mb-3"><i class="bi bi-car-front me-2"></i>Vehículo</h6>
      <div class="row g-2 mb-3">
        <div class="col-6"><small class="text-muted d-block">Título</small><span class="fw-bold">${v.titulo}</span></div>
        <div class="col-6"><small class="text-muted d-block">Precio pagado</small><span class="fw-bold text-success">$${Number(v.monto).toLocaleString()}</span></div>
        <div class="col-6"><small class="text-muted d-block">Marca / Modelo</small><span>${v.marca} ${v.modelo}</span></div>
        <div class="col-6"><small class="text-muted d-block">Año</small><span>${v.año}</span></div>
        <div class="col-6"><small class="text-muted d-block">Color</small><span>${v.color||'N/D'}</span></div>
        <div class="col-6"><small class="text-muted d-block">Kilometraje</small><span>${v.kilometraje?v.kilometraje.toLocaleString()+' km':'N/D'}</span></div>
        <div class="col-6"><small class="text-muted d-block">VIN</small><span class="font-monospace small">${v.vin||'N/D'}</span></div>
        <div class="col-6"><small class="text-muted d-block">Placa</small><span>${v.placa||'N/D'}</span></div>
      </div>

      <!-- Vendedor -->
      <h6 class="fw-bold border-bottom pb-2 mb-3"><i class="bi bi-person me-2"></i>Vendedor</h6>
      <div class="row g-2 mb-3">
        <div class="col-6"><small class="text-muted d-block">Nombre</small><span>${v.vendedor_nombre} ${v.vendedor_apellido}</span></div>
        <div class="col-6"><small class="text-muted d-block">Correo</small><span>${v.vendedor_correo}</span></div>
        <div class="col-6"><small class="text-muted d-block">Teléfono</small><span>${v.vendedor_telefono||'N/D'}</span></div>
        <div class="col-6"><small class="text-muted d-block">Fecha de compra</small><span>${new Date(v.fecha_venta).toLocaleDateString('es-HN')}</span></div>
      </div>

      ${v.observaciones ? `<div class="alert alert-light small"><strong>Observaciones:</strong> ${v.observaciones}</div>` : ''}

      <div class="d-flex gap-2 mt-2">
        <a href="detalle.html?id=${v.id_publicacion}" class="btn btn-outline-dark btn-sm">
          <i class="bi bi-car-front me-1"></i>Ver Publicación
        </a>
        <a href="mensajeria.html" class="btn btn-outline-primary btn-sm">
          <i class="bi bi-chat me-1"></i>Mensajería
        </a>
      </div>`;
  } catch (err) {
    document.getElementById('cuerpo-detalle-compra').innerHTML =
      `<div class="alert alert-danger">${err.message}</div>`;
  }
}

// ── Mis Ventas ────────────────────────────────────────────────────────────────
async function renderizarMisVentas() {
  const usuario = sesion.obtener();
  const panel   = document.getElementById('contenido-panel');
  panel.innerHTML = '<div class="text-center py-5"><div class="spinner-border text-primary"></div></div>';
  try {
    const data  = await apiVentas.misVentas(usuario.id_usuario);
    const ventas = data.ventas || [];
    panel.innerHTML = `<h4 class="fw-bold mb-4">Mis Ventas <span class="badge bg-secondary">${ventas.length}</span></h4><div id="lista-ventas"></div>`;

    const lista = document.getElementById('lista-ventas');
    if (!ventas.length) {
      lista.innerHTML = '<p class="text-muted">No has concretado ninguna venta aún.</p>'; return;
    }

    lista.innerHTML = ventas.map(v => `
      <div class="card border-0 shadow-sm mb-3">
        <div class="card-body">
          <div class="row align-items-center">
            <div class="col-auto">
              <img src="${v.imagen_principal||'https://placehold.co/90x70/e9ecef/6c757d?text=Auto'}"
                   class="rounded" style="width:90px;height:70px;object-fit:cover"
                   onerror="this.src='https://placehold.co/90x70/e9ecef/6c757d?text=Auto'">
            </div>
            <div class="col">
              <h6 class="fw-bold mb-0">${v.titulo}</h6>
              <small class="text-muted">${v.marca} ${v.modelo} ${v.año}</small><br>
              <small class="text-muted"><i class="bi bi-person me-1"></i>Comprador: ${v.comprador_nombre} ${v.comprador_apellido}
                ${v.comprador_telefono?` · ${v.comprador_telefono}`:''}</small>
            </div>
            <div class="col-auto text-end">
              <p class="fw-bold text-success mb-1">$${Number(v.monto).toLocaleString()}</p>
              <span class="badge ${v.estado_pago==='pagado'?'bg-success':v.estado_pago==='rechazado'?'bg-danger':'bg-warning text-dark'} small d-block mb-1">${v.estado_pago}</span>
              <span class="badge bg-secondary small">${v.estado_venta}</span>
            </div>
          </div>
          <div class="d-flex gap-2 mt-3 flex-wrap">
            ${v.estado_pago==='pendiente'?`<button class="btn btn-success btn-sm" onclick="marcarPagado(${v.id_venta})"><i class="bi bi-check me-1"></i>Marcar Pagado</button>`:''}
            ${v.estado_venta==='en proceso'?`
              <button class="btn btn-primary btn-sm" onclick="completarVenta(${v.id_venta})"><i class="bi bi-check2-all me-1"></i>Completar Venta</button>
              <button class="btn btn-outline-danger btn-sm" onclick="cancelarVenta(${v.id_venta})">Cancelar</button>`:''}
          </div>
          <small class="text-muted d-block mt-2">${new Date(v.fecha_venta).toLocaleDateString('es-HN')}</small>
        </div>
      </div>`).join('');
  } catch (err) {
    panel.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
  }
}

async function marcarPagado(id)   { try { await apiVentas.estadoPago(id,'pagado');      renderizarMisVentas(); } catch(e){alert(e.message);} }
async function completarVenta(id) { try { await apiVentas.estadoVenta(id,'completada'); renderizarMisVentas(); } catch(e){alert(e.message);} }
async function cancelarVenta(id)  {
  if (!confirm('¿Cancelar esta venta? El vehículo volverá a estar disponible.')) return;
  try { await apiVentas.estadoVenta(id,'cancelada'); renderizarMisVentas(); } catch(e){alert(e.message);}
}

// ── Inicializar ───────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  if (!requiereLogin('perfil.html')) return;
  const usuario = sesion.obtener();
  document.getElementById('nombre-sidebar').textContent  = `${usuario.nombre} ${usuario.apellido}`;
  document.getElementById('rol-sidebar').textContent     = usuario.rol;
  renderizarPerfil();
});
