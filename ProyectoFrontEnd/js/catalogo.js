let paginaActual = 1;
const POR_PAGINA = 9;

// ── Cargar selectores de catálogos ────────────────────────────────────────────
async function cargarCatalogos() {
  try {
    const [marcas, catalogos] = await Promise.all([
      apiCatalogos.marcas(),
      apiCatalogos.vehiculo(),
    ]);

    const sel = (id) => document.getElementById(id);

    marcas.forEach(m => {
      sel('filtro-marca').innerHTML += `<option value="${m.id_marca}">${m.nombre}</option>`;
    });

    catalogos.combustibles.forEach(c => {
      sel('filtro-combustible').innerHTML += `<option value="${c.id_combustible}">${c.nombre}</option>`;
    });
    catalogos.transmisiones.forEach(t => {
      sel('filtro-transmision').innerHTML += `<option value="${t.id_transmision}">${t.nombre}</option>`;
    });
    catalogos.condiciones.forEach(c => {
      sel('filtro-condicion').innerHTML += `<option value="${c.id_condicion_vehiculo}">${c.nombre}</option>`;
    });
  } catch (err) {
    console.error('Error cargando catálogos:', err);
  }
}

// ── Al cambiar marca, cargar modelos ─────────────────────────────────────────
document.getElementById('filtro-marca')?.addEventListener('change', async function () {
  const selModelo = document.getElementById('filtro-modelo');
  selModelo.innerHTML = '<option value="">Todos los modelos</option>';
  selModelo.disabled = !this.value;

  if (!this.value) return;
  try {
    const modelos = await apiCatalogos.modelos(this.value);
    modelos.forEach(m => {
      selModelo.innerHTML += `<option value="${m.id_modelo}">${m.nombre}</option>`;
    });
  } catch (err) {
    console.error('Error cargando modelos:', err);
  }
});

// ── Construir filtros desde el form ──────────────────────────────────────────
function obtenerFiltros() {
  const g = (id) => document.getElementById(id)?.value || undefined;
  return {
    id_marca:       g('filtro-marca')      || undefined,
    id_modelo:      g('filtro-modelo')     || undefined,
    precio_min:     g('filtro-precio-min') || undefined,
    precio_max:     g('filtro-precio-max') || undefined,
    año_min:        g('filtro-anio-min')   || undefined,
    año_max:        g('filtro-anio-max')   || undefined,
    id_combustible: g('filtro-combustible')|| undefined,
    id_transmision: g('filtro-transmision')|| undefined,
    id_condicion:   g('filtro-condicion')  || undefined,
    pagina:         paginaActual,
    por_pagina:     POR_PAGINA,
  };
}

