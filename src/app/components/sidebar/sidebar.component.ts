import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';

declare interface RouteInfo {
    path: string;
    title: string;
    icon: string;
    class: string;
    roles?: string[]; // Roles que pueden ver esta ruta
}

// Rutas con permisos por rol
export const ROUTES: RouteInfo[] = [
    { path: '/dashboard', title: 'Dashboard',  icon: 'design_app', class: '', roles: ['ADMIN', 'USER'] },
    { path: '/students', title: 'Estudiantes',  icon:'education_hat', class: '', roles: ['ADMIN', 'USER', 'PROFESOR'] },
    { path: '/professors', title: 'Profesores',  icon:'business_badge', class: '', roles: ['ADMIN', 'USER'] },
    { path: '/teams', title: 'Equipos',  icon:'sport_trophy', class: '', roles: ['ADMIN', 'USER'] },
    { path: '/expenses', title: 'Gastos',  icon:'business_money-coins', class: '', roles: ['ADMIN', 'USER'] },
    { path: '/professor-attendance', title: 'Asistencia Profes.',  icon:'ui-1_check', class: '', roles: ['ADMIN', 'USER'] },
    { path: '/professor-payments', title: 'Pagos Profesores',  icon:'business_money-coins', class: '', roles: ['ADMIN', 'USER'] },
    { path: '/student-attendance', title: 'Asistencia Estud.',  icon:'education_paper', class: '', roles: ['ADMIN', 'USER', 'PROFESOR'] },
    { path: '/student-attendance-report', title: 'Reporte Asist. Est.',  icon:'files_paper', class: '', roles: ['ADMIN', 'USER', 'PROFESOR'] },
    { path: '/settings', title: 'Configuración',  icon:'ui-2_settings-90', class: '', roles: ['ADMIN', 'USER'] }
];

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  menuItems: RouteInfo[];

  constructor(private authService: AuthService) { }

  ngOnInit() {
    this.filterMenuByRole();
  }

  filterMenuByRole(): void {
    const currentUser = this.authService.currentUserValue;
    const userRole = this.normalizeRole(currentUser?.rol || '');
    
    this.menuItems = ROUTES.filter(menuItem => {
      // Si no tiene roles definidos, mostrar a todos
      if (!menuItem.roles || menuItem.roles.length === 0) {
        return true;
      }
      // Verificar si el rol del usuario está en la lista de roles permitidos
      return menuItem.roles.some(role => this.normalizeRole(role) === userRole);
    });
  }

  private normalizeRole(rol: string): string {
    if (!rol) return '';
    return rol.toUpperCase().replace('ROLE_', '');
  }

  isMobileMenu() {
      if ( window.innerWidth > 991) {
          return false;
      }
      return true;
  }
}
