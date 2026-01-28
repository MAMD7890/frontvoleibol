 import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Sede {
  idSede?: number;
  nombre?: string;
}

export interface Equipo {
  idEquipo?: number;
  nombre?: string;
}

export interface Estudiante {
  idEstudiante?: number;
  nombreCompleto?: string;
  tipoDocumento?: string;
  numeroDocumento?: string;
  fechaNacimiento?: string;
  edad?: number;
  sexo?: string;
  sede?: Sede;
  estado?: boolean;
}

export interface AsistenciaEstudiante {
  idAsistencia?: number;
  estudiante?: Estudiante;
  equipo?: Equipo;
  fecha?: string;
  asistio?: boolean;
  observaciones?: string;
}

export interface EstudianteAsistenciaDto {
  idEstudiante: number;
  numeroDocumento: string;
  nombreCompleto: string;
  sede: string;
  asistio: boolean;
  observaciones?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AsistenciaEstudianteService {
  private apiUrl = 'http://localhost:8081/api/asistencia-estudiante';
  private estudiantesUrl = 'http://localhost:8081/api/estudiantes';
  private equiposUrl = 'http://localhost:8081/api/equipos';

  constructor(private http: HttpClient) { }

  obtenerTodos(): Observable<AsistenciaEstudiante[]> {
    return this.http.get<AsistenciaEstudiante[]>(this.apiUrl);
  }

  obtenerPorId(id: number): Observable<AsistenciaEstudiante> {
    return this.http.get<AsistenciaEstudiante>(`${this.apiUrl}/${id}`);
  }

  crear(asistencia: AsistenciaEstudiante): Observable<AsistenciaEstudiante> {
    return this.http.post<AsistenciaEstudiante>(this.apiUrl, asistencia);
  }

  actualizar(id: number, asistencia: AsistenciaEstudiante): Observable<AsistenciaEstudiante> {
    return this.http.put<AsistenciaEstudiante>(`${this.apiUrl}/${id}`, asistencia);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  obtenerEstudiantes(): Observable<Estudiante[]> {
    return this.http.get<Estudiante[]>(this.estudiantesUrl);
  }

  obtenerEquipos(): Observable<Equipo[]> {
    return this.http.get<Equipo[]>(this.equiposUrl);
  }

  obtenerSedes(): Observable<Sede[]> {
    return this.http.get<Sede[]>('http://localhost:8081/api/sedes');
  }
}