// ── Renderizar tarjetas ───────────────────────────────────────────────────────
function renderizarVehiculos(publicaciones) {
  const contenedor = document.getElementById('contenedor-vehiculos');
  if (!publicaciones.length) {
    contenedor.innerHTML = `
      <div class="col-12 text-center py-5">
        <i class="bi bi-car-front display-1 text-muted"></i>
        <p class="mt-3 text-muted">No se encontraron vehículos con esos filtros.</p>
      </div>`;
    return;
  }

  const usuario = sesion.obtener();
  contenedor.innerHTML = publicaciones.map(p => `
    <div class="col">
      <div class="card h-100 shadow-sm border-0 card-hover">
        <div class="position-relative">
          <img src="${p.imagen_principal || 'https://via.placeholder.com/400x250?text=Sin+imagen'}"
               class="card-img-top" alt="${p.titulo}" style="height:200px;object-fit:cover">
          ${usuario ? `
          <button class="btn btn-sm btn-light position-absolute top-0 end-0 m-2 btn-fav"
                  data-id="${p.id_publicacion}" title="Agregar a favoritos">
            <i class="bi bi-heart"></i>
          </button>` : ''}
        </div>
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-center mb-1">
            <span class="badge bg-success small">Disponible</span>
            <h5 class="fw-bold mb-0 text-primary">$${Number(p.precio).toLocaleString()}</h5>
          </div>
          <h6 class="card-title fw-bold">${p.titulo}</h6>
          <p class="card-text text-muted small mb-1">
            <i class="bi bi-calendar me-1"></i>${p.año}
            &nbsp;•&nbsp;
            <i class="bi bi-speedometer2 me-1"></i>${p.kilometraje ? p.kilometraje.toLocaleString()+' km' : 'N/D'}
          </p>
          <p class="card-text text-muted small">
            <i class="bi bi-geo-alt me-1"></i>${p.ciudad}
          </p>
        </div>
        <div class="card-footer bg-white border-0 d-grid pb-3">
          <a href="detalle.html?id=${p.id_publicacion}" class="btn btn-outline-dark btn-sm">
            Ver Detalles
          </a>
        </div>
      </div>
    </div>`).join('');

  // Eventos favoritos
  document.querySelectorAll('.btn-fav').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const usuario = sesion.obtener();
      if (!usuario) return;
      try {
        await apiFavoritos.agregar(usuario.id_usuario, Number(btn.dataset.id));
        btn.innerHTML = '<i class="bi bi-heart-fill text-danger"></i>';
        btn.title = 'En favoritos';
      } catch (err) {
        console.error(err);
      }
    });
  });
}

// ── Renderizar paginación ─────────────────────────────────────────────────────
function renderizarPaginacion(total) {
  const totalPaginas = Math.ceil(total / POR_PAGINA);
  const nav = document.getElementById('paginacion');
  if (!nav || totalPaginas <= 1) { if (nav) nav.innerHTML = ''; return; }

  let html = '<ul class="pagination">';
  html += `<li class="page-item ${paginaActual === 1 ? 'disabled' : ''}">
    <button class="page-link" data-pag="${paginaActual - 1}">‹</button></li>`;

  for (let i = 1; i <= totalPaginas; i++) {
    html += `<li class="page-item ${i === paginaActual ? 'active' : ''}">
      <button class="page-link" data-pag="${i}">${i}</button></li>`;
  }

  html += `<li class="page-item ${paginaActual === totalPaginas ? 'disabled' : ''}">
    <button class="page-link" data-pag="${paginaActual + 1}">›</button></li>`;
  html += '</ul>';

  nav.innerHTML = html;
  nav.querySelectorAll('[data-pag]').forEach(btn => {
    btn.addEventListener('click', () => {
      paginaActual = Number(btn.dataset.pag);
      buscar();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
}

// ── Buscar ────────────────────────────────────────────────────────────────────
async function buscar() {
  const contenedor = document.getElementById('contenedor-vehiculos');
  contenedor.innerHTML = '<div class="col-12 text-center py-5"><div class="spinner-border text-primary" role="status"></div></div>';

  try {
    const data = await apiPublicaciones.listar(obtenerFiltros());
    document.getElementById('total-resultados').textContent =
      data.publicaciones?.length ? `(${data.publicaciones.length} resultados)` : '';
    renderizarVehiculos(data.publicaciones || []);
    renderizarPaginacion(data.publicaciones?.length || 0);
  } catch (err) {
    contenedor.innerHTML = `<div class="col-12 text-center py-5 text-danger">${err.message}</div>`;
  }
}

// ── Inicializar ───────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  cargarCatalogos();
  buscar();

  document.getElementById('formFiltros')?.addEventListener('submit', (e) => {
    e.preventDefault();
    paginaActual = 1;
    buscar();
  });

  document.getElementById('btn-limpiar')?.addEventListener('click', () => {
    document.getElementById('formFiltros').reset();
    document.getElementById('filtro-modelo').innerHTML = '<option value="">Todos los modelos</option>';
    document.getElementById('filtro-modelo').disabled = true;
    paginaActual = 1;
    buscar();
  });
});
