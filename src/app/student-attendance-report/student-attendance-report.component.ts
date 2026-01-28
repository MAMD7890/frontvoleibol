import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { 
  AsistenciaEstudianteService, 
  AsistenciaEstudiante,
  Estudiante,
  Sede
} from '../services/asistencia-estudiante.service';

export interface ReporteAsistenciaEstudiante {
  idAsistencia: number;
  fecha: string;
  estudiante: string;
  documento: string;
  sede: string;
  asistio: boolean;
  observaciones: string;
}

export interface EstadisticasEstudiante {
  idEstudiante: number;
  nombreCompleto: string;
  documento: string;
  sede: string;
  totalAsistencias: number;
  diasPresente: number;
  diasAusente: number;
  porcentajeAsistencia: number;
}

@Component({
  selector: 'app-student-attendance-report',
  templateUrl: './student-attendance-report.component.html',
  styleUrls: ['./student-attendance-report.component.css']
})
export class StudentAttendanceReportComponent implements OnInit {
  
  // Datos
  asistencias: AsistenciaEstudiante[] = [];
  asistenciasFiltradas: ReporteAsistenciaEstudiante[] = [];
  estudiantes: Estudiante[] = [];
  sedes: Sede[] = [];
  estadisticasEstudiantes: EstadisticasEstudiante[] = [];
  
  // Filtros
  fechaInicio: string = '';
  fechaFin: string = '';
  filtroSede: string = '';
  filtroEstudiante: string = '';
  filtroAsistencia: string = '';
  filtroBusqueda: string = '';
  
  // Estado
  cargando: boolean = false;
  vistaActual: 'detalle' | 'resumen' = 'detalle';
  
  constructor(
    private asistenciaService: AsistenciaEstudianteService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.inicializarFechas();
    this.cargarDatos();
  }

  // ========== INICIALIZACIÓN ==========
  inicializarFechas(): void {
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    
    this.fechaFin = this.formatearFechaInput(hoy);
    this.fechaInicio = this.formatearFechaInput(inicioMes);
  }

  formatearFechaInput(fecha: Date): string {
    return fecha.toISOString().split('T')[0];
  }

  // ========== CARGA DE DATOS ==========
  cargarDatos(): void {
    this.cargando = true;
    
    // Cargar sedes
    this.asistenciaService.obtenerSedes().subscribe(
      (data: Sede[]) => {
        this.sedes = data;
      },
      (error) => console.error('Error al cargar sedes:', error)
    );

    // Cargar estudiantes
    this.asistenciaService.obtenerEstudiantes().subscribe(
      (data: Estudiante[]) => {
        this.estudiantes = data;
      },
      (error) => console.error('Error al cargar estudiantes:', error)
    );
    
    // Cargar asistencias
    this.asistenciaService.obtenerTodos().subscribe(
      (data: AsistenciaEstudiante[]) => {
        this.asistencias = data;
        this.aplicarFiltros();
        this.calcularEstadisticas();
        this.cargando = false;
      },
      (error) => {
        console.error('Error al cargar asistencias:', error);
        this.toastr.error('Error al cargar los reportes', 'Error');
        this.cargando = false;
      }
    );
  }

  // ========== FILTROS ==========
  aplicarFiltros(): void {
    let filtradas = this.asistencias;
    
    // Filtrar por rango de fechas
    if (this.fechaInicio) {
      filtradas = filtradas.filter(a => a.fecha && a.fecha >= this.fechaInicio);
    }
    if (this.fechaFin) {
      filtradas = filtradas.filter(a => a.fecha && a.fecha <= this.fechaFin);
    }
    
    // Filtrar por sede
    if (this.filtroSede) {
      const sedeId = parseInt(this.filtroSede);
      filtradas = filtradas.filter(a => a.estudiante?.sede?.idSede === sedeId);
    }
    
    // Filtrar por estudiante específico
    if (this.filtroEstudiante) {
      const estudianteId = parseInt(this.filtroEstudiante);
      filtradas = filtradas.filter(a => a.estudiante?.idEstudiante === estudianteId);
    }
    
    // Filtrar por estado de asistencia
    if (this.filtroAsistencia === 'presente') {
      filtradas = filtradas.filter(a => a.asistio === true);
    } else if (this.filtroAsistencia === 'ausente') {
      filtradas = filtradas.filter(a => a.asistio === false);
    }
    
    // Búsqueda por texto
    if (this.filtroBusqueda) {
      const busqueda = this.filtroBusqueda.toLowerCase();
      filtradas = filtradas.filter(a => 
        a.estudiante?.nombreCompleto?.toLowerCase().includes(busqueda) ||
        a.estudiante?.numeroDocumento?.toLowerCase().includes(busqueda) ||
        a.observaciones?.toLowerCase().includes(busqueda)
      );
    }
    
    // Convertir a formato de reporte
    this.asistenciasFiltradas = filtradas.map(a => ({
      idAsistencia: a.idAsistencia || 0,
      fecha: a.fecha || '',
      estudiante: a.estudiante?.nombreCompleto || 'Sin nombre',
      documento: a.estudiante?.numeroDocumento || '',
      sede: a.estudiante?.sede?.nombre || 'Sin sede',
      asistio: a.asistio || false,
      observaciones: a.observaciones || ''
    }));
    
    // Ordenar por fecha descendente
    this.asistenciasFiltradas.sort((a, b) => b.fecha.localeCompare(a.fecha));
    
    this.calcularEstadisticas();
  }

