import { Component, inject, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';

export type AuthMode = 'login' | 'register' | 'forgot';

@Component({
  selector: 'app-auth-screen',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './auth-screen.component.html',
  styleUrl: './auth-screen.component.scss'
})
export class AuthScreenComponent {
  authService = inject(AuthService);
  private toastService = inject(ToastService);

  @Output() authFinished = new EventEmitter<void>();

  // Default to 'register' (Create Account) for new users right after splash screen
  mode = signal<AuthMode>('register');
  isDismissing = signal<boolean>(false);
  showPassword = signal<boolean>(false);

  // In-form error message state
  loginErrorMessage = signal<string | null>(null);
  isAccountNotFound = signal<boolean>(false);
  registerErrorMessage = signal<string | null>(null);
  isAlreadyRegistered = signal<boolean>(false);
  forgotErrorMessage = signal<string | null>(null);

  // Form Fields
  loginMobile: string = '';
  loginPassword: string = '';

  regName: string = '';
  regMobile: string = '';
  regPassword: string = '';

  forgotMobile: string = '';
  forgotNewPassword: string = '';

  switchMode(newMode: AuthMode): void {
    this.mode.set(newMode);
    this.showPassword.set(false);
    this.loginErrorMessage.set(null);
    this.isAccountNotFound.set(false);
    this.registerErrorMessage.set(null);
    this.isAlreadyRegistered.set(false);
    this.forgotErrorMessage.set(null);
  }

  switchToRegisterWithMobile(): void {
    this.regMobile = this.loginMobile;
    this.loginErrorMessage.set(null);
    this.isAccountNotFound.set(false);
    this.registerErrorMessage.set(null);
    this.isAlreadyRegistered.set(false);
    this.mode.set('register');
  }

  switchToLoginWithMobile(): void {
    this.loginMobile = this.regMobile;
    this.registerErrorMessage.set(null);
    this.isAlreadyRegistered.set(false);
    this.loginErrorMessage.set(null);
    this.isAccountNotFound.set(false);
    this.mode.set('login');
  }

  togglePasswordVisibility(): void {
    this.showPassword.update(v => !v);
  }

  async handleLogin(): Promise<void> {
    this.loginErrorMessage.set(null);
    this.isAccountNotFound.set(false);

    const cleanLoginMobile = (this.loginMobile || '').replace(/\D/g, '').slice(-10);
    if (!cleanLoginMobile || cleanLoginMobile.length !== 10) {
      this.loginErrorMessage.set('Kripya apna 10-digit mobile number enter karein.');
      this.toastService.show('Please enter a valid 10-digit mobile number', 'warning');
      return;
    }
    if (!this.loginPassword) {
      this.loginErrorMessage.set('Kripya apna password enter karein.');
      this.toastService.show('Please enter your password', 'warning');
      return;
    }

    const res = await this.authService.login(cleanLoginMobile, this.loginPassword);
    if (res.success) {
      this.dismiss();
    } else {
      this.loginErrorMessage.set(res.message);
      if (res.message.includes('nahi mila')) {
        this.isAccountNotFound.set(true);
      }
      this.toastService.show(res.message, 'error');
    }
  }

  async handleRegister(): Promise<void> {
    this.registerErrorMessage.set(null);
    this.isAlreadyRegistered.set(false);

    if (!this.regName || this.regName.trim().length < 2) {
      const msg = 'Please enter your full name (min 2 characters).';
      this.registerErrorMessage.set(msg);
      this.toastService.show(msg, 'warning');
      return;
    }

    const cleanRegMobile = (this.regMobile || '').replace(/\D/g, '').slice(-10);
    if (!cleanRegMobile || cleanRegMobile.length !== 10) {
      const msg = 'Please enter a valid 10-digit mobile number.';
      this.registerErrorMessage.set(msg);
      this.toastService.show(msg, 'warning');
      return;
    }

    if (!this.regPassword || this.regPassword.length < 4) {
      const msg = 'Password must be at least 4 characters long.';
      this.registerErrorMessage.set(msg);
      this.toastService.show(msg, 'warning');
      return;
    }

    const res = await this.authService.register(this.regName, cleanRegMobile, this.regPassword);
    if (res.success) {
      this.dismiss();
    } else {
      this.registerErrorMessage.set(res.message);
      if (res.alreadyRegistered || res.message.toLowerCase().includes('already registered')) {
        this.isAlreadyRegistered.set(true);
      }
      this.toastService.show(res.message, 'error');
    }
  }

  async handleResetPassword(): Promise<void> {
    this.forgotErrorMessage.set(null);

    const cleanForgotMobile = (this.forgotMobile || '').replace(/\D/g, '').slice(-10);
    if (!cleanForgotMobile || cleanForgotMobile.length !== 10) {
      const msg = 'Please enter a valid 10-digit mobile number.';
      this.forgotErrorMessage.set(msg);
      this.toastService.show(msg, 'warning');
      return;
    }
    if (!this.forgotNewPassword || this.forgotNewPassword.length < 4) {
      const msg = 'New password must be at least 4 characters long.';
      this.forgotErrorMessage.set(msg);
      this.toastService.show(msg, 'warning');
      return;
    }

    const res = await this.authService.resetPassword(cleanForgotMobile, this.forgotNewPassword);
    if (res.success) {
      this.dismiss();
    } else {
      this.forgotErrorMessage.set(res.message);
      this.toastService.show(res.message, 'error');
    }
  }

  onSkip(): void {
    this.dismiss();
  }

  private dismiss(): void {
    this.isDismissing.set(true);
    setTimeout(() => {
      this.authFinished.emit();
    }, 320);
  }
}

