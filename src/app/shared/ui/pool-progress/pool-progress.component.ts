import { CommonModule } from '@angular/common';
import { Component, Input, computed } from '@angular/core';
import { PoolTier } from '../../../core/models/pool.model';

@Component({
  selector: 'bm-pool-progress',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bm-pool-progress">
      <div class="bm-progress-meta">
        <span class="bm-joined-count">
          <strong>{{ participantCount }}</strong> people joined
        </span>
        <span class="bm-discount-pill">
          Up to {{ maxDiscount }}% off
        </span>
      </div>

      <!-- Linear Progress Bar -->
      <div class="bm-bar-track">
        <div
          class="bm-bar-fill"
          [style.width.%]="progressPercent()"
        ></div>
      </div>

      <!-- Tiers breakdown if available -->
      @if (tiers && tiers.length > 0) {
        <div class="bm-tiers-steps">
          @for (tier of tiers; track tier.targetAmount) {
            <div
              class="bm-tier-step"
              [class.is-reached]="currentAmount >= tier.targetAmount"
            >
              <span class="bm-tier-pct">{{ tier.discountPercentage }}%</span>
              <span class="bm-tier-amt">₹{{ tier.targetAmount }}</span>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .bm-pool-progress {
      display: flex;
      flex-direction: column;
      gap: 6px;
      width: 100%;
    }

    .bm-progress-meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 12px;
    }

    .bm-joined-count {
      color: var(--bm-color-text-secondary);

      strong {
        color: var(--bm-color-text-primary);
        font-weight: 600;
      }
    }

    .bm-discount-pill {
      font-weight: 700;
      color: var(--bm-color-primary);
      background-color: var(--bm-color-primary-soft);
      padding: 1px 6px;
      border-radius: var(--bm-radius-sm);
      font-size: 11px;
    }

    .bm-bar-track {
      height: 6px;
      width: 100%;
      background-color: var(--bm-color-surface-subtle);
      border-radius: var(--bm-radius-full);
      overflow: hidden;
      border: 1px solid var(--bm-color-border-subtle);
    }

    .bm-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #176B50 0%, #22c55e 100%);
      border-radius: var(--bm-radius-full);
      transition: width 0.3s ease;
    }

    .bm-tiers-steps {
      display: flex;
      justify-content: space-between;
      margin-top: 2px;
    }

    .bm-tier-step {
      display: flex;
      flex-direction: column;
      align-items: center;
      font-size: 10px;
      color: var(--bm-color-text-muted);

      &.is-reached {
        color: var(--bm-color-primary);
        font-weight: 600;
      }
    }

    .bm-tier-pct {
      font-weight: 700;
    }

    .bm-tier-amt {
      font-size: 9px;
    }
  `],
})
export class PoolProgressComponent {
  @Input() currentAmount = 0;
  @Input() targetAmount = 10000;
  @Input() participantCount = 0;
  @Input() maxDiscount = 10;
  @Input() tiers: PoolTier[] = [];

  readonly progressPercent = computed(() => {
    if (!this.targetAmount || this.targetAmount <= 0) return 35;
    const pct = Math.round((this.currentAmount / this.targetAmount) * 100);
    return Math.min(Math.max(pct, 12), 100);
  });
}