  limpiarFiltros(): void {
    this.inicializarFechas();
    this.filtroSede = '';
    this.filtroEstudiante = '';
    this.filtroAsistencia = '';
    this.filtroBusqueda = '';
    this.aplicarFiltros();
  }

  // ========== ESTADÍSTICAS ==========
  calcularEstadisticas(): void {
    const estadisticasMap = new Map<number, EstadisticasEstudiante>();
    
    // Filtrar asistencias por rango de fechas
    let asistenciasRango = this.asistencias;
    if (this.fechaInicio) {
      asistenciasRango = asistenciasRango.filter(a => a.fecha && a.fecha >= this.fechaInicio);
    }
    if (this.fechaFin) {
      asistenciasRango = asistenciasRango.filter(a => a.fecha && a.fecha <= this.fechaFin);
    }
    
    // Filtrar por sede si está seleccionada
    if (this.filtroSede) {
      const sedeId = parseInt(this.filtroSede);
      asistenciasRango = asistenciasRango.filter(a => a.estudiante?.sede?.idSede === sedeId);
    }
    
    asistenciasRango.forEach(a => {
      if (!a.estudiante?.idEstudiante) return;
      
      const id = a.estudiante.idEstudiante;
      
      if (!estadisticasMap.has(id)) {
        estadisticasMap.set(id, {
          idEstudiante: id,
          nombreCompleto: a.estudiante.nombreCompleto || '',
          documento: a.estudiante.numeroDocumento || '',
          sede: a.estudiante.sede?.nombre || 'Sin sede',
          totalAsistencias: 0,
          diasPresente: 0,
          diasAusente: 0,
          porcentajeAsistencia: 0
        });
      }
      
      const stats = estadisticasMap.get(id)!;
      stats.totalAsistencias++;
      if (a.asistio) {
        stats.diasPresente++;
      } else {
        stats.diasAusente++;
      }
    });
    
    // Calcular porcentajes
    estadisticasMap.forEach(stats => {
      if (stats.totalAsistencias > 0) {
        stats.porcentajeAsistencia = Math.round((stats.diasPresente / stats.totalAsistencias) * 100);
      }
    });
    
    this.estadisticasEstudiantes = Array.from(estadisticasMap.values());
    // Ordenar por nombre
    this.estadisticasEstudiantes.sort((a, b) => a.nombreCompleto.localeCompare(b.nombreCompleto));
  }

  // ========== HELPERS ==========
  formatearFecha(fecha: string): string {
    if (!fecha) return '-';
    const date = new Date(fecha + 'T00:00:00');
    return date.toLocaleDateString('es-CO', { 
      weekday: 'short',
      day: '2-digit', 
      month: 'short',
      year: 'numeric'
    });
  }

  getSedeId(sede: Sede): number | null {
    return sede.idSede || null;
  }

  getEstudianteId(est: Estudiante): number | null {
    return est.idEstudiante || null;
  }

  // ========== TOTALES ==========
  getTotalPresentes(): number {
    return this.asistenciasFiltradas.filter(a => a.asistio).length;
  }

  getTotalAusentes(): number {
    return this.asistenciasFiltradas.filter(a => !a.asistio).length;
  }

  getPorcentajeGeneral(): number {
    if (this.asistenciasFiltradas.length === 0) return 0;
    return Math.round((this.getTotalPresentes() / this.asistenciasFiltradas.length) * 100);
  }

  getEstudiantesUnicos(): number {
    const estudiantesSet = new Set(this.asistenciasFiltradas.map(a => a.documento));
    return estudiantesSet.size;
  }

  getFechasUnicas(): number {
    const fechasSet = new Set(this.asistenciasFiltradas.map(a => a.fecha));
    return fechasSet.size;
  }

  // ========== CAMBIO DE VISTA ==========
  cambiarVista(vista: 'detalle' | 'resumen'): void {
    this.vistaActual = vista;
  }

  // ========== EXPORTAR ==========
  exportarCSV(): void {
    if (this.vistaActual === 'detalle') {
      this.exportarDetalleCSV();
    } else {
      this.exportarResumenCSV();
    }
  }

  exportarDetalleCSV(): void {
    const headers = ['Fecha', 'Estudiante', 'Documento', 'Sede', 'Asistió', 'Observaciones'];
    const rows = this.asistenciasFiltradas.map(a => [
      a.fecha,
      a.estudiante,
      a.documento,
      a.sede,
      a.asistio ? 'Sí' : 'No',
      a.observaciones
    ]);
    
    this.descargarCSV(headers, rows, 'reporte_asistencia_estudiantes');
  }

  exportarResumenCSV(): void {
    const headers = ['Estudiante', 'Documento', 'Sede', 'Total Días', 'Presente', 'Ausente', '% Asistencia'];
    const rows = this.estadisticasEstudiantes.map(e => [
      e.nombreCompleto,
      e.documento,
      e.sede,
      e.totalAsistencias.toString(),
      e.diasPresente.toString(),
      e.diasAusente.toString(),
      e.porcentajeAsistencia + '%'
    ]);
    
    this.descargarCSV(headers, rows, 'resumen_asistencia_estudiantes');
  }

  descargarCSV(headers: string[], rows: string[][], filename: string): void {
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${this.fechaInicio}_${this.fechaFin}.csv`;
    link.click();
    
    this.toastr.success('Archivo CSV descargado', 'Éxito');
  }

  // ========== BADGE CLASS ==========
  getAsistenciaBadgeClass(porcentaje: number): string {
    if (porcentaje >= 90) return 'badge-success';
    if (porcentaje >= 70) return 'badge-warning';
    return 'badge-danger';
  }
}
