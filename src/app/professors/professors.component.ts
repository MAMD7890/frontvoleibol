import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ProfesorService, Profesor, ProfesorRegistroResponse } from '../services/profesor.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-professors',
  templateUrl: './professors.component.html',
  styleUrls: ['./professors.component.css']
})
export class ProfessorsComponent implements OnInit {
  @ViewChild('modalContent') modalContent: any;
  @ViewChild('modalConfirmacion') modalConfirmacion: any;
  @ViewChild('fileInput') fileInput: ElementRef;

  profesores: Profesor[] = [];
  profesoresFiltrados: Profesor[] = [];
  formulario: FormGroup;
  modalRef: NgbModalRef;
  cargando = false;
  editando = false;
  profesorIdEditando: number | null = null;
  profesorAEliminar: Profesor | null = null;

  // Propiedades para manejo de foto
  fotoSeleccionada: File | null = null;
  fotoPreview: string | null = null;
  cargandoFoto = false;

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
      correo: ['', [Validators.required, Validators.email]],
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
    this.limpiarFoto();
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
    this.limpiarFoto();
    
    // Establecer vista previa de foto si existe
    if (profesor.fotoUrl) {
      this.fotoPreview = profesor.fotoUrl;
    }
    
    this.formulario.patchValue({
      nombre: profesor.nombre,
      documento: profesor.documento,
      telefono: profesor.telefono,
      correo: profesor.correo || '',
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
      correo: datos.correo,
      salarioPorClase: parseFloat(datos.salarioPorClase),
      fotoUrl: datos.fotoUrl || null,
      fotoNombre: datos.fotoNombre || null,
      estado: datos.estado
    };

    if (this.editando && this.profesorIdEditando) {
      // Actualizar profesor
      this.profesorService.actualizarProfesor(this.profesorIdEditando, profesor).subscribe(
        (response) => {
          // Si hay foto nueva seleccionada, subirla
          if (this.fotoSeleccionada) {
            this.subirFotoProfesor(this.profesorIdEditando!, true);
          } else {
            this.toastr.success('Profesor actualizado correctamente', 'Éxito');
            this.cargarProfesores();
            this.modalRef.close();
          }
        },
        (error) => {
          console.error('Error al actualizar profesor:', error);
          this.toastr.error('Error al actualizar el profesor', 'Error');
        }
      );
    } else {
      // Para crear profesor con usuario
      if (this.fotoSeleccionada) {
        // Si hay foto, usar el endpoint que registra todo en una sola petición
        this.cargandoFoto = true;
        this.profesorService.registrarProfesorConFoto(profesor, this.fotoSeleccionada).subscribe(
          (response: ProfesorRegistroResponse) => {
            this.cargandoFoto = false;
            this.mostrarCredenciales(profesor.correo!, profesor.documento);
            this.cargarProfesores();
            this.modalRef.close();
          },
          (error) => {
            this.cargandoFoto = false;
            console.error('Error al crear profesor:', error);
            const errorMsg = error.error?.message || error.message || 'Error al crear el profesor';
            this.toastr.error(errorMsg, 'Error');
          }
        );
      } else {
        // Sin foto, usar el endpoint normal
        this.profesorService.registrarProfesorConUsuario(profesor).subscribe(
          (response: ProfesorRegistroResponse) => {
            this.mostrarCredenciales(profesor.correo!, profesor.documento);
            this.cargarProfesores();
            this.modalRef.close();
          },
          (error) => {
            console.error('Error al crear profesor:', error);
            const errorMsg = error.error?.message || error.message || 'Error al crear el profesor';
            this.toastr.error(errorMsg, 'Error');
          }
        );
      }
    }
  }

  // Subir foto después de crear/actualizar profesor
  subirFotoProfesor(profesorId: number, esActualizacion: boolean, correo?: string, documento?: string): void {
    if (!this.fotoSeleccionada) return;
    
    this.cargandoFoto = true;
    this.profesorService.uploadFoto(profesorId, this.fotoSeleccionada).subscribe(
      (response) => {
        this.cargandoFoto = false;
        if (esActualizacion) {
          this.toastr.success('Profesor y foto actualizados correctamente', 'Éxito');
        } else {
          this.mostrarCredenciales(correo!, documento!);
        }
        this.cargarProfesores();
        this.modalRef.close();
      },
      (error) => {
        console.error('Error al subir foto:', error);
        this.cargandoFoto = false;
        if (esActualizacion) {
          this.toastr.warning('Profesor actualizado, pero hubo un error al subir la foto', 'Advertencia');
        } else {
          this.toastr.warning('Profesor creado, pero hubo un error al subir la foto', 'Advertencia');
          this.mostrarCredenciales(correo!, documento!);
        }
        this.cargarProfesores();
        this.modalRef.close();
      }
    );
  }

  mostrarCredenciales(correo: string, documento: string): void {
    this.toastr.success(
      `Profesor creado correctamente. Credenciales de acceso:<br>` +
      `<strong>Email:</strong> ${correo}<br>` +
      `<strong>Contraseña:</strong> ${documento}`, 
      'Éxito',
      { timeOut: 10000, closeButton: true, enableHtml: true }
    );
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
    this.limpiarFoto();
  }

  // ========== MANEJO DE FOTO ==========
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        this.toastr.warning('Por favor selecciona un archivo de imagen válido', 'Archivo inválido');
        return;
      }
      
      // Validar tamaño (máximo 5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        this.toastr.warning('La imagen no debe superar los 5MB', 'Archivo muy grande');
        return;
      }
      
      this.fotoSeleccionada = file;
      
      // Crear vista previa local (no subir aún)
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.fotoPreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
      
      this.toastr.info('Foto seleccionada. Se subirá al guardar el profesor.', 'Foto lista');
    }
  }

  limpiarFoto(): void {
    this.fotoSeleccionada = null;
    this.fotoPreview = null;
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  eliminarFoto(): void {
    this.limpiarFoto();
    this.formulario.patchValue({
      fotoUrl: '',
      fotoNombre: ''
    });
  }

  formatearSalario(salario: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(salario);
  }
}
