// ── Cargar catálogos al iniciar ───────────────────────────────────────────────
async function cargarCatalogosPublicar() {
  try {
    const [marcas, catalogos, continentes] = await Promise.all([
      apiCatalogos.marcas(),
      apiCatalogos.vehiculo(),
      apiCatalogos.continentes(),
    ]);

    const sel = (n) => document.querySelector(`[name="${n}"]`);

    marcas.forEach(m =>
      document.getElementById('sel-marca').innerHTML += `<option value="${m.id_marca}">${m.nombre}</option>`);

    catalogos.combustibles.forEach(c =>
      sel('id_combustible').innerHTML += `<option value="${c.id_combustible}">${c.nombre}</option>`);
    catalogos.transmisiones.forEach(t =>
      sel('id_transmision').innerHTML += `<option value="${t.id_transmision}">${t.nombre}</option>`);
    catalogos.carrocerias.forEach(c =>
      sel('id_carroceria').innerHTML += `<option value="${c.id_carroceria}">${c.nombre}</option>`);
    catalogos.condiciones.forEach(c =>
      sel('id_condicion_vehiculo').innerHTML += `<option value="${c.id_condicion_vehiculo}">${c.nombre}</option>`);

    continentes.forEach(c =>
      document.getElementById('sel-continente').innerHTML += `<option value="${c.id_continente}">${c.nombre}</option>`);

  } catch (err) {
    console.error('Error cargando catálogos:', err);
  }
}

// ── Cascada marca → modelo ────────────────────────────────────────────────────
document.getElementById('sel-marca')?.addEventListener('change', async function () {
  const selModelo = document.getElementById('sel-modelo');
  selModelo.innerHTML = '<option value="">Selecciona un modelo</option>';
  selModelo.disabled = !this.value;
  if (!this.value) return;
  try {
    const modelos = await apiCatalogos.modelos(this.value);
    modelos.forEach(m =>
      selModelo.innerHTML += `<option value="${m.id_modelo}">${m.nombre}</option>`);
  } catch (err) { console.error(err); }
});

// ── Cascada continente → país → ciudad ───────────────────────────────────────
document.getElementById('sel-continente')?.addEventListener('change', async function () {
  const selPais = document.getElementById('sel-pais');
  const selCiudad = document.getElementById('sel-ciudad');
  selPais.innerHTML = '<option value="">Selecciona un país</option>';
  selCiudad.innerHTML = '<option value="">Primero selecciona país</option>';
  selPais.disabled = !this.value;
  selCiudad.disabled = true;
  if (!this.value) return;
  try {
    const paises = await apiCatalogos.paises(this.value);
    paises.forEach(p =>
      selPais.innerHTML += `<option value="${p.id_pais}">${p.nombre}</option>`);
  } catch (err) { console.error(err); }
});

document.getElementById('sel-pais')?.addEventListener('change', async function () {
  const selCiudad = document.getElementById('sel-ciudad');
  selCiudad.innerHTML = '<option value="">Selecciona una ciudad</option>';
  selCiudad.disabled = !this.value;
  if (!this.value) return;
  try {
    const ciudades = await apiCatalogos.ciudades(this.value);
    ciudades.forEach(c =>
      selCiudad.innerHTML += `<option value="${c.id_ciudad}">${c.nombre}</option>`);
  } catch (err) { console.error(err); }
});

// ── Preview de imágenes ───────────────────────────────────────────────────────
document.getElementById('input-imagenes')?.addEventListener('change', function () {
  const preview = document.getElementById('preview-imagenes');
  preview.innerHTML = '';
  Array.from(this.files).forEach(file => {
    const url = URL.createObjectURL(file);
    preview.innerHTML += `
      <div class="position-relative" style="width:90px">
        <img src="${url}" class="rounded" style="width:90px;height:70px;object-fit:cover">
      </div>`;
  });
});

// ── Submit ────────────────────────────────────────────────────────────────────
document.getElementById('formPublicar')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const usuario = sesion.obtener();
  if (!usuario) { window.location.href = 'index.html'; return; }

  const alertaEl = document.getElementById('alerta-publicar');
  alertaEl.innerHTML = '';
  const btn = document.getElementById('btn-publicar');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Publicando...';

  try {
    const d = new FormData(e.target);

    // Construir objetos JSON para el backend
    const vehiculo = {
      id_modelo:           Number(d.get('id_modelo')),
      id_combustible:      Number(d.get('id_combustible')),
      id_transmision:      Number(d.get('id_transmision')),
      id_carroceria:       Number(d.get('id_carroceria')),
      id_condicion_vehiculo: Number(d.get('id_condicion_vehiculo')),
      año:                 Number(d.get('año')),
      kilometraje:         d.get('kilometraje') ? Number(d.get('kilometraje')) : undefined,
      color:               d.get('color') || undefined,
      num_puertas:         d.get('num_puertas') ? Number(d.get('num_puertas')) : undefined,
      cilindraje:          d.get('cilindraje') ? Number(d.get('cilindraje')) : undefined,
      vin:                 d.get('vin'),
      placa:               d.get('placa') || undefined,
      descripcion_general: d.get('descripcion_general') || undefined,
    };

    const ubicacion = {
      id_ciudad:  Number(d.get('id_ciudad')),
      direccion:  d.get('direccion') || undefined,
    };

    const publicacion = {
      titulo:      d.get('titulo'),
      descripcion: d.get('descripcion') || undefined,
      precio:      Number(d.get('precio')),
      id_usuario:  usuario.id_usuario,
    };

    // Construir el FormData para multipart
    const formData = new FormData();
    formData.append('vehiculo',    JSON.stringify(vehiculo));
    formData.append('ubicacion',   JSON.stringify(ubicacion));
    formData.append('publicacion', JSON.stringify(publicacion));

    const archivos = document.getElementById('input-imagenes').files;
    Array.from(archivos).forEach(f => formData.append('imagenes', f));

    const resultado = await apiPublicaciones.crearCompleta(formData);

    alertaEl.innerHTML = `
      <div class="alert alert-success">
        ¡Publicación creada exitosamente!
        <a href="detalle.html?id=${resultado.id_publicacion}" class="alert-link ms-2">Ver publicación →</a>
      </div>`;

    e.target.reset();
    document.getElementById('preview-imagenes').innerHTML = '';

  } catch (err) {
    alertaEl.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="bi bi-check-circle me-2"></i>Publicar Vehículo';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
});

// ── Inicializar ───────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  if (!requiereLogin('publicar.html')) return;
  cargarCatalogosPublicar();
});
