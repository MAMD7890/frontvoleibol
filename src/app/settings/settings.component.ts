import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { SedeService, Sede } from '../services/sede.service';
import { CategoriaService, Categoria } from '../services/categoria.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  @ViewChild('modalSede') modalSede: any;
  @ViewChild('modalCategoria') modalCategoria: any;
  @ViewChild('modalConfirmacion') modalConfirmacion: any;

  // Datos
  sedes: Sede[] = [];
  categorias: Categoria[] = [];
  
  // Formularios
  formularioSede: FormGroup;
  formularioCategoria: FormGroup;
  
  // Modal
  modalRef: NgbModalRef;
  
  // Estados
  cargandoSedes = false;
  cargandoCategorias = false;
  editandoSede = false;
  editandoCategoria = false;
  
  // IDs en edición
  sedeIdEditando: number | null = null;
  categoriaIdEditando: number | null = null;
  
  // Para eliminar
  itemAEliminar: any = null;
  tipoEliminar: 'sede' | 'categoria' = 'sede';

  constructor(
    private sedeService: SedeService,
    private categoriaService: CategoriaService,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private fb: FormBuilder
  ) {
    this.formularioSede = this.crearFormularioSede();
    this.formularioCategoria = this.crearFormularioCategoria();
  }

  ngOnInit(): void {
    this.cargarSedes();
    this.cargarCategorias();
  }

  // ========== HELPERS ==========
  getSedeId(sede: Sede): number | null {
    return sede.id || sede.idSede || null;
  }

  getCategoriaId(categoria: Categoria): number | null {
    return categoria.id || categoria.idCategoria || null;
  }

  // ========== SEDES ==========
  crearFormularioSede(): FormGroup {
    return this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      direccion: ['', Validators.required],
      telefono: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      estado: [true]
    });
  }

  cargarSedes(): void {
    this.cargandoSedes = true;
    this.sedeService.obtenerSedes().subscribe(
      (data: Sede[]) => {
        this.sedes = data;
        this.cargandoSedes = false;
      },
      (error) => {
        console.error('Error al cargar sedes:', error);
        this.toastr.error('Error al cargar las sedes', 'Error');
        this.cargandoSedes = false;
      }
    );
  }

  abrirModalCrearSede(): void {
    this.editandoSede = false;
    this.sedeIdEditando = null;
    this.formularioSede.reset({ estado: true });
    this.modalRef = this.modalService.open(this.modalSede, { 
      size: 'lg',
      scrollable: true,
      backdrop: true,
      keyboard: true
    });
  }

  abrirModalEditarSede(sede: Sede): void {
    this.editandoSede = true;
    this.sedeIdEditando = this.getSedeId(sede);
    this.formularioSede.patchValue({
      nombre: sede.nombre,
      direccion: sede.direccion,
      telefono: sede.telefono,
      estado: sede.estado
    });
    this.modalRef = this.modalService.open(this.modalSede, { 
      size: 'lg',
      scrollable: true,
      backdrop: true,
      keyboard: true
    });
  }

  guardarSede(): void {
    if (this.formularioSede.invalid) {
      this.toastr.warning('Por favor completa todos los campos requeridos', 'Validación');
      Object.keys(this.formularioSede.controls).forEach(key => {
        this.formularioSede.get(key)?.markAsTouched();
      });
      return;
    }

    const datos = this.formularioSede.value;
    const sede: Sede = {
      nombre: datos.nombre,
      direccion: datos.direccion,
      telefono: datos.telefono,
      estado: datos.estado
    };

    if (this.editandoSede && this.sedeIdEditando) {
      this.sedeService.actualizarSede(this.sedeIdEditando, sede).subscribe(
        () => {
          this.toastr.success('Sede actualizada correctamente', 'Éxito');
          this.cargarSedes();
          this.modalRef.close();
        },
        (error) => {
          console.error('Error al actualizar sede:', error);
          this.toastr.error('Error al actualizar la sede', 'Error');
        }
      );
    } else {
      this.sedeService.crearSede(sede).subscribe(
        () => {
          this.toastr.success('Sede creada correctamente', 'Éxito');
          this.cargarSedes();
          this.modalRef.close();
        },
        (error) => {
          console.error('Error al crear sede:', error);
          this.toastr.error('Error al crear la sede', 'Error');
        }
      );
    }
  }

  eliminarSede(sede: Sede): void {
    this.itemAEliminar = sede;
    this.tipoEliminar = 'sede';
    this.modalRef = this.modalService.open(this.modalConfirmacion, { 
      size: 'sm',
      centered: true,
      backdrop: true,
      keyboard: true
    });
  }

  // ========== CATEGORÍAS ==========
  crearFormularioCategoria(): FormGroup {
    return this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: ['', Validators.required],
      estado: [true]
    });
  }

  cargarCategorias(): void {
    this.cargandoCategorias = true;
    this.categoriaService.obtenerCategorias().subscribe(
      (data: Categoria[]) => {
        this.categorias = data;
        this.cargandoCategorias = false;
      },
      (error) => {
        console.error('Error al cargar categorías:', error);
        this.toastr.error('Error al cargar las categorías', 'Error');
        this.cargandoCategorias = false;
      }
    );
  }

  abrirModalCrearCategoria(): void {
    this.editandoCategoria = false;
    this.categoriaIdEditando = null;
    this.formularioCategoria.reset();
    this.formularioCategoria.patchValue({ 
      nombre: '',
      descripcion: '',
      estado: true 
    });
    this.modalRef = this.modalService.open(this.modalCategoria, { 
      size: 'lg',
      scrollable: true,
      backdrop: true,
      keyboard: true
    });
  }

  abrirModalEditarCategoria(categoria: Categoria): void {
    this.editandoCategoria = true;
    this.categoriaIdEditando = this.getCategoriaId(categoria);
    this.formularioCategoria.patchValue({
      nombre: categoria.nombre,
      descripcion: categoria.descripcion,
      estado: categoria.estado
    });
    this.modalRef = this.modalService.open(this.modalCategoria, { 
      size: 'lg',
      scrollable: true,
      backdrop: true,
      keyboard: true
    });
  }

  guardarCategoria(): void {
    if (this.formularioCategoria.invalid) {
      this.toastr.warning('Por favor completa todos los campos requeridos', 'Validación');
      Object.keys(this.formularioCategoria.controls).forEach(key => {
        this.formularioCategoria.get(key)?.markAsTouched();
      });
      return;
    }

    const datos = this.formularioCategoria.value;
    const categoria: Categoria = {
      nombre: datos.nombre,
      descripcion: datos.descripcion,
      estado: datos.estado === true || datos.estado === 'true'
    };

    if (this.editandoCategoria && this.categoriaIdEditando) {
      this.categoriaService.actualizarCategoria(this.categoriaIdEditando, categoria).subscribe(
        () => {
          this.toastr.success('Categoría actualizada correctamente', 'Éxito');
          this.cargarCategorias();
          this.modalRef.close();
        },
        (error) => {
          console.error('Error al actualizar categoría:', error);
          this.toastr.error('Error al actualizar la categoría', 'Error');
        }
      );
    } else {
      this.categoriaService.crearCategoria(categoria).subscribe(
        () => {
          this.toastr.success('Categoría creada correctamente', 'Éxito');
          this.cargarCategorias();
          this.modalRef.close();
        },
        (error) => {
          console.error('Error al crear categoría:', error);
          this.toastr.error('Error al crear la categoría', 'Error');
        }
      );
    }
  }

  eliminarCategoria(categoria: Categoria): void {
    this.itemAEliminar = categoria;
    this.tipoEliminar = 'categoria';
    this.modalRef = this.modalService.open(this.modalConfirmacion, { 
      size: 'sm',
      centered: true,
      backdrop: true,
      keyboard: true
    });
  }

  // ========== CONFIRMACIÓN ELIMINAR ==========
  confirmarEliminar(): void {
    if (this.tipoEliminar === 'sede') {
      const id = this.getSedeId(this.itemAEliminar);
      if (id) {
        this.sedeService.eliminarSede(id).subscribe(
          () => {
            this.toastr.success('Sede eliminada correctamente', 'Éxito');
            this.cargarSedes();
            this.modalRef.close();
            this.itemAEliminar = null;
          },
          (error) => {
            console.error('Error al eliminar sede:', error);
            this.toastr.error('Error al eliminar la sede', 'Error');
          }
        );
      }
    } else {
      const id = this.getCategoriaId(this.itemAEliminar);
      if (id) {
        this.categoriaService.eliminarCategoria(id).subscribe(
          () => {
            this.toastr.success('Categoría eliminada correctamente', 'Éxito');
            this.cargarCategorias();
            this.modalRef.close();
            this.itemAEliminar = null;
          },
          (error) => {
            console.error('Error al eliminar categoría:', error);
            this.toastr.error('Error al eliminar la categoría', 'Error');
          }
        );
      }
    }
  }

  cerrarModal(): void {
    this.modalRef.close();
    this.itemAEliminar = null;
  }
}
