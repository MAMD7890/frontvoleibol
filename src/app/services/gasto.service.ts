import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Sede {
  id?: number;
  idSede?: number;
  nombre?: string;
}

export interface Gasto {
  id?: number;
  idGasto?: number;
  concepto: string;
  descripcion: string;
  monto: number;
  fecha: string;
  sede: Sede;
}

export interface GastoResumenReporteDto {
  gastos: Gasto[];
  totalMonto: number;
  cantidadGastos: number;
}

@Injectable({
  providedIn: 'root'
})
export class GastoService {
  private apiUrl = 'http://localhost:8081/api/gastos';
  private sedesUrl = 'http://localhost:8081/api/sedes';

  constructor(private http: HttpClient) { }

  obtenerGastos(): Observable<Gasto[]> {
    return this.http.get<Gasto[]>(this.apiUrl);
  }

  obtenerGastoPorId(id: number): Observable<Gasto> {
    return this.http.get<Gasto>(`${this.apiUrl}/${id}`);
  }

  crearGasto(gasto: Gasto): Observable<Gasto> {
    return this.http.post<Gasto>(this.apiUrl, gasto);
  }

  actualizarGasto(id: number, gasto: Gasto): Observable<Gasto> {
    return this.http.put<Gasto>(`${this.apiUrl}/${id}`, gasto);
  }

  eliminarGasto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  generarReporte(desde: string, hasta: string, sedeId?: number, concepto?: string, descripcion?: string): Observable<GastoResumenReporteDto> {
    let params = new HttpParams()
      .set('desde', desde)
      .set('hasta', hasta);
    
    if (sedeId) {
      params = params.set('sedeId', sedeId.toString());
    }
    if (concepto) {
      params = params.set('concepto', concepto);
    }
    if (descripcion) {
      params = params.set('descripcion', descripcion);
    }
    
    return this.http.get<GastoResumenReporteDto>(`${this.apiUrl}/reporte`, { params });
  }

  obtenerSedes(): Observable<Sede[]> {
    return this.http.get<Sede[]>(this.sedesUrl);
  }
}
