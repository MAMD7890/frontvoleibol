import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { 
  AsistenciaEstudianteService, 
  Estudiante, 
  Equipo,
  Sede,
  AsistenciaEstudiante,
  EstudianteAsistenciaDto
} from '../services/asistencia-estudiante.service';

@Component({
  selector: 'app-student-attendance',
  templateUrl: './student-attendance.component.html',
  styleUrls: ['./student-attendance.component.css']
})
export class StudentAttendanceComponent implements OnInit {
  // Datos
  estudiantes: Estudiante[] = [];  
  estudiantesFiltrados: EstudianteAsistenciaDto[] = [];
  equipos: Equipo[] = [];
  sedes: Sede[] = [];
  asistenciasRegistradas: AsistenciaEstudiante[] = [];
  
  // Filtros
  fechaSeleccionada: string = '';
  filtroEquipo: string = '';
  filtroSede: string = '';
  filtroNombre: string = '';
  
  // Estados
  cargando = false;
  guardando = false;
  
  // Selección de asistencia
  asistenciaSeleccionada: Map<number, boolean> = new Map();
  observacionesMap: Map<number, string> = new Map();

  constructor(
    private asistenciaService: AsistenciaEstudianteService,
    private toastr: ToastrService
  ) {
    // Establecer fecha de hoy por defecto
    this.fechaSeleccionada = new Date().toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.cargarSedes();
    this.cargarEquipos();
    this.cargarEstudiantes();
  }

  // ========== HELPERS ==========
  getEquipoId(equipo: Equipo): number | null {
    return equipo.idEquipo || null;
  }

  getSedeId(sede: Sede): number | null {
    return sede.idSede || null;
  }

  getEstudianteId(estudiante: Estudiante): number | null {
    return estudiante.idEstudiante || null;
  }

  // ========== CARGA DE DATOS ==========
  cargarSedes(): void {
    this.asistenciaService.obtenerSedes().subscribe(
      (data: Sede[]) => {
        this.sedes = data;
      },
      (error) => {
        console.error('Error al cargar sedes:', error);
      }
    );
  }

  cargarEquipos(): void {
    this.asistenciaService.obtenerEquipos().subscribe(
      (data: Equipo[]) => {
        this.equipos = data;
      },
      (error) => {
        console.error('Error al cargar equipos:', error);
      }
    );
  }

  cargarEstudiantes(): void {
    this.cargando = true;
    
    this.asistenciaService.obtenerEstudiantes().subscribe(
      (data: Estudiante[]) => {
        this.estudiantes = data;
        this.cargarAsistenciasDelDia();
      },
      (error) => {
        console.error('Error al cargar estudiantes:', error);
        this.toastr.error('Error al cargar los estudiantes', 'Error');
        this.cargando = false;
      }
    );
  }

  cargarAsistenciasDelDia(): void {
    this.asistenciaService.obtenerTodos().subscribe(
      (data: AsistenciaEstudiante[]) => {
        // Filtrar asistencias del día seleccionado
        this.asistenciasRegistradas = data.filter(a => a.fecha === this.fechaSeleccionada);
        this.aplicarFiltros();
        this.cargando = false;
      },
      (error) => {
        console.error('Error al cargar asistencias:', error);
        this.aplicarFiltros();
        this.cargando = false;
      }
    );
  }

  // ========== FILTROS ==========
  aplicarFiltros(): void {
    let filtrados = this.estudiantes;
    
    // Filtrar por sede
    if (this.filtroSede) {
      const sedeId = parseInt(this.filtroSede);
      filtrados = filtrados.filter(e => e.sede?.idSede === sedeId);
    }
    
    // Filtrar por nombre o documento
    if (this.filtroNombre) {
      const busqueda = this.filtroNombre.toLowerCase();
      filtrados = filtrados.filter(e => 
        e.nombreCompleto?.toLowerCase().includes(busqueda) ||
        e.numeroDocumento?.toLowerCase().includes(busqueda)
      );
    }
    
    // Convertir a DTO y verificar asistencia ya registrada
    this.estudiantesFiltrados = filtrados.map(e => {
      const asistenciaExistente = this.asistenciasRegistradas.find(
        a => a.estudiante?.idEstudiante === e.idEstudiante
      );
      
      const dto: EstudianteAsistenciaDto = {
        idEstudiante: e.idEstudiante || 0,
        numeroDocumento: e.numeroDocumento || '',
        nombreCompleto: e.nombreCompleto || '',
        sede: e.sede?.nombre || 'Sin sede',
        asistio: asistenciaExistente?.asistio || false,
        observaciones: asistenciaExistente?.observaciones
      };
      
      // Inicializar el mapa de selección
      if (asistenciaExistente) {
        this.asistenciaSeleccionada.set(dto.idEstudiante, asistenciaExistente.asistio || false);
        if (asistenciaExistente.observaciones) {
          this.observacionesMap.set(dto.idEstudiante, asistenciaExistente.observaciones);
        }
      } else if (!this.asistenciaSeleccionada.has(dto.idEstudiante)) {
        this.asistenciaSeleccionada.set(dto.idEstudiante, false);
      }
      
      return dto;
    });
  }

