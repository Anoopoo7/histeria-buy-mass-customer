import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  signal,
} from '@angular/core';
import { Clock, LucideAngularModule } from 'lucide-angular';
import { parseTimestampMs } from '../../../core/utils/date.utils';

@Component({
  selector: 'bm-countdown-timer',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="bm-timer" [class.is-expired]="isExpired()">
      <lucide-icon [img]="ClockIcon" [size]="12"></lucide-icon>
      @if (isExpired()) {
        <span class="bm-timer-text">Closed</span>
      } @else {
        <span class="bm-timer-text">{{ formattedTime() }}</span>
      }
    </div>
  `,
  styles: [`
    .bm-timer {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 11px;
      font-weight: 600;
      color: var(--bm-color-warning);
      background-color: var(--bm-color-warning-bg);
      border: 1px solid var(--bm-color-warning-border);
      padding: 2px 6px;
      border-radius: var(--bm-radius-sm);
      line-height: 1.2;

      &.is-expired {
        color: var(--bm-color-text-muted);
        background-color: var(--bm-color-surface-subtle);
        border-color: var(--bm-color-border);
      }
    }

    .bm-timer-text {
      font-variant-numeric: tabular-nums;
    }
  `],
})
export class CountdownTimerComponent implements OnInit, OnChanges, OnDestroy {
  @Input({ required: true }) endsAt!: string | Date | number;
  @Output() expired = new EventEmitter<void>();

  readonly ClockIcon = Clock;
  readonly formattedTime = signal<string>('00:00:00');
  readonly isExpired = signal<boolean>(false);

  private intervalId: any = null;

  ngOnInit(): void {
    this.updateRemaining();
    this.intervalId = setInterval(() => this.updateRemaining(), 1000);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['endsAt']) {
      this.updateRemaining();
    }
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private updateRemaining(): void {
    const end = parseTimestampMs(this.endsAt);
    const now = Date.now();
    const diff = end - now;

    if (diff <= 0) {
      this.isExpired.set(true);
      this.formattedTime.set('00:00:00');
      this.expired.emit();
      if (this.intervalId) {
        clearInterval(this.intervalId);
      }
      return;
    }

    this.isExpired.set(false);

    const totalHours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    const pad = (n: number) => n.toString().padStart(2, '0');

    if (totalHours >= 24) {
      const days = Math.floor(totalHours / 24);
      const remHours = totalHours % 24;
      this.formattedTime.set(`${days}d ${pad(remHours)}h ${pad(minutes)}m`);
    } else {
      this.formattedTime.set(`${pad(totalHours)}:${pad(minutes)}:${pad(seconds)}`);
    }
  }
}
