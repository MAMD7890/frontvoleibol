import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

interface PlanOption {
  id: string;
  months: number;
  price: number;
  label?: string;
}

@Component({
  selector: 'app-billing',
  templateUrl: './billing.component.html',
  styleUrls: ['./billing.component.css']
})
export class BillingComponent implements OnInit {
  selectedPlan: PlanOption | null = null;

  nombre = '';
  apellido = '';
  correo = '';
  documento = '';
  direccion = '';
  telefono = '';

  public showLogoutModal = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    const raw = localStorage.getItem('student.selectedPlan');
    this.selectedPlan = raw ? JSON.parse(raw) : null;
  }

  continuar(): void {
    const payload = {
      plan: this.selectedPlan,
      billing: {
        nombre: this.nombre,
        apellido: this.apellido,
        correo: this.correo,
        documento: this.documento,
        direccion: this.direccion,
        telefono: this.telefono,
      }
    };
    console.log('Continuar al pago (placeholder):', payload);
    alert('Datos listos para pago (placeholder).');
  }

  goBack(): void {
    this.router.navigate(['/student/plan-select']); // Redirects to the plan selection page
  }

  cancelLogout(): void {
    this.showLogoutModal = false;
  }

  logout(): void {
    this.showLogoutModal = false;
    localStorage.clear();
    this.router.navigate(['/auth/login']);
  }

  confirmLogout(): void {
    this.showLogoutModal = true;
  }
}
