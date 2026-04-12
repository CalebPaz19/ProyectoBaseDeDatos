import multer from "multer";
import path from "path";
import fs from "fs";

const UPLOADS_DIR = path.join(process.cwd(), "uploads");

// Crear la carpeta si no existe
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  console.log("Carpeta uploads creada en:", UPLOADS_DIR);
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const filtro: multer.Options["fileFilter"] = (_req, file, cb) => {
  const tipos = ["image/jpeg", "image/png", "image/webp"];
  if (tipos.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Solo se permiten imágenes JPG, PNG o WEBP"));
  }
};
export const upload = multer(
  { storage,
   fileFilter: filtro, 
  });
 
// Exportar la ruta para usarla en el service al construir la URL
export const UPLOADS_PATH = UPLOADS_DIR;