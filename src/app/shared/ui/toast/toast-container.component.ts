import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AlertCircle, CheckCircle2, Info, LucideAngularModule, X } from 'lucide-angular';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'bm-toast-container',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="bm-toast-viewport" aria-live="polite">
      @for (toast of toasts(); track toast.id) {
        <div class="bm-toast-item" [ngClass]="'is-' + toast.type">
          <div class="bm-toast-icon">
            @if (toast.type === 'success') {
              <lucide-icon [img]="CheckCircleIcon" [size]="18"></lucide-icon>
            } @else if (toast.type === 'error') {
              <lucide-icon [img]="AlertCircleIcon" [size]="18"></lucide-icon>
            } @else {
              <lucide-icon [img]="InfoIcon" [size]="18"></lucide-icon>
            }
          </div>
          <span class="bm-toast-text">{{ toast.text }}</span>
          <button type="button" class="bm-toast-close" (click)="dismiss(toast.id)">
            <lucide-icon [img]="XIcon" [size]="14"></lucide-icon>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .bm-toast-viewport {
      position: fixed;
      top: calc(12px + var(--bm-safe-top));
      left: 16px;
      right: 16px;
      max-width: var(--bm-max-mobile-width);
      margin: 0 auto;
      z-index: 2000;
      display: flex;
      flex-direction: column;
      gap: 8px;
      pointer-events: none;
    }

    .bm-toast-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 14px;
      border-radius: var(--bm-radius-md);
      box-shadow: var(--bm-shadow-md);
      font-size: 13px;
      line-height: 1.35;
      pointer-events: auto;
      animation: bm-toast-slide 0.2s ease-out;

      &.is-success {
        background-color: var(--bm-color-success-bg);
        border: 1px solid var(--bm-color-success-border);
        color: var(--bm-color-success);
      }

      &.is-error {
        background-color: var(--bm-color-danger-bg);
        border: 1px solid var(--bm-color-danger-border);
        color: var(--bm-color-danger);
      }

      &.is-info, &.is-warning {
        background-color: var(--bm-color-surface);
        border: 1px solid var(--bm-color-border);
        color: var(--bm-color-text-primary);
      }
    }

    .bm-toast-icon {
      flex-shrink: 0;
      display: flex;
      align-items: center;
    }

    .bm-toast-text {
      flex: 1;
    }

    .bm-toast-close {
      opacity: 0.6;
      display: flex;
      align-items: center;
      padding: 2px;
      color: inherit;

      &:hover {
        opacity: 1;
      }
    }

    @keyframes bm-toast-slide {
      from {
        opacity: 0;
        transform: translateY(-8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `],
})
export class ToastContainerComponent {
  private readonly toastService = inject(ToastService);

  readonly CheckCircleIcon = CheckCircle2;
  readonly AlertCircleIcon = AlertCircle;
  readonly InfoIcon = Info;
  readonly XIcon = X;

  readonly toasts = this.toastService.toasts;

  dismiss(id: string): void {
    this.toastService.dismiss(id);
  }
}
