import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfessorPaymentsComponent } from './professor-payments.component';

describe('ProfessorPaymentsComponent', () => {
  let component: ProfessorPaymentsComponent;
  let fixture: ComponentFixture<ProfessorPaymentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProfessorPaymentsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfessorPaymentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
