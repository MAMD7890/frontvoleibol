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

    // Verificar si el usuario tiene uno de los roles requeridos
    if (requiredRoles.includes(currentUser.rol)) {
      return true;
    }

    // Si no tiene el rol, redirigir al dashboard
    this.router.navigate(['/dashboard']);
    return false;
  }
}
