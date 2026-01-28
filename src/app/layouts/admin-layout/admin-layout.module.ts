import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AdminLayoutRoutes } from './admin-layout.routing';
import { DashboardComponent } from '../../dashboard/dashboard.component';
import { UserProfileComponent } from '../../user-profile/user-profile.component';
import { TableListComponent } from '../../table-list/table-list.component';
import { TypographyComponent } from '../../typography/typography.component';
import { IconsComponent } from '../../icons/icons.component';
import { MapsComponent } from '../../maps/maps.component';
import { NotificationsComponent } from '../../notifications/notifications.component';
import { ChartsModule } from 'ng2-charts';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastrModule } from 'ngx-toastr';
import { UpgradeComponent } from '../../upgrade/upgrade.component';
import { StudentsComponent } from '../../students/students.component';
import { ProfessorsComponent } from '../../professors/professors.component';
import { TeamsComponent } from '../../teams/teams.component';
import { SettingsComponent } from '../../settings/settings.component';
import { ExpensesComponent } from '../../expenses/expenses.component';
import { ProfessorAttendanceComponent } from '../../professor-attendance/professor-attendance.component';
import { ProfessorPaymentsComponent } from '../../professor-payments/professor-payments.component';
import { StudentAttendanceComponent } from '../../student-attendance/student-attendance.component';
import { StudentAttendanceReportComponent } from '../../student-attendance-report/student-attendance-report.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(AdminLayoutRoutes),
    FormsModule,
    ReactiveFormsModule,
    ChartsModule,
    NgbModule,
    ToastrModule.forRoot()
  ],
  declarations: [
    DashboardComponent,
    UserProfileComponent,
    TableListComponent,
    StudentsComponent,
    ProfessorsComponent,
    TeamsComponent,
    SettingsComponent,
    ExpensesComponent,
    ProfessorAttendanceComponent,
    ProfessorPaymentsComponent,
    StudentAttendanceComponent,
    StudentAttendanceReportComponent,
    UpgradeComponent,
    TypographyComponent,
    IconsComponent,
    MapsComponent,
    NotificationsComponent,
  ]
})

export class AdminLayoutModule {}
