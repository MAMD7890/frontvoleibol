import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Profesor {
  id?: number;
  idProfesor?: number;
  nombre: string;
  documento: string;
  telefono: string;
  salarioPorClase: number;
  fotoUrl?: string;
  fotoNombre?: string;
  estado: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ProfesorService {
  private apiUrl = 'http://localhost:8081/api/profesores';

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
