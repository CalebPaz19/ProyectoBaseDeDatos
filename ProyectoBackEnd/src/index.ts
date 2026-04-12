import express,{ Express } from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { poolPromise } from "./config/baseDeDatos";
import usuariosRouter from './routers/usuarios.router';
import publicacionRouter from './routers/publicacion.router'
import vehiculoRouter from "./routers/vehiculo.router";
import catalogosRouter from "./routers/catalogos.router";
import ubicacionRouter from "./routers/ubicacion.router";
import imagenRouter from "./routers/imagen.router";
import adminRouter from "./routers/admin.router";
import ventaRouter from "./routers/venta.router";
import reporteRouter from "./routers/reporte.router";
import favoritoRouter from "./routers/favorito.router";
import chatRouter from "./routers/chat.router";

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

const uploadsDir = path.join(process.cwd(), "uploads");
app.use("/uploads", express.static(uploadsDir));
console.log("📁 Uploads en:", uploadsDir);

app.get("/uploads-check", (_req, res) => {
  try {
    const archivos = fs.readdirSync(uploadsDir);
    res.json({ carpeta: uploadsDir, archivos, total: archivos.length });
  } catch {
    res.json({ carpeta: uploadsDir, error: "La carpeta no existe o está vacía" });
  }
});

// rutas
app.use('/autoDrive', usuariosRouter);
app.use('/autoDrive', publicacionRouter);
app.use('/autoDrive', vehiculoRouter);
app.use('/autoDrive', catalogosRouter);
app.use('/autoDrive', ubicacionRouter);
app.use('/autoDrive', imagenRouter);
app.use("/autoDrive", adminRouter);
app.use("/autoDrive", ventaRouter);
app.use("/autoDrive", favoritoRouter);
app.use("/autoDrive", reporteRouter);
app.use("/autoDrive", chatRouter);


