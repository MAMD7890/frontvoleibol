import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { WompiService, WompiConfig, WompiPaymentLinkRequest } from '../services/wompi.service';
import { AuthService } from '../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';

interface PlanOption {
  id: string;
  months: number;
  price: number;
  label?: string;
}

interface BillingData {
  tipoDocumento: string;
  documento: string;
  nombreCompleto: string;
  email: string;
  celular: string;
}

interface StudentProfile {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  tipoDocumento: string;
  numeroDocumento: string;
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

@Component({
  selector: 'app-plan-select',
  templateUrl: './plan-select.component.html',
  styleUrls: ['./plan-select.component.css']
})
export class PlanSelectComponent implements OnInit {
  @ViewChild('studentFileInput') studentFileInput: ElementRef;
  
  private apiUrl = 'http://localhost:8080/api';
  
  plans: PlanOption[] = [
    { id: 'plan-1', months: 1, price: 70000 },
    { id: 'plan-2', months: 2, price: 140000, label: 'Más popular' },
    { id: 'plan-3', months: 3, price: 210000 }
  ];

  currentUser = {
    nombre: 'Usuario',
    email: 'usuario@ejemplo.com',
    rol: 'Estudiante',
    id: 12345
  };

  // Estados de modales
  public showLogoutModal = false;
  public showPaymentModal = false;
  public showBillingForm = false;
  public showUserDropdown = false;
  public showProfileModal = false;
  public showPasswordModal = false;
  
  // Foto del estudiante
  public studentPhotoUrl: string | null = null;
  public photoPreview: string | null = null;
  public selectedStudentPhoto: File | null = null;
  public uploadingPhoto = false;
  
  // Perfil del estudiante
  public studentProfile: StudentProfile = {
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    tipoDocumento: '',
    numeroDocumento: ''
  };
  public updatingProfile = false;
  
  // Cambio de contraseña
  public passwordData: PasswordData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
  public changingPassword = false;
  public passwordError = '';
  public showCurrentPassword = false;
  public showNewPassword = false;
  public showConfirmPassword = false;
  
  public selectedPlan: PlanOption | null = null;
  public isProcessing = false;
  public paymentError = '';
  public wompiConfig: WompiConfig | null = null;

  // Datos de facturación
  public billingData: BillingData = {
    tipoDocumento: '',
    documento: '',
    nombreCompleto: '',
    email: '',
    celular: ''
  };

  public tiposDocumento = [
    { value: 'CC', label: 'Cédula de Ciudadanía' },
    { value: 'CE', label: 'Cédula de Extranjería' },
    { value: 'TI', label: 'Tarjeta de Identidad' },
    { value: 'PP', label: 'Pasaporte' }
  ];



