import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { GastoService, Gasto, Sede } from '../services/gasto.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-expenses',
  templateUrl: './expenses.component.html',
  styleUrls: ['./expenses.component.css']
})
export class ExpensesComponent implements OnInit {
  @ViewChild('modalGasto') modalGasto: any;
  @ViewChild('modalConfirmacion') modalConfirmacion: any;

  // Datos
  gastos: Gasto[] = [];
  gastosFiltrados: Gasto[] = [];
  sedes: Sede[] = [];
  
  // Formulario
  formularioGasto: FormGroup;
  
  // Filtros
  filtroConcepto: string = '';
  filtroSede: string = '';
  filtroFechaDesde: string = '';
  filtroFechaHasta: string = '';
  
  // Modal
  modalRef: NgbModalRef;
  
  // Estados
  cargando = false;
  editando = false;
  
  // ID en edición
  gastoIdEditando: number | null = null;
  
  // Para eliminar
  gastoAEliminar: Gasto | null = null;

  constructor(
    private gastoService: GastoService,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private fb: FormBuilder
  ) {
    this.formularioGasto = this.crearFormulario();
  }

  ngOnInit(): void {
    this.cargarGastos();
    this.cargarSedes();
  }

  // ========== HELPERS ==========
  getGastoId(gasto: Gasto): number | null {
    return gasto.id || gasto.idGasto || null;
  }

  getSedeId(sede: Sede): number | null {
    return sede.id || sede.idSede || null;
  }

  getNombreSede(gasto: Gasto): string {
    if (!gasto.sede) return 'Sin sede';
    return gasto.sede.nombre || `Sede ${this.getSedeId(gasto.sede)}`;
  }

  // ========== FORMULARIO ==========
  crearFormulario(): FormGroup {
    return this.fb.group({
      concepto: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: ['', Validators.required],
      monto: ['', [Validators.required, Validators.min(0.01)]],
      fecha: ['', Validators.required],
      sedeId: ['', Validators.required]
    });
  }

  // ========== CARGA DE DATOS ==========
  cargarGastos(): void {
    this.cargando = true;
    this.gastoService.obtenerGastos().subscribe(
      (data: Gasto[]) => {
        this.gastos = data;
        this.aplicarFiltros();
        this.cargando = false;
      },
      (error) => {
        console.error('Error al cargar gastos:', error);
        this.toastr.error('Error al cargar los gastos', 'Error');
        this.cargando = false;
      }
    );
  }

  cargarSedes(): void {
    this.gastoService.obtenerSedes().subscribe(
      (data: Sede[]) => {
        this.sedes = data;
        console.log('Sedes cargadas:', this.sedes);
      },
      (error) => {
        console.error('Error al cargar sedes:', error);
        this.toastr.error('Error al cargar las sedes', 'Error');
      }
    );
  }

  // ========== FILTROS ==========
  aplicarFiltros(): void {
    this.gastosFiltrados = this.gastos.filter(gasto => {
      // Filtro por concepto
      if (this.filtroConcepto && !gasto.concepto.toLowerCase().includes(this.filtroConcepto.toLowerCase())) {
        return false;
      }
      
      // Filtro por sede
      if (this.filtroSede) {
        const sedeId = this.getSedeId(gasto.sede);
        if (!sedeId || sedeId.toString() !== this.filtroSede) {
          return false;
        }
      }
      
      // Filtro por fecha desde
      if (this.filtroFechaDesde && gasto.fecha < this.filtroFechaDesde) {
        return false;
      }
      
      // Filtro por fecha hasta
      if (this.filtroFechaHasta && gasto.fecha > this.filtroFechaHasta) {
        return false;
      }
      
      return true;
    });
  }

  limpiarFiltros(): void {
    this.filtroConcepto = '';
    this.filtroSede = '';
    this.filtroFechaDesde = '';
    this.filtroFechaHasta = '';
    this.aplicarFiltros();
  }

  // ========== MODALES ==========
  abrirModalCrear(): void {
    this.editando = false;
    this.gastoIdEditando = null;
    this.formularioGasto.reset();
    
    // Establecer fecha de hoy por defecto
    const hoy = new Date().toISOString().split('T')[0];
    this.formularioGasto.patchValue({ fecha: hoy });
    
    this.modalRef = this.modalService.open(this.modalGasto, { 
      size: 'lg',
      scrollable: true,
      backdrop: true,
      keyboard: true
    });
  }

  abrirModalEditar(gasto: Gasto): void {
    this.editando = true;
    this.gastoIdEditando = this.getGastoId(gasto);
    
    const sedeId = gasto.sede ? this.getSedeId(gasto.sede) : null;
    
    this.formularioGasto.patchValue({
      concepto: gasto.concepto,
      descripcion: gasto.descripcion,
      monto: gasto.monto,
      fecha: gasto.fecha,
      sedeId: sedeId
    });
    
    this.modalRef = this.modalService.open(this.modalGasto, { 
      size: 'lg',
      scrollable: true,
      backdrop: true,
      keyboard: true
    });
  }

  // ========== GUARDAR ==========
  guardarGasto(): void {
    if (this.formularioGasto.invalid) {
      this.toastr.warning('Por favor completa todos los campos requeridos', 'Validación');
      Object.keys(this.formularioGasto.controls).forEach(key => {
        this.formularioGasto.get(key)?.markAsTouched();
      });
      return;
    }

    const datos = this.formularioGasto.value;
    const gasto: Gasto = {
      concepto: datos.concepto,
      descripcion: datos.descripcion,
      monto: parseFloat(datos.monto),
      fecha: datos.fecha,
      sede: { idSede: parseInt(datos.sedeId) }
    };

    if (this.editando && this.gastoIdEditando) {
      this.gastoService.actualizarGasto(this.gastoIdEditando, gasto).subscribe(
        () => {
          this.toastr.success('Gasto actualizado correctamente', 'Éxito');
          this.cargarGastos();
          this.modalRef.close();
        },
        (error) => {
          console.error('Error al actualizar gasto:', error);
          this.toastr.error('Error al actualizar el gasto', 'Error');
        }
      );
    } else {
      this.gastoService.crearGasto(gasto).subscribe(
        () => {
          this.toastr.success('Gasto creado correctamente', 'Éxito');
          this.cargarGastos();
          this.modalRef.close();
        },
        (error) => {
          console.error('Error al crear gasto:', error);
          this.toastr.error('Error al crear el gasto', 'Error');
        }
      );
    }
  }

  // ========== ELIMINAR ==========
  confirmarEliminar(gasto: Gasto): void {
    this.gastoAEliminar = gasto;
    this.modalRef = this.modalService.open(this.modalConfirmacion, { 
      size: 'sm',
      centered: true,
      backdrop: true,
      keyboard: true
    });
  }

  eliminarGasto(): void {
    if (this.gastoAEliminar) {
      const id = this.getGastoId(this.gastoAEliminar);
      if (id) {
        this.gastoService.eliminarGasto(id).subscribe(
          () => {
            this.toastr.success('Gasto eliminado correctamente', 'Éxito');
            this.cargarGastos();
            this.modalRef.close();
            this.gastoAEliminar = null;
          },
          (error) => {
            console.error('Error al eliminar gasto:', error);
            this.toastr.error('Error al eliminar el gasto', 'Error');
          }
        );
      }
    }
  }

  cerrarModal(): void {
    this.modalRef.close();
    this.gastoAEliminar = null;
  }

  // ========== UTILIDADES ==========
  formatearMonto(monto: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(monto);
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

  getTotalGastos(): number {
    return this.gastosFiltrados.reduce((sum, gasto) => sum + gasto.monto, 0);
  }
}
