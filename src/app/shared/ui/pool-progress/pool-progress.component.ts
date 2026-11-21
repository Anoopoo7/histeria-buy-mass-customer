import { CommonModule } from '@angular/common';
import { Component, Input, computed } from '@angular/core';
import { Check, LucideAngularModule, Sparkles } from 'lucide-angular';
import { PoolLiveProgress, PoolTier, PoolTierProgress } from '../../../core/models/pool.model';

@Component({
  selector: 'bm-pool-progress',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="bm-pool-progress">
      <!-- Header meta: participant count & active discount badge -->
      <div class="bm-progress-meta">
        <span class="bm-joined-count">
          <strong>{{ participantCount() }}</strong>
          {{ participantCount() === 1 ? 'person joined' : 'people joined' }}
        </span>
        <span class="bm-discount-pill" [class.is-unlocked]="currentDiscount() > 0">
          @if (currentDiscount() > 0) {
            {{ currentDiscount() }}% unlocked
          } @else {
            Up to {{ maxDiscount() }}% off
          }
        </span>
      </div>

      <!-- Linear Progress Bar -->
      <div class="bm-bar-track">
        <div
          class="bm-bar-fill"
          [style.width.%]="progressPercent()"
        ></div>
      </div>

      <!-- Next Tier Target Callout (when active) -->
      @if (nextTierHint()) {
        <div class="bm-next-tier-row">
          <lucide-icon [img]="SparklesIcon" [size]="12" class="text-primary"></lucide-icon>
          <span class="bm-next-tier-text">{{ nextTierHint() }}</span>
        </div>
      }

      <!-- Tiers breakdown steps -->
      @if (displayTiers().length > 0) {
        <div class="bm-tiers-steps">
          @for (tier of displayTiers(); track tier.targetAmount) {
            <div
              class="bm-tier-step"
              [class.is-reached]="tier.isReached"
              [class.is-current]="tier.isCurrent"
            >
              <div class="bm-tier-header">
                @if (tier.isReached) {
                  <lucide-icon [img]="CheckIcon" [size]="10" class="bm-check-icon"></lucide-icon>
                }
                <span class="bm-tier-pct">{{ tier.discountPercentage }}%</span>
              </div>
              <span class="bm-tier-amt">{{ formatTarget(tier.targetAmount) }}</span>
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
      gap: 8px;
      font-size: 12px;
    }

    .bm-joined-count {
      color: var(--bm-color-text-secondary);
      white-space: nowrap;

      strong {
        color: var(--bm-color-text-primary);
        font-weight: 600;
      }
    }

    .bm-discount-pill {
      font-weight: 700;
      color: var(--bm-color-primary);
      background-color: var(--bm-color-primary-soft);
      padding: 1px 7px;
      border-radius: var(--bm-radius-sm);
      font-size: 11px;
      white-space: nowrap;
      flex-shrink: 0;

      &.is-unlocked {
        background-color: #dcfce7;
        color: #15803d;
      }
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
      transition: width 0.35s ease;
    }

    .bm-next-tier-row {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      color: var(--bm-color-text-secondary);
      background-color: var(--bm-color-surface-subtle);
      padding: 4px 8px;
      border-radius: var(--bm-radius-sm);
      min-width: 0;

      lucide-icon {
        flex-shrink: 0;
      }
    }

    .bm-next-tier-text {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      flex: 1;
      min-width: 0;
    }

    .bm-tiers-steps {
      display: flex;
      justify-content: space-between;
      margin-top: 2px;
      gap: 4px;
    }

    .bm-tier-step {
      display: flex;
      flex-direction: column;
      align-items: center;
      font-size: 10px;
      color: var(--bm-color-text-muted);
      flex: 1;
      text-align: center;

      &.is-reached {
        color: var(--bm-color-primary);
        font-weight: 600;
      }

      &.is-current {
        color: #15803d;
        font-weight: 700;
      }
    }

    .bm-tier-header {
      display: inline-flex;
      align-items: center;
      gap: 2px;
      font-weight: 700;
      white-space: nowrap;
    }

    .bm-tier-amt {
      white-space: nowrap;
      font-size: 9.5px;
    }

    .bm-check-icon {
      color: #15803d;
    }

    .bm-tier-pct {
      font-weight: 700;
      font-size: 11px;
    }

    .bm-tier-amt {
      font-size: 9px;
      color: var(--bm-color-text-secondary);
    }
  `],
})
export class PoolProgressComponent {
  @Input() progress?: PoolLiveProgress | null;
  @Input() currentAmount = 0;
  @Input() targetAmount = 10000;
  @Input() participantCountInput = 0;
  @Input() maxDiscountInput = 10;
  @Input() tiers: PoolTier[] = [];

  readonly SparklesIcon = Sparkles;
  readonly CheckIcon = Check;

  readonly participantCount = computed(() => {
    if (this.progress) {
      return this.progress.totalParticipants ?? this.progress.totalParticipations ?? 0;
    }
    return this.participantCountInput || 0;
  });

  readonly currentDiscount = computed(() => {
    if (this.progress?.currentDiscountPercentage !== undefined) {
      return this.progress.currentDiscountPercentage;
    }
    return 0;
  });

  readonly maxDiscount = computed(() => {
    if (this.progress?.tiersProgress?.length) {
      return Math.max(...this.progress.tiersProgress.map((t) => t.discountPercentage));
    }
    if (this.tiers?.length) {
      return Math.max(...this.tiers.map((t) => t.discountPercentage));
    }
    return this.maxDiscountInput || 10;
  });

  readonly progressPercent = computed(() => {
    if (this.progress?.overallProgressPercentage !== undefined) {
      return Math.min(Math.max(this.progress.overallProgressPercentage, 0), 100);
    }
    const target = this.targetAmount > 0 ? this.targetAmount : 10000;
    const pct = Math.round((this.currentAmount / target) * 100);
    return Math.min(Math.max(pct, 0), 100);
  });

  readonly nextTierHint = computed<string | null>(() => {
    if (!this.progress) return null;

    if (this.progress.targetReached) {
      return 'Max collective discount tier unlocked!';
    }

    if (this.progress.nextTier) {
      const nt = this.progress.nextTier;
      const needed = this.formatTarget(nt.amountNeeded);
      return `${needed} needed to unlock ${nt.discountPercentage}% off`;
    }

    return null;
  });

  readonly displayTiers = computed<
    Array<{ targetAmount: number; discountPercentage: number; isReached: boolean; isCurrent: boolean }>
  >(() => {
    if (this.progress?.tiersProgress?.length) {
      return this.progress.tiersProgress.map((tp) => ({
        targetAmount: tp.targetAmount,
        discountPercentage: tp.discountPercentage,
        isReached: Boolean(tp.isReached),
        isCurrent: Boolean(tp.isCurrent),
      }));
    }

    const cur = this.currentAmount;
    return (this.tiers || []).map((t) => ({
      targetAmount: t.targetAmount,
      discountPercentage: t.discountPercentage,
      isReached: cur >= t.targetAmount,
      isCurrent: false,
    }));
  });

  formatTarget(val: number): string {
    if (val === undefined || val === null) return '₹0';
    if (val >= 10000000) {
      return `₹${(val / 10000000).toFixed(val % 10000000 === 0 ? 0 : 1)}Cr`;
    }
    if (val >= 100000) {
      return `₹${(val / 100000).toFixed(val % 100000 === 0 ? 0 : 1)}L`;
    }
    if (val >= 1000) {
      return `₹${(val / 1000).toFixed(val % 1000 === 0 ? 0 : 1)}k`;
    }
    return `₹${val.toLocaleString('en-IN')}`;
  }
}
