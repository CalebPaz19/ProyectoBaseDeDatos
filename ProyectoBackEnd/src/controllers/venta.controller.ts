import { Request, Response } from "express";
import { poolPromise } from "../config/baseDeDatos";
import { registrarVenta, obtenerPublicacionParaCompra, obtenerComprasDeUsuario, obtenerVentasDeUsuario, obtenerDetalleVenta, listarTodasLasVentas, actualizarEstadoPago, actualizarEstadoVenta, obtenerVentaPorId } from "../models/venta.model";
import { actualizarEstadoPublicacion } from "../models/publicacion.model";

//Comprar un vehículo
export const comprarVehiculo = async (req: Request, res: Response) => {
  const pool = await poolPromise;
  const tx   = pool.transaction();

  try {
    const { id_publicacion, id_comprador, observaciones } = req.body;

    if (!id_publicacion || !id_comprador) {
      return res.status(400).json({
        message: "Se requieren id_publicacion e id_comprador",
      });
    }

    await tx.begin();

    // 1. Obtener y validar la publicación
    const publicacion = await obtenerPublicacionParaCompra(
      Number(id_publicacion),
      tx
    );

    if (!publicacion) {
      await tx.rollback();
      return res.status(404).json({ message: "Publicación no encontrada" });
    }

    if (publicacion.estado !== "activa") {
      await tx.rollback();
      return res.status(400).json({
        message: `Este vehículo ya no está disponible (estado: ${publicacion.estado})`,
      });
    }

    if (publicacion.id_vendedor === Number(id_comprador)) {
      await tx.rollback();
      return res.status(400).json({
        message: "No puedes comprar tu propia publicación",
      });
    }

    // 2. Registrar la venta con vendedor explícito
    const venta = await registrarVenta(
      {
        id_publicacion: Number(id_publicacion),
        id_comprador:   Number(id_comprador),
        id_vendedor:    publicacion.id_vendedor,
        monto:          publicacion.precio,
        observaciones:  observaciones || null,
      },
      tx
    );

    // 3. Marcar la publicación como vendida
    await tx.request()
      .input("id_publicacion", Number(id_publicacion))
      .input("estado", "vendido")
      .query(`
        UPDATE Publicacion
        SET estado = @estado
        WHERE id_publicacion = @id_publicacion
      `);

    await tx.commit();

    return res.status(201).json({
      message:      "¡Compra registrada exitosamente!",
      id_venta:     venta.id_venta,
      fecha_venta:  venta.fecha_venta,
      estado_pago:  venta.estado_pago,
      estado_venta: venta.estado_venta,
      titulo:       publicacion.titulo,
      monto:        publicacion.precio,
    });

  } catch (error: any) {
    await tx.rollback();
    console.error("Error comprarVehiculo:", error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

//Actualizar estado de pago
export const cambiarEstadoPago = async (req: Request, res: Response) => {
  const pool = await poolPromise;
  const tx   = pool.transaction();

  try {
    const { id_venta }    = req.params;
    const { estado_pago } = req.body;

    const validos = ["pendiente", "pagado", "rechazado"];
    if (!estado_pago || !validos.includes(estado_pago)) {
      return res.status(400).json({
        message: `estado_pago debe ser: ${validos.join(", ")}`,
      });
    }

    await tx.begin();

    // 1. Obtener la venta para saber a qué publicación afecta
    const venta = await obtenerVentaPorId(Number(id_venta), tx);
    if (!venta) {
      await tx.rollback();
      return res.status(404).json({ message: "Venta no encontrada" });
    }

    // 2. Actualizar estado de pago
    await actualizarEstadoPago(Number(id_venta), estado_pago);

    // 3. Si el pago fue rechazado → venta cancelada + publicación activa de nuevo
    if (estado_pago === "rechazado") {
      await actualizarEstadoVenta(Number(id_venta), "cancelada", "Pago rechazado");
      await actualizarEstadoPublicacion(venta.id_publicacion, "activa");
    }

    await tx.commit();

    return res.json({
      message: `Estado de pago actualizado a '${estado_pago}'`,
      ...(estado_pago === "rechazado" && {
        nota: "La publicación volvió a estar activa y la venta fue cancelada",
      }),
    });

  } catch (error: any) {
    await tx.rollback();
    console.error("Error cambiarEstadoPago:", error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

//Actualizar estado de venta
export const cambiarEstadoVenta = async (req: Request, res: Response) => {
  const pool = await poolPromise;
  const tx   = pool.transaction();

  try {
    const { id_venta }                    = req.params;
    const { estado_venta, observaciones } = req.body;

    const validos = ["en proceso", "completada", "cancelada"];
    if (!estado_venta || !validos.includes(estado_venta)) {
      return res.status(400).json({
        message: `estado_venta debe ser: ${validos.join(", ")}`,
      });
    }

    await tx.begin();

    // 1. Obtener la venta para saber a qué publicación afecta
    const venta = await obtenerVentaPorId(Number(id_venta), tx);
    if (!venta) {
      await tx.rollback();
      return res.status(404).json({ message: "Venta no encontrada" });
    }

    // 2. Actualizar estado de venta
    await actualizarEstadoVenta(Number(id_venta), estado_venta, observaciones);

    // 3. Actualizar publicación según el nuevo estado
    if (estado_venta === "completada") {
      // Venta cerrada con éxito → publicación vendida definitivamente
      await actualizarEstadoPublicacion(venta.id_publicacion, "vendido");
    } else if (estado_venta === "cancelada") {
      // Venta cancelada → publicación vuelve a estar activa
      await actualizarEstadoPublicacion(venta.id_publicacion, "activa");
    }
    // "en proceso" no cambia el estado de la publicación

    await tx.commit();

    const notas: Record<string, string> = {
      completada: "La publicación quedó marcada como vendida",
      cancelada:  "La publicación volvió a estar activa y disponible",
    };

    return res.json({
      message: `Estado de venta actualizado a '${estado_venta}'`,
      ...(notas[estado_venta] && { nota: notas[estado_venta] }),
    });

  } catch (error: any) {
    await tx.rollback();
    console.error("Error cambiarEstadoVenta:", error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

//Mis compras
export const misCompras = async (req: Request, res: Response) => {
  try {
    const { id_usuario } = req.params;

    const compras = await obtenerComprasDeUsuario(Number(id_usuario));

    return res.json({ compras });

  } catch (error: any) {
    console.error("Error misCompras:", error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

//Mis ventas
export const misVentas = async (req: Request, res: Response) => {
  try {
    const { id_usuario } = req.params;

    const ventas = await obtenerVentasDeUsuario(Number(id_usuario));

    return res.json({ ventas });

  } catch (error: any) {
    console.error("Error misVentas:", error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

//Detalle de una venta
export const detalleVenta = async (req: Request, res: Response) => {
  try {
    const { id_venta } = req.params;

    const venta = await obtenerDetalleVenta(Number(id_venta));

    if (!venta) {
      return res.status(404).json({ message: "Venta no encontrada" });
    }

    return res.json({ venta });

  } catch (error: any) {
    console.error("Error detalleVenta:", error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

//Todas las ventas (admin)
export const todasLasVentas = async (req: Request, res: Response) => {
  try {
    const { estado_venta, estado_pago, pagina, por_pagina } = req.query;

    const ventas = await listarTodasLasVentas({
      estado_venta: estado_venta as string | undefined,
      estado_pago:  estado_pago  as string | undefined,
      pagina:       pagina       ? Number(pagina)     : 1,
      por_pagina:   por_pagina   ? Number(por_pagina) : 20,
    });

    return res.json({ ventas });

  } catch (error: any) {
    console.error("Error todasLasVentas:", error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};