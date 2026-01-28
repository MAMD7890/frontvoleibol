import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { EstudianteService, Estudiante, Sede, RegistroEstudianteResponse } from '../services/estudiante.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-students',
  templateUrl: './students.component.html',
  styleUrls: ['./students.component.css']
})
export class StudentsComponent implements OnInit {
  @ViewChild('modalContent') modalContent: any;
  @ViewChild('modalConfirmacion') modalConfirmacion: any;

  estudiantes: Estudiante[] = [];
  estudiantesFiltrados: Estudiante[] = [];
  formulario: FormGroup;
  modalRef: NgbModalRef;
  cargando = false;
  editando = false;
  estudianteIdEditando: number | null = null;
  titulo: string = '';
  mensaje: string = '';
  nombreBoton: string = '';

  sedes: Sede[] = [];

  // Filtros
  filtroNombre: string = '';
  filtroDocumento: string = '';
  filtroSede: string = '';
  filtroSexo: string = '';

  constructor(
    private estudianteService: EstudianteService,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.formulario = this.crearFormulario();
  }

  ngOnInit(): void {
    this.cargarSedes();
    this.cargarEstudiantes();
  }

  cargarSedes(): void {
    this.estudianteService.obtenerSedes().subscribe(
      (data: Sede[]) => {
        console.log('Sedes cargadas:', data);
        this.sedes = data;
      },
      (error) => {
        console.error('Error al cargar sedes:', error);
        this.toastr.error('No se pudieron cargar las sedes. Verifica que el servidor esté activo.', 'Error');
      }
    );
  }

  cargarEstudiantes(): void {
    this.cargando = true;
    this.estudianteService.obtenerEstudiantes().subscribe(
      (data: Estudiante[]) => {
        this.estudiantes = data;
        this.aplicarFiltros();
        this.cargando = false;
      },
      (error) => {
        console.error('Error al cargar estudiantes:', error);
        this.toastr.error('Error al cargar los estudiantes', 'Error');
        this.cargando = false;
      }
    );
  }

  // ========== FILTROS ==========
  aplicarFiltros(): void {
    this.estudiantesFiltrados = this.estudiantes.filter(estudiante => {
      // Filtro por nombre
      if (this.filtroNombre && !estudiante.nombreCompleto.toLowerCase().includes(this.filtroNombre.toLowerCase())) {
        return false;
      }
      
      // Filtro por documento
      if (this.filtroDocumento && !estudiante.numeroDocumento.includes(this.filtroDocumento)) {
        return false;
      }
      
      // Filtro por sede
      if (this.filtroSede) {
        const sedeId = estudiante.sede?.id || estudiante.sede?.idSede;
        if (!sedeId || sedeId.toString() !== this.filtroSede) {
          return false;
        }
      }
      
      // Filtro por sexo
      if (this.filtroSexo && estudiante.sexo !== this.filtroSexo) {
        return false;
      }
      
      return true;
    });
  }

  limpiarFiltros(): void {
    this.filtroNombre = '';
    this.filtroDocumento = '';
    this.filtroSede = '';
    this.filtroSexo = '';
    this.aplicarFiltros();
  }

  getSedeId(sede: Sede): number | null {
    return sede.id || sede.idSede || null;
  }

  crearFormulario(): FormGroup {
    return this.fb.group({
      nombreCompleto: ['', [Validators.required, Validators.minLength(3)]],
      tipoDocumento: ['CC', Validators.required],
      numeroDocumento: ['', [Validators.required, Validators.pattern(/^\d+$/)]], 
      fechaNacimiento: ['', Validators.required],
      sexo: ['MASCULINO', Validators.required],
      direccionResidencia: ['', Validators.required],
      barrio: ['', Validators.required],
      celularEstudiante: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      correoEstudiante: ['', [Validators.required, Validators.email]],
      sedeId: ['', Validators.required],
      nombreTutor: ['', Validators.required],
      parentescoTutor: ['Padre', Validators.required],
      documentoTutor: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      telefonoTutor: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      correoTutor: ['', [Validators.required, Validators.email]],
      ocupacionTutor: ['', []],
      institucionEducativa: ['', Validators.required],
      jornada: ['MAÑANA', Validators.required],
      gradoActual: [9, [Validators.required, Validators.min(1), Validators.max(11)]],
      eps: ['', Validators.required],
      tipoSangre: ['O+', Validators.required],
      alergias: [''],
      enfermedadesCondiciones: [''],
      medicamentos: [''],
      certificadoMedicoDeportivo: [false],
      nombreCamiseta: [''],
      numeroCamiseta: [0],
      estado: [true]
    });
  }

