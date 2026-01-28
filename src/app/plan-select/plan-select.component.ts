import { Component } from '@angular/core';
import { Router } from '@angular/router';

interface PlanOption {
  id: string;
  months: number;
  price: number;
  label?: string;
}

@Component({
  selector: 'app-plan-select',
  templateUrl: './plan-select.component.html',
  styleUrls: ['./plan-select.component.css']
})
export class PlanSelectComponent {
  plans: PlanOption[] = [
    { id: 'plan-1', months: 1, price: 70000 },
    { id: 'plan-2', months: 2, price: 140000, label: 'Más popular' },
    { id: 'plan-3', months: 3, price: 210000 }
  ];

  currentUser = {
    nombre: 'Usuario',
    email: 'usuario@ejemplo.com',
    rol: 'Estudiante',
    id: '12345'
  };

  public showLogoutModal = false;

  constructor(private router: Router) {}

  elegirPlan(plan: PlanOption): void {
    localStorage.setItem('student.selectedPlan', JSON.stringify(plan));
    this.router.navigate(['/student/billing']);
  }

  getFeatures(plan: PlanOption): string[] {
    switch (plan.months) {
      case 1:
        return ['Acceso', '1 mes', 'Clases'];
      case 2:
        return ['Acceso', '2 meses', 'Ahorro'];
      case 3:
        return ['Acceso', '3 meses', 'Máximo ahorro'];
      default:
        return ['Acceso'];
    }
  }

  getUserPhotoUrl(): string | null {
    // Retorna la URL de la foto del usuario o null si no tiene una
    return null; // Cambiar por la lógica real si es necesario
  }

  getUserInitials(): string {
    // Retorna las iniciales del usuario
    return this.currentUser.nombre
      .split(' ')
      .map((n) => n[0])
      .join('');
  }

  confirmLogout(): void {
    this.showLogoutModal = true;
  }

  cancelLogout(): void {
    this.showLogoutModal = false;
  }

  logout(): void {
    this.showLogoutModal = false;
    localStorage.clear();
    this.router.navigate(['/auth/login']);
  }
}
