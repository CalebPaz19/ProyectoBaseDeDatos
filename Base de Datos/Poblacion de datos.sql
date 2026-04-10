use AutoDrive

-- TRANSMISSION
INSERT INTO Transmision(nombre) 
VALUES 
('Manual'),
('Automática'),
('CVT'),
('Secuencial');

-- TIPO_CARROCERIA
INSERT INTO TipoCarroceria (nombre) 
VALUES 
('Sedán'),
('Hatchback'),
('SUV'),
('Pickup'),
('Coupé'),
('Convertible');

-- COMBUSTIBLE
INSERT INTO Combustible(nombre)
VALUES 
('Gasolina'),
('Diésel'),
('Eléctrico'),
('Híbrido'),
('Gas LP');

-- CONDICION VEHICULO
INSERT INTO CondicionVehiculo(nombre) 
VALUES 
('Semi nuevo'),
('Usado'),
('Chocado');

-- MARCA
INSERT INTO Marca(nombre) 
VALUES 
('Toyota'),
('Honda'),
('Ford'),
('Chevrolet'),
('Nissan');

-- UBICACION
-- Primero poblar CONTINENTE
INSERT INTO Continente(nombre) 
VALUES 
('América'),
('Europa');

-- Luego PAIS
INSERT INTO PAIS (id_continente, nombre) 
VALUES 
(1, 'Honduras'),
(1, 'México'),
(2, 'España');

-- CIUDAD
INSERT INTO CIUDAD (id_pais, nombre) 
VALUES 
(1, 'Tegucigalpa'),
(1, 'San Pedro Sula'),
(2, 'Ciudad de México'),
(3, 'Madrid');

-- UBICACION
INSERT INTO Ubicacion(id_ciudad, direccion) 
VALUES 
(1, 'Colonia Centro'),
(2, 'Barrio Los Andes'),
(3, 'Polanco'),
(4, 'Gran Vía');

