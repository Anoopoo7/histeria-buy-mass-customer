import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { LoadingBarService } from '../../../core/services/loading-bar.service';

@Component({
  selector: 'bm-page-loading-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (loader.isNavigating()) {
      <div class="bm-tyre-transition-overlay" aria-label="Loading page">
        <div class="bm-tyre-loader-card">
          <!-- Animated Rotating Vehicle Tyre / Wheel -->
          <div class="bm-tyre-assembly">
            <svg
              class="bm-tyre-wheel-svg"
              viewBox="0 0 100 100"
              width="68"
              height="68"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <!-- Outer Rubber Tire with Treads -->
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="#0f172a"
                stroke-width="8"
                stroke-dasharray="6 3.5"
              />
              <!-- Tire Sidewall -->
              <circle cx="50" cy="50" r="39" stroke="#1e293b" stroke-width="5.5" />
              <!-- Rim Outer Lip -->
              <circle cx="50" cy="50" r="33" stroke="#cbd5e1" stroke-width="2.5" />
              <!-- Inner Rim Well -->
              <circle cx="50" cy="50" r="29" fill="#0f172a" />
              <!-- 5 Sport Alloy Spokes -->
              <g stroke="#f1f5f9" stroke-width="4.5" stroke-linecap="round">
                <line x1="50" y1="50" x2="50" y2="22" />
                <line x1="50" y1="50" x2="76.6" y2="41.3" />
                <line x1="50" y1="50" x2="66.5" y2="72.7" />
                <line x1="50" y1="50" x2="33.5" y2="72.7" />
                <line x1="50" y1="50" x2="23.4" y2="41.3" />
              </g>
              <!-- Secondary Sport Accents (BuyMass Emerald) -->
              <g stroke="#10b981" stroke-width="2" stroke-linecap="round">
                <line x1="50" y1="50" x2="50" y2="25" />
                <line x1="50" y1="50" x2="73.8" y2="42.3" />
                <line x1="50" y1="50" x2="64.7" y2="70.2" />
                <line x1="50" y1="50" x2="35.3" y2="70.2" />
                <line x1="50" y1="50" x2="26.2" y2="42.3" />
              </g>
              <!-- Center Hub -->
              <circle cx="50" cy="50" r="9.5" fill="#1e293b" stroke="#cbd5e1" stroke-width="2" />
              <circle cx="50" cy="50" r="4.5" fill="#10b981" />
              <!-- 5 Lug Nuts -->
              <circle cx="50" cy="44" r="1.3" fill="#ffffff" />
              <circle cx="55.7" cy="48.1" r="1.3" fill="#ffffff" />
              <circle cx="53.5" cy="54.9" r="1.3" fill="#ffffff" />
              <circle cx="46.5" cy="54.9" r="1.3" fill="#ffffff" />
              <circle cx="44.3" cy="48.1" r="1.3" fill="#ffffff" />
            </svg>

            <!-- Animated Road Skid / Track Below Tyre -->
            <svg
              class="bm-road-svg"
              viewBox="0 0 80 8"
              width="64"
              height="8"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <line
                x1="0"
                y1="4"
                x2="80"
                y2="4"
                stroke="#10b981"
                stroke-width="2.5"
                stroke-dasharray="10 8"
                stroke-linecap="round"
                class="bm-road-streak"
              />
            </svg>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .bm-tyre-transition-overlay {
      position: fixed;
      inset: 0;
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(15, 23, 42, 0.28);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      pointer-events: none;
      animation: bmOverlayFadeIn 0.16s ease-out;
    }

    .bm-tyre-loader-card {
      background: rgba(255, 255, 255, 0.96);
      border: 1px solid rgba(16, 185, 129, 0.2);
      box-shadow:
        0 14px 34px -8px rgba(15, 23, 42, 0.18),
        0 0 20px rgba(16, 185, 129, 0.14);
      border-radius: 20px;
      padding: 18px 24px 14px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      animation: bmCardScaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .bm-tyre-assembly {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      position: relative;
    }

    .bm-tyre-wheel-svg {
      animation: bmSpinWheel 0.65s linear infinite;
      filter: drop-shadow(0 4px 6px rgba(15, 23, 42, 0.18));
      transform-origin: center center;
    }

    .bm-road-svg {
      overflow: hidden;
      margin-top: -2px;
    }

    .bm-road-streak {
      animation: bmRoadMove 0.4s linear infinite;
    }

    .bm-tyre-label-row {
      display: flex;
      align-items: center;
      font-size: 13px;
      font-weight: 600;
      color: #176B50;
      letter-spacing: 0.3px;
    }

    .bm-dots-animation {
      display: inline-flex;
      margin-left: 2px;

      span {
        animation: bmDotBlink 1.2s infinite;
        opacity: 0;

        &:nth-child(1) { animation-delay: 0s; }
        &:nth-child(2) { animation-delay: 0.2s; }
        &:nth-child(3) { animation-delay: 0.4s; }
      }
    }

    @keyframes bmSpinWheel {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    @keyframes bmRoadMove {
      from {
        stroke-dashoffset: 0;
      }
      to {
        stroke-dashoffset: -36;
      }
    }

    @keyframes bmOverlayFadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    @keyframes bmCardScaleIn {
      from {
        opacity: 0;
        transform: scale(0.92) translateY(6px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }

    @keyframes bmDotBlink {
      0%, 20% { opacity: 0; }
      40% { opacity: 1; }
      100% { opacity: 0; }
    }
  `],
})
export class PageLoadingBarComponent {
  readonly loader = inject(LoadingBarService);
}
