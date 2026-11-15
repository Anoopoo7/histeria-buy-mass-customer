import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ArrowLeft, CheckCircle2, LucideAngularModule, MessageCircle, RotateCw } from 'lucide-angular';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'bm-verify-phone-page',
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
        <div class="bm-icon-circle">
          <lucide-icon [img]="MessageCircleIcon" [size]="26" class="text-primary"></lucide-icon>
        </div>
        <h1 class="bm-auth-title">Verify Phone Number</h1>
        <p class="bm-auth-desc">
          We sent a 6-digit verification code via WhatsApp to <strong>{{ phone() }}</strong>
        </p>
      </div>

      <div class="bm-card bm-auth-card">
        <form (ngSubmit)="submitOtp()" class="bm-auth-form">
          <div class="bm-field">
            <label class="bm-label">6-Digit WhatsApp Code</label>
            <input
              type="text"
              class="bm-input bm-otp-input"
              [(ngModel)]="otp"
              name="otp"
              placeholder="123456"
              maxlength="6"
              required
              autofocus
            />
          </div>

          @if (errorMessage()) {
            <div class="bm-error-alert">{{ errorMessage() }}</div>
          }

          <button
            type="submit"
            class="bm-btn-submit"
            [disabled]="isLoading() || otp.trim().length !== 6"
          >
            <lucide-icon [img]="CheckCircleIcon" [size]="18"></lucide-icon>
            <span>{{ isLoading() ? 'Verifying...' : 'Verify & Continue' }}</span>
          </button>
        </form>

        <div class="bm-resend-box">
          <span>Didn't receive the WhatsApp code?</span>
          <button
            type="button"
            class="bm-resend-btn"
            [disabled]="isResending()"
            (click)="resendCode()"
          >
            <lucide-icon
              [img]="RotateCwIcon"
              [size]="12"
              [class.bm-spin]="isResending()"
            ></lucide-icon>
            <span>{{ isResending() ? 'Resending...' : 'Resend Code' }}</span>
          </button>
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

    .bm-icon-circle {
      width: 52px;
      height: 52px;
      border-radius: var(--bm-radius-full);
      background-color: var(--bm-color-primary-soft);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 12px;
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
      max-width: 290px;
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

    .bm-otp-input {
      height: 50px;
      border: 1px solid var(--bm-color-border);
      border-radius: var(--bm-radius-md);
      background-color: var(--bm-color-surface-subtle);
      font-size: 20px;
      font-weight: 800;
      letter-spacing: 6px;
      text-align: center;
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

      &:disabled {
        opacity: 0.6;
      }
    }

    .bm-resend-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      margin-top: 16px;
      font-size: 12px;
      color: var(--bm-color-text-secondary);
    }

    .bm-resend-btn {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      color: var(--bm-color-primary);
      font-weight: 600;
      font-size: 12px;
      background: none;
    }

    .bm-spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      100% { transform: rotate(360deg); }
    }
  `],
})
export class VerifyPhonePageComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  readonly ArrowLeftIcon = ArrowLeft;
  readonly MessageCircleIcon = MessageCircle;
  readonly CheckCircleIcon = CheckCircle2;
  readonly RotateCwIcon = RotateCw;

  readonly phone = signal<string>('919876543210');
  readonly isLoading = this.auth.isLoading;
  readonly isResending = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  otp = '';

  ngOnInit(): void {
    const p = this.auth.pendingPhone() || this.auth.currentUser()?.phone;
    if (p) {
      this.phone.set(p);
    }
  }

  submitOtp(): void {
    if (this.otp.trim().length !== 6) return;

    this.errorMessage.set(null);
    this.auth.verifyPhone(this.phone(), this.otp.trim()).subscribe({
      next: () => {
        this.toast.success('Phone verified! Welcome to BuyMass.');
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.errorMessage.set(err.message || 'Invalid verification code. Please check your WhatsApp.');
      },
    });
  }

  resendCode(): void {
    this.isResending.set(true);
    this.auth.sendPhoneOtp(this.phone()).subscribe({
      next: () => {
        this.isResending.set(false);
        this.toast.info('New verification code sent to your WhatsApp.');
      },
      error: (err) => {
        this.isResending.set(false);
        this.toast.error(err.message || 'Could not resend code. Please wait.');
      },
    });
  }
}
