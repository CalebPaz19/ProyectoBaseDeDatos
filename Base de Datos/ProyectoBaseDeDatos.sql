CREATE DATABASE AutoDrive;
use AutoDrive

CREATE TABLE Usuario (
    id_usuario INT IDENTITY PRIMARY KEY,
    dni VARCHAR(20) UNIQUE NOT NULL,
    primer_nombre VARCHAR(25) NOT NULL, 
    segundo_nombre VARCHAR(25),
    primer_apellido VARCHAR(25) NOT NULL,
    segundo_apellido VARCHAR(25),
    
    correo VARCHAR(100) NOT NULL UNIQUE,
    contrasena VARCHAR(100) NOT NULL,
    telefono VARCHAR(25) NOT NULL,
    
    foto_perfil VARCHAR(100),

    rol VARCHAR(20) NOT NULL DEFAULT 'usuario',
    estado_cuenta VARCHAR(25) NOT NULL DEFAULT 'activa',
    
    fecha_registro DATETIME DEFAULT GETDATE() NOT NULL,
    ultimo_acceso DATETIME,

    CONSTRAINT CHK_Usuario_Rol CHECK(rol IN('admin', 'usuario')),
    CONSTRAINT CHK_Estado_Cuenta CHECK(estado_cuenta IN('activa', 'suspendida', 'bloqueada')),
);

