import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Sede {
  id?: number;
  idSede?: number;
  nombre: string;
  direccion: string;
  telefono: string;
  estado: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SedeService {
  private apiUrl = 'http://localhost:8080/api/sedes';

  constructor(private http: HttpClient) { }

  obtenerSedes(): Observable<Sede[]> {
    return this.http.get<Sede[]>(this.apiUrl);
  }

  obtenerSedePorId(id: number): Observable<Sede> {
    return this.http.get<Sede>(`${this.apiUrl}/${id}`);
  }

  obtenerActivos(): Observable<Sede[]> {
    return this.http.get<Sede[]>(`${this.apiUrl}/activos/lista`);
  }

  crearSede(sede: Sede): Observable<Sede> {
    return this.http.post<Sede>(this.apiUrl, sede);
  }

  actualizarSede(id: number, sede: Sede): Observable<Sede> {
    return this.http.put<Sede>(`${this.apiUrl}/${id}`, sede);
  }

  eliminarSede(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  desactivarSede(id: number): Observable<Sede> {
    return this.http.patch<Sede>(`${this.apiUrl}/${id}/desactivar`, {});
  }
}
