import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { LoginRequest } from '../models/auth.model';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  // Control de vista
  isLoginMode = true;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  // Datos de Login
  loginData: LoginRequest = {
    email: '',
    password: ''
  };

  // Datos de Registro (sin fotoUrl, ahora se envía como File)
  registerNombre = '';
  registerEmail = '';
  registerPassword = '';
  registerIdRol: number | undefined = undefined;

  // Confirmación de contraseña
  confirmPassword = '';

  // Foto de perfil (OBLIGATORIA)
  selectedFile: File | null = null;
  previewUrl: string | null = null;

  // Validaciones
  showPassword = false;
  showConfirmPassword = false;
  returnUrl = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Si ya está autenticado, redirigir al dashboard
    if (this.authService.isAuthenticated) {
      this.router.navigate(['/dashboard']);
    }

    // Obtener URL de retorno
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
  }

  // Cambiar entre login y registro
  toggleMode(): void {
    this.isLoginMode = !this.isLoginMode;
    this.clearMessages();
    this.resetForms();
  }

  // Limpiar mensajes
  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  // Resetear formularios
  resetForms(): void {
    this.loginData = { email: '', password: '' };
    this.registerNombre = '';
    this.registerEmail = '';
    this.registerPassword = '';
    this.registerIdRol = undefined;
    this.confirmPassword = '';
    this.selectedFile = null;
    this.previewUrl = null;
  }

  // Manejar selección de archivo
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        this.errorMessage = 'Solo se permiten archivos de imagen';
        return;
      }

      // Validar tamaño (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage = 'La imagen no debe superar los 5MB';
        return;
      }

      this.selectedFile = file;
      this.clearMessages();

      // Crear preview
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  // Eliminar foto seleccionada
  removePhoto(): void {
    this.selectedFile = null;
    this.previewUrl = null;
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  // Disparar selección de archivo
  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  // Toggle mostrar contraseña
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  // Validar email
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validar formulario de login
  isLoginValid(): boolean {
    return this.isValidEmail(this.loginData.email) && 
           this.loginData.password.length >= 1;
  }

  // Validar formulario de registro (foto obligatoria)
  isRegisterValid(): boolean {
    return this.registerNombre.length >= 2 &&
           this.isValidEmail(this.registerEmail) &&
           this.registerPassword.length >= 6 &&
           this.registerPassword === this.confirmPassword &&
           this.selectedFile !== null; // Foto obligatoria
  }

  // Submit Login
  onLogin(): void {
    if (!this.isLoginValid()) {
      this.errorMessage = 'Por favor, complete todos los campos correctamente';
      return;
    }

    this.isLoading = true;
    this.clearMessages();

    this.authService.login(this.loginData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = `¡Bienvenido, ${response.user.nombre}!`;
        setTimeout(() => {
          // Redirigir a /student/plans si el rol es STUDENT
          const redirectPath = response.user.rol === 'STUDENT' ? '/student/plans' : this.returnUrl;
          this.router.navigate([redirectPath]);
        }, 1000);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.message || 'Error al iniciar sesión';
      }
    });
  }

  // Submit Registro
  onRegister(): void {
    // Validar foto obligatoria
    if (!this.selectedFile) {
      this.errorMessage = 'La foto de perfil es obligatoria';
      return;
    }

    if (!this.isRegisterValid()) {
      this.errorMessage = 'Por favor, complete todos los campos correctamente';
      return;
    }

    this.isLoading = true;
    this.clearMessages();

    // Registrar usuario con FormData (multipart/form-data)
    this.authService.register(
      this.registerNombre,
      this.registerEmail,
      this.registerPassword,
      this.selectedFile,
      this.registerIdRol
    ).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = `¡Registro exitoso! Bienvenido, ${response.user.nombre}`;
        setTimeout(() => {
          this.router.navigate([this.returnUrl]);
        }, 1500);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.message || 'Error al registrarse';
      }
    });
  }

  // Manejar Enter en formulario
  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      if (this.isLoginMode) {
        this.onLogin();
      } else {
        this.onRegister();
      }
    }
  }
}
