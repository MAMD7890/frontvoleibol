import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { AuthComponent } from './auth.component';
import { AuthService } from '../services/auth.service';

describe('AuthComponent', () => {
  let component: AuthComponent;
  let fixture: ComponentFixture<AuthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FormsModule,
        RouterTestingModule,
        HttpClientTestingModule
      ],
      declarations: [AuthComponent],
      providers: [AuthService]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start in login mode', () => {
    expect(component.isLoginMode).toBeTrue();
  });

  it('should toggle to register mode', () => {
    component.toggleMode();
    expect(component.isLoginMode).toBeFalse();
  });

  it('should validate email correctly', () => {
    expect(component.isValidEmail('test@example.com')).toBeTrue();
    expect(component.isValidEmail('invalid-email')).toBeFalse();
  });

  it('should validate login form', () => {
    component.loginData = { email: 'test@example.com', password: '123456' };
    expect(component.isLoginValid()).toBeTrue();

    component.loginData = { email: 'invalid', password: '123456' };
    expect(component.isLoginValid()).toBeFalse();
  });

  it('should validate register form', () => {
    component.registerNombre = 'Test User';
    component.registerEmail = 'test@example.com';
    component.registerPassword = '123456';
    component.confirmPassword = '123456';
    // Crear un archivo mock para la foto (obligatoria)
    component.selectedFile = new File(['test'], 'photo.jpg', { type: 'image/jpeg' });
    expect(component.isRegisterValid()).toBeTrue();
  });

  it('should fail register validation when passwords dont match', () => {
    component.registerNombre = 'Test User';
    component.registerEmail = 'test@example.com';
    component.registerPassword = '123456';
    component.confirmPassword = 'different';
    component.selectedFile = new File(['test'], 'photo.jpg', { type: 'image/jpeg' });
    expect(component.isRegisterValid()).toBeFalse();
  });

  it('should fail register validation when photo is missing', () => {
    component.registerNombre = 'Test User';
    component.registerEmail = 'test@example.com';
    component.registerPassword = '123456';
    component.confirmPassword = '123456';
    component.selectedFile = null;
    expect(component.isRegisterValid()).toBeFalse();
  });
});
