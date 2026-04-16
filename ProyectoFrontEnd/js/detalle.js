let publicacionActual = null;
let imagenes = [];
let imgActual = 0;

// ── Galería ───────────────────────────────────────────────────────────────────
function cambiarImagen(dir) {
  imgActual = (imgActual + dir + imagenes.length) % imagenes.length;
  document.getElementById('img-principal').src = imagenes[imgActual].url_imagen;
  document.getElementById('img-contador').textContent = `${imgActual + 1} / ${imagenes.length}`;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const nd = (v) => v ?? 'N/D';

function ficha(label, value) {
  return `<div class="col-6 col-md-4">
    <div class="bg-light rounded p-2">
      <div class="text-muted" style="font-size:11px;text-transform:uppercase;letter-spacing:.5px">${label}</div>
      <div class="fw-bold small">${nd(value)}</div>
    </div>
  </div>`;
}

// ── Renderizar detalle ────────────────────────────────────────────────────────
function renderizarDetalle(p) {
  const usuario  = sesion.obtener();
  const esPropio = usuario?.id_usuario === p.id_vendedor;
  imagenes = p.imagenes || [];

  // ── Botones de acción ──
  let acciones = '';
  if (!usuario) {
    acciones = `
      <div class="d-grid gap-2">
        <button class="btn btn-success btn-lg" data-bs-toggle="modal" data-bs-target="#loginModal">
          <i class="bi bi-cart-plus me-2"></i>Comprar Ahora
        </button>
        <button class="btn btn-outline-dark" data-bs-toggle="modal" data-bs-target="#loginModal">
          <i class="bi bi-chat me-2"></i>Contactar Vendedor
        </button>
      </div>`;
  } else if (!esPropio) {
    acciones = `
      <div class="d-grid gap-2">
        <button class="btn btn-success btn-lg" id="btn-comprar">
          <i class="bi bi-cart-plus me-2"></i>Comprar Ahora
        </button>
        <button class="btn btn-outline-dark" id="btn-chat">
          <i class="bi bi-chat me-2"></i>Contactar Vendedor
        </button>
        <button class="btn btn-outline-secondary" id="btn-fav">
          <i class="bi bi-heart me-2"></i>Guardar en Favoritos
        </button>
        <button class="btn btn-link text-danger btn-sm p-0 text-start" id="btn-reportar">
          <i class="bi bi-flag me-1"></i>Reportar esta publicación
        </button>
      </div>`;
  } else {
    acciones = `
      <div class="alert alert-info small py-2 mb-2">Esta es tu publicación.</div>
      <div class="d-grid gap-2">
        ${p.estado === 'activa'  ? `<button class="btn btn-outline-warning" id="btn-pausar"><i class="bi bi-pause-circle me-2"></i>Pausar</button>` : ''}
        ${p.estado === 'pausada' ? `<button class="btn btn-outline-success" id="btn-activar"><i class="bi bi-play-circle me-2"></i>Activar</button>` : ''}
        <button class="btn btn-outline-danger" id="btn-eliminar"><i class="bi bi-trash me-2"></i>Eliminar</button>
      </div>`;
  }

  // ── Imagen placeholder si no hay imágenes ──
  const imgSrc = imagenes[0]?.url_imagen || `https://placehold.co/800x400/e9ecef/6c757d?text=${encodeURIComponent(p.titulo)}`;

  document.getElementById('contenido-detalle').innerHTML = `
    <nav aria-label="breadcrumb" class="mb-3">
      <ol class="breadcrumb">
        <li class="breadcrumb-item"><a href="catalogo.html">Catálogo</a></li>
        <li class="breadcrumb-item active text-truncate" style="max-width:200px">${p.titulo}</li>
      </ol>
    </nav>

    <div class="row g-4">
      <!-- ── Galería ── -->
      <div class="col-lg-7">
        <div class="position-relative bg-light rounded overflow-hidden" style="height:380px">
          <img id="img-principal" src="${imgSrc}"
               class="w-100 h-100" style="object-fit:cover"
               onerror="this.src='https://placehold.co/800x400/e9ecef/6c757d?text=Sin+imagen'">
          ${imagenes.length > 1 ? `
            <button class="btn btn-dark btn-sm position-absolute top-50 start-0 ms-2 translate-middle-y"
                    style="opacity:.8" onclick="cambiarImagen(-1)">&#8249;</button>
            <button class="btn btn-dark btn-sm position-absolute top-50 end-0 me-2 translate-middle-y"
                    style="opacity:.8" onclick="cambiarImagen(1)">&#8250;</button>
            <span id="img-contador" class="badge bg-dark position-absolute bottom-0 end-0 m-2">
              1 / ${imagenes.length}
            </span>` : ''}
        </div>

        ${imagenes.length > 1 ? `
        <div class="d-flex gap-2 mt-2 overflow-auto pb-1">
          ${imagenes.map((img, i) => `
            <img src="${img.url_imagen}"
                 class="rounded flex-shrink-0"
                 style="width:80px;height:60px;object-fit:cover;cursor:pointer;
                        border:2px solid ${i===0?'#0d6efd':'transparent'};opacity:${i===0?1:0.65}"
                 onclick="imgActual=${i};
                          document.getElementById('img-principal').src='${img.url_imagen}';
                          document.getElementById('img-contador').textContent='${i+1} / ${imagenes.length}';
                          document.querySelectorAll('.thumb-img').forEach((t,j)=>{t.style.borderColor=j===${i}?'#0d6efd':'transparent';t.style.opacity=j===${i}?1:0.65})"
                 class="thumb-img">`).join('')}
        </div>` : ''}

        <!-- Descripción del anuncio -->
        ${p.descripcion ? `
        <div class="mt-4">
          <h6 class="fw-bold border-bottom pb-2">Descripción del anuncio</h6>
          <p class="text-muted">${p.descripcion}</p>
        </div>` : ''}

        <!-- Descripción del vehículo -->
        ${p.descripcion_general ? `
        <div class="mt-3">
          <h6 class="fw-bold border-bottom pb-2">Descripción del vehículo</h6>
          <p class="text-muted">${p.descripcion_general}</p>
        </div>` : ''}
      </div>

      <!-- ── Info lateral ── -->
      <div class="col-lg-5">
        <div class="d-flex justify-content-between align-items-start mb-1">
          <span class="badge ${
            p.estado === 'activa'  ? 'bg-success' :
            p.estado === 'pausada' ? 'bg-warning text-dark' :
            p.estado === 'vendido' ? 'bg-primary' : 'bg-secondary'}">${p.estado}</span>
          <small class="text-muted">${new Date(p.fecha_publicacion).toLocaleDateString('es-HN')}</small>
        </div>
        <h2 class="fw-bold mb-1">${p.titulo}</h2>
        <h3 class="text-primary fw-bold mb-3">$${Number(p.precio).toLocaleString()}</h3>

        <!-- Ficha técnica -->
        <h6 class="fw-bold border-bottom pb-2 mb-3">Ficha Técnica</h6>
        <div class="row g-2 mb-3">
          ${ficha('Marca',       p.marca)}
          ${ficha('Modelo',      p.modelo)}
          ${ficha('Año',         p.año)}
          ${ficha('Kilometraje', p.kilometraje ? p.kilometraje.toLocaleString()+' km' : null)}
          ${ficha('Color',       p.color)}
          ${ficha('Puertas',     p.num_puertas)}
          ${ficha('Combustible', p.combustible)}
          ${ficha('Transmisión', p.transmision)}
          ${ficha('Carrocería',  p.carroceria)}
          ${ficha('Condición',   p.condicion)}
          ${ficha('Cilindraje',  p.cilindraje ? p.cilindraje.toFixed(1)+' litros' : null)}
          ${ficha('VIN',         p.vin)}
          ${ficha('Placa',       p.placa)}
        </div>

        <!-- Ubicación -->
        <h6 class="fw-bold border-bottom pb-2 mb-2">Ubicación</h6>
        <p class="text-muted small mb-3">
          <i class="bi bi-geo-alt me-1"></i>
          ${[p.direccion, p.ciudad, p.pais].filter(Boolean).join(', ')}
        </p>

        <!-- Vendedor -->
        <h6 class="fw-bold border-bottom pb-2 mb-2">Vendedor</h6>
        <div class="d-flex align-items-center gap-3 mb-3">
          <i class="bi bi-person-circle text-muted" style="font-size:2.2rem"></i>
          <div>
            <div class="fw-bold">${p.vendedor_nombre} ${p.vendedor_apellido}</div>
            ${p.vendedor_telefono ? `<div class="text-muted small"><i class="bi bi-telephone me-1"></i>${p.vendedor_telefono}</div>` : ''}
            ${p.vendedor_correo   ? `<div class="text-muted small"><i class="bi bi-envelope me-1"></i>${p.vendedor_correo}</div>` : ''}
          </div>
        </div>

        ${acciones}
      </div>
    </div>`;

  asignarEventos(p);
}

// ── Eventos ───────────────────────────────────────────────────────────────────
function asignarEventos(p) {
  const usuario = sesion.obtener();

  // Comprar
  document.getElementById('btn-comprar')?.addEventListener('click', () => {
    document.getElementById('compra-titulo').textContent = p.titulo;
    document.getElementById('compra-precio').textContent = `$${Number(p.precio).toLocaleString()}`;
    document.getElementById('alerta-compra').innerHTML = '';
    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalComprar')).show();
  });

  document.getElementById('btn-confirmar-compra')?.addEventListener('click', async () => {
    const btn = document.getElementById('btn-confirmar-compra');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Procesando...';
    try {
      await apiVentas.comprar({
        id_publicacion: p.id_publicacion,
        id_comprador:   usuario.id_usuario,
        observaciones:  document.getElementById('compra-obs').value || undefined,
      });
      document.getElementById('alerta-compra').innerHTML =
        '<div class="alert alert-success">¡Compra registrada! El vendedor te contactará pronto.</div>';
      setTimeout(() => {
        bootstrap.Modal.getInstance(document.getElementById('modalComprar'))?.hide();
        window.location.reload();
      }, 2000);
    } catch (err) {
      document.getElementById('alerta-compra').innerHTML =
        `<div class="alert alert-danger">${err.message}</div>`;
      btn.disabled = false;
      btn.innerHTML = '<i class="bi bi-check-circle me-2"></i>Confirmar Compra';
    }
  });

  // Chat — FIX: usar p.id_vendedor que ahora viene del backend
  document.getElementById('btn-chat')?.addEventListener('click', async () => {
    const btn = document.getElementById('btn-chat');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Abriendo chat...';
    try {
      const res = await apiChat.iniciar({
        id_publicacion: p.id_publicacion,
        id_comprador:   usuario.id_usuario,
        id_vendedor:    p.id_vendedor,       // ← viene del backend ahora
      });
      window.location.href = `mensajeria.html?id_chat=${res.chat.id_chat}`;
    } catch (err) {
      alert(err.message);
      btn.disabled = false;
      btn.innerHTML = '<i class="bi bi-chat me-2"></i>Contactar Vendedor';
    }
  });

  // Favorito
  document.getElementById('btn-fav')?.addEventListener('click', async () => {
    const btn = document.getElementById('btn-fav');
    try {
      await apiFavoritos.agregar(usuario.id_usuario, p.id_publicacion);
      btn.innerHTML = '<i class="bi bi-heart-fill text-danger me-2"></i>En Favoritos';
      btn.disabled = true;
    } catch (err) {
      if (err.message.toLowerCase().includes('ya está')) {
        btn.innerHTML = '<i class="bi bi-heart-fill text-danger me-2"></i>En Favoritos';
        btn.disabled = true;
      } else alert(err.message);
    }
  });

  // Verificar si ya es favorito al cargar
  if (usuario && !( usuario.id_usuario === p.id_vendedor )) {
    apiFavoritos.verificar(usuario.id_usuario, p.id_publicacion)
      .then(r => {
        if (r.es_favorito) {
          const btn = document.getElementById('btn-fav');
          if (btn) { btn.innerHTML = '<i class="bi bi-heart-fill text-danger me-2"></i>En Favoritos'; btn.disabled = true; }
        }
      }).catch(() => {});
  }

  // Reportar
  document.getElementById('btn-reportar')?.addEventListener('click', () => {
    document.getElementById('alerta-reporte').innerHTML = '';
    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalReportar')).show();
  });

  document.getElementById('formReporte')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const d = new FormData(e.target);
    try {
      await apiReportes.crear({
        id_usuario_reporta: usuario.id_usuario,
        id_publicacion:     p.id_publicacion,
        motivo:             d.get('motivo'),
        descripcion:        d.get('descripcion') || undefined,
      });
      document.getElementById('alerta-reporte').innerHTML =
        '<div class="alert alert-success">Reporte enviado. Gracias.</div>';
      setTimeout(() => bootstrap.Modal.getInstance(document.getElementById('modalReportar'))?.hide(), 1800);
    } catch (err) {
      document.getElementById('alerta-reporte').innerHTML =
        `<div class="alert alert-danger">${err.message}</div>`;
    }
  });

  // Pausar / Activar / Eliminar (dueño)
  document.getElementById('btn-pausar')?.addEventListener('click', async () => {
    if (!confirm('¿Pausar esta publicación?')) return;
    try { await apiPublicaciones.cambiarEstado(p.id_publicacion, 'pausada'); window.location.reload(); }
    catch (err) { alert(err.message); }
  });

  document.getElementById('btn-activar')?.addEventListener('click', async () => {
    try { await apiPublicaciones.cambiarEstado(p.id_publicacion, 'activa'); window.location.reload(); }
    catch (err) { alert(err.message); }
  });

  document.getElementById('btn-eliminar')?.addEventListener('click', async () => {
    if (!confirm('¿Eliminar esta publicación? No se puede deshacer.')) return;
    try {
      await apiPublicaciones.eliminar(p.id_publicacion);
      window.location.href = 'perfil.html';
    } catch (err) { alert(err.message); }
  });
}

// ── Inicializar ───────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  const id = new URLSearchParams(location.search).get('id');
  if (!id) { window.location.href = 'catalogo.html'; return; }
  try {
    publicacionActual = await apiPublicaciones.detalle(id);
    renderizarDetalle(publicacionActual);
  } catch (err) {
    document.getElementById('contenido-detalle').innerHTML =
      `<div class="alert alert-danger mt-4">${err.message}</div>`;
  }
});