  limpiarFiltros(): void {
    this.filtroEquipo = '';
    this.filtroSede = '';
    this.filtroNombre = '';
    this.aplicarFiltros();
  }

  onFechaChange(): void {
    this.asistenciaSeleccionada.clear();
    this.observacionesMap.clear();
    this.cargarAsistenciasDelDia();
  }

  // ========== ASISTENCIA ==========
  toggleAsistencia(estudiante: EstudianteAsistenciaDto): void {
    const estadoActual = this.asistenciaSeleccionada.get(estudiante.idEstudiante) || false;
    this.asistenciaSeleccionada.set(estudiante.idEstudiante, !estadoActual);
  }

  getAsistencia(idEstudiante: number): boolean {
    return this.asistenciaSeleccionada.get(idEstudiante) || false;
  }

  getObservacion(idEstudiante: number): string {
    return this.observacionesMap.get(idEstudiante) || '';
  }

  setObservacion(idEstudiante: number, obs: string): void {
    this.observacionesMap.set(idEstudiante, obs);
  }

  marcarTodosPresentes(): void {
    this.estudiantesFiltrados.forEach(e => {
      this.asistenciaSeleccionada.set(e.idEstudiante, true);
    });
  }

  desmarcarTodos(): void {
    this.estudiantesFiltrados.forEach(e => {
      this.asistenciaSeleccionada.set(e.idEstudiante, false);
    });
  }

  yaRegistrado(idEstudiante: number): boolean {
    return this.asistenciasRegistradas.some(a => a.estudiante?.idEstudiante === idEstudiante);
  }

  guardarAsistencia(): void {
    const estudiantesParaGuardar = this.estudiantesFiltrados.filter(e => !this.yaRegistrado(e.idEstudiante));
    
    if (estudiantesParaGuardar.length === 0) {
      this.toastr.info('No hay nuevas asistencias para registrar', 'Información');
      return;
    }

    this.guardando = true;
    let guardados = 0;
    let errores = 0;
    const total = estudiantesParaGuardar.length;

    estudiantesParaGuardar.forEach(est => {
      const estudiante = this.estudiantes.find(e => e.idEstudiante === est.idEstudiante);
      
      const asistencia: AsistenciaEstudiante = {
        estudiante: { idEstudiante: est.idEstudiante },
        fecha: this.fechaSeleccionada,
        asistio: this.asistenciaSeleccionada.get(est.idEstudiante) || false,
        observaciones: this.observacionesMap.get(est.idEstudiante) || ''
      };

      this.asistenciaService.crear(asistencia).subscribe(
        () => {
          guardados++;
          this.verificarFinalizacion(guardados, errores, total);
        },
        (error) => {
          console.error('Error al guardar asistencia:', error);
          errores++;
          this.verificarFinalizacion(guardados, errores, total);
        }
      );
    });
  }

  private verificarFinalizacion(guardados: number, errores: number, total: number): void {
    if (guardados + errores === total) {
      this.guardando = false;
      if (guardados > 0) {
        this.toastr.success(`Se registraron ${guardados} asistencia(s)`, 'Éxito');
      }
      if (errores > 0) {
        this.toastr.warning(`${errores} registro(s) fallaron`, 'Advertencia');
      }
      this.cargarAsistenciasDelDia();
    }
  }

  // ========== UTILIDADES ==========
  formatearFecha(fecha: string): string {
    if (!fecha) return '';
    const date = new Date(fecha + 'T00:00:00');
    return date.toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getNombreCompleto(est: EstudianteAsistenciaDto): string {
    return est.nombreCompleto || '';
  }

  getTotalPresentes(): number {
    let count = 0;
    this.estudiantesFiltrados.forEach(e => {
      if (this.asistenciaSeleccionada.get(e.idEstudiante)) {
        count++;
      }
    });
    return count;
  }

  getTotalAusentes(): number {
    return this.estudiantesFiltrados.length - this.getTotalPresentes();
  }

  getPendientesPorRegistrar(): number {
    return this.estudiantesFiltrados.filter(e => !this.yaRegistrado(e.idEstudiante)).length;
  }

  getRegistrados(): number {
    return this.estudiantesFiltrados.filter(e => this.yaRegistrado(e.idEstudiante)).length;
  }
}
