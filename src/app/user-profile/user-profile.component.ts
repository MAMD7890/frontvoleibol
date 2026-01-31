import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { UserInfo } from '../models/auth.model';
import { ToastrService } from 'ngx-toastr';
import { HttpClient } from '@angular/common/http';

export interface UserProfile {
  id: number;
  nombre: string;
  apellido?: string;
  email: string;
  tipoDocumento?: string;
  numeroDocumento?: string;
  telefono?: string;
  fotoUrl: string | null;
  rol: string;
}

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  @ViewChild('fileInput') fileInput: ElementRef;

  currentUser: UserInfo | null = null;
  perfilForm: FormGroup;
  passwordForm: FormGroup;
  
  // Estado
  cargando = false;
  guardando = false;
  cambiandoPassword = false;
  
  // Foto
  fotoSeleccionada: File | null = null;
  fotoPreview: string | null = null;
  cargandoFoto = false;
  
  // Control de visibilidad de passwords
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;
  
  // Tipos de documento
  tiposDocumento = [
    { value: 'CC', label: 'Cédula de Ciudadanía' },
    { value: 'CE', label: 'Cédula de Extranjería' },
    { value: 'TI', label: 'Tarjeta de Identidad' },
    { value: 'PASAPORTE', label: 'Pasaporte' }
  ];

  private apiUrl = 'http://localhost:8080/api';

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private http: HttpClient
  ) {
    this.perfilForm = this.crearPerfilForm();
    this.passwordForm = this.crearPasswordForm();
  }

  ngOnInit() {
    this.currentUser = this.authService.currentUserValue;
    this.cargarPerfil();
  }

  crearPerfilForm(): FormGroup {
    return this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: [''],
      email: ['', [Validators.required, Validators.email]],
      tipoDocumento: ['CC'],
      numeroDocumento: [''],
      telefono: ['', [Validators.pattern(/^\d{10}$/)]]
    });
  }

  crearPasswordForm(): FormGroup {
    return this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    
    if (newPassword !== confirmPassword) {
      form.get('confirmPassword')?.setErrors({ mismatch: true });
      return { mismatch: true };
    }
    return null;
  }

  cargarPerfil(): void {
    // Primero obtener datos actualizados del servidor
    this.cargando = true;
    this.authService.getCurrentUser().subscribe(
      (user) => {
        this.currentUser = user;
        this.cargando = false;
        this.llenarFormulario();
      },
      (error) => {
        console.error('Error al cargar perfil:', error);
        this.cargando = false;
        // Usar datos del localStorage si falla
        if (this.currentUser) {
          this.llenarFormulario();
        }
      }
    );
  }

  llenarFormulario(): void {
    if (this.currentUser) {
      // Separar nombre y apellido si vienen juntos
      const nombreCompleto = this.currentUser.nombre || '';
      const partes = nombreCompleto.split(' ');
      const nombre = partes[0] || '';
      const apellido = partes.slice(1).join(' ') || '';
      
      this.perfilForm.patchValue({
        nombre: nombre,
        apellido: apellido,
        email: this.currentUser.email,
        tipoDocumento: this.currentUser.tipoDocumento || 'CC',
        numeroDocumento: this.currentUser.numeroDocumento || '',
        telefono: this.currentUser.telefono || ''
      });
      
      if (this.currentUser.fotoUrl) {
        this.fotoPreview = 'http://localhost:8080' + this.currentUser.fotoUrl;
      }
    }
  }

  // ========== FOTO ==========
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      if (!file.type.startsWith('image/')) {
        this.toastr.warning('Por favor selecciona un archivo de imagen válido', 'Archivo inválido');
        return;
      }
      
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        this.toastr.warning('La imagen no debe superar los 5MB', 'Archivo muy grande');
        return;
      }
      
      this.fotoSeleccionada = file;
      
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.fotoPreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  subirFoto(): void {
    if (!this.fotoSeleccionada) {
      this.toastr.warning('Selecciona una foto primero', 'Aviso');
      return;
    }
    
    this.cargandoFoto = true;
    
    // Usar el servicio de auth que maneja correctamente la actualización
    this.authService.updateProfilePhoto(this.fotoSeleccionada).subscribe(
      (response) => {
        this.cargandoFoto = false;
        this.toastr.success('Foto actualizada correctamente', 'Éxito');
        this.currentUser = response;
        this.fotoSeleccionada = null;
        if (response.fotoUrl) {
          this.fotoPreview = 'http://localhost:8080' + response.fotoUrl;
        }
      },
      (error) => {
        this.cargandoFoto = false;
        console.error('Error completo al subir foto:', error);
        console.error('Status:', error.status);
        console.error('Message:', error.message);
        console.error('Error body:', error.error);
        const mensaje = error.error?.message || error.error?.error || 'Error al actualizar la foto';
        this.toastr.error(mensaje, 'Error');
      }
    );
  }

  eliminarFoto(): void {
    this.fotoSeleccionada = null;
    this.fotoPreview = this.currentUser?.fotoUrl 
      ? 'http://localhost:8080' + this.currentUser.fotoUrl 
      : null;
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  // ========== PERFIL ==========
  guardarPerfil(): void {
    if (this.perfilForm.invalid) {
      this.toastr.warning('Por favor completa los campos correctamente', 'Validación');
      Object.keys(this.perfilForm.controls).forEach(key => {
        this.perfilForm.get(key)?.markAsTouched();
      });
      return;
    }
    
    this.guardando = true;
    const datos = this.perfilForm.value;
    const nombreCompleto = `${datos.nombre} ${datos.apellido}`.trim();
    
    const payload = {
      nombre: nombreCompleto,
      email: datos.email,
      tipoDocumento: datos.tipoDocumento,
      numeroDocumento: datos.numeroDocumento,
      telefono: datos.telefono
    };
    
    this.http.put<UserInfo>(`${this.apiUrl}/auth/update-profile`, payload).subscribe(
      (response) => {
        this.guardando = false;
        this.toastr.success('Perfil actualizado correctamente', 'Éxito');
        this.authService.getCurrentUser().subscribe();
      },
      (error) => {
        this.guardando = false;
        console.error('Error al actualizar perfil:', error);
        this.toastr.error('Error al actualizar el perfil', 'Error');
      }
    );
  }

  // ========== CONTRASEÑA ==========
  cambiarPassword(): void {
    if (this.passwordForm.invalid) {
      this.toastr.warning('Por favor completa los campos correctamente', 'Validación');
      Object.keys(this.passwordForm.controls).forEach(key => {
        this.passwordForm.get(key)?.markAsTouched();
      });
      return;
    }
    
    this.cambiandoPassword = true;
    const datos = this.passwordForm.value;
    
    this.http.post(`${this.apiUrl}/auth/change-password`, {
      currentPassword: datos.currentPassword,
      newPassword: datos.newPassword
    }).subscribe(
      (response) => {
        this.cambiandoPassword = false;
        this.toastr.success('Contraseña cambiada correctamente', 'Éxito');
        this.passwordForm.reset();
      },
      (error) => {
        this.cambiandoPassword = false;
        console.error('Error al cambiar contraseña:', error);
        const errorMsg = error.error?.message || 'Error al cambiar la contraseña';
        this.toastr.error(errorMsg, 'Error');
      }
    );
  }

  // ========== HELPERS ==========
  getUserInitials(): string {
    if (this.currentUser && this.currentUser.nombre) {
      const parts = this.currentUser.nombre.split(' ');
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return parts[0].substring(0, 2).toUpperCase();
    }
    return 'US';
  }

  togglePasswordVisibility(field: string): void {
    switch (field) {
      case 'current':
        this.showCurrentPassword = !this.showCurrentPassword;
        break;
      case 'new':
        this.showNewPassword = !this.showNewPassword;
        break;
      case 'confirm':
        this.showConfirmPassword = !this.showConfirmPassword;
        break;
    }
  }
}