  abrirModalCrear(): void {
    this.editando = false;
    this.estudianteIdEditando = null;
    this.formulario.reset();
    this.modalRef = this.modalService.open(this.modalContent, { 
      size: 'lg', 
      scrollable: true,
      backdrop: false,
      keyboard: true,
      centered: false
    });
  }

  abrirModalEditar(estudiante: Estudiante): void {
    this.editando = true;
    this.estudianteIdEditando = estudiante.idEstudiante!;
    
    console.log('Estudiante completo:', estudiante);
    
    this.formulario.patchValue({
      nombreCompleto: estudiante.nombreCompleto,
      tipoDocumento: estudiante.tipoDocumento,
      numeroDocumento: estudiante.numeroDocumento,
      fechaNacimiento: estudiante.fechaNacimiento,
      sexo: estudiante.sexo,
      direccionResidencia: estudiante.direccionResidencia,
      barrio: estudiante.barrio,
      celularEstudiante: estudiante.celularEstudiante,
      correoEstudiante: estudiante.correoEstudiante,
      sedeId: estudiante.sede.idSede,
      nombreTutor: estudiante.nombreTutor,
      parentescoTutor: estudiante.parentescoTutor,
      documentoTutor: estudiante.documentoTutor,
      telefonoTutor: estudiante.telefonoTutor,
      correoTutor: estudiante.correoTutor,
      ocupacionTutor: estudiante.ocupacionTutor,
      institucionEducativa: estudiante.institucionEducativa,
      jornada: estudiante.jornada,
      gradoActual: estudiante.gradoActual,
      eps: estudiante.eps,
      tipoSangre: estudiante.tipoSangre,
      alergias: estudiante.alergias,
      enfermedadesCondiciones: estudiante.enfermedadesCondiciones,
      medicamentos: estudiante.medicamentos,
      certificadoMedicoDeportivo: estudiante.certificadoMedicoDeportivo,
      nombreCamiseta: estudiante.nombreCamiseta || '',
      numeroCamiseta: estudiante.numeroCamiseta || 0,
      estado: estudiante.estado
    });

    this.modalRef = this.modalService.open(this.modalContent, {
      size: 'lg',
      scrollable: true,
      backdrop: false,
      keyboard: true,
      centered: false
    });
  }

