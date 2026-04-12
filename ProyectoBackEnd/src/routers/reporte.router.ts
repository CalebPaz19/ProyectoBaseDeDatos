import { Router } from "express";
import {reportar, misReportes, listarTodos, detalle, gestionarReporte } from "../controllers/reporte.controller";

const router = Router();

//Usuario: crear un reporte
router.post("/reporte/crear", reportar);

//Usuario: ver sus propios reportesrouter.get("/reporte/misReportes/:id_usuario", misReportes);
router.get("/reporte/misReportes/:id_usuario", misReportes);

//Admin: listar todos los reportes (con filtro ?estado=pendiente)
router.get("/admin/reportes", listarTodos);

//Admin: ver detalle de un reporte
router.get("/admin/reportes/:id_reporte", detalle);

//Admin: gestionar un reporte (cambiar estado, suspender, eliminar)
router.patch("/admin/reportes/:id_reporte", gestionarReporte);

export default router;