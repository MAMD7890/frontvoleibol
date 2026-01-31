import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Categoria {
  id?: number;
  idCategoria?: number;
  nombre?: string;
}

export interface Sede {
  id?: number;
  idSede?: number;
  nombre?: string;
  nombreSede?: string;
  direccion?: string;
}

export interface Equipo {
  id?: number;
  idEquipo?: number;
  nombre: string;
  categoria: Categoria;
  sede: Sede;
  horario: string;
  fotoUrl?: string;
  estado: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class EquipoService {
  private apiUrl = 'http://localhost:8080/api/equipos';
  private sedesUrl = 'http://localhost:8080/api/sedes';
  private categoriasUrl = 'http://localhost:8080/api/categorias';

  constructor(private http: HttpClient) { }

  // Obtener sedes desde el backend
  obtenerSedes(): Observable<Sede[]> {
    return this.http.get<Sede[]>(this.sedesUrl);
  }

  // Obtener categorías desde el backend
  obtenerCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(this.categoriasUrl);
  }

  obtenerEquipos(): Observable<Equipo[]> {
    return this.http.get<Equipo[]>(this.apiUrl);
  }

  obtenerEquipoPorId(id: number): Observable<Equipo> {
    return this.http.get<Equipo>(`${this.apiUrl}/${id}`);
  }

  obtenerActivos(): Observable<Equipo[]> {
    return this.http.get<Equipo[]>(`${this.apiUrl}/activos/lista`);
  }

  obtenerPorSede(idSede: number): Observable<Equipo[]> {
    return this.http.get<Equipo[]>(`${this.apiUrl}/sede/${idSede}`);
  }

  obtenerPorCategoria(idCategoria: number): Observable<Equipo[]> {
    return this.http.get<Equipo[]>(`${this.apiUrl}/categoria/${idCategoria}`);
  }

  crearEquipo(equipo: Equipo): Observable<Equipo> {
    return this.http.post<Equipo>(this.apiUrl, equipo);
  }

  actualizarEquipo(id: number, equipo: Equipo): Observable<Equipo> {
    return this.http.put<Equipo>(`${this.apiUrl}/${id}`, equipo);
  }

  eliminarEquipo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  desactivarEquipo(id: number): Observable<Equipo> {
    return this.http.patch<Equipo>(`${this.apiUrl}/${id}/desactivar`, {});
  }
}
