import { Request, Response } from "express";
import { guardarVehiculo } from "../models/vehiculo.model";

export const crearVehiculo = async (req: Request, res: Response) => {
  try {
    const {
      id_modelo,
      id_combustible,
      id_transmision,
      id_carroceria,
      id_condicion_vehiculo,
      año,
      kilometraje,
      color,
      num_puertas,
      cilindraje,
      vin,
      placa,
      descripcion_general
    } = req.body;

    // validación básica
    if (
      !id_modelo ||
      !id_combustible ||
      !id_transmision ||
      !id_carroceria ||
      !id_condicion_vehiculo ||
      !año ||
      !vin ||
      !kilometraje ||
      !color
    ) {
      return res.status(400).json({
        message: "Faltan campos obligatorios"
      });
    }

    const nuevo = await guardarVehiculo({
      id_modelo,
      id_combustible,
      id_transmision,
      id_carroceria,
      id_condicion_vehiculo,
      año,
      kilometraje,
      color,
      num_puertas,
      cilindraje,
      vin,
      placa,
      descripcion_general
    });

    return res.status(201).json({
      message: "Vehículo creado",
      id_vehiculo: nuevo.id_vehiculo
    });

  } catch (error: any) {

    // VIN o placa duplicada
    if (error.number === 2627) {
      return res.status(400).json({
        message: "VIN o placa ya existen"
      });
    }

    // FK inválida
    if (error.number === 547) {
      return res.status(400).json({
        message: "Error en datos de catálogo (modelo, combustible, etc.)"
      });
    }

    return res.status(500).json({
      message: "Error en el servidor"
    });
  }
};