CREATE TABLE Marca (
    id_marca INT IDENTITY PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE Modelo (
    id_modelo INT IDENTITY PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    id_marca INT NOT NULL,

    CONSTRAINT FK_modelo_marca FOREIGN KEY (id_marca) REFERENCES Marca(id_marca),
    CONSTRAINT UQ_Modelo UNIQUE (id_marca, nombre)
);

CREATE TABLE Combustible (
    id_combustible INT IDENTITY PRIMARY KEY,
    nombre VARCHAR(60) NOT NULL UNIQUE
);

CREATE TABLE Transmision (
    id_transmision INT IDENTITY PRIMARY KEY,
    nombre VARCHAR(60) NOT NULL UNIQUE
);

CREATE TABLE TipoCarroceria (
    id_carroceria INT IDENTITY PRIMARY KEY,
    nombre VARCHAR(60) NOT NULL UNIQUE
);

CREATE TABLE CondicionVehiculo (
    id_condicion_vehiculo INT IDENTITY PRIMARY KEY,
    nombre VARCHAR(60) NOT NULL UNIQUE
);

CREATE TABLE Vehiculo (
    id_vehiculo INT IDENTITY PRIMARY KEY,

    id_modelo INT NOT NULL,
    id_combustible INT NOT NULL,
    id_transmision INT NOT NULL,
    id_carroceria INT NOT NULL,
    id_condicion_vehiculo INT NOT NULL,

    año INT NOT NULL CHECK (año >= 1800),
    kilometraje INT CHECK (kilometraje >= 0),
    color VARCHAR(50),
    num_puertas INT CHECK (num_puertas BETWEEN 2 AND 6),
    cilindraje DECIMAL(4,2),

    vin VARCHAR(50) UNIQUE NOT NULL,
    placa VARCHAR(20) UNIQUE,
    descripcion_general TEXT,
    fecha_registro DATETIME DEFAULT GETDATE()

    CONSTRAINT FK_Vehiculo_Modelo FOREIGN KEY (id_modelo) REFERENCES Modelo(id_modelo),
    CONSTRAINT FK_Vehiculo_Combustible FOREIGN KEY (id_combustible) REFERENCES Combustible(id_combustible),
    CONSTRAINT FK_Vehiculo_Transmision FOREIGN KEY (id_transmision) REFERENCES Transmision(id_transmision),
    CONSTRAINT FK_Vehiculo_Carroceria FOREIGN KEY (id_carroceria) REFERENCES TipoCarroceria(id_carroceria),
    CONSTRAINT FK_VEHICULO_CONDICION FOREIGN KEY (id_condicion_vehiculo) REFERENCES CondicionVehiculo(id_condicion_vehiculo),
);

CREATE TABLE Continente (
    id_continente INT IDENTITY PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE Pais (
    id_pais INT IDENTITY PRIMARY KEY,
    id_continente INT NOT NULL,
    nombre VARCHAR(100) NOT NULL UNIQUE,

    CONSTRAINT FK_Pais_Continente FOREIGN KEY (id_continente) REFERENCES Continente(id_continente)
);

CREATE TABLE Ciudad (
    id_ciudad INT IDENTITY PRIMARY KEY,
    id_pais INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,

    CONSTRAINT FK_Ciudad_Pais FOREIGN KEY (id_pais) REFERENCES Pais(id_pais),
    CONSTRAINT UQ_Ciudad UNIQUE (id_pais, nombre)
);

CREATE TABLE Ubicacion (
    id_ubicacion INT IDENTITY PRIMARY KEY,
    id_ciudad INT NOT NULL,
    direccion VARCHAR(255),

    CONSTRAINT FK_Ubicacion_Ciudad FOREIGN KEY (id_ciudad) REFERENCES Ciudad(id_ciudad)
);

CREATE TABLE Publicacion (
    id_publicacion INT IDENTITY PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_vehiculo INT NOT NULL,
    id_ubicacion INT NOT NULL,

    precio DECIMAL(10,2) NOT NULL CHECK (precio > 0),
    descripcion TEXT,

    estado VARCHAR(20) NOT NULL CHECK (estado IN ('activa','pausada','vendido','eliminada')),

    fecha_publicacion DATETIME DEFAULT GETDATE(),
    fecha_actualizacion DATETIME,

    CONSTRAINT FK_Publicacion_Usuario FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario),
    CONSTRAINT FK_Publicacion_Vehiculo FOREIGN KEY (id_vehiculo) REFERENCES Vehiculo(id_vehiculo),
    CONSTRAINT FK_Publicacion_Ubicacion FOREIGN KEY (id_ubicacion) REFERENCES Ubicacion(id_ubicacion)
);

CREATE TABLE Imagen (
    id_imagen INT IDENTITY PRIMARY KEY,
    id_publicacion INT NOT NULL,

    url_imagen VARCHAR(255) NOT NULL,
    orden_imagen INT DEFAULT 1,

    CONSTRAINT FK_Imagen_Publicacion FOREIGN KEY (id_publicacion) REFERENCES Publicacion(id_publicacion)
);

CREATE TABLE Chat (
    id_chat INT IDENTITY PRIMARY KEY,
    id_publicacion INT NOT NULL,
    id_comprador INT NOT NULL,
    id_vendedor INT NOT NULL,

    fecha_inicio DATETIME DEFAULT GETDATE(),
    estado VARCHAR(20) DEFAULT 'activo',

    CONSTRAINT FK_Chat_Publicacion FOREIGN KEY (id_publicacion) REFERENCES Publicacion(id_publicacion),
    CONSTRAINT FK_Chat_Comprador FOREIGN KEY (id_comprador) REFERENCES Usuario(id_usuario),
    CONSTRAINT FK_Chat_Vendedor FOREIGN KEY (id_vendedor) REFERENCES Usuario(id_usuario),
    CONSTRAINT CHK_Chat_Estado CHECK (estado IN ('activo', 'cerrado', 'archivado'))
);
CREATE UNIQUE INDEX UQ_Chat_Activo
ON Chat (id_comprador, id_publicacion)
WHERE estado = 'activo';

CREATE TABLE Mensaje (
    id_mensaje INT IDENTITY PRIMARY KEY,
    id_chat INT NOT NULL,
    id_usuario INT NOT NULL,

    contenido VARCHAR(500) NOT NULL,
    tipo VARCHAR(20) DEFAULT 'texto',
    leido BIT DEFAULT 0,

    fecha_envio DATETIME DEFAULT GETDATE(),
    fecha_lectura DATETIME,

    CONSTRAINT FK_Mensaje_Chat FOREIGN KEY (id_chat) REFERENCES CHAT(id_chat),
    CONSTRAINT FK_Mensaje_Usuario FOREIGN KEY (id_usuario) REFERENCES USUARIO(id_usuario),
    CONSTRAINT CHK_Tipo_Mensaje CHECK (tipo IN ('texto', 'imagen', 'sistema'))
);

CREATE TABLE Venta (
    id_venta INT IDENTITY PRIMARY KEY,
    id_publicacion INT NOT NULL,
    id_comprador INT NOT NULL,
    id_vendedor INT NOT NULL,

    fecha_venta DATETIME DEFAULT GETDATE(),
    monto DECIMAL(12,2) NOT NULL,

    estado_pago VARCHAR(20) DEFAULT 'pendiente',
    estado_venta VARCHAR(20) DEFAULT 'en proceso',

    observaciones VARCHAR(500),

    CONSTRAINT FK_Venta_Publicacion FOREIGN KEY (id_publicacion) REFERENCES Publicacion(id_publicacion),
    CONSTRAINT FK_Venta_Comprador FOREIGN KEY (id_comprador) REFERENCES Usuario(id_usuario),
    CONSTRAINT FK_Venta_Vendedor FOREIGN KEY (id_vendedor) REFERENCES Usuario(id_usuario),
    CONSTRAINT CHK_Estado_Pago CHECK (estado_pago IN ('pendiente', 'pagado', 'rechazado')),
    CONSTRAINT CHK_Estado_Venta CHECK (estado_venta IN ('en proceso', 'completada', 'cancelada'))
);

CREATE TABLE Favorito (
    id_favorito INT IDENTITY PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_publicacion INT NOT NULL,

    fecha_agregado DATETIME DEFAULT GETDATE(),

    CONSTRAINT FK_Favorito_Usuario FOREIGN KEY (id_usuario) REFERENCES USUARIO(id_usuario),
    CONSTRAINT FK_Favorito_Publicacion FOREIGN KEY (id_publicacion) REFERENCES PUBLICACION(id_publicacion),
    CONSTRAINT UQ_Favorito UNIQUE (id_usuario, id_publicacion)
);

CREATE TABLE Reporte (
    id_reporte INT IDENTITY PRIMARY KEY,
    id_usuario_reporta INT NOT NULL,
    id_usuario_reportado INT NULL,
    id_publicacion INT NULL,

    motivo VARCHAR(255),
    descripcion VARCHAR(500),

    estado VARCHAR(20) DEFAULT 'pendiente',
    fecha_reporte DATETIME DEFAULT GETDATE(),

    CONSTRAINT FK_Reporte_Reporta FOREIGN KEY (id_usuario_reporta) REFERENCES Usuario(id_usuario),
    CONSTRAINT FK_Reporte_Reportado FOREIGN KEY (id_usuario_reportado) REFERENCES Usuario(id_usuario),
    CONSTRAINT FK_Reporte_Publicacion FOREIGN KEY (id_publicacion) REFERENCES Publicacion(id_publicacion),
    CONSTRAINT CHK_ESTADO_Reporte CHECK (estado IN ('pendiente', 'revisado', 'rechazado', 'resuelto'))
);

CREATE TABLE Notificacion (
    id_notificacion INT IDENTITY PRIMARY KEY,
    id_usuario INT NOT NULL,

    titulo VARCHAR(100),
    mensaje VARCHAR(255),
    tipo VARCHAR(50),

    leida BIT DEFAULT 0,
    fecha_creacion DATETIME DEFAULT GETDATE(),

    CONSTRAINT FK_Notificacion_Usuario FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario)
);