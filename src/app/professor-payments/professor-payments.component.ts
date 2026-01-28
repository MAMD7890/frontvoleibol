import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { 
  ReportePagoDocenteService, 
  ReportePagoDocentesDto, 
  PagoDocenteDto 
} from '../services/reporte-pago-docente.service';

@Component({
  selector: 'app-professor-payments',
  templateUrl: './professor-payments.component.html',
  styleUrls: ['./professor-payments.component.css']
})
export class ProfessorPaymentsComponent implements OnInit {
  // Datos del reporte
  reporte: ReportePagoDocentesDto | null = null;
  pagos: PagoDocenteDto[] = [];
  
  // Filtros
  fechaDesde: string = '';
  fechaHasta: string = '';
  filtroNombre: string = '';
  filtroIdDocente: string = '';
  
  // Estados
  cargando = false;
  reporteGenerado = false;
  
  // Estado de pagos (manual)
  estadoPagos: Map<number, boolean> = new Map();

  constructor(
    private reporteService: ReportePagoDocenteService,
    private toastr: ToastrService
  ) {
    // Establecer fechas por defecto (mes actual)
    const hoy = new Date();
    const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const ultimoDiaMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
    
    this.fechaDesde = primerDiaMes.toISOString().split('T')[0];
    this.fechaHasta = ultimoDiaMes.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    // No cargar automáticamente, esperar a que el usuario genere el reporte
  }

  // ========== GENERAR REPORTE ==========
  generarReporte(): void {
    if (!this.fechaDesde || !this.fechaHasta) {
      this.toastr.warning('Debes seleccionar las fechas del período', 'Validación');
      return;
    }

    if (new Date(this.fechaDesde) > new Date(this.fechaHasta)) {
      this.toastr.warning('La fecha "desde" no puede ser mayor que la fecha "hasta"', 'Validación');
      return;
    }

    this.cargando = true;
    const nombre = this.filtroNombre || undefined;
    const idDocente = this.filtroIdDocente ? parseInt(this.filtroIdDocente) : undefined;

    this.reporteService.generarReporte(this.fechaDesde, this.fechaHasta, nombre, idDocente).subscribe(
      (data: ReportePagoDocentesDto) => {
        this.reporte = data;
        this.pagos = data.pagos || [];
        this.reporteGenerado = true;
        this.cargando = false;
        
        // Inicializar estados de pago como pendientes
        this.estadoPagos.clear();
        this.pagos.forEach(p => {
          this.estadoPagos.set(p.idProfesor, false); // false = pendiente
        });
        
        if (this.pagos.length === 0) {
          this.toastr.info('No se encontraron datos para el período seleccionado', 'Información');
        } else {
          this.toastr.success(`Reporte generado con ${this.pagos.length} docente(s)`, 'Éxito');
        }
      },
      (error) => {
        console.error('Error al generar reporte:', error);
        this.toastr.error('Error al generar el reporte', 'Error');
        this.cargando = false;
      }
    );
  }

  // ========== LIMPIAR FILTROS ==========
  limpiarFiltros(): void {
    const hoy = new Date();
    const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const ultimoDiaMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
    
    this.fechaDesde = primerDiaMes.toISOString().split('T')[0];
    this.fechaHasta = ultimoDiaMes.toISOString().split('T')[0];
    this.filtroNombre = '';
    this.filtroIdDocente = '';
    this.reporte = null;
    this.pagos = [];
    this.reporteGenerado = false;
    this.estadoPagos.clear();
  }

  // ========== ESTADO DE PAGOS ==========
  toggleEstadoPago(idProfesor: number): void {
    const estadoActual = this.estadoPagos.get(idProfesor) || false;
    this.estadoPagos.set(idProfesor, !estadoActual);
  }

  getEstadoPago(idProfesor: number): boolean {
    return this.estadoPagos.get(idProfesor) || false;
  }

  marcarTodosPagados(): void {
    this.pagos.forEach(p => {
      if (p.totalCalculado > 0) {
        this.estadoPagos.set(p.idProfesor, true);
      }
    });
  }

  marcarTodosPendientes(): void {
    this.pagos.forEach(p => {
      this.estadoPagos.set(p.idProfesor, false);
    });
  }

  getTotalPagados(): number {
    let count = 0;
    this.pagos.forEach(p => {
      if (this.estadoPagos.get(p.idProfesor) && p.totalCalculado > 0) {
        count++;
      }
    });
    return count;
  }

  getTotalPendientes(): number {
    let count = 0;
    this.pagos.forEach(p => {
      if (!this.estadoPagos.get(p.idProfesor) && p.totalCalculado > 0) {
        count++;
      }
    });
    return count;
  }

  getMontoPagado(): number {
    let total = 0;
    this.pagos.forEach(p => {
      if (this.estadoPagos.get(p.idProfesor)) {
        total += p.totalCalculado;
      }
    });
    return total;
  }

  getMontoPendiente(): number {
    let total = 0;
    this.pagos.forEach(p => {
      if (!this.estadoPagos.get(p.idProfesor)) {
        total += p.totalCalculado;
      }
    });
    return total;
  }

  // ========== EXPORTAR ==========
  exportarCSV(): void {
    if (this.pagos.length === 0) {
      this.toastr.warning('No hay datos para exportar', 'Validación');
      return;
    }

    const headers = ['Documento', 'Nombre Profesor', 'Asistencias', 'Salario por Clase', 'Total a Pagar', 'Estado'];
    const rows = this.pagos.map(p => [
      p.documento || 'N/A',
      p.nombreProfesor,
      p.asistencias,
      p.salarioPorClase,
      p.totalCalculado,
      this.estadoPagos.get(p.idProfesor) ? 'Pagado' : 'Pendiente'
    ]);

    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
      csv += row.join(',') + '\n';
    });
    
    // Agregar totales
    csv += '\n';
    csv += `Total Docentes,${this.reporte?.cantidadDocentes}\n`;
    csv += `Total a Pagar,${this.reporte?.totalAPagar}\n`;
    csv += `Salario Promedio,${this.reporte?.salarioPromedio}\n`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `reporte_pagos_${this.fechaDesde}_${this.fechaHasta}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.toastr.success('Reporte exportado correctamente', 'Éxito');
  }

  imprimir(): void {
    window.print();
  }

  // ========== UTILIDADES ==========
  formatearMoneda(valor: number): string {
    if (!valor && valor !== 0) return '$0';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(valor);
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return '';
    const date = new Date(fecha + 'T00:00:00');
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getPeriodoTexto(): string {
    if (!this.fechaDesde || !this.fechaHasta) return '';
    return `${this.formatearFecha(this.fechaDesde)} - ${this.formatearFecha(this.fechaHasta)}`;
  }

  getTotalAsistencias(): number {
    return this.pagos.reduce((sum, p) => sum + p.asistencias, 0);
  }
}
