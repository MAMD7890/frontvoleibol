import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { EquipoService, Equipo, Categoria, Sede } from '../services/equipo.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-teams',
  templateUrl: './teams.component.html',
  styleUrls: ['./teams.component.css']
})
export class TeamsComponent implements OnInit {
  @ViewChild('modalContent') modalContent: any;
  @ViewChild('modalConfirmacion') modalConfirmacion: any;

  equipos: Equipo[] = [];
  equiposFiltrados: Equipo[] = [];
  formulario: FormGroup;
  modalRef: NgbModalRef;
  cargando = false;
  editando = false;
  equipoIdEditando: number | null = null;
  equipoAEliminar: Equipo | null = null;

  // Datos que se cargan desde el backend
  categorias: Categoria[] = [];
  sedes: Sede[] = [];

  // Filtros
  filtroNombre: string = '';
  filtroCategoria: string = '';
  filtroSede: string = '';
  filtroEstado: string = '';

  constructor(
    private equipoService: EquipoService,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private fb: FormBuilder
  ) {
    this.formulario = this.crearFormulario();
  }

  ngOnInit(): void {
    this.cargarCategorias();
    this.cargarSedes();
    this.cargarEquipos();
  }

  // Helper para obtener el ID del equipo (puede venir como 'id' o 'idEquipo')
  getEquipoId(equipo: Equipo): number | null {
    return equipo.id || equipo.idEquipo || null;
  }

  cargarCategorias(): void {
    this.equipoService.obtenerCategorias().subscribe(
      (data: Categoria[]) => {
        this.categorias = data;
        console.log('Categorías cargadas:', data);
      },
      (error) => {
        console.error('Error al cargar categorías:', error);
        this.toastr.error('No se pudieron cargar las categorías', 'Error');
      }
    );
  }

  cargarSedes(): void {
    this.equipoService.obtenerSedes().subscribe(
      (data: Sede[]) => {
        this.sedes = data;
        console.log('Sedes cargadas:', data);
      },
      (error) => {
        console.error('Error al cargar sedes:', error);
        this.toastr.error('No se pudieron cargar las sedes', 'Error');
      }
    );
  }

  cargarEquipos(): void {
    this.cargando = true;
    this.equipoService.obtenerEquipos().subscribe(
      (data: Equipo[]) => {
        this.equipos = data;
        this.aplicarFiltros();
        this.cargando = false;
      },
      (error) => {
        console.error('Error al cargar equipos:', error);
        this.toastr.error('Error al cargar los equipos. Verifica que el servidor esté activo.', 'Error');
        this.cargando = false;
      }
    );
  }

  // ========== FILTROS ==========
  aplicarFiltros(): void {
    this.equiposFiltrados = this.equipos.filter(equipo => {
      // Filtro por nombre
      if (this.filtroNombre && !equipo.nombre.toLowerCase().includes(this.filtroNombre.toLowerCase())) {
        return false;
      }
      
      // Filtro por categoría
      if (this.filtroCategoria) {
        const categoriaId = equipo.categoria?.id || equipo.categoria?.idCategoria;
        if (!categoriaId || categoriaId.toString() !== this.filtroCategoria) {
          return false;
        }
      }
      
      // Filtro por sede
      if (this.filtroSede) {
        const sedeId = equipo.sede?.id || equipo.sede?.idSede;
        if (!sedeId || sedeId.toString() !== this.filtroSede) {
          return false;
        }
      }
      
      // Filtro por estado
      if (this.filtroEstado !== '') {
        const estadoBuscado = this.filtroEstado === 'true';
        if (equipo.estado !== estadoBuscado) {
          return false;
        }
      }
      
      return true;
    });
  }

  limpiarFiltros(): void {
    this.filtroNombre = '';
    this.filtroCategoria = '';
    this.filtroSede = '';
    this.filtroEstado = '';
    this.aplicarFiltros();
  }

  getCategoriaId(categoria: Categoria): number | null {
    return categoria.id || categoria.idCategoria || null;
  }

  getSedeId(sede: Sede): number | null {
    return sede.id || sede.idSede || null;
  }

