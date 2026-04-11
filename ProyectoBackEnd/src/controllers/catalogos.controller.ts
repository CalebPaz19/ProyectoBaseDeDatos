import { Request, Response } from "express";
import { traerCatalogosVehiculo, traerMarcas, traerModelosSegunMarca, traerContinentes, traerPaisesSegunContinente, traerCiudadesSegunPais } from "../models/catalogos.model";


export const obtenerMarcas = async (req: Request, res: Response) => {
  const data = await traerMarcas();
  res.json(data);
};

export const obtenerModelos = async (req: Request, res: Response) => {
  const { id_marca } = req.params;
  const data = await traerModelosSegunMarca(Number(id_marca));
  res.json(data);
};

export const obtenerCatalogosVehiculo = async (req: Request, res: Response) => {
  try {
    const data = await traerCatalogosVehiculo();

    return res.json(data);

  } catch (error) {
    return res.status(500).json({
      message: "Error al obtener catálogos"
    });
  }
};

export const obtenerContinentes = async (req: Request, res: Response) => {
  const data = await traerContinentes();
  res.json(data);
};

export const obtenerPaises = async (req: Request, res: Response) => {
  const { id_continente } = req.params;
  const data = await traerPaisesSegunContinente(Number(id_continente));
  res.json(data);
};

export const obtenerCiudades = async (req: Request, res: Response) => {
  const { id_pais } = req.params;
  const data = await traerCiudadesSegunPais(Number(id_pais));
  res.json(data);
};