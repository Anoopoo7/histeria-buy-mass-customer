import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  ArrowLeft,
  ChevronDown,
  HelpCircle,
  LucideAngularModule,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles,
  Store,
} from 'lucide-angular';
import { TranslationService } from '../../../../core/services/translation.service';

export interface FaqItem {
  q: string;
  qMl: string;
  a: string;
  aMl: string;
  open?: boolean;
}

@Component({
  selector: 'bm-help-page',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
    <div class="bm-help-view">
      <div class="bm-top-bar">
        <a routerLink="/profile" class="bm-back-btn">
          <lucide-icon [img]="ArrowLeftIcon" [size]="20"></lucide-icon>
        </a>
        <h1 class="bm-top-title">{{ t('profile_help') }}</h1>
      </div>

      <div class="bm-help-content">
        <!-- Customer Support Helpline Box -->
        <div class="bm-card bm-support-card">
          <div class="bm-support-head">
            <lucide-icon [img]="MessageCircleIcon" [size]="22" class="text-primary"></lucide-icon>
            <div>
              <h3 class="bm-support-title">Kerala Customer Support</h3>
              <span class="bm-support-sub">WhatsApp Support • 9:00 AM - 9:00 PM IST</span>
            </div>
          </div>
          <p class="bm-support-desc">
            Need help with your group order or store pickup? Chat directly with the BuyMass Kerala customer care team on WhatsApp.
          </p>
          <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" class="bm-btn-whatsapp">
            <lucide-icon [img]="MessageCircleIcon" [size]="16"></lucide-icon>
            <span>Chat on WhatsApp</span>
          </a>
        </div>

        <!-- FAQ Accordion -->
        <h3 class="bm-faq-heading">Frequently Asked Questions</h3>
        <div class="bm-faq-list">
          @for (faq of faqs; track faq.q; let idx = $index) {
            <div class="bm-card bm-faq-item" (click)="toggleFaq(idx)">
              <div class="bm-faq-q">
                <span class="bm-q-text">{{ isMalayalam() ? faq.qMl : faq.q }}</span>
                <lucide-icon
                  [img]="ChevronDownIcon"
                  [size]="16"
                  [class.is-rotated]="faq.open"
                ></lucide-icon>
              </div>
              @if (faq.open) {
                <p class="bm-faq-a">{{ isMalayalam() ? faq.aMl : faq.a }}</p>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .bm-help-view {
      padding-bottom: 30px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .bm-top-bar {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 14px;
      background-color: var(--bm-color-surface);
      border-bottom: 1px solid var(--bm-color-border);
    }

    .bm-back-btn {
      color: var(--bm-color-text-primary);
      display: flex;
      align-items: center;
    }

    .bm-top-title {
      font-size: 17px;
      font-weight: 700;
    }

    .bm-help-content {
      padding: 0 14px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .bm-card {
      background-color: var(--bm-color-surface);
      border: 1px solid var(--bm-color-border);
      border-radius: var(--bm-radius-lg);
      padding: 14px;
      box-shadow: var(--bm-shadow-xs);
    }

    .bm-support-card {
      background-color: var(--bm-color-primary-soft);
      border-color: var(--bm-color-primary-border);
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .bm-support-head {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .bm-support-title {
      font-size: 14px;
      font-weight: 700;
      color: var(--bm-color-primary);
    }

    .bm-support-sub {
      font-size: 11px;
      color: var(--bm-color-text-secondary);
    }

    .bm-support-desc {
      font-size: 12px;
      color: var(--bm-color-text-secondary);
      line-height: 1.45;
    }

    .bm-btn-whatsapp {
      height: 40px;
      background-color: var(--bm-color-primary);
      color: #fff;
      font-size: 13px;
      font-weight: 600;
      border-radius: var(--bm-radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .bm-faq-heading {
      font-size: 14px;
      font-weight: 700;
      color: var(--bm-color-text-primary);
      margin-top: 6px;
    }

    .bm-faq-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .bm-faq-item {
      cursor: pointer;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .bm-faq-q {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
    }

    .bm-q-text {
      font-size: 13px;
      font-weight: 600;
      color: var(--bm-color-text-primary);
    }

    .bm-faq-a {
      font-size: 12px;
      color: var(--bm-color-text-secondary);
      line-height: 1.5;
      border-top: 1px solid var(--bm-color-border-subtle);
      padding-top: 8px;
    }

    .is-rotated {
      transform: rotate(180deg);
    }
  `],
})
export class HelpPageComponent {
  private readonly i18n = inject(TranslationService);

  readonly ArrowLeftIcon = ArrowLeft;
  readonly MessageCircleIcon = MessageCircle;
  readonly ChevronDownIcon = ChevronDown;

  readonly isMalayalam = this.i18n.isMalayalam;

  readonly faqs: FaqItem[] = [
    {
      q: 'How does BuyMass group buying work?',
      qMl: 'ബൈമാസ് ഗ്രൂപ്പ് ബയിംഗ് എങ്ങനെ പ്രവർത്തിക്കുന്നു?',
      a: 'Local merchants create group-buying campaigns with target thresholds. Customers in the neighborhood commit their store carts. As more neighbors join before time runs out, everyone unlocks higher collective discounts! You then collect your goods from the store.',
      aMl: 'കടക്കാർ നിശ്ചിത സമയത്തേക്ക് ഗ്രൂപ്പ് ഓഫറുകൾ നൽകുന്നു. അടുത്തുള്ള ആളുകൾ ഒരുമിച്ച് സാധനങ്ങൾ വാങ്ങുമ്പോൾ എല്ലാവർക്കും ഉയർന്ന കിഴിവ് ലഭിക്കും. തുടർന്ന് കടയിൽ നിന്ന് നേരിട്ട് സാധനങ്ങൾ വാങ്ങാം.',
      open: true,
    },
    {
      q: 'Where do I find my pickup OTP code?',
      qMl: 'പിക്കപ്പ് ഒ.ടി.പി എവിടെ കാണാം?',
      a: 'For security, your 6-digit pickup OTP is sent directly to your registered WhatsApp when the merchant confirms your order as Ready for Pickup. Show this code to the merchant at collection.',
      aMl: 'നിങ്ങളുടെ സുരക്ഷയ്ക്കായി 6 അക്ക പിക്കപ്പ് കോഡ് വാട്ട്‌സ്ആപ്പിലേക്ക് നേരിട്ട് അയച്ചുതരുന്നതാണ്. സാധനങ്ങൾ വാങ്ങുമ്പോൾ കടക്കാരന് ഈ കോഡ് നൽകുക.',
    },
    {
      q: 'Why are carts separated by store?',
      qMl: 'എന്തുകൊണ്ടാണ് കാർട്ടുകൾ ഓരോ കടകൾക്കായി മാറ്റിവെച്ചിരിക്കുന്നത്?',
      a: 'BuyMass connects you directly with neighborhood physical stores. Because you collect directly from each merchant, orders and carts are kept store-specific.',
      aMl: 'ഓരോ കടയിൽ നിന്നും നേരിട്ടാണ് സാധനങ്ങൾ കൈപ്പറ്റുന്നത് എന്നതിനാലാണ് കടകൾക്കനുസരിച്ച് കാർട്ടുകൾ പ്രത്യേകം കാണിക്കുന്നത്.',
    },
  ];

  toggleFaq(idx: number): void {
    this.faqs[idx].open = !this.faqs[idx].open;
  }

  t(key: string, params?: Record<string, string | number>): string {
    return this.i18n.t(key, params);
  }
}
