import { Component, OnInit } from '@angular/core';

declare interface RouteInfo {
    path: string;
    title: string;
    icon: string;
    class: string;
}
export const ROUTES: RouteInfo[] = [
    { path: '/dashboard', title: 'Dashboard',  icon: 'design_app', class: '' },
    { path: '/students', title: 'Estudiantes',  icon:'education_hat', class: '' },
    { path: '/professors', title: 'Profesores',  icon:'business_badge', class: '' },
    { path: '/teams', title: 'Equipos',  icon:'sport_trophy', class: '' },
    { path: '/expenses', title: 'Gastos',  icon:'business_money-coins', class: '' },
    { path: '/professor-attendance', title: 'Asistencia Profes.',  icon:'ui-1_check', class: '' },
    { path: '/professor-payments', title: 'Pagos Profesores',  icon:'business_money-coins', class: '' },
    { path: '/student-attendance', title: 'Asistencia Estud.',  icon:'education_paper', class: '' },
    { path: '/student-attendance-report', title: 'Reporte Asist. Est.',  icon:'files_paper', class: '' },
    { path: '/settings', title: 'Configuración',  icon:'ui-2_settings-90', class: '' }
];

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  menuItems: any[];

  constructor() { }

  ngOnInit() {
    this.menuItems = ROUTES.filter(menuItem => menuItem);
  }

  isMobileMenu() {
      if ( window.innerWidth > 991) {
          return false;
      }
      return true;
  }
}