  guardarEstudiante(): void {
    if (this.formulario.invalid) {
      // Log de errores por campo para debuggeo
      Object.keys(this.formulario.controls).forEach(key => {
        const control = this.formulario.get(key);
        if (control && control.invalid) {
          console.error(`Campo inválido: ${key}`, control.errors);
        }
      });
      this.toastr.warning('Por favor completa todos los campos requeridos correctamente', 'Validación');
      return;
    }

    const datos = this.formulario.value;
    const sedeId = parseInt(datos.sedeId);
    
    const estudiante: Estudiante = {
      nombreCompleto: datos.nombreCompleto?.trim(),
      tipoDocumento: datos.tipoDocumento,
      numeroDocumento: datos.numeroDocumento?.trim(),
      fechaNacimiento: datos.fechaNacimiento,
      edad: this.calcularEdad(datos.fechaNacimiento),
      sexo: datos.sexo,
      direccionResidencia: datos.direccionResidencia?.trim(),
      barrio: datos.barrio?.trim(),
      celularEstudiante: datos.celularEstudiante?.trim(),
      correoEstudiante: datos.correoEstudiante?.trim(),
      sede: {
        idSede: sedeId
      },
      nombreTutor: datos.nombreTutor?.trim(),
      parentescoTutor: datos.parentescoTutor,
      documentoTutor: datos.documentoTutor?.trim(),
      telefonoTutor: datos.telefonoTutor?.trim(),
      correoTutor: datos.correoTutor?.trim(),
      ocupacionTutor: datos.ocupacionTutor?.trim() || '',
      institucionEducativa: datos.institucionEducativa?.trim(),
      jornada: datos.jornada,
      gradoActual: parseInt(datos.gradoActual),
      eps: datos.eps?.trim(),
      tipoSangre: datos.tipoSangre,
      alergias: datos.alergias?.trim() || '',
      enfermedadesCondiciones: datos.enfermedadesCondiciones?.trim() || '',
      medicamentos: datos.medicamentos?.trim() || '',
      certificadoMedicoDeportivo: datos.certificadoMedicoDeportivo === true,
      nombreCamiseta: datos.nombreCamiseta?.trim() || '',
      numeroCamiseta: datos.numeroCamiseta ? parseInt(datos.numeroCamiseta) : 0,
      estado: datos.estado === true || datos.estado === 'true'
    };

    if (this.editando && this.estudianteIdEditando) {
      // Modo edición - usar endpoint tradicional
      this.estudianteService.actualizarEstudiante(this.estudianteIdEditando, estudiante).subscribe(
        () => {
          this.toastr.success('Estudiante actualizado correctamente', 'Éxito');
          this.cerrarModal();
          this.cargarEstudiantes();
        },
        (error) => {
          console.error('Error al actualizar:', error);
          this.toastr.error('Error al actualizar: ' + (error.error?.message || error.message), 'Error');
        }
      );
    } else {
      // Modo creación - usar endpoint de registro con login automático
      this.estudianteService.registrarEstudiante(estudiante).subscribe(
        (response: RegistroEstudianteResponse) => {
          // Almacenar tokens y datos de usuario
          this.almacenarTokensYUsuario(response);
          
          // Mostrar mensaje de éxito
          this.toastr.success(`¡Bienvenido ${response.user.nombre}! Tu cuenta ha sido creada exitosamente`, 'Registro Exitoso');
          
          // Cerrar modal
          this.cerrarModal();
          
          // Redirigir al dashboard del estudiante
          this.router.navigate(['/dashboard']);
        },
        (error) => {
          console.error('Error al registrar:', error);
          let mensajeError = 'Error al registrar el estudiante';
          
          // Manejo específico de errores
          if (error.status === 409 || error.error?.message?.includes('email')) {
            mensajeError = 'Ya existe un usuario registrado con este correo electrónico';
          } else if (error.status === 400) {
            mensajeError = 'Datos inválidos. Verifica la información ingresada';
          } else if (error.error?.message) {
            mensajeError = error.error.message;
          }
          
          this.toastr.error(mensajeError, 'Error de Registro');
        }
      );
    }
  }

  private almacenarTokensYUsuario(response: RegistroEstudianteResponse): void {
    // Usar el método público del AuthService para manejar la autenticación
    this.authService.handleAuthResponse(response);
  }

  eliminarEstudiante(id: number, nombre: string): void {
    const modalRef = this.modalService.open(this.modalConfirmacion, {
      size: 'sm',
      backdrop: false,
      keyboard: false,
      centered: true
    });
    
    this.titulo = 'Eliminar Estudiante';
    this.mensaje = `¿Estás seguro de que deseas eliminar a ${nombre}?`;
    this.nombreBoton = 'Eliminar';
    
    modalRef.result.then(
      (confirmado) => {
        if (confirmado) {
          this.estudianteService.eliminarEstudiante(id).subscribe(
            () => {
              this.toastr.success('Estudiante eliminado correctamente', 'Éxito');
              this.cargarEstudiantes();
            },
            (error) => {
              console.error('Error al eliminar:', error);
              this.toastr.error('Error al eliminar el estudiante', 'Error');
            }
          );
        }
      },
      () => {
        // Modal cerrado sin confirmar
      }
    );
  }

  calcularEdad(fechaNacimiento: string): number {
    const hoy = new Date();
    const fecha = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - fecha.getFullYear();
    const mes = hoy.getMonth() - fecha.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < fecha.getDate())) {
      edad--;
    }
    return edad;
  }

  obtenerNombreSede(sedeId: number): string {
    const sede = this.sedes.find(s => s.idSede === sedeId);
    return sede ? sede.nombreSede : 'Desconocida';
  }

  cerrarModal(): void {
    this.modalRef.dismiss();
  }
}
