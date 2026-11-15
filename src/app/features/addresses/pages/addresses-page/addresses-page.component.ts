import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  LucideAngularModule,
  MapPin,
  Plus,
  Trash2,
} from 'lucide-angular';
import { SavedAddress } from '../../../../core/models/location.model';
import { LocationService } from '../../../../core/services/location.service';
import { ToastService } from '../../../../core/services/toast.service';
import { TranslationService } from '../../../../core/services/translation.service';

@Component({
  selector: 'bm-addresses-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LucideAngularModule],
  template: `
    <div class="bm-addresses-view">
      <div class="bm-top-bar">
        <a routerLink="/profile" class="bm-back-btn">
          <lucide-icon [img]="ArrowLeftIcon" [size]="20"></lucide-icon>
        </a>
        <h1 class="bm-top-title">{{ t('profile_saved_locations') }}</h1>
      </div>

      <div class="bm-addr-content">
        <!-- Addresses List -->
        <div class="bm-addr-list">
          @for (addr of savedAddresses(); track addr.id) {
            <div class="bm-addr-card">
              <div class="bm-addr-head">
                <div class="bm-addr-badge">{{ addr.type }}</div>
                <button
                  type="button"
                  class="bm-btn-delete"
                  (click)="deleteAddress(addr.id)"
                  title="Delete address"
                >
                  <lucide-icon [img]="TrashIcon" [size]="14"></lucide-icon>
                </button>
              </div>

              <h3 class="bm-addr-name">{{ addr.title }}</h3>
              <p class="bm-addr-text">
                {{ addr.locality }}, {{ addr.city }}
                @if (addr.postalCode) {
                  • {{ addr.postalCode }}
                }
              </p>

              <button
                type="button"
                class="bm-btn-select"
                (click)="selectAddress(addr.id)"
              >
                <lucide-icon [img]="CheckIcon" [size]="14"></lucide-icon>
                <span>Set as Active Discovery Location</span>
              </button>
            </div>
          }
        </div>

        <!-- Add Address Form Toggle -->
        @if (!showAddForm()) {
          <button type="button" class="bm-btn-add-toggle" (click)="showAddForm.set(true)">
            <lucide-icon [img]="PlusIcon" [size]="16"></lucide-icon>
            <span>Add New Address</span>
          </button>
        } @else {
          <div class="bm-new-addr-form">
            <h3 class="bm-form-title">Add New Address</h3>

            <div class="bm-field">
              <label class="bm-label">Address Label / Title</label>
              <input
                type="text"
                class="bm-input"
                [(ngModel)]="newTitle"
                placeholder="e.g. My Apartment, Mom's House"
              />
            </div>

            <div class="bm-field">
              <label class="bm-label">Locality / Area</label>
              <input
                type="text"
                class="bm-input"
                [(ngModel)]="newLocality"
                placeholder="e.g. Kadavanthra"
              />
            </div>

            <div class="bm-field">
              <label class="bm-label">City</label>
              <input
                type="text"
                class="bm-input"
                [(ngModel)]="newCity"
                placeholder="e.g. Kochi"
              />
            </div>

            <div class="bm-field">
              <label class="bm-label">PIN Code</label>
              <input
                type="text"
                class="bm-input"
                [(ngModel)]="newPostalCode"
                placeholder="e.g. 682020"
                maxlength="6"
              />
            </div>

            <div class="bm-form-actions">
              <button type="button" class="bm-btn-cancel" (click)="showAddForm.set(false)">
                Cancel
              </button>
              <button
                type="button"
                class="bm-btn-save"
                [disabled]="!newCity.trim()"
                (click)="saveNewAddress()"
              >
                Save Address
              </button>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .bm-addresses-view {
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

    .bm-addr-content {
      padding: 0 14px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .bm-addr-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .bm-addr-card {
      background-color: var(--bm-color-surface);
      border: 1px solid var(--bm-color-border);
      border-radius: var(--bm-radius-lg);
      padding: 14px;
      box-shadow: var(--bm-shadow-xs);
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .bm-addr-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .bm-addr-badge {
      font-size: 10px;
      font-weight: 700;
      color: var(--bm-color-primary);
      background-color: var(--bm-color-primary-soft);
      padding: 2px 6px;
      border-radius: var(--bm-radius-sm);
    }

    .bm-btn-delete {
      color: var(--bm-color-text-muted);

      &:hover {
        color: var(--bm-color-danger);
      }
    }

    .bm-addr-name {
      font-size: 14px;
      font-weight: 700;
      color: var(--bm-color-text-primary);
    }

    .bm-addr-text {
      font-size: 12px;
      color: var(--bm-color-text-secondary);
      line-height: 1.4;
    }

    .bm-btn-select {
      margin-top: 4px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      font-weight: 600;
      color: var(--bm-color-primary);
      background: none;
      align-self: flex-start;
      padding: 4px 0;
    }

    .bm-btn-add-toggle {
      height: 44px;
      border: 1px dashed var(--bm-color-primary);
      background-color: var(--bm-color-primary-soft);
      color: var(--bm-color-primary);
      border-radius: var(--bm-radius-md);
      font-size: 13px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }

    .bm-new-addr-form {
      background-color: var(--bm-color-surface);
      border: 1px solid var(--bm-color-border);
      border-radius: var(--bm-radius-lg);
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .bm-form-title {
      font-size: 14px;
      font-weight: 700;
    }

    .bm-field {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .bm-label {
      font-size: 11px;
      font-weight: 600;
      color: var(--bm-color-text-secondary);
    }

    .bm-input {
      height: 40px;
      border: 1px solid var(--bm-color-border);
      border-radius: var(--bm-radius-md);
      background-color: var(--bm-color-surface-subtle);
      padding: 0 10px;
      font-size: 13px;

      &:focus {
        border-color: var(--bm-color-primary);
        background-color: var(--bm-color-surface);
      }
    }

    .bm-form-actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-top: 4px;
    }

    .bm-btn-cancel {
      height: 40px;
      border: 1px solid var(--bm-color-border);
      border-radius: var(--bm-radius-md);
      font-size: 13px;
      font-weight: 500;
      color: var(--bm-color-text-secondary);
    }

    .bm-btn-save {
      height: 40px;
      background-color: var(--bm-color-primary);
      color: #fff;
      border-radius: var(--bm-radius-md);
      font-size: 13px;
      font-weight: 600;
    }
  `],
})
export class AddressesPageComponent {
  private readonly locationService = inject(LocationService);
  private readonly toast = inject(ToastService);
  private readonly i18n = inject(TranslationService);
  private readonly router = inject(Router);

