import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Sede {
  id?: number;
  idSede?: number;
  nombre?: string;
  nombreSede?: string;
  direction?: string;
  direccion?: string;
  ciudad?: string;
}

export interface Estudiante {
  idEstudiante?: number;
  nombreCompleto: string;
  tipoDocumento: string;
  numeroDocumento: string;
  fechaNacimiento: string;
  edad: number;
  sexo: string;
  direccionResidencia: string;
  barrio: string;
  celularEstudiante: string;
  whatsappEstudiante?: string;
  correoEstudiante: string;
  sede: Sede;
  nombreTutor: string;
  parentescoTutor: string;
  documentoTutor: string;
  telefonoTutor: string;
  correoTutor: string;
  ocupacionTutor?: string;
  institucionEducativa: string;
  jornada: string;
  gradoActual: number;
  eps: string;
  tipoSangre: string;
  alergias?: string;
  enfermedadesCondiciones?: string;
  medicamentos?: string;
  certificadoMedicoDeportivo: boolean;
  nombreCamiseta?: string;
  numeroCamiseta?: number;
  estado: boolean;
}

export interface RegistroEstudianteResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: {
    id: number;
    nombre: string;
    email: string;
    fotoUrl: string | null;
    rol: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class EstudianteService {
  private apiUrl = 'http://localhost:8080/api/estudiantes';
  private sedesUrl = 'http://localhost:8080/api/sedes';

  constructor(private http: HttpClient) { }

  obtenerEstudiantes(): Observable<Estudiante[]> {
    return this.http.get<Estudiante[]>(this.apiUrl);
  }

  obtenerEstudiante(id: number): Observable<Estudiante> {
    return this.http.get<Estudiante>(`${this.apiUrl}/${id}`);
  }

  obtenerSedes(): Observable<Sede[]> {
    return this.http.get<Sede[]>(this.sedesUrl);
  }

  crearEstudiante(estudiante: Estudiante): Observable<Estudiante> {
    return this.http.post<Estudiante>(this.apiUrl, estudiante);
  }

  registrarEstudiante(estudiante: Estudiante): Observable<RegistroEstudianteResponse> {
    return this.http.post<RegistroEstudianteResponse>(`${this.apiUrl}/registro`, estudiante);
  }

  actualizarEstudiante(id: number, estudiante: Estudiante): Observable<Estudiante> {
    return this.http.put<Estudiante>(`${this.apiUrl}/${id}`, estudiante);
  }

  eliminarEstudiante(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
