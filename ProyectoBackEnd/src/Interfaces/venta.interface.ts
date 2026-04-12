export interface Venta {
  id_venta?:      number;
  id_publicacion: number;
  id_comprador:   number;
  id_vendedor:    number;
  monto:          number;
  estado_pago?:   'pendiente' | 'pagado' | 'rechazado';
  estado_venta?:  'en proceso' | 'completada' | 'cancelada';
  observaciones?: string;
  fecha_venta?:   Date;
}