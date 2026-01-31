import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Profesor {
  id?: number;
  idProfesor?: number;
  nombre: string;
  documento: string;
  telefono: string;
  correo?: string;
  salarioPorClase: number;
  fotoUrl?: string;
  fotoNombre?: string;
  estado: boolean;
}

export interface ProfesorRegistroResponse {
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

export interface FileUploadResponse {
  storedFileName: string;
  originalFileName: string;
  fileUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProfesorService {
  private apiUrl = 'http://localhost:8080/api/profesores';
  private uploadUrl = 'http://localhost:8080/api/files';

  constructor(private http: HttpClient) { }

  obtenerProfesores(): Observable<Profesor[]> {
    return this.http.get<Profesor[]>(this.apiUrl);
  }

  obtenerProfesorPorId(id: number): Observable<Profesor> {
    return this.http.get<Profesor>(`${this.apiUrl}/${id}`);
  }

  obtenerActivos(): Observable<Profesor[]> {
    return this.http.get<Profesor[]>(`${this.apiUrl}/activos/lista`);
  }

  crearProfesor(profesor: Profesor): Observable<Profesor> {
    return this.http.post<Profesor>(this.apiUrl, profesor);
  }

  // Crear profesor con usuario automático (rol PROFESOR) - sin foto
  registrarProfesorConUsuario(profesor: Profesor): Observable<ProfesorRegistroResponse> {
    return this.http.post<ProfesorRegistroResponse>(`${this.apiUrl}/registrar`, profesor);
  }

  // Crear profesor con usuario y foto en una sola petición (FormData)
  registrarProfesorConFoto(profesor: Profesor, foto: File): Observable<ProfesorRegistroResponse> {
    const formData = new FormData();
    formData.append('nombre', profesor.nombre);
    formData.append('documento', profesor.documento);
    formData.append('correo', profesor.correo || '');
    formData.append('telefono', profesor.telefono);
    formData.append('salarioPorClase', profesor.salarioPorClase.toString());
    formData.append('foto', foto);
    
    return this.http.post<ProfesorRegistroResponse>(`${this.apiUrl}/registrar-con-foto`, formData);
  }

  // Subir/actualizar foto del profesor
  uploadFoto(profesorId: number, file: File): Observable<Profesor> {
    const formData = new FormData();
    formData.append('foto', file);
    return this.http.post<Profesor>(`${this.apiUrl}/${profesorId}/foto`, formData);
  }

  actualizarProfesor(id: number, profesor: Profesor): Observable<Profesor> {
    return this.http.put<Profesor>(`${this.apiUrl}/${id}`, profesor);
  }

  eliminarProfesor(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  desactivarProfesor(id: number): Observable<Profesor> {
    return this.http.patch<Profesor>(`${this.apiUrl}/${id}/desactivar`, {});
  }
}