  crearFormulario(): FormGroup {
    return this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      categoriaId: ['', Validators.required],
      sedeId: ['', Validators.required],
      horario: ['', Validators.required],
      fotoUrl: [''],
      estado: [true]
    });
  }

  abrirModalCrear(): void {
    this.editando = false;
    this.equipoIdEditando = null;
    this.formulario.reset({ estado: true });
    this.modalRef = this.modalService.open(this.modalContent, { 
      size: 'lg',
      scrollable: true,
      backdrop: true,
      keyboard: true
    });
  }

  abrirModalEditar(equipo: Equipo): void {
    this.editando = true;
    this.equipoIdEditando = this.getEquipoId(equipo);
    this.formulario.patchValue({
      nombre: equipo.nombre,
      categoriaId: equipo.categoria?.idCategoria || '',
      sedeId: equipo.sede?.idSede || '',
      horario: equipo.horario,
      fotoUrl: equipo.fotoUrl || '',
      estado: equipo.estado
    });
    this.modalRef = this.modalService.open(this.modalContent, { 
      size: 'lg',
      scrollable: true,
      backdrop: true,
      keyboard: true
    });
  }

  guardarEquipo(): void {
    if (this.formulario.invalid) {
      this.toastr.warning('Por favor completa todos los campos requeridos correctamente', 'Validación');
      Object.keys(this.formulario.controls).forEach(key => {
        this.formulario.get(key)?.markAsTouched();
      });
      return;
    }

    const datos = this.formulario.value;
    const equipo: Equipo = {
      nombre: datos.nombre,
      categoria: { idCategoria: parseInt(datos.categoriaId) },
      sede: { idSede: parseInt(datos.sedeId) },
      horario: datos.horario,
      fotoUrl: datos.fotoUrl || null,
      estado: datos.estado
    };

    if (this.editando && this.equipoIdEditando) {
      this.equipoService.actualizarEquipo(this.equipoIdEditando, equipo).subscribe(
        (response) => {
          this.toastr.success('Equipo actualizado correctamente', 'Éxito');
          this.cargarEquipos();
          this.modalRef.close();
        },
        (error) => {
          console.error('Error al actualizar equipo:', error);
          this.toastr.error('Error al actualizar el equipo', 'Error');
        }
      );
    } else {
      this.equipoService.crearEquipo(equipo).subscribe(
        (response) => {
          this.toastr.success('Equipo creado correctamente', 'Éxito');
          this.cargarEquipos();
          this.modalRef.close();
        },
        (error) => {
          console.error('Error al crear equipo:', error);
          this.toastr.error('Error al crear el equipo', 'Error');
        }
      );
    }
  }

  eliminarEquipo(equipo: Equipo): void {
    this.equipoAEliminar = equipo;
    this.modalRef = this.modalService.open(this.modalConfirmacion, { 
      size: 'sm',
      centered: true,
      backdrop: true,
      keyboard: true
    });
  }

  confirmarEliminar(): void {
    const id = this.getEquipoId(this.equipoAEliminar!);
    if (id) {
      this.equipoService.eliminarEquipo(id).subscribe(
        () => {
          this.toastr.success('Equipo eliminado correctamente', 'Éxito');
          this.cargarEquipos();
          this.modalRef.close();
          this.equipoAEliminar = null;
        },
        (error) => {
          console.error('Error al eliminar equipo:', error);
          this.toastr.error('Error al eliminar el equipo', 'Error');
        }
      );
    }
  }

  cerrarModal(): void {
    this.modalRef.close();
    this.equipoAEliminar = null;
  }

  getNombreCategoria(equipo: Equipo): string {
    if (equipo.categoria?.nombre) {
      return equipo.categoria.nombre;
    }
    const cat = this.categorias.find(c => c.idCategoria === equipo.categoria?.idCategoria);
    return cat?.nombre || 'Sin categoría';
  }

  getNombreSede(equipo: Equipo): string {
    if (equipo.sede?.nombre || equipo.sede?.nombreSede) {
      return equipo.sede.nombre || equipo.sede.nombreSede || '';
    }
    const sede = this.sedes.find(s => s.idSede === equipo.sede?.idSede);
    return sede?.nombre || 'Sin sede';
  }
}
