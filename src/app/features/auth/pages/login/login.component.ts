import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ArrowLeft, Lock, LogIn, LucideAngularModule, Phone, ShieldCheck } from 'lucide-angular';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import { TranslationService } from '../../../../core/services/translation.service';

@Component({
  selector: 'bm-login-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LucideAngularModule],
  template: `
    <div class="bm-auth-screen">
      <div class="bm-auth-top">
        <a routerLink="/home" class="bm-back-btn" aria-label="Back">
          <lucide-icon [img]="ArrowLeftIcon" [size]="20"></lucide-icon>
        </a>
      </div>

      <div class="bm-auth-hero">
        <div class="bm-logo-badge">BM</div>
        <h1 class="bm-auth-title">Welcome Back to BuyMass</h1>
        <p class="bm-auth-desc">Sign in with your email or phone to access your carts and group deals.</p>
      </div>

      <div class="bm-card bm-auth-card">
        <form (ngSubmit)="submitLogin()" class="bm-auth-form">
          <div class="bm-field">
            <label class="bm-label">Email or Phone Number</label>
            <input
              type="text"
              class="bm-input"
              [(ngModel)]="identifier"
              name="identifier"
              placeholder="e.g. 919876543210 or name@example.com"
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
              placeholder="Enter your password"
              required
            />
          </div>

          @if (errorMessage()) {
            <div class="bm-error-alert">{{ errorMessage() }}</div>
          }

          <button
            type="submit"
            class="bm-btn-submit"
            [disabled]="isLoading() || !identifier.trim() || !password.trim()"
          >
            <lucide-icon [img]="LogInIcon" [size]="18"></lucide-icon>
            <span>{{ isLoading() ? 'Signing in...' : 'Sign In' }}</span>
          </button>
        </form>

        <div class="bm-auth-footer">
          <span>Don't have an account?</span>
          <a routerLink="/auth/register" class="bm-switch-link">Create Account</a>
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

    .bm-logo-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      background-color: var(--bm-color-primary);
      color: #fff;
      font-weight: 800;
      font-size: 16px;
      border-radius: var(--bm-radius-md);
      margin-bottom: 12px;
    }

    .bm-auth-title {
      font-size: 20px;
      font-weight: 800;
      color: var(--bm-color-text-primary);
      letter-spacing: -0.4px;
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
      gap: 14px;
    }

    .bm-field {
      display: flex;
      flex-direction: column;
      gap: 5px;
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
      transition: background-color 0.15s ease;

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
export class LoginPageComponent {
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  readonly ArrowLeftIcon = ArrowLeft;
  readonly LogInIcon = LogIn;

  identifier = '';
  password = '';

  readonly isLoading = this.auth.isLoading;
  readonly errorMessage = signal<string | null>(null);

  submitLogin(): void {
    if (!this.identifier.trim() || !this.password.trim()) return;

    this.errorMessage.set(null);
    this.auth
      .login({
        identifier: this.identifier.trim(),
        password: this.password.trim(),
      })
      .subscribe({
        next: () => {
          this.toast.success('Signed in successfully!');
          this.router.navigate(['/home']);
        },
        error: (err) => {
          this.errorMessage.set(err.message || 'Invalid credentials. Please try again.');
        },
      });
  }
}
