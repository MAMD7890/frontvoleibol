import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PagoDocenteDto {
  idProfesor: number;
  documento?: string;
  nombreProfesor: string;
  asistencias: number;
  salarioPorClase: number;
  totalCalculado: number;
  periodoDesde: string;
  periodoHasta: string;
}

export interface ReportePagoDocentesDto {
  pagos: PagoDocenteDto[];
  totalAPagar: number;
  cantidadDocentes: number;
  salarioPromedio: number;
}

@Injectable({
  providedIn: 'root'
})
export class ReportePagoDocenteService {
  private apiUrl = 'http://localhost:8080/api/reportes/pagos-docentes';

  constructor(private http: HttpClient) { }

  generarReporte(desde: string, hasta: string, nombre?: string, idDocente?: number): Observable<ReportePagoDocentesDto> {
    let params = new HttpParams()
      .set('desde', desde)
      .set('hasta', hasta);
    
    if (nombre) {
      params = params.set('nombre', nombre);
    }
    if (idDocente) {
      params = params.set('idDocente', idDocente.toString());
    }
    
    return this.http.get<ReportePagoDocentesDto>(this.apiUrl, { params });
  }
}
