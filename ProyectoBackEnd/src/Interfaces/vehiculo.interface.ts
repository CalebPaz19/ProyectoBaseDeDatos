export interface Vehiculo {
  id_vehiculo?: number

  id_modelo: number
  id_combustible: number
  id_transmision: number
  id_carroceria: number
  id_condicion_vehiculo: number
  año: number
  kilometraje: number
  color: string
  num_puertas?: number
  cilindraje: number
  vin: string
  placa?: string
  descripcion_general?: string
}