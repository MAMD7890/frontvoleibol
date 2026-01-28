import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ProfesorService, Profesor } from '../services/profesor.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-professors',
  templateUrl: './professors.component.html',
  styleUrls: ['./professors.component.css']
})
export class ProfessorsComponent implements OnInit {
  @ViewChild('modalContent') modalContent: any;
  @ViewChild('modalConfirmacion') modalConfirmacion: any;

  profesores: Profesor[] = [];
  profesoresFiltrados: Profesor[] = [];
  formulario: FormGroup;
  modalRef: NgbModalRef;
  cargando = false;
  editando = false;
  profesorIdEditando: number | null = null;
  profesorAEliminar: Profesor | null = null;

  // Filtros
  filtroNombre: string = '';
  filtroDocumento: string = '';
  filtroEstado: string = '';

  constructor(
    private profesorService: ProfesorService,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private fb: FormBuilder
  ) {
    this.formulario = this.crearFormulario();
  }

  ngOnInit(): void {
    this.cargarProfesores();
  }

  // Helper para obtener el ID del profesor (puede venir como 'id' o 'idProfesor')
  getProfesorId(profesor: Profesor): number | null {
    return profesor.id || profesor.idProfesor || null;
  }

  cargarProfesores(): void {
    this.cargando = true;
    this.profesorService.obtenerProfesores().subscribe(
      (data: Profesor[]) => {
        this.profesores = data;
        this.aplicarFiltros();
        this.cargando = false;
      },
      (error) => {
        console.error('Error al cargar profesores:', error);
        this.toastr.error('Error al cargar los profesores. Verifica que el servidor esté activo.', 'Error');
        this.cargando = false;
      }
    );
  }

  // ========== FILTROS ==========
  aplicarFiltros(): void {
    this.profesoresFiltrados = this.profesores.filter(profesor => {
      // Filtro por nombre
      if (this.filtroNombre && !profesor.nombre.toLowerCase().includes(this.filtroNombre.toLowerCase())) {
        return false;
      }
      
      // Filtro por documento
      if (this.filtroDocumento && !profesor.documento.includes(this.filtroDocumento)) {
        return false;
      }
      
      // Filtro por estado
      if (this.filtroEstado !== '') {
        const estadoBuscado = this.filtroEstado === 'true';
        if (profesor.estado !== estadoBuscado) {
          return false;
        }
      }
      
      return true;
    });
  }

  limpiarFiltros(): void {
    this.filtroNombre = '';
    this.filtroDocumento = '';
    this.filtroEstado = '';
    this.aplicarFiltros();
  }

  crearFormulario(): FormGroup {
    return this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      documento: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      telefono: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      salarioPorClase: ['', [Validators.required, Validators.min(0)]],
      fotoUrl: [''],
      fotoNombre: [''],
      estado: [true]
    });
  }

  abrirModalCrear(): void {
    this.editando = false;
    this.profesorIdEditando = null;
    this.formulario.reset({ estado: true });
    this.modalRef = this.modalService.open(this.modalContent, { 
      size: 'lg',
      scrollable: true,
      backdrop: true,
      keyboard: true
    });
  }

  abrirModalEditar(profesor: Profesor): void {
    this.editando = true;
    this.profesorIdEditando = this.getProfesorId(profesor);
    this.formulario.patchValue({
      nombre: profesor.nombre,
      documento: profesor.documento,
      telefono: profesor.telefono,
      salarioPorClase: profesor.salarioPorClase,
      fotoUrl: profesor.fotoUrl || '',
      fotoNombre: profesor.fotoNombre || '',
      estado: profesor.estado
    });
    this.modalRef = this.modalService.open(this.modalContent, { 
      size: 'lg',
      scrollable: true,
      backdrop: true,
      keyboard: true
    });
  }

  guardarProfesor(): void {
    if (this.formulario.invalid) {
      this.toastr.warning('Por favor completa todos los campos requeridos correctamente', 'Validación');
      Object.keys(this.formulario.controls).forEach(key => {
        this.formulario.get(key)?.markAsTouched();
      });
      return;
    }

    const datos = this.formulario.value;
    const profesor: Profesor = {
      nombre: datos.nombre,
      documento: datos.documento,
      telefono: datos.telefono,
      salarioPorClase: parseFloat(datos.salarioPorClase),
      fotoUrl: datos.fotoUrl || null,
      fotoNombre: datos.fotoNombre || null,
      estado: datos.estado
    };

    if (this.editando && this.profesorIdEditando) {
      this.profesorService.actualizarProfesor(this.profesorIdEditando, profesor).subscribe(
        (response) => {
          this.toastr.success('Profesor actualizado correctamente', 'Éxito');
          this.cargarProfesores();
          this.modalRef.close();
        },
        (error) => {
          console.error('Error al actualizar profesor:', error);
          this.toastr.error('Error al actualizar el profesor', 'Error');
        }
      );
    } else {
      this.profesorService.crearProfesor(profesor).subscribe(
        (response) => {
          this.toastr.success('Profesor creado correctamente', 'Éxito');
          this.cargarProfesores();
          this.modalRef.close();
        },
        (error) => {
          console.error('Error al crear profesor:', error);
          this.toastr.error('Error al crear el profesor', 'Error');
        }
      );
    }
  }

  eliminarProfesor(profesor: Profesor): void {
    this.profesorAEliminar = profesor;
    this.modalRef = this.modalService.open(this.modalConfirmacion, { 
      size: 'sm',
      centered: true,
      backdrop: true,
      keyboard: true
    });
  }

  confirmarEliminar(): void {
    const id = this.getProfesorId(this.profesorAEliminar!);
    if (id) {
      this.profesorService.eliminarProfesor(id).subscribe(
        () => {
          this.toastr.success('Profesor eliminado correctamente', 'Éxito');
          this.cargarProfesores();
          this.modalRef.close();
          this.profesorAEliminar = null;
        },
        (error) => {
          console.error('Error al eliminar profesor:', error);
          this.toastr.error('Error al eliminar el profesor', 'Error');
        }
      );
    }
  }

  cerrarModal(): void {
    this.modalRef.close();
    this.profesorAEliminar = null;
  }

  formatearSalario(salario: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(salario);
  }
}
