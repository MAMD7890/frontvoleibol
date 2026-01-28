import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfessorAttendanceComponent } from './professor-attendance.component';

describe('ProfessorAttendanceComponent', () => {
  let component: ProfessorAttendanceComponent;
  let fixture: ComponentFixture<ProfessorAttendanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProfessorAttendanceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfessorAttendanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
