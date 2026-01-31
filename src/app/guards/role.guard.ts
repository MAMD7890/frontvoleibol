import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const currentUser = this.authService.currentUserValue;
    
    // Si no está autenticado, redirigir al login
    if (!this.authService.isAuthenticated || !currentUser) {
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: state.url }
      });
      return false;
    }

    // Obtener roles requeridos de la ruta
    const requiredRoles = route.data['roles'] as string[];
    
    // Si no hay roles requeridos, permitir
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Normalizar el rol del usuario (quitar prefijo ROLE_ si existe)
    const userRole = this.normalizeRole(currentUser.rol);

    // Verificar si el usuario tiene uno de los roles requeridos
    const hasRole = requiredRoles.some(role => 
      this.normalizeRole(role) === userRole
    );

    if (hasRole) {
      return true;
    }

    // Si no tiene el rol, redirigir según su rol actual
    console.log('Usuario sin permisos. Rol:', userRole, 'Requerido:', requiredRoles);
    this.redirectBasedOnRole(userRole);
    return false;
  }

  private normalizeRole(rol: string): string {
    if (!rol) return '';
    // Convertir a mayúsculas y quitar prefijo ROLE_ si existe
    const upperRole = rol.toUpperCase();
    return upperRole.replace('ROLE_', '');
  }

  private redirectBasedOnRole(rol: string): void {
    switch (rol) {
      case 'STUDENT':
        this.router.navigate(['/student/plans']);
        break;
      case 'PROFESOR':
        this.router.navigate(['/student-attendance-report']);
        break;
      case 'ADMIN':
      case 'USER':
        this.router.navigate(['/dashboard']);
        break;
      default:
        this.router.navigate(['/auth/login']);
    }
  }
}
