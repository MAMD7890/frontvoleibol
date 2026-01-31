import { NgModule } from '@angular/core';
import { CommonModule, } from '@angular/common';
import { BrowserModule  } from '@angular/platform-browser';
import { Routes, RouterModule } from '@angular/router';
import { PlanSelectComponent } from './plan-select/plan-select.component';
import { BillingComponent } from './billing/billing.component';

import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

const routes: Routes =[
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
  },
  // Rutas de estudiante
  { 
    path: 'student/plans', 
    component: PlanSelectComponent, 
    canActivate: [AuthGuard, RoleGuard], 
    data: { roles: ['STUDENT'] } 
  },
  { 
    path: 'student/billing', 
    component: BillingComponent, 
    canActivate: [AuthGuard, RoleGuard], 
    data: { roles: ['STUDENT'] } 
  },
  // Rutas de profesor y admin (comparten el layout pero el sidebar filtra por rol)
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN', 'USER', 'PROFESOR'] },
    children: [{
      path: '',
      loadChildren: () => import('./layouts/admin-layout/admin-layout.module').then(x=>x.AdminLayoutModule)
    }]
  },
  {
    path: '**',
    redirectTo: 'auth/login'
  }
];

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    RouterModule.forRoot(routes)
  ],
  exports: [
  ],
})
export class AppRoutingModule { }