  constructor(
    private router: Router,
    private wompiService: WompiService,
    private authService: AuthService,
    private http: HttpClient,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    // Cargar configuración de Wompi
    this.wompiService.getConfig().subscribe({
      next: (config) => {
        this.wompiConfig = config;
      },
      error: (err) => {
        console.error('Error cargando configuración de Wompi:', err);
      }
    });

    // Cargar datos del usuario desde localStorage si están disponibles
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        this.currentUser = {
          nombre: userData.nombre || userData.username || 'Usuario',
          email: userData.email || 'usuario@ejemplo.com',
          rol: userData.rol || 'Estudiante',
          id: userData.id || userData.idEstudiante || 12345
        };
        
        // Cargar foto si existe
        if (userData.fotoUrl) {
          this.studentPhotoUrl = 'http://localhost:8080' + userData.fotoUrl;
        }
        
        // Inicializar perfil del estudiante
        this.studentProfile = {
          nombre: userData.nombre || '',
          apellido: userData.apellido || '',
          email: userData.email || '',
          telefono: userData.telefono || '',
          tipoDocumento: userData.tipoDocumento || '',
          numeroDocumento: userData.numeroDocumento || ''
        };
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
    
    // También intentar desde currentUser del AuthService
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        const userData = user as any;
        this.currentUser = {
          nombre: userData.nombre || userData.username || 'Usuario',
          email: userData.email || 'usuario@ejemplo.com',
          rol: userData.rol || 'Estudiante',
          id: userData.id || 12345
        };
        
        if (userData.fotoUrl) {
          this.studentPhotoUrl = 'http://localhost:8080' + userData.fotoUrl;
        }
        
        this.studentProfile = {
          nombre: userData.nombre || '',
          apellido: userData.apellido || '',
          email: userData.email || '',
          telefono: userData.telefono || '',
          tipoDocumento: userData.tipoDocumento || '',
          numeroDocumento: userData.numeroDocumento || ''
        };
      }
    });
  }

  elegirPlan(plan: PlanOption): void {
    this.selectedPlan = plan;
    // Mostrar formulario de facturación en lugar de ir directo al pago
    this.showBillingForm = true;
    this.paymentError = '';
    
    // Pre-llenar datos del usuario si están disponibles
    if (this.currentUser) {
      this.billingData.nombreCompleto = this.currentUser.nombre || '';
      this.billingData.email = this.currentUser.email || '';
    }
  }

  selectPlan(plan: PlanOption): void {
    this.selectedPlan = plan;
  }

  showDetails(): void {
    // Mostrar formulario de facturación con detalles
    if (this.selectedPlan) {
      this.showBillingForm = true;
    }
  }

  cancelBillingForm(): void {
    this.showBillingForm = false;
  }

  isFormValid(): boolean {
    return !!(
      this.billingData.tipoDocumento &&
      this.billingData.documento &&
      this.billingData.nombreCompleto &&
      this.billingData.email &&
      this.billingData.celular
    );
  }

  proceedToPayment(): void {
    if (!this.isFormValid()) {
      this.paymentError = 'Por favor complete todos los campos obligatorios';
      return;
    }

    // Guardar datos de facturación
    localStorage.setItem('billingData', JSON.stringify(this.billingData));

    // Actualizar datos del usuario para el pago
    this.currentUser.nombre = this.billingData.nombreCompleto;
    this.currentUser.email = this.billingData.email;

    // Cerrar formulario y mostrar modal de pago
    this.showBillingForm = false;
    this.showPaymentModal = true;
  }

  cancelPayment(): void {
    this.showPaymentModal = false;
    this.paymentError = '';
  }

  /**
   * Procesa el pago usando el widget de Wompi
   */
  async processPaymentWithWidget(): Promise<void> {
    if (!this.selectedPlan || !this.wompiConfig) {
      this.paymentError = 'Configuración no disponible. Intente nuevamente.';
      return;
    }

    this.isProcessing = true;
    this.paymentError = '';

    try {
      // Generar el mes a pagar basado en la fecha actual
      const now = new Date();
      const month = now.getMonth() + 1;
      const mesPagado = `${now.getFullYear()}-${month < 10 ? '0' + month : month}`;

      // Generar referencia única
      const refResponse = await this.wompiService.generateReference(
        this.currentUser.id,
        mesPagado
      ).toPromise();

      if (!refResponse) {
        throw new Error('No se pudo generar la referencia de pago');
      }

      const reference = refResponse.reference;
      const amountInCents = this.selectedPlan.price * 100;

      // Generar firma de integridad
      const signatureResponse = await this.wompiService.generateIntegritySignature(
        this.selectedPlan.price,
        reference,
        'COP'
      ).toPromise();

      if (!signatureResponse) {
        throw new Error('No se pudo generar la firma de integridad');
      }

      // Abrir el widget de Wompi
      const redirectUrl = `${window.location.origin}/student/payment-result`;

      const transaction = await this.wompiService.openCheckout({
        publicKey: this.wompiConfig.publicKey,
        currency: 'COP',
        amountInCents: amountInCents,
        reference: reference,
        signature: signatureResponse.signature,
        redirectUrl: redirectUrl,
        customerEmail: this.currentUser.email,
        customerFullName: this.currentUser.nombre
      });

      // Procesar resultado de la transacción
      if (transaction.status === 'APPROVED') {
        this.showPaymentModal = false;
        // Guardar info del pago y redirigir
        localStorage.setItem('lastPayment', JSON.stringify({
          transactionId: transaction.id,
          plan: this.selectedPlan,
          status: transaction.status
        }));
        this.router.navigate(['/student/payment-success']);
      } else {
        this.paymentError = `Estado del pago: ${transaction.status}. ${transaction.statusMessage || ''}`;
      }

    } catch (error: any) {
      console.error('Error en el proceso de pago:', error);
      this.paymentError = error.message || 'Error procesando el pago. Intente nuevamente.';
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Procesa el pago usando un link de pago (redirección)
   */
  async processPaymentWithLink(): Promise<void> {
    if (!this.selectedPlan) {
      this.paymentError = 'Por favor seleccione un plan';
      return;
    }

    this.isProcessing = true;
    this.paymentError = '';

    try {
      const now = new Date();
      const month = now.getMonth() + 1;
      const mesPagado = `${now.getFullYear()}-${month < 10 ? '0' + month : month}`;

      const request: WompiPaymentLinkRequest = {
        idEstudiante: this.currentUser.id,
        amount: this.selectedPlan.price,
        currency: 'COP',
        name: `Plan ${this.selectedPlan.months} mes${this.selectedPlan.months > 1 ? 'es' : ''} - Galácticos`,
        description: `Pago de inscripción por ${this.selectedPlan.months} mes${this.selectedPlan.months > 1 ? 'es' : ''} de entrenamiento`,
        customerEmail: this.currentUser.email,
        customerName: this.currentUser.nombre,
        redirectUrl: `${window.location.origin}/student/payment-result`,
        mesPagado: mesPagado,
        singleUse: true,
        collectShipping: false
      };

      const response = await this.wompiService.createPaymentLink(request).toPromise();

      if (response && response.success && response.paymentLinkUrl) {
        // Guardar referencia del pago
        localStorage.setItem('pendingPayment', JSON.stringify({
          reference: response.reference,
          plan: this.selectedPlan,
          linkId: response.id
        }));
        
        // Redirigir al link de pago de Wompi
        window.location.href = response.paymentLinkUrl;
      } else {
        this.paymentError = response?.message || 'Error creando el link de pago';
      }

    } catch (error: any) {
      console.error('Error creando link de pago:', error);
      this.paymentError = error.message || 'Error creando el link de pago. Intente nuevamente.';
    } finally {
      this.isProcessing = false;
    }
  }

  getFeatures(plan: PlanOption): string[] {
    return [
      `${plan.months} mes${plan.months > 1 ? 'es' : ''} de clases`,
      'Acceso completo a entrenamientos'
    ];
  }

  getUserPhotoUrl(): string | null {
    return null;
  }

  getUserInitials(): string {
    return this.currentUser.nombre
      .split(' ')
      .map((n) => n[0])
      .join('');
  }

  confirmLogout(): void {
    this.showLogoutModal = true;
    this.closeDropdowns();
  }

  cancelLogout(): void {
    this.showLogoutModal = false;
  }

  logout(): void {
    this.showLogoutModal = false;
    
    // Usar el AuthService para cerrar sesión correctamente
    this.authService.logout();
    
    // Limpiar el historial del navegador para evitar volver con botón atrás
    if (window.history && window.history.pushState) {
      window.history.pushState(null, '', window.location.href);
      window.history.pushState(null, '', window.location.href);
      window.history.go(-2);
    }
  }

  // ========== DROPDOWN DE USUARIO ==========
  toggleUserDropdown(event: Event): void {
    event.stopPropagation();
    this.showUserDropdown = !this.showUserDropdown;
  }

  closeDropdowns(): void {
    this.showUserDropdown = false;
  }

  // ========== MODAL DE PERFIL ==========
  openProfileModal(): void {
    this.showProfileModal = true;
    this.closeDropdowns();
  }

  closeProfileModal(): void {
    this.showProfileModal = false;
    this.photoPreview = null;
    this.selectedStudentPhoto = null;
  }

  triggerFileInput(): void {
    if (this.studentFileInput) {
      this.studentFileInput.nativeElement.click();
    }
  }

  onStudentPhotoSelected(event: Event): void {
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
      
      this.selectedStudentPhoto = file;
      
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.photoPreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  cancelPhotoSelection(): void {
    this.photoPreview = null;
    this.selectedStudentPhoto = null;
    if (this.studentFileInput) {
      this.studentFileInput.nativeElement.value = '';
    }
  }

  uploadStudentPhoto(): void {
    if (!this.selectedStudentPhoto) {
      this.toastr.warning('Selecciona una foto primero', 'Aviso');
      return;
    }
    
    this.uploadingPhoto = true;
    
    // Usar el servicio de auth para actualizar la foto
    this.authService.updateProfilePhoto(this.selectedStudentPhoto).subscribe(
      (response) => {
        this.uploadingPhoto = false;
        this.toastr.success('Foto actualizada correctamente', 'Éxito');
        this.selectedStudentPhoto = null;
        if (response.fotoUrl) {
          this.studentPhotoUrl = 'http://localhost:8080' + response.fotoUrl;
          this.photoPreview = null;
        }
        // Actualizar localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          userData.fotoUrl = response.fotoUrl;
          localStorage.setItem('user', JSON.stringify(userData));
        }
      },
      (error) => {
        this.uploadingPhoto = false;
        console.error('Error al subir foto:', error);
        const mensaje = error.error?.message || 'Error al actualizar la foto';
        this.toastr.error(mensaje, 'Error');
      }
    );
  }

  updateStudentProfile(): void {
    this.updatingProfile = true;
    
    const payload = {
      nombre: this.studentProfile.nombre,
      apellido: this.studentProfile.apellido,
      email: this.studentProfile.email,
      telefono: this.studentProfile.telefono,
      tipoDocumento: this.studentProfile.tipoDocumento,
      numeroDocumento: this.studentProfile.numeroDocumento
    };
    
    this.http.put(`${this.apiUrl}/auth/update-profile`, payload).subscribe(
      (response: any) => {
        this.updatingProfile = false;
        this.toastr.success('Perfil actualizado correctamente', 'Éxito');
        
        // Actualizar currentUser
        this.currentUser.nombre = this.studentProfile.nombre + ' ' + (this.studentProfile.apellido || '');
        this.currentUser.email = this.studentProfile.email;
        
        // Actualizar localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          Object.assign(userData, this.studentProfile);
          localStorage.setItem('user', JSON.stringify(userData));
        }
        
        this.closeProfileModal();
      },
      (error) => {
        this.updatingProfile = false;
        console.error('Error al actualizar perfil:', error);
        const mensaje = error.error?.message || 'Error al actualizar el perfil';
        this.toastr.error(mensaje, 'Error');
      }
    );
  }

  // ========== MODAL DE CONTRASEÑA ==========
  openPasswordModal(): void {
    this.showPasswordModal = true;
    this.closeDropdowns();
    this.passwordData = { currentPassword: '', newPassword: '', confirmPassword: '' };
    this.passwordError = '';
  }

  closePasswordModal(): void {
    this.showPasswordModal = false;
    this.passwordData = { currentPassword: '', newPassword: '', confirmPassword: '' };
    this.passwordError = '';
  }

  changeStudentPassword(): void {
    // Validaciones
    if (!this.passwordData.currentPassword || !this.passwordData.newPassword || !this.passwordData.confirmPassword) {
      this.passwordError = 'Todos los campos son obligatorios';
      return;
    }
    
    if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
      this.passwordError = 'Las contraseñas nuevas no coinciden';
      return;
    }
    
    if (this.passwordData.newPassword.length < 6) {
      this.passwordError = 'La contraseña debe tener al menos 6 caracteres';
      return;
    }
    
    this.changingPassword = true;
    this.passwordError = '';
    
    this.http.post(`${this.apiUrl}/auth/change-password`, {
      currentPassword: this.passwordData.currentPassword,
      newPassword: this.passwordData.newPassword
    }).subscribe(
      () => {
        this.changingPassword = false;
        this.toastr.success('Contraseña cambiada correctamente', 'Éxito');
        this.closePasswordModal();
      },
      (error) => {
        this.changingPassword = false;
        console.error('Error al cambiar contraseña:', error);
        this.passwordError = error.error?.message || 'Error al cambiar la contraseña';
      }
    );
  }
}
