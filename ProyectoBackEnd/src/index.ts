import express,{ Express } from "express";
import cors from "cors";
import { poolPromise } from "./config/baseDeDatos";
import usuariosRouter from './routers/usuarios.router';
import publicacionRouter from './routers/publicacion.router'
import vehiculoRouter from "./routers/vehiculo.router";
import catalogosRouter from "./routers/catalogos.router";
import ubicacionRouter from "./routers/ubicacion.router";
import path from "path";
import imagenRouter from "./routers/imagen.router";

const app: Express = express();

app.use(cors()); //para habilitar cors

app.use(express.json());

async function startApp() {
  try {
    // Esperamos a que la conexión se complete
    const pool = await poolPromise; 
    console.log("Base de datos conectada");
    
    app.listen(3000, () => {
      console.log('Servidor corriendo en puerto 3000');
    });
    
  } catch (err) {
    console.error("No se pudo iniciar la app debido a la base de datos");
  }
}

startApp();
// rutas
app.use('/autoDrive', usuariosRouter);
app.use('/autoDrive', publicacionRouter);
app.use('/autoDrive', vehiculoRouter);
app.use('/autoDrive', catalogosRouter);
app.use('/autoDrive', ubicacionRouter);
app.use('/autoDrive', imagenRouter);
// app.use('/autoDrive', imagenRouter);
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));