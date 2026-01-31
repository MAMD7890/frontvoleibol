import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    if (this.authService.isAuthenticated) {
      return true;
    }

    // Limpiar el historial del navegador para evitar acceso con botón atrás
    this.clearBrowserHistory();

    // Redirigir al login si no está autenticado
    this.router.navigate(['/auth/login'], {
      queryParams: { returnUrl: state.url }
    });
    return false;
  }

  private clearBrowserHistory(): void {
    // Reemplazar el estado del historial para evitar volver atrás
    if (typeof window !== 'undefined' && window.history) {
      window.history.pushState(null, '', window.location.href);
    }
  }
}
