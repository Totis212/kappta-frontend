export interface ReporteSemanal {
  categoria: string;
  totalGastado: number;
  numGastos: number;
  semana: number;
  anio: number;
}

export interface ReporteMensual {
  categoria: string;
  presupuesto: number;
  totalGastado: number;
  numGastos: number;
  mes: number;
  anio: number;
  porcentaje: number;
  disponible: number;
}