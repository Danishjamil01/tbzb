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

  mode = signal<AuthMode>('login');
  isDismissing = signal<boolean>(false);
  showPassword = signal<boolean>(false);

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
  }

  togglePasswordVisibility(): void {
    this.showPassword.update(v => !v);
  }

  async handleLogin(): Promise<void> {
    if (!this.loginMobile || this.loginMobile.length !== 10) {
      this.toastService.show('Please enter a valid 10-digit mobile number', 'warning');
      return;
    }
    if (!this.loginPassword) {
      this.toastService.show('Please enter your password', 'warning');
      return;
    }

    const res = await this.authService.login(this.loginMobile, this.loginPassword);
    if (res.success) {
      this.dismiss();
    } else {
      this.toastService.show(res.message, 'error');
    }
  }

  async handleRegister(): Promise<void> {
    if (!this.regName || this.regName.trim().length < 2) {
      this.toastService.show('Please enter your full name', 'warning');
      return;
    }
    if (!this.regMobile || this.regMobile.length !== 10) {
      this.toastService.show('Please enter a valid 10-digit mobile number', 'warning');
      return;
    }
    if (!this.regPassword || this.regPassword.length < 4) {
      this.toastService.show('Password must be at least 4 characters', 'warning');
      return;
    }

    const res = await this.authService.register(this.regName, this.regMobile, this.regPassword);
    if (res.success) {
      this.dismiss();
    } else {
      this.toastService.show(res.message, 'error');
    }
  }

  async handleResetPassword(): Promise<void> {
    if (!this.forgotMobile || this.forgotMobile.length !== 10) {
      this.toastService.show('Please enter a valid 10-digit mobile number', 'warning');
      return;
    }
    if (!this.forgotNewPassword || this.forgotNewPassword.length < 4) {
      this.toastService.show('New password must be at least 4 characters', 'warning');
      return;
    }

    const res = await this.authService.resetPassword(this.forgotMobile, this.forgotNewPassword);
    if (res.success) {
      this.dismiss();
    } else {
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

