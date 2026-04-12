import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
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