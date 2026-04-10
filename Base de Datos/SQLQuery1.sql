use AutoDrive
SELECT * FROM Usuario

ALTER TABLE Usuario
ALTER COLUMN foto_perfil VARCHAR(100) NULL;

ALTER TABLE Usuario
ALTER COLUMN dni VARCHAR(20) NOT NULL;

ALTER TABLE Usuario
DROP CONSTRAINT UQ__Usuario__D87608A7BA2F00E1;

EXEC sp_rename 'Usuario.contraseña', 'contrasena', 'COLUMN';

EXEC sp_rename 'Usuario.segundo_apellifo', 'segundo_apellido', 'COLUMN';

ALTER TABLE Usuario
ADD CONSTRAINT UQ_dniUnico UNIQUE (dni);

SELECT * FROM Usuario;

DELETE FROM Usuario;
DBCC CHECKIDENT ('Usuario', RESEED, 0);

ALTER TABLE Publicacion
ADD titulo VARCHAR(150) NOT NULL;

ALTER TABLE Vehiculo
ALTER COLUMN kilometraje INT NOT NULL;

ALTER TABLE Vehiculo
ALTER COLUMN color VARCHAR(50) NOT NULL;

ALTER TABLE Vehiculo
ALTER COLUMN cilindraje DECIMAL(4,2) NOT NULL;

SELECT * FROM Modelo;
SELECT * FROM Combustible;
SELECT * FROM Transmision;
SELECT * FROM TipoCarroceria;
SELECT * FROM CondicionVehiculo;
SELECT * FROM Marca;

SELECT * FROM Vehiculo

SELECT * FROM Ubicacion;

SELECT * FROM Publicacion;