import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ArrowLeft, LucideAngularModule, UserPlus } from 'lucide-angular';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'bm-register-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LucideAngularModule],
  template: `
    <div class="bm-auth-screen">
      <div class="bm-auth-top">
        <a routerLink="/auth/login" class="bm-back-btn">
          <lucide-icon [img]="ArrowLeftIcon" [size]="20"></lucide-icon>
        </a>
      </div>

      <div class="bm-auth-hero">
        <h1 class="bm-auth-title">Join BuyMass Kerala</h1>
        <p class="bm-auth-desc">Unlock collective group-buying discounts at local stores near you.</p>
      </div>

      <div class="bm-card bm-auth-card">
        <form (ngSubmit)="submitRegister()" class="bm-auth-form">
          <div class="bm-field">
            <label class="bm-label">Full Name</label>
            <input
              type="text"
              class="bm-input"
              [(ngModel)]="name"
              name="name"
              placeholder="e.g. Rahul Nair"
              required
            />
          </div>

          <div class="bm-field">
            <label class="bm-label">WhatsApp Mobile Number</label>
            <input
              type="tel"
              class="bm-input"
              [(ngModel)]="phone"
              name="phone"
              placeholder="e.g. 919876543210"
              required
            />
            <span class="bm-field-hint">Used for 6-digit store pickup OTP codes</span>
          </div>

          <div class="bm-field">
            <label class="bm-label">Email Address</label>
            <input
              type="email"
              class="bm-input"
              [(ngModel)]="email"
              name="email"
              placeholder="name@example.com"
              required
            />
          </div>

          <div class="bm-field">
            <label class="bm-label">Password</label>
            <input
              type="password"
              class="bm-input"
              [(ngModel)]="password"
              name="password"
              placeholder="Min 8 characters with numbers"
              required
            />
          </div>

          @if (errorMessage()) {
            <div class="bm-error-alert">{{ errorMessage() }}</div>
          }

          <button
            type="submit"
            class="bm-btn-submit"
            [disabled]="isLoading() || !name.trim() || !phone.trim() || !email.trim() || !password.trim()"
          >
            <lucide-icon [img]="UserPlusIcon" [size]="18"></lucide-icon>
            <span>{{ isLoading() ? 'Creating Account...' : 'Create Account' }}</span>
          </button>
        </form>

        <div class="bm-auth-footer">
          <span>Already registered?</span>
          <a routerLink="/auth/login" class="bm-switch-link">Sign In</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .bm-auth-screen {
      padding: 16px 16px 36px;
      max-width: var(--bm-max-mobile-width);
      margin: 0 auto;
      width: 100%;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .bm-auth-top {
      margin-bottom: 20px;
    }

    .bm-back-btn {
      color: var(--bm-color-text-primary);
      display: inline-flex;
    }

    .bm-auth-hero {
      text-align: center;
      margin-bottom: 24px;
    }

    .bm-auth-title {
      font-size: 20px;
      font-weight: 800;
      color: var(--bm-color-text-primary);
      margin-bottom: 6px;
    }

    .bm-auth-desc {
      font-size: 13px;
      color: var(--bm-color-text-secondary);
      max-width: 280px;
      margin: 0 auto;
      line-height: 1.4;
    }

    .bm-card {
      background-color: var(--bm-color-surface);
      border: 1px solid var(--bm-color-border);
      border-radius: var(--bm-radius-lg);
      padding: 20px 16px;
      box-shadow: var(--bm-shadow-xs);
    }

    .bm-auth-form {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .bm-field {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .bm-label {
      font-size: 12px;
      font-weight: 600;
      color: var(--bm-color-text-secondary);
    }

    .bm-input {
      height: 44px;
      border: 1px solid var(--bm-color-border);
      border-radius: var(--bm-radius-md);
      background-color: var(--bm-color-surface-subtle);
      padding: 0 12px;
      font-size: 14px;
      outline: none;

      &:focus {
        border-color: var(--bm-color-primary);
        background-color: var(--bm-color-surface);
      }
    }

    .bm-field-hint {
      font-size: 11px;
      color: var(--bm-color-text-muted);
    }

    .bm-error-alert {
      padding: 8px 12px;
      background-color: var(--bm-color-danger-bg);
      color: var(--bm-color-danger);
      border: 1px solid var(--bm-color-danger-border);
      border-radius: var(--bm-radius-md);
      font-size: 12px;
    }

    .bm-btn-submit {
      height: 44px;
      background-color: var(--bm-color-primary);
      color: #fff;
      font-size: 14px;
      font-weight: 600;
      border-radius: var(--bm-radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      margin-top: 6px;

      &:disabled {
        opacity: 0.6;
      }
    }

    .bm-auth-footer {
      display: flex;
      justify-content: center;
      gap: 6px;
      margin-top: 16px;
      font-size: 13px;
      color: var(--bm-color-text-secondary);
    }

    .bm-switch-link {
      color: var(--bm-color-primary);
      font-weight: 600;
    }
  `],
})
export class RegisterPageComponent {
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  readonly ArrowLeftIcon = ArrowLeft;
  readonly UserPlusIcon = UserPlus;

  name = '';
  phone = '';
  email = '';
  password = '';

  readonly isLoading = this.auth.isLoading;
  readonly errorMessage = signal<string | null>(null);

  submitRegister(): void {
    if (!this.name.trim() || !this.phone.trim() || !this.email.trim() || !this.password.trim()) {
      return;
    }

    this.errorMessage.set(null);
    this.auth
      .register({
        name: this.name.trim(),
        phone: this.phone.trim(),
        email: this.email.trim(),
        password: this.password.trim(),
      })
      .subscribe({
        next: () => {
          this.toast.success('Registration initiated. Please verify your phone number.');
          this.router.navigate(['/auth/verify-phone']);
        },
        error: (err) => {
          this.errorMessage.set(err.message || 'Registration failed. Please check your information.');
        },
      });
  }
}
