import { Component, OnInit } from '@angular/core';
import { ReportePagoDocenteService, ReportePagoDocentesDto, PagoDocenteDto } from '../services/reporte-pago-docente.service';
import { EstudianteService, Estudiante, Sede } from '../services/estudiante.service';
import { GastoService, GastoResumenReporteDto, Gasto } from '../services/gasto.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  public lineBigDashboardChartType;
  public gradientStroke;
  public chartColor;
  public canvas: any;
  public ctx;
  public gradientFill;
  public lineBigDashboardChartData: Array<any>;
  public lineBigDashboardChartOptions: any;
  public lineBigDashboardChartLabels: Array<any>;
  public lineBigDashboardChartColors: Array<any>;

  public gradientChartOptionsConfiguration: any;
  public gradientChartOptionsConfigurationWithNumbersAndGrid: any;

  public lineChartType;
  public lineChartData: Array<any>;
  public lineChartOptions: any;
  public lineChartLabels: Array<any>;
  public lineChartColors: Array<any>;

  public lineChartWithNumbersAndGridType;
  public lineChartWithNumbersAndGridData: Array<any>;
  public lineChartWithNumbersAndGridOptions: any;
  public lineChartWithNumbersAndGridLabels: Array<any>;
  public lineChartWithNumbersAndGridColors: Array<any>;

  public lineChartGradientsNumbersType;
  public lineChartGradientsNumbersData: Array<any>;
  public lineChartGradientsNumbersOptions: any;
  public lineChartGradientsNumbersLabels: Array<any>;
  public lineChartGradientsNumbersColors: Array<any>;

  // Datos de reportes
  public reportePagos: ReportePagoDocentesDto | null = null;
  public estudiantes: Estudiante[] = [];
  public reporteGastos: GastoResumenReporteDto | null = null;
  public sedes: Sede[] = [];

  // Filtros
  public fechaDesde: string;
  public fechaHasta: string;
  public filtroNombreProfesor: string = '';
  public sedeSeleccionada: number | null = null;

  // Estadísticas
  public totalEstudiantes: number = 0;
  public estudiantesActivos: number = 0;
  public estudiantesInactivos: number = 0;
  public estudiantesPorSede: { [key: string]: number } = {};

  // Estados de carga
  public cargandoPagos: boolean = false;
  public cargandoEstudiantes: boolean = false;
  public cargandoGastos: boolean = false;

  public chartClicked(e: any): void {
    console.log(e);
  }

  public chartHovered(e: any): void {
    console.log(e);
  }

  public hexToRGB(hex, alpha) {
    var r = parseInt(hex.slice(1, 3), 16),
      g = parseInt(hex.slice(3, 5), 16),
      b = parseInt(hex.slice(5, 7), 16);

    if (alpha) {
      return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
    } else {
      return "rgb(" + r + ", " + g + ", " + b + ")";
    }
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  constructor(
    private reportePagoService: ReportePagoDocenteService,
    private estudianteService: EstudianteService,
    private gastoService: GastoService
  ) {
    // Configurar fechas por defecto (mes actual)
    const hoy = new Date();
    const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    this.fechaDesde = this.formatDate(primerDiaMes);
    this.fechaHasta = this.formatDate(hoy);
  }

  ngOnInit() {
    this.initCharts();
    this.cargarDatos();
  }

  cargarDatos() {
    this.cargarSedes();
    this.cargarReportePagos();
    this.cargarEstudiantes();
    this.cargarReporteGastos();
  }

  cargarSedes() {
    this.estudianteService.obtenerSedes().subscribe({
      next: (sedes) => {
        this.sedes = sedes;
      },
      error: (error) => {
        console.error('Error al cargar sedes:', error);
      }
    });
  }

  cargarReportePagos() {
    this.cargandoPagos = true;
    this.reportePagoService.generarReporte(
      this.fechaDesde,
      this.fechaHasta,
      this.filtroNombreProfesor || undefined
    ).subscribe({
      next: (reporte) => {
        this.reportePagos = reporte;
        this.actualizarGraficoPagos(reporte);
        this.actualizarGraficoPrincipal(reporte);
        this.cargandoPagos = false;
      },
      error: (error) => {
        console.error('Error al cargar reporte de pagos:', error);
        this.cargandoPagos = false;
      }
    });
  }

  cargarEstudiantes() {
    this.cargandoEstudiantes = true;
    this.estudianteService.obtenerEstudiantes().subscribe({
      next: (estudiantes) => {
        this.estudiantes = estudiantes;
        this.calcularEstadisticasEstudiantes(estudiantes);
        this.actualizarGraficoEstudiantes(estudiantes);
        this.cargandoEstudiantes = false;
      },
      error: (error) => {
        console.error('Error al cargar estudiantes:', error);
        this.cargandoEstudiantes = false;
      }
    });
  }

  cargarReporteGastos() {
    this.cargandoGastos = true;
    this.gastoService.generarReporte(
      this.fechaDesde,
      this.fechaHasta,
      this.sedeSeleccionada || undefined
    ).subscribe({
      next: (reporte) => {
        this.reporteGastos = reporte;
        this.actualizarGraficoGastos(reporte);
        this.cargandoGastos = false;
      },
      error: (error) => {
        console.error('Error al cargar reporte de gastos:', error);
        this.cargandoGastos = false;
      }
    });
  }

  aplicarFiltros() {
    this.cargarReportePagos();
    this.cargarReporteGastos();
  }

  calcularEstadisticasEstudiantes(estudiantes: Estudiante[]) {
    this.totalEstudiantes = estudiantes.length;
    this.estudiantesActivos = estudiantes.filter(e => e.estado === true).length;
    this.estudiantesInactivos = estudiantes.filter(e => e.estado === false).length;

    this.estudiantesPorSede = {};
    estudiantes.forEach(e => {
      const nombreSede = e.sede?.nombre || e.sede?.nombreSede || 'Sin sede';
      this.estudiantesPorSede[nombreSede] = (this.estudiantesPorSede[nombreSede] || 0) + 1;
    });
  }

  actualizarGraficoPrincipal(reporte: ReportePagoDocentesDto) {
    if (reporte && reporte.pagos && reporte.pagos.length > 0) {
      const data = reporte.pagos.map(p => p.totalCalculado);
      const labels = reporte.pagos.map(p => p.nombreProfesor.split(' ')[0]);

      this.lineBigDashboardChartData = [
        {
          label: "Pagos por Profesor",
          pointBorderWidth: 1,
          pointHoverRadius: 7,
          pointHoverBorderWidth: 2,
          pointRadius: 5,
          fill: true,
          borderWidth: 2,
          data: data
        }
      ];
      this.lineBigDashboardChartLabels = labels;
    }
  }

  actualizarGraficoPagos(reporte: ReportePagoDocentesDto) {
    if (reporte && reporte.pagos && reporte.pagos.length > 0) {
      const data = reporte.pagos.map(p => p.asistencias);
      const labels = reporte.pagos.map(p => p.nombreProfesor.split(' ')[0]);

      this.lineChartData = [
        {
          label: "Asistencias",
          pointBorderWidth: 2,
          pointHoverRadius: 4,
          pointHoverBorderWidth: 1,
          pointRadius: 4,
          fill: true,
          borderWidth: 2,
          data: data
        }
      ];
      this.lineChartLabels = labels;
    }
  }

  actualizarGraficoEstudiantes(estudiantes: Estudiante[]) {
    const sedesKeys = Object.keys(this.estudiantesPorSede);
    if (sedesKeys.length > 0) {
      const data = sedesKeys.map(key => this.estudiantesPorSede[key]);
      const labels = sedesKeys;

      this.lineChartWithNumbersAndGridData = [
        {
          label: "Estudiantes",
          pointBorderWidth: 2,
          pointHoverRadius: 4,
          pointHoverBorderWidth: 1,
          pointRadius: 4,
          fill: true,
          borderWidth: 2,
          data: data
        }
      ];
      this.lineChartWithNumbersAndGridLabels = labels;
    }
  }

  actualizarGraficoGastos(reporte: GastoResumenReporteDto) {
    if (reporte && reporte.gastos && reporte.gastos.length > 0) {
      const gastosPorConcepto: { [key: string]: number } = {};
      reporte.gastos.forEach(g => {
        gastosPorConcepto[g.concepto] = (gastosPorConcepto[g.concepto] || 0) + g.monto;
      });

      const conceptoKeys = Object.keys(gastosPorConcepto);
      const data = conceptoKeys.map(key => gastosPorConcepto[key]);
      const labels = conceptoKeys;

      this.lineChartGradientsNumbersData = [
        {
          label: "Gastos",
          pointBorderWidth: 2,
          pointHoverRadius: 4,
          pointHoverBorderWidth: 1,
          pointRadius: 4,
          fill: true,
          borderWidth: 1,
          data: data
        }
      ];
      this.lineChartGradientsNumbersLabels = labels;
    }
  }

  initCharts() {
    this.chartColor = "#FFFFFF";
    
    // Configurar gráfico principal grande (Pagos por Profesor)
    this.canvas = document.getElementById("bigDashboardChart");
    if (this.canvas) {
      this.ctx = this.canvas.getContext("2d");
      this.gradientStroke = this.ctx.createLinearGradient(500, 0, 100, 0);
      this.gradientStroke.addColorStop(0, '#c9a227');
      this.gradientStroke.addColorStop(1, this.chartColor);

      this.gradientFill = this.ctx.createLinearGradient(0, 200, 0, 50);
      this.gradientFill.addColorStop(0, "rgba(66, 165, 245, 0)");
      this.gradientFill.addColorStop(1, "rgba(66, 165, 245, 0.3)");
    }

    this.lineBigDashboardChartData = [
      {
        label: "Pagos por Profesor",
        pointBorderWidth: 1,
        pointHoverRadius: 7,
        pointHoverBorderWidth: 2,
        pointRadius: 5,
        fill: true,
        borderWidth: 2,
        data: [0]
      }
    ];
    this.lineBigDashboardChartColors = [
      {
        backgroundColor: this.gradientFill,
        borderColor: "#1565C0",
        pointBorderColor: "#1565C0",
        pointBackgroundColor: "#FFFFFF",
        pointHoverBackgroundColor: "#FFFFFF",
        pointHoverBorderColor: "#42A5F5",
      }
    ];
    this.lineBigDashboardChartLabels = ["Cargando..."];
    this.lineBigDashboardChartOptions = {
      layout: {
        padding: { left: 20, right: 20, top: 0, bottom: 0 }
      },
      maintainAspectRatio: false,
      tooltips: {
        backgroundColor: '#fff',
        titleFontColor: '#333',
        bodyFontColor: '#666',
        bodySpacing: 4,
        xPadding: 12,
        mode: "nearest",
        intersect: 0,
        position: "nearest",
        callbacks: {
          label: function(tooltipItem, data) {
            return '$' + tooltipItem.yLabel.toLocaleString();
          }
        }
      },
      legend: { position: "bottom", fillStyle: "#FFF", display: false },
      scales: {
        yAxes: [{
          ticks: {
            fontColor: "#333333",
            fontStyle: "bold",
            beginAtZero: true,
            maxTicksLimit: 5,
            padding: 10,
            callback: function(value) {
              return '$' + value.toLocaleString();
            }
          },
          gridLines: {
            drawTicks: true,
            drawBorder: false,
            display: true,
            color: "rgba(0,0,0,0.1)",
            zeroLineColor: "transparent"
          }
        }],
        xAxes: [{
          gridLines: { zeroLineColor: "transparent", display: false },
          ticks: { padding: 10, fontColor: "#333333", fontStyle: "bold" }
        }]
      }
    };
    this.lineBigDashboardChartType = 'line';

    // Configuraciones comunes para gráficos pequeños
    this.gradientChartOptionsConfiguration = {
      maintainAspectRatio: false,
      legend: { display: false },
      tooltips: {
        bodySpacing: 4,
        mode: "nearest",
        intersect: 0,
        position: "nearest",
        xPadding: 10,
        yPadding: 10,
        caretPadding: 10
      },
      responsive: 1,
      scales: {
        yAxes: [{
          display: 0,
          ticks: { display: false },
          gridLines: { zeroLineColor: "transparent", drawTicks: false, display: false, drawBorder: false }
        }],
        xAxes: [{
          display: 0,
          ticks: { display: false },
          gridLines: { zeroLineColor: "transparent", drawTicks: false, display: false, drawBorder: false }
        }]
      },
      layout: { padding: { left: 0, right: 0, top: 15, bottom: 15 } }
    };

    this.gradientChartOptionsConfigurationWithNumbersAndGrid = {
      maintainAspectRatio: false,
      legend: { display: false },
      tooltips: {
        bodySpacing: 4,
        mode: "nearest",
        intersect: 0,
        position: "nearest",
        xPadding: 10,
        yPadding: 10,
        caretPadding: 10
      },
      responsive: true,
      scales: {
        yAxes: [{
          gridLines: { zeroLineColor: "transparent", drawBorder: false },
          ticks: { stepSize: 10 }
        }],
        xAxes: [{
          display: 0,
          ticks: { display: false },
          gridLines: { zeroLineColor: "transparent", drawTicks: false, display: false, drawBorder: false }
        }]
      },
      layout: { padding: { left: 0, right: 0, top: 15, bottom: 15 } }
    };

    // Gráfico de Asistencias de Profesores
    this.canvas = document.getElementById("lineChartExample");
    if (this.canvas) {
      this.ctx = this.canvas.getContext("2d");
      this.gradientStroke = this.ctx.createLinearGradient(500, 0, 100, 0);
      this.gradientStroke.addColorStop(0, '#1a1a1a');
      this.gradientStroke.addColorStop(1, this.chartColor);

      this.gradientFill = this.ctx.createLinearGradient(0, 170, 0, 50);
      this.gradientFill.addColorStop(0, "rgba(26, 26, 26, 0)");
      this.gradientFill.addColorStop(1, "rgba(26, 26, 26, 0.40)");
    }

    this.lineChartData = [
      {
        label: "Asistencias",
        pointBorderWidth: 2,
        pointHoverRadius: 4,
        pointHoverBorderWidth: 1,
        pointRadius: 4,
        fill: true,
        borderWidth: 2,
        data: [0]
      }
    ];
    this.lineChartColors = [
      {
        borderColor: "#1a1a1a",
        pointBorderColor: "#FFF",
        pointBackgroundColor: "#1a1a1a",
        backgroundColor: this.gradientFill
      }
    ];
    this.lineChartLabels = ["Cargando..."];
    this.lineChartOptions = this.gradientChartOptionsConfiguration;
    this.lineChartType = 'line';

    // Gráfico de Estudiantes por Sede
    this.canvas = document.getElementById("lineChartExampleWithNumbersAndGrid");
    if (this.canvas) {
      this.ctx = this.canvas.getContext("2d");
      this.gradientStroke = this.ctx.createLinearGradient(500, 0, 100, 0);
      this.gradientStroke.addColorStop(0, '#28a745');
      this.gradientStroke.addColorStop(1, this.chartColor);

      this.gradientFill = this.ctx.createLinearGradient(0, 170, 0, 50);
      this.gradientFill.addColorStop(0, "rgba(40, 167, 69, 0)");
      this.gradientFill.addColorStop(1, this.hexToRGB('#28a745', 0.4));
    }

    this.lineChartWithNumbersAndGridData = [
      {
        label: "Estudiantes",
        pointBorderWidth: 2,
        pointHoverRadius: 4,
        pointHoverBorderWidth: 1,
        pointRadius: 4,
        fill: true,
        borderWidth: 2,
        data: [0]
      }
    ];
    this.lineChartWithNumbersAndGridColors = [
      {
        borderColor: "#28a745",
        pointBorderColor: "#FFF",
        pointBackgroundColor: "#28a745",
        backgroundColor: this.gradientFill
      }
    ];
    this.lineChartWithNumbersAndGridLabels = ["Cargando..."];
    this.lineChartWithNumbersAndGridOptions = this.gradientChartOptionsConfigurationWithNumbersAndGrid;
    this.lineChartWithNumbersAndGridType = 'line';

    // Gráfico de Gastos por Concepto (Barra)
    this.canvas = document.getElementById("barChartSimpleGradientsNumbers");
    if (this.canvas) {
      this.ctx = this.canvas.getContext("2d");
      this.gradientFill = this.ctx.createLinearGradient(0, 170, 0, 50);
      this.gradientFill.addColorStop(0, "rgba(220, 53, 69, 0)");
      this.gradientFill.addColorStop(1, this.hexToRGB('#dc3545', 0.6));
    }

    this.lineChartGradientsNumbersData = [
      {
        label: "Gastos",
        pointBorderWidth: 2,
        pointHoverRadius: 4,
        pointHoverBorderWidth: 1,
        pointRadius: 4,
        fill: true,
        borderWidth: 1,
        data: [0]
      }
    ];
    this.lineChartGradientsNumbersColors = [
      {
        backgroundColor: this.gradientFill,
        borderColor: "#dc3545",
        pointBorderColor: "#FFF",
        pointBackgroundColor: "#dc3545",
      }
    ];
    this.lineChartGradientsNumbersLabels = ["Cargando..."];
    this.lineChartGradientsNumbersOptions = {
      maintainAspectRatio: false,
      legend: { display: false },
      tooltips: {
        bodySpacing: 4,
        mode: "nearest",
        intersect: 0,
        position: "nearest",
        xPadding: 10,
        yPadding: 10,
        caretPadding: 10,
        callbacks: {
          label: function(tooltipItem, data) {
            return '$' + tooltipItem.yLabel.toLocaleString();
          }
        }
      },
      responsive: 1,
      scales: {
        yAxes: [{
          gridLines: { zeroLineColor: "transparent", drawBorder: false },
          ticks: {
            stepSize: 50000,
            callback: function(value) {
              return '$' + (value / 1000) + 'k';
            }
          }
        }],
        xAxes: [{
          display: 1,
          ticks: { display: true },
          gridLines: { zeroLineColor: "transparent", drawTicks: false, display: false, drawBorder: false }
        }]
      },
      layout: { padding: { left: 0, right: 0, top: 15, bottom: 15 } }
    };
    this.lineChartGradientsNumbersType = 'bar';
  }
}
