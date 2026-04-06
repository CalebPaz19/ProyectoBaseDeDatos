let usuarioRegistrado = null;

const vehiculos = [
    { id: 101, userId: 1, precio: 25000, marca: "Toyota", modelo: "Corolla", desc: "Excelente estado, único dueño.", fecha: "2026-03-15" },
    { id: 102, userId: 2, precio: 18500, marca: "Honda", modelo: "Civic", desc: "Mantenimientos al día, full equipo.", fecha: "2026-04-01" },
    { id: 103, userId: 1, precio: 32000, marca: "Ford", modelo: "Raptor", desc: "Potencia y comodidad para todo terreno.", fecha: "2026-04-05" }
];


// 2. Función para renderizar los vehículos
function renderizarCatalogo() {

    const hero = document.getElementById('hero-principal');
    if (hero) {
        hero.classList.add('d-none'); 
    }
    const contenedor = document.getElementById('contenedor-vehiculos');
    
    // Limpiamos el contenedor para no duplicar si se hace click varias veces
    contenedor.innerHTML = "";
    
    vehiculos.forEach(auto => {
        // Creamos el HTML de la tarjeta usando Template Literals
        const cardHTML = `
            <div class="col">
                <div class="card h-100 shadow-sm border-0">
                    <img src="https://via.placeholder.com/400x250?text=${auto.marca}+${auto.modelo}" class="card-img-top" alt="${auto.marca}">
                    <div class="card-body">
                        <div class="d-flex justify-content-between mb-2">
                            <h5 class="fw-bold text-primary mb-0">$${auto.precio.toLocaleString()}</h5>
                            <small class="text-muted">${auto.fecha}</small>
                        </div>
                        <h5 class="card-title">${auto.marca} ${auto.modelo}</h5>
                        <p class="card-text text-muted small">${auto.desc}</p>
                    </div>
                    <div class="card-footer bg-white border-0 d-grid pb-3">
                        <button class="btn btn-outline-dark" onclick="verDetalles(${auto.id})">
                            Ver Detalles (ID: ${auto.id})
                        </button>
                    </div>
                </div>
            </div>
        `;
        // Insertamos la tarjeta en el contenedor
        contenedor.innerHTML += cardHTML;
    });
}

function actualizarNavbar() {
    const contenedor = document.getElementById('contenedor-auth');
    
    if (usuarioRegistrado) {
        // Borramos los botones de Login/Registro y ponemos el de Panel
        contenedor.innerHTML = `
            <div class="d-flex align-items-center gap-3">
                <span class="text-white small d-none d-lg-inline">Hola, <strong>${usuarioRegistrado.nombre}</strong></span>
                <button class="btn btn-warning btn-sm px-3 fw-bold" id="btn-ir-panel">
                    Ir a mi Panel
                </button>
                <button class="btn btn-link text-white-50 btn-sm p-0" id="btn-logout-nav">Salir</button>
            </div>
        `;

        // Asignamos el evento al nuevo botón de "Ir a mi Panel"
        document.getElementById('btn-ir-panel').addEventListener('click', () => {
            // Aquí llamas a la función que diseñamos antes para mostrar el Sidebar
            activarInterfazPrivada(); 
        });

        // Evento para cerrar sesión desde la navbar
        document.getElementById('btn-logout-nav').addEventListener('click', () => {
            location.reload(); // Forma rápida de resetear todo (limpia variables globales)
        });
    }
}

// 1. Función para activar el modo Panel
function irAMiPanel() {
    // Escondemos TODO lo público (Hero, Catálogo, Navbar original si deseas)
    document.getElementById('hero-principal')?.classList.add('d-none');
    document.getElementById('contenedor-vehiculos').innerHTML = "";
    document.querySelector('nav').classList.add('shadow-sm'); // Opcional: ajustar navbar

    // Mostramos el contenedor del Dashboard
    const dashboard = document.getElementById('dashboard-container');
    dashboard.classList.remove('d-none');

    // Actualizamos el nombre en el sidebar
    document.getElementById('nombre-sidebar').innerText = usuarioRegistrado.nombre;

    // Por defecto, mostramos el perfil al entrar
    renderizarSeccionPerfil();
}

// Eventos para el menú del Sidebar
// Delegación de eventos: Escucha clics en elementos que se crean dinámicamente
document.addEventListener('click', (e) => {
    // Si el clic fue en el botón de "Ir a mi Panel"
    if (e.target && e.target.id === 'btn-ir-panel') {
        irAMiPanel();
    }

    // Aprovechamos para activar los botones del Sidebar aquí también
    if (e.target && e.target.id === 'btn-ver-perfil') {
        e.preventDefault();
        renderizarSeccionPerfil();
    }
    
    if (e.target && e.target.id === 'btn-ver-mis-autos') {
        e.preventDefault();
        renderizarSeccionMisAutos();
    }
});

