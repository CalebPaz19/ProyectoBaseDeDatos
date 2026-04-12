import { Router } from "express";
import {comprarVehiculo, misCompras, misVentas, detalleVenta, todasLasVentas, cambiarEstadoPago, cambiarEstadoVenta} from "../controllers/venta.controller";
 
const router = Router();
 
//Realizar una compra
router.post("/venta/comprar", comprarVehiculo);
 
//Historial de compras de un usuario
router.get("/venta/misCompras/:id_usuario", misCompras);
 
//Historial de ventas de un usuario (como vendedor)
router.get("/venta/misVentas/:id_usuario", misVentas);
 
//Detalle de una venta
router.get("/venta/detalle/:id_venta", detalleVenta);
 
//Actualizar estado de pago  (pendiente | pagado | rechazado)
router.patch("/venta/:id_venta/estadoPago", cambiarEstadoPago);
 
//Actualizar estado de venta (en proceso | completada | cancelada)
router.patch("/venta/:id_venta/estadoVenta", cambiarEstadoVenta);
 
//Todas las ventas con filtros (admin)
router.get("/admin/ventas", todasLasVentas);
 
export default router;