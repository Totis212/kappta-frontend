import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Categoria } from '../models/categoria.model';
import { Gasto } from '../models/gasto.model';

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {
  private apiUrl = 'http://localhost:5000/api/categorias';
  private gastosUrl = 'http://localhost:5000/api/gastos';
  private baseUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  getCategorias(usuarioId?: number): Observable<Categoria[]> {
    let url = this.apiUrl;
    if (usuarioId) {
      url += `?usuarioId=${usuarioId}`;
    }
    return this.http.get<Categoria[]>(url);
  }

  agregarGasto(gasto: Gasto): Observable<any> {
    return this.http.post(this.gastosUrl, gasto);
  }

  getGastosPorCategoria(categoriaId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.gastosUrl}/${categoriaId}`);
  }

  eliminarGasto(gastoId: number): Observable<any> {
    return this.http.delete(`${this.gastosUrl}/eliminar/${gastoId}`);
  }

  actualizarPresupuesto(categoriaId: number, presupuesto: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${categoriaId}`, { presupuesto });
  }

  getGastosPorFecha(inicio?: string, fin?: string): Observable<any[]> {
  let url = 'http://localhost:5000/api/gastos/fecha';
  if (inicio && fin) {
    url += `?inicio=${inicio}&fin=${fin}`;
  }
  return this.http.get<any[]>(url);
  }

  login(username: string, password: string): Observable<any> {
  return this.http.post('http://localhost:5000/api/login', { username, password });
  }

  registro(username: string, password: string): Observable<any> {
    return this.http.post('http://localhost:5000/api/registro', { username, password });
  }

  crearCategoria(nombre: string, presupuesto: number, usuarioId: number): Observable<any> {
    return this.http.post(this.apiUrl, { nombre, presupuesto, usuarioId });
  }

  guardarNomina(usuarioId: number, nomina: number, periodo: string): Observable<any> {
    return this.http.put(`http://localhost:5000/api/usuarios/${usuarioId}/nomina`, { nomina, periodo });
  }

  crearSobresRecomendados(usuarioId: number, nomina: number): Observable<any> {
    return this.http.post(`http://localhost:5000/api/usuarios/${usuarioId}/recomendar`, { nomina });
  }

  distribuirNomina(usuarioId: number, nomina: number, categoriasIds: number[]): Observable<any> {
    return this.http.post(`http://localhost:5000/api/usuarios/${usuarioId}/distribuir`, { nomina, categoriasIds });
  }

  getAhorro(usuarioId: number) {
    return this.http.get<any>(`${this.baseUrl}/ahorro/${usuarioId}`);
  }

  guardarAhorro(usuarioId: number, meta: number) {
    return this.http.post(`${this.baseUrl}/ahorro`, { usuarioId, meta });
  }

  moverSobrante(usuarioId: number) {
    return this.http.post<any>(`${this.baseUrl}/ahorro/mover-sobrante/${usuarioId}`, {});
  }

  getReporteSemanal(usuarioId: number) {
    return this.http.get<any[]>(`${this.baseUrl}/reportes/semanal/${usuarioId}`);
  }

  getReporteMensual(usuarioId: number) {
    return this.http.get<any[]>(`${this.baseUrl}/reportes/mensual/${usuarioId}`);
  }

  exportarPDF(usuarioId: number) {
    return this.http.get(`${this.baseUrl}/exportar/pdf/${usuarioId}`, { responseType: 'blob' });
  }

  exportarExcel(usuarioId: number) {
    return this.http.get(`${this.baseUrl}/exportar/excel/${usuarioId}`, { responseType: 'blob' });
  }
}