  readonly ArrowLeftIcon = ArrowLeft;
  readonly PlusIcon = Plus;
  readonly TrashIcon = Trash2;
  readonly CheckIcon = Check;

  readonly savedAddresses = this.locationService.savedAddresses;
  readonly showAddForm = signal<boolean>(false);

  newTitle = '';
  newLocality = '';
  newCity = '';
  newPostalCode = '';

  selectAddress(id: string): void {
    this.locationService.selectSavedAddress(id);
    this.toast.success('Active location switched!');
    this.router.navigate(['/home']);
  }

  deleteAddress(id: string): void {
    this.locationService.deleteSavedAddress(id);
    this.toast.info('Address removed.');
  }

  saveNewAddress(): void {
    if (!this.newCity.trim()) return;

    this.locationService.saveAddress({
      type: 'OTHER',
      title: this.newTitle.trim() || `${this.newLocality}, ${this.newCity}`,
      locality: this.newLocality.trim() || this.newCity.trim(),
      city: this.newCity.trim(),
      postalCode: this.newPostalCode.trim(),
      latitude: 9.9312,
      longitude: 76.2673,
    });

    this.toast.success('Address saved!');
    this.showAddForm.set(false);
    this.newTitle = '';
    this.newLocality = '';
    this.newCity = '';
    this.newPostalCode = '';
  }

  t(key: string, params?: Record<string, string | number>): string {
    return this.i18n.t(key, params);
  }
}
