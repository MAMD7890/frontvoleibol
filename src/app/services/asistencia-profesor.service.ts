import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ProfesorAttendanceDto {
  idProfesor: number;
  nombre: string;
  salarioPorClase: number;
  asistio: boolean;
  fechaAsistencia?: string;
}

export interface ProfesorAttendanceMarkRequest {
  idProfesor: number;
  fecha: string;
}

export interface ProfesorPagoDto {
  idProfesor: number;
  nombre: string;
  asistencias: number;
  salarioPorClase: number;
  totalPagar: number;
}

export interface Sede {
  id?: number;
  idSede?: number;
  nombre?: string;
}

export interface Equipo {
  id?: number;
  idEquipo?: number;
  nombre?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AsistenciaProfesorService {
  private apiUrl = 'http://localhost:8080/api/profesor/asistencia';
  private sedesUrl = 'http://localhost:8080/api/sedes';
  private equiposUrl = 'http://localhost:8080/api/equipos';

  constructor(private http: HttpClient) { }

  listarProfesoresConAsistencia(fecha: string, sedeId?: number, equipoId?: number, nombre?: string): Observable<ProfesorAttendanceDto[]> {
    let params = new HttpParams().set('date', fecha);
    
    if (sedeId) {
      params = params.set('sedeId', sedeId.toString());
    }
    if (equipoId) {
      params = params.set('equipoId', equipoId.toString());
    }
    if (nombre) {
      params = params.set('nombre', nombre);
    }
    
    return this.http.get<ProfesorAttendanceDto[]>(`${this.apiUrl}/list`, { params });
  }

  registrarAsistencia(marcas: ProfesorAttendanceMarkRequest[]): Observable<any[]> {
    return this.http.post<any[]>(`${this.apiUrl}/registrar`, marcas);
  }

  obtenerMarcasPorFecha(fecha: string): Observable<any[]> {
    const params = new HttpParams().set('date', fecha);
    return this.http.get<any[]>(`${this.apiUrl}/marcas`, { params });
  }

  calcularPagos(desde: string, hasta: string): Observable<ProfesorPagoDto[]> {
    const params = new HttpParams()
      .set('desde', desde)
      .set('hasta', hasta);
    return this.http.get<ProfesorPagoDto[]>(`${this.apiUrl}/pagos`, { params });
  }

  obtenerSedes(): Observable<Sede[]> {
    return this.http.get<Sede[]>(this.sedesUrl);
  }

  obtenerEquipos(): Observable<Equipo[]> {
    return this.http.get<Equipo[]>(this.equiposUrl);
  }
}
