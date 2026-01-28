import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { 
  AsistenciaProfesorService, 
  ProfesorAttendanceDto, 
  ProfesorAttendanceMarkRequest,
  Sede,
  Equipo
} from '../services/asistencia-profesor.service';

@Component({
  selector: 'app-professor-attendance',
  templateUrl: './professor-attendance.component.html',
  styleUrls: ['./professor-attendance.component.css']
})
export class ProfessorAttendanceComponent implements OnInit {
  // Datos
  profesores: ProfesorAttendanceDto[] = [];
  profesoresFiltrados: ProfesorAttendanceDto[] = [];
  sedes: Sede[] = [];
  equipos: Equipo[] = [];
  
  // Filtros
  fechaSeleccionada: string = '';
  filtroSede: string = '';
  filtroEquipo: string = '';
  filtroNombre: string = '';
  
  // Estados
  cargando = false;
  guardando = false;
  
  // Selección de asistencia
  asistenciaSeleccionada: Map<number, boolean> = new Map();

  constructor(
    private asistenciaService: AsistenciaProfesorService,
    private toastr: ToastrService
  ) {
    // Establecer fecha de hoy por defecto
    this.fechaSeleccionada = new Date().toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.cargarSedes();
    this.cargarEquipos();
    this.cargarProfesores();
  }

  // ========== HELPERS ==========
  getSedeId(sede: Sede): number | null {
    return sede.id || sede.idSede || null;
  }

  getEquipoId(equipo: Equipo): number | null {
    return equipo.id || equipo.idEquipo || null;
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

  cargarProfesores(): void {
    if (!this.fechaSeleccionada) {
      this.toastr.warning('Selecciona una fecha', 'Validación');
      return;
    }

    this.cargando = true;
    const sedeId = this.filtroSede ? parseInt(this.filtroSede) : undefined;
    const equipoId = this.filtroEquipo ? parseInt(this.filtroEquipo) : undefined;
    const nombre = this.filtroNombre || undefined;

    this.asistenciaService.listarProfesoresConAsistencia(
      this.fechaSeleccionada, 
      sedeId, 
      equipoId, 
      nombre
    ).subscribe(
      (data: ProfesorAttendanceDto[]) => {
        this.profesores = data;
        this.profesoresFiltrados = data;
        // Inicializar mapa de selección
        this.asistenciaSeleccionada.clear();
        data.forEach(p => {
          this.asistenciaSeleccionada.set(p.idProfesor, p.asistio);
        });
        this.cargando = false;
      },
      (error) => {
        console.error('Error al cargar profesores:', error);
        this.toastr.error('Error al cargar los profesores', 'Error');
        this.cargando = false;
      }
    );
  }

  // ========== FILTROS ==========
  aplicarFiltros(): void {
    this.cargarProfesores();
  }

  limpiarFiltros(): void {
    this.filtroSede = '';
    this.filtroEquipo = '';
    this.filtroNombre = '';
    this.cargarProfesores();
  }

  // ========== ASISTENCIA ==========
  toggleAsistencia(profesor: ProfesorAttendanceDto): void {
    const estadoActual = this.asistenciaSeleccionada.get(profesor.idProfesor) || false;
    this.asistenciaSeleccionada.set(profesor.idProfesor, !estadoActual);
  }

  getAsistencia(idProfesor: number): boolean {
    return this.asistenciaSeleccionada.get(idProfesor) || false;
  }

  marcarTodosPresentes(): void {
    this.profesoresFiltrados.forEach(p => {
      if (!p.asistio) { // Solo marcar los que no están ya registrados
        this.asistenciaSeleccionada.set(p.idProfesor, true);
      }
    });
  }

  desmarcarTodos(): void {
    this.profesoresFiltrados.forEach(p => {
      if (!p.asistio) { // Solo desmarcar los que no están ya registrados
        this.asistenciaSeleccionada.set(p.idProfesor, false);
      }
    });
  }

  guardarAsistencia(): void {
    // Filtrar solo los profesores que se marcaron como presentes y no estaban registrados
    const marcas: ProfesorAttendanceMarkRequest[] = [];
    
    this.profesoresFiltrados.forEach(p => {
      const seleccionado = this.asistenciaSeleccionada.get(p.idProfesor);
      // Solo registrar los que se marcaron como presentes y no tenían asistencia previa
      if (seleccionado && !p.asistio) {
        marcas.push({
          idProfesor: p.idProfesor,
          fecha: this.fechaSeleccionada
        });
      }
    });

    if (marcas.length === 0) {
      this.toastr.info('No hay nuevas asistencias para registrar', 'Información');
      return;
    }

    this.guardando = true;
    this.asistenciaService.registrarAsistencia(marcas).subscribe(
      (response) => {
        const guardados = response.filter(r => r.guardado).length;
        const yaExistian = response.filter(r => r.asistioAntes).length;
        
        if (guardados > 0) {
          this.toastr.success(`Se registraron ${guardados} asistencia(s)`, 'Éxito');
        }
        if (yaExistian > 0) {
          this.toastr.info(`${yaExistian} profesor(es) ya tenían asistencia registrada`, 'Información');
        }
        
        this.cargarProfesores(); // Recargar datos
        this.guardando = false;
      },
      (error) => {
        console.error('Error al registrar asistencia:', error);
        this.toastr.error('Error al registrar la asistencia', 'Error');
        this.guardando = false;
      }
    );
  }

  // ========== UTILIDADES ==========
  formatearSalario(salario: number): string {
    if (!salario) return '$0';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(salario);
  }

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

  getTotalPresentes(): number {
    let count = 0;
    this.profesoresFiltrados.forEach(p => {
      if (this.asistenciaSeleccionada.get(p.idProfesor)) {
        count++;
      }
    });
    return count;
  }

  getTotalAusentes(): number {
    return this.profesoresFiltrados.length - this.getTotalPresentes();
  }

  getPendientesPorRegistrar(): number {
    let count = 0;
    this.profesoresFiltrados.forEach(p => {
      if (this.asistenciaSeleccionada.get(p.idProfesor) && !p.asistio) {
        count++;
      }
    });
    return count;
  }
}
