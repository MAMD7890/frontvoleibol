import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, Subject } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  UserInfo,
  RefreshTokenRequest,
  MessageResponse,
  FileInfo
} from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';
  private uploadUrl = 'http://localhost:8080/api/files';
  
  private currentUserSubject: BehaviorSubject<UserInfo | null>;
  public currentUser$: Observable<UserInfo | null>;
  
  private isAuthenticatedSubject: BehaviorSubject<boolean>;
  public isAuthenticated$: Observable<boolean>;

  // Subject para notificar cuando el token está por vencer
  private tokenExpiringSubject: Subject<number> = new Subject<number>();
  public tokenExpiring$: Observable<number> = this.tokenExpiringSubject.asObservable();

  // Timer para verificar expiración del token
  private tokenCheckInterval: any;
  private tokenExpirationTime: number = 0;
  private warningShown: boolean = false;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    const storedUser = this.getStoredUser();
    this.currentUserSubject = new BehaviorSubject<UserInfo | null>(storedUser);
    this.currentUser$ = this.currentUserSubject.asObservable();
    
    this.isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasValidToken());
    this.isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

    // Iniciar verificación de token si hay sesión activa
    if (this.hasValidToken()) {
      this.startTokenExpirationCheck();
    }
  }

  // Getters
  get currentUserValue(): UserInfo | null {
    return this.currentUserSubject.value;
  }

  get isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  // Login
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        this.handleAuthResponse(response);
      }),
      catchError(error => this.handleError(error))
    );
  }

  // Registro con multipart/form-data (foto obligatoria)
  register(nombre: string, email: string, password: string, foto: File, idRol?: number): Observable<AuthResponse> {
    const formData = new FormData();
    formData.append('nombre', nombre);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('foto', foto);
    
    if (idRol) {
      formData.append('idRol', idRol.toString());
    }

    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, formData).pipe(
      tap(response => {
        this.handleAuthResponse(response);
      }),
      catchError(error => this.handleError(error))
    );
  }

  // Actualizar foto de perfil (usuario autenticado)
  updateProfilePhoto(foto: File): Observable<UserInfo> {
    const formData = new FormData();
    formData.append('foto', foto);
    
    return this.http.post<UserInfo>(`${this.apiUrl}/update-photo`, formData).pipe(
      tap(user => {
        this.currentUserSubject.next(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
      }),
      catchError(error => this.handleError(error))
    );
  }

  // Refresh Token
  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No hay refresh token disponible'));
    }

    const request: RefreshTokenRequest = { refreshToken };
    return this.http.post<AuthResponse>(`${this.apiUrl}/refresh`, request).pipe(
      tap(response => {
        this.handleAuthResponse(response);
        this.warningShown = false;
      }),
      catchError(error => {
        this.performLogout();
        return this.handleError(error);
      })
    );
  }

  // Obtener usuario actual
  getCurrentUser(): Observable<UserInfo> {
    return this.http.get<UserInfo>(`${this.apiUrl}/me`).pipe(
      tap(user => {
        this.currentUserSubject.next(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
      }),
      catchError(error => this.handleError(error))
    );
  }

  // Logout - Ahora solo limpia la sesión, la confirmación se maneja en el componente
  logout(): void {
    this.performLogout();
  }

  // Logout interno
  private performLogout(): void {
    this.stopTokenExpirationCheck();
    // Llamar al endpoint de logout (opcional)
    this.http.post(`${this.apiUrl}/logout`, {}).subscribe();
    this.clearSession();
  }

  // Extender sesión (refresh token)
  extendSession(): void {
    this.refreshToken().subscribe({
      next: () => {
        this.warningShown = false;
      },
      error: () => {
        this.performLogout();
      }
    });
  }

  // Validar token
  validateToken(): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.apiUrl}/validate`, {}).pipe(
      catchError(error => this.handleError(error))
    );
  }

  // Iniciar verificación de expiración del token
  private startTokenExpirationCheck(): void {
    this.stopTokenExpirationCheck();
    this.warningShown = false;

    const expiresIn = localStorage.getItem('expiresIn');
    const loginTime = localStorage.getItem('loginTime');
    
    if (expiresIn) {
      // Calcular tiempo de expiración
      const expiresInMs = parseInt(expiresIn, 10);
      const loginTimeMs = loginTime ? parseInt(loginTime, 10) : Date.now();
      this.tokenExpirationTime = loginTimeMs + expiresInMs;

      // Verificar cada 30 segundos
      this.tokenCheckInterval = setInterval(() => {
        this.checkTokenExpiration();
      }, 30000);

      // Verificar inmediatamente
      this.checkTokenExpiration();
    }
  }

  // Detener verificación
  private stopTokenExpirationCheck(): void {
    if (this.tokenCheckInterval) {
      clearInterval(this.tokenCheckInterval);
      this.tokenCheckInterval = null;
    }
  }

  // Verificar expiración del token
  private checkTokenExpiration(): void {
    const now = Date.now();
    const timeLeft = this.tokenExpirationTime - now;
    
    // Mostrar advertencia 5 minutos antes de que expire (300000 ms)
    const warningTime = 5 * 60 * 1000;
    
    if (timeLeft <= 0) {
      // Token expirado
      this.performLogout();
    } else if (timeLeft <= warningTime && !this.warningShown) {
      // Token por expirar - emitir evento con minutos restantes
      const minutesLeft = Math.ceil(timeLeft / 60000);
      this.tokenExpiringSubject.next(minutesLeft);
      this.warningShown = true;
    }
  }

  // Obtener tiempo restante del token en minutos
  getTokenTimeRemaining(): number {
    const now = Date.now();
    const timeLeft = this.tokenExpirationTime - now;
    return Math.max(0, Math.ceil(timeLeft / 60000));
  }

  // Métodos privados
  private clearSession(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tokenType');
    localStorage.removeItem('expiresIn');
    localStorage.removeItem('loginTime');
    localStorage.removeItem('currentUser');
    
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/auth/login']);
  }

  private getStoredUser(): UserInfo | null {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  private hasValidToken(): boolean {
    const token = this.getAccessToken();
    return !!token;
  }

  // Métodos públicos para tokens
  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  getTokenType(): string {
    return localStorage.getItem('tokenType') || 'Bearer';
  }

  // Método público para manejar respuesta de autenticación (usado en registro de estudiantes)
  handleAuthResponse(response: AuthResponse): void {
    if (response && response.accessToken) {
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      localStorage.setItem('tokenType', response.tokenType);
      localStorage.setItem('expiresIn', response.expiresIn.toString());
      localStorage.setItem('loginTime', Date.now().toString());
      localStorage.setItem('currentUser', JSON.stringify(response.user));
      
      this.currentUserSubject.next(response.user);
      this.isAuthenticatedSubject.next(true);
      this.startTokenExpirationCheck();
    }
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'Ha ocurrido un error';
    
    console.error('Error completo:', error);
    
    if (error.error instanceof ErrorEvent) {
      // Error del cliente
      errorMessage = error.error.message;
    } else if (error.error?.message) {
      // Error del servidor con mensaje
      errorMessage = error.error.message;
    } else if (error.error?.error) {
      // Otro formato de error del servidor
      errorMessage = error.error.error;
    } else if (typeof error.error === 'string') {
      // Error como string
      errorMessage = error.error;
    } else if (error.status === 401) {
      errorMessage = 'Credenciales inválidas';
    } else if (error.status === 400) {
      // Para 400, intentar obtener más detalles
      if (error.error?.errors) {
        // Validaciones de Spring Boot
        const keys = Object.keys(error.error.errors);
        const errores = keys.map(k => error.error.errors[k]).join(', ');
        errorMessage = `Errores de validación: ${errores}`;
      } else {
        errorMessage = 'Datos inválidos. Verifica todos los campos.';
      }
    } else if (error.status === 0) {
      errorMessage = 'No se puede conectar con el servidor';
    }
    
    console.error('Mensaje de error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