// 2. Función para renderizar la INFO DEL PERFIL
function renderizarSeccionPerfil() {
    const main = document.getElementById('contenido-panel');
    main.innerHTML = `
        <h2 class="mb-4">Información de mi Cuenta</h2>
        <div class="card border-0 shadow-sm p-4" style="max-width: 600px;">
            <p><strong>Nombre completo:</strong> ${usuarioRegistrado.nombre} ${usuarioRegistrado.apellido}</p>
            <p><strong>Correo electrónico:</strong> ${usuarioRegistrado.correo}</p>
            <p><strong>Teléfono de contacto:</strong> ${usuarioRegistrado.telefono}</p>
            <button class="btn btn-primary btn-sm w-25 mt-3">Editar Perfil</button>
        </div>
    `;
}

// 3. Función para renderizar MIS PUBLICACIONES
function renderizarSeccionMisAutos() {
    const main = document.getElementById('contenido-panel');
    
    // Filtramos del arreglo global los autos que pertenecen a este usuario
    // (Asumiendo que tus autos tienen un campo 'userId')
    const misAutos = vehiculos.filter(auto => auto.userId === usuarioRegistrado.id);

    main.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2>Mis Publicaciones</h2>
            <button class="btn btn-success"><i class="bi bi-plus-lg"></i> Publicar nuevo auto</button>
        </div>
        <div class="row g-3" id="lista-mis-autos"></div>
    `;

    const lista = document.getElementById('lista-mis-autos');
    if (misAutos.length === 0) {
        lista.innerHTML = `<p class="text-muted">Aún no has publicado ningún vehículo.</p>`;
    } else {
        misAutos.forEach(auto => {
            lista.innerHTML += `
                <div class="col-12 col-xl-6">
                    <div class="card mb-3 shadow-sm border-0">
                        <div class="row g-0 align-items-center">
                            <div class="col-4">
                                <img src="https://via.placeholder.com/150" class="img-fluid rounded-start">
                            </div>
                            <div class="col-8">
                                <div class="card-body">
                                    <h5 class="card-title">${auto.marca} ${auto.modelo}</h5>
                                    <p class="text-primary fw-bold mb-1">$${auto.precio.toLocaleString()}</p>
                                    <div class="btn-group btn-group-sm">
                                        <button class="btn btn-outline-secondary">Editar</button>
                                        <button class="btn btn-outline-danger">Eliminar</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`;
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const formRegistro = document.getElementById('formRegistro');

    formRegistro.addEventListener('submit', (e) => {
        e.preventDefault(); // Evita que la página se recargue

        const datos = new FormData(formRegistro);

        // AQUÍ GUARDAMOS EN LA VARIABLE GLOBAL
        usuarioRegistrado = {
            id: Date.now(), // Generamos un ID único basado en el tiempo
            nombre: datos.get('nombre'),
            apellido: datos.get('apellido'),
            correo: datos.get('correo'),
            telefono: datos.get('telefono'),
            password: datos.get('password')
        };

        console.log("¡Usuario guardado en variable global!", usuarioRegistrado);

        // Feedback visual
        alert(`Registro exitoso. Bienvenido ${usuarioRegistrado.nombre}`);

        // Cerramos el modal (Código de Bootstrap)
        const modalElement = document.getElementById('registroModal');
        const modalInstance = bootstrap.Modal.getInstance(modalElement);
        modalInstance.hide();
        
        // Limpiamos el formulario para la próxima vez
        formRegistro.reset();

        // OPCIONAL: Aquí podrías llamar a la función que muestra el Sidebar
        // mostrarInterfazPrivada(); 
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const formLogin = document.getElementById('formLogin');

    formLogin.addEventListener('submit', (e) => {
        e.preventDefault();

        const datos = new FormData(formLogin);
        const correoIngresado = datos.get('correoLogin');
        const passIngresada = datos.get('passLogin');

        // 1. Verificamos si existe un usuario registrado en la variable global
        if (!usuarioRegistrado) {
            alert("No hay ningún usuario registrado en el sistema.");
            return;
        }

        // 2. Comparamos los datos
        if (correoIngresado === usuarioRegistrado.correo && passIngresada === usuarioRegistrado.password) {
    
            // 1. Cerramos el modal
            const modalLogin = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
            modalLogin.hide();

            // 2. Actualizamos la interfaz
            actualizarNavbar();
            
            alert(`¡Bienvenido de nuevo, ${usuarioRegistrado.nombre}!`);
        } else {
            alert("Correo o contraseña incorrectos. Inténtalo de nuevo.");
        }
    });
});

// 3. Escuchar el click en el menú "Catálogo"
document.getElementById('link-catalogo').addEventListener('click', function(e) {
    e.preventDefault(); // Evita que la página recargue o salte
    renderizarCatalogo();
});

// Escuchamos el clic en el botón de "Inicio" o el Logo
document.querySelector('.navbar-brand').addEventListener('click', () => {
    // Mostramos el Hero quitando la clase 'd-none'
    document.getElementById('hero-principal').classList.remove('d-none');
    
    // Opcional: Limpiar el catálogo para que no se vea abajo
    document.getElementById('contenedor-vehiculos').innerHTML = "";
});

// Función extra para probar los clicks en las tarjetas
function verDetalles(id) {
    alert("Cargando detalles del vehículo con ID: " + id);
}