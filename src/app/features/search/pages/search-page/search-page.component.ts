import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  ArrowLeft,
  Clock,
  LucideAngularModule,
  Plus,
  Search,
  ShoppingBag,
  Sparkles,
  Store,
  X,
} from 'lucide-angular';
import { Subject, Subscription, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { PoolRecord } from '../../../../core/models/pool.model';
import { ProductRecord } from '../../../../core/models/product.model';
import { StoreRecord } from '../../../../core/models/store.model';
import { CartService } from '../../../../core/services/cart.service';
import { PoolService } from '../../../../core/services/pool.service';
import { ProductService } from '../../../../core/services/product.service';
import { StoreService } from '../../../../core/services/store.service';
import { TranslationService } from '../../../../core/services/translation.service';

@Component({
  selector: 'bm-search-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LucideAngularModule],
  template: `
    <div class="bm-search-view">
      <!-- Search Input Top Bar -->
      <div class="bm-search-header">
        <a routerLink="/home" class="bm-back-btn" aria-label="Go back">
          <lucide-icon [img]="ArrowLeftIcon" [size]="20"></lucide-icon>
        </a>

        <div class="bm-search-field-box">
          <lucide-icon [img]="SearchIcon" [size]="18" class="bm-search-icon"></lucide-icon>
          <input
            type="search"
            class="bm-search-input"
            [(ngModel)]="searchQuery"
            (ngModelChange)="onQueryChange($event)"
            [placeholder]="t('search_placeholder')"
            autofocus
          />
          @if (searchQuery.trim().length > 0) {
            <button type="button" class="bm-clear-btn" (click)="clearSearch()">
              <lucide-icon [img]="XIcon" [size]="16"></lucide-icon>
            </button>
          }
        </div>
      </div>

      <!-- Scope Tabs (All, Products, Stores, Pools) -->
      <div class="bm-tabs-bar">
        <button
          type="button"
          class="bm-tab-btn"
          [class.is-active]="selectedScope() === 'all'"
          (click)="setScope('all')"
        >
          {{ t('search_all') }}
        </button>

        <button
          type="button"
          class="bm-tab-btn"
          [class.is-active]="selectedScope() === 'products'"
          (click)="setScope('products')"
        >
          {{ t('search_products') }} ({{ products().length }})
        </button>

        <button
          type="button"
          class="bm-tab-btn"
          [class.is-active]="selectedScope() === 'stores'"
          (click)="setScope('stores')"
        >
          {{ t('search_stores') }} ({{ stores().length }})
        </button>

        <button
          type="button"
          class="bm-tab-btn"
          [class.is-active]="selectedScope() === 'pools'"
          (click)="setScope('pools')"
        >
          {{ t('search_pools') }} ({{ pools().length }})
        </button>
      </div>

      <!-- Results or Initial State -->
      @if (isLoading()) {
        <div class="bm-loading-box">
          <div class="bm-search-skeleton bm-skeleton"></div>
          <div class="bm-search-skeleton bm-skeleton"></div>
          <div class="bm-search-skeleton bm-skeleton"></div>
        </div>
      } @else if (searchQuery.trim().length === 0) {
        <!-- Recent Searches -->
        @if (recentSearches().length > 0) {
          <div class="bm-recent-searches">
            <div class="bm-recent-head">
              <span class="bm-recent-title">{{ t('search_recent') }}</span>
              <button type="button" class="bm-clear-history" (click)="clearRecentSearches()">
                {{ t('search_clear') }}
              </button>
            </div>
            <div class="bm-recent-chips">
              @for (term of recentSearches(); track term) {
                <button type="button" class="bm-recent-chip" (click)="applyRecent(term)">
                  <lucide-icon [img]="ClockIcon" [size]="12"></lucide-icon>
                  <span>{{ term }}</span>
                </button>
              }
            </div>
          </div>
        }
      } @else {
        <!-- Results Content -->
        <div class="bm-results-container">
          <!-- Products Section -->
          @if (selectedScope() === 'all' || selectedScope() === 'products') {
            @if (products().length > 0) {
              <div class="bm-res-section">
                <h3 class="bm-res-sec-title">{{ t('search_products') }}</h3>
                <div class="bm-res-prod-grid">
                  @for (prod of products(); track prod.id) {
                    <div class="bm-res-prod-card">
                      <a [routerLink]="['/products', prod.id]" class="bm-prod-link">
                        <img [src]="prod.primaryImageUrl || '/favicon.ico'" [alt]="prod.name" class="bm-prod-img" />
                        <div class="bm-prod-meta">
                          <span class="bm-store-name">{{ prod.storeName || 'Authorized Dealership' }}</span>
                          <span class="bm-prod-title">{{ prod.name }}</span>
                          <span class="bm-prod-price">₹{{ prod.price | number }}</span>
                        </div>
                      </a>
                      <button type="button" class="bm-cart-mini-btn" (click)="addToCart(prod.id)">
                        <lucide-icon [img]="PlusIcon" [size]="14"></lucide-icon>
                        <span>Book</span>
                      </button>
                    </div>
                  }
                </div>
              </div>
            }
          }

          <!-- Stores Section -->
          @if (selectedScope() === 'all' || selectedScope() === 'stores') {
            @if (stores().length > 0) {
              <div class="bm-res-section">
                <h3 class="bm-res-sec-title">{{ t('search_stores') }}</h3>
                <div class="bm-res-stores-list">
                  @for (store of stores(); track store.id) {
                    <a [routerLink]="['/stores', store.id]" class="bm-res-store-card">
                      <div class="bm-store-img-box">
                        <lucide-icon [img]="StoreIcon" [size]="20" class="text-primary"></lucide-icon>
                      </div>
                      <div class="bm-store-meta">
                        <span class="bm-store-title">{{ store.storeName }}</span>
                        <span class="bm-store-sub">{{ store.businessType || 'Dealership' }} • {{ store.city }}</span>
                      </div>
                    </a>
                  }
                </div>
              </div>
            }
          }

          <!-- Pools Section -->
          @if (selectedScope() === 'all' || selectedScope() === 'pools') {
            @if (pools().length > 0) {
              <div class="bm-res-section">
                <h3 class="bm-res-sec-title">{{ t('search_pools') }}</h3>
                <div class="bm-res-pools-list">
                  @for (pool of pools(); track pool.id) {
                    <a [routerLink]="['/pools', pool.id]" class="bm-res-pool-card">
                      <img [src]="pool.primaryImageUrl || '/favicon.ico'" [alt]="pool.title" class="bm-pool-img" />
                      <div class="bm-pool-meta">
                        <span class="bm-pool-title">{{ pool.title }}</span>
                        <span class="bm-pool-sub">{{ pool.storeName || 'Dealership' }}</span>
                        <span class="bm-pool-discount">Up to {{ pool.maxDiscountPercentage || 15 }}% off</span>
                      </div>
                    </a>
                  }
                </div>
              </div>
            }
          }

          <!-- Empty State -->
          @if (products().length === 0 && stores().length === 0 && pools().length === 0) {
            <div class="bm-no-results">
              <lucide-icon [img]="SearchIcon" [size]="32" class="text-muted"></lucide-icon>
              <h4>{{ t('search_no_results') }} "{{ searchQuery }}"</h4>
              <p>Try searching for vehicle models like "Punch", "Swift", "Classic 350", "Activa" or showroom names.</p>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .bm-search-view {
      padding: 10px 14px 24px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .bm-search-header {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .bm-back-btn {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--bm-color-text-primary);
      flex-shrink: 0;
    }

    .bm-search-field-box {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 8px;
      height: 44px;
      padding: 0 12px;
      background-color: var(--bm-color-surface);
      border: 1px solid var(--bm-color-border);
      border-radius: var(--bm-radius-full);
      box-shadow: var(--bm-shadow-xs);

      &:focus-within {
        border-color: var(--bm-color-primary);
      }
    }

    .bm-search-icon {
      color: var(--bm-color-text-muted);
    }

    .bm-search-input {
      flex: 1;
      border: none;
      background: none;
      outline: none;
      font-size: 14px;
      color: var(--bm-color-text-primary);
    }

    .bm-clear-btn {
      color: var(--bm-color-text-muted);
      display: flex;
      align-items: center;
      padding: 2px;
    }

    .bm-tabs-bar {
      display: flex;
      gap: 6px;
      overflow-x: auto;
      padding-bottom: 2px;
    }

    .bm-tab-btn {
      flex-shrink: 0;
      padding: 6px 12px;
      border-radius: var(--bm-radius-full);
      border: 1px solid var(--bm-color-border);
      background-color: var(--bm-color-surface);
      color: var(--bm-color-text-secondary);
      font-size: 12px;
      font-weight: 500;

      &.is-active {
        background-color: var(--bm-color-primary);
        color: #fff;
        border-color: var(--bm-color-primary);
        font-weight: 600;
      }
    }

    .bm-recent-searches {
      margin-top: 8px;
    }

    .bm-recent-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .bm-recent-title {
      font-size: 12px;
      font-weight: 600;
      color: var(--bm-color-text-muted);
    }

    .bm-clear-history {
      font-size: 11px;
      color: var(--bm-color-primary);
    }

    .bm-recent-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .bm-recent-chip {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 6px 10px;
      background-color: var(--bm-color-surface);
      border: 1px solid var(--bm-color-border);
      border-radius: var(--bm-radius-full);
      font-size: 12px;
      color: var(--bm-color-text-secondary);
    }

    .bm-results-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .bm-res-section {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .bm-res-sec-title {
      font-size: 13px;
      font-weight: 700;
      color: var(--bm-color-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .bm-res-prod-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }

    .bm-res-prod-card {
      background-color: var(--bm-color-surface);
      border: 1px solid var(--bm-color-border);
      border-radius: var(--bm-radius-md);
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .bm-prod-link {
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .bm-prod-img {
      width: 100%;
      height: 100px;
      object-fit: cover;
    }

    .bm-prod-meta {
      padding: 6px 8px;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .bm-store-name {
      font-size: 10px;
      color: var(--bm-color-text-muted);
    }

    .bm-prod-title {
      font-size: 12px;
      font-weight: 600;
      height: 30px;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    .bm-prod-price {
      font-size: 13px;
      font-weight: 700;
      color: var(--bm-color-primary);
    }

    .bm-cart-mini-btn {
      height: 30px;
      margin: 0 6px 6px;
      background-color: var(--bm-color-primary-soft);
      color: var(--bm-color-primary);
      border-radius: var(--bm-radius-sm);
      font-size: 11px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
    }

    .bm-res-stores-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .bm-res-store-card {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px;
      background-color: var(--bm-color-surface);
      border: 1px solid var(--bm-color-border);
      border-radius: var(--bm-radius-md);
    }

    .bm-store-img-box {
      width: 40px;
      height: 40px;
      border-radius: var(--bm-radius-sm);
      background-color: var(--bm-color-surface-subtle);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .bm-store-meta {
      display: flex;
      flex-direction: column;
    }

    .bm-store-title {
      font-size: 13px;
      font-weight: 600;
    }

    .bm-store-sub {
      font-size: 11px;
      color: var(--bm-color-text-muted);
    }

    .bm-res-pools-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .bm-res-pool-card {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px;
      background-color: var(--bm-color-surface);
      border: 1px solid var(--bm-color-border);
      border-radius: var(--bm-radius-md);
    }

    .bm-pool-img {
      width: 60px;
      height: 60px;
      object-fit: cover;
      border-radius: var(--bm-radius-sm);
    }

    .bm-pool-meta {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .bm-pool-title {
      font-size: 13px;
      font-weight: 600;
    }

    .bm-pool-sub {
      font-size: 11px;
      color: var(--bm-color-text-muted);
    }

    .bm-pool-discount {
      font-size: 11px;
      font-weight: 700;
      color: var(--bm-color-primary);
    }

    .bm-no-results {
      padding: 32px 16px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      color: var(--bm-color-text-secondary);

      h4 {
        font-size: 15px;
        color: var(--bm-color-text-primary);
      }

      p {
        font-size: 12px;
        max-width: 280px;
      }
    }

    .bm-search-skeleton {
      height: 70px;
      border-radius: var(--bm-radius-md);
      margin-bottom: 8px;
    }
  `],
})
export class SearchPageComponent implements OnInit, OnDestroy {
  private readonly productService = inject(ProductService);
  private readonly storeService = inject(StoreService);
  private readonly poolService = inject(PoolService);
  private readonly cartService = inject(CartService);
  private readonly i18n = inject(TranslationService);

  readonly ArrowLeftIcon = ArrowLeft;
  readonly SearchIcon = Search;
  readonly XIcon = X;
  readonly ClockIcon = Clock;
  readonly PlusIcon = Plus;
  readonly StoreIcon = Store;

  searchQuery = '';
  readonly selectedScope = signal<'all' | 'products' | 'stores' | 'pools'>('all');

  readonly products = signal<ProductRecord[]>([]);
  readonly stores = signal<StoreRecord[]>([]);
  readonly pools = signal<PoolRecord[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly recentSearches = signal<string[]>(this.getRecentSearches());

  private readonly searchSubject = new Subject<string>();
  private searchSub?: Subscription;

  ngOnInit(): void {
    this.searchSub = this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
      )
      .subscribe((query) => {
        this.performSearch(query);
      });
  }

  ngOnDestroy(): void {
    this.searchSub?.unsubscribe();
  }

  onQueryChange(val: string): void {
    this.searchSubject.next(val);
  }

  setScope(scope: 'all' | 'products' | 'stores' | 'pools'): void {
    this.selectedScope.set(scope);
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.products.set([]);
    this.stores.set([]);
    this.pools.set([]);
    this.isLoading.set(false);
  }

  applyRecent(term: string): void {
    this.searchQuery = term;
    this.performSearch(term);
  }

  clearRecentSearches(): void {
    this.recentSearches.set([]);
    try {
      localStorage.removeItem('bm_recent_searches');
    } catch {
      // ignore
    }
  }

  addToCart(productId: string): void {
    const prod = this.products().find((p) => p.id === productId);
    this.cartService.addItem(productId, 1, prod || undefined).subscribe();
  }

  t(key: string, params?: Record<string, string | number>): string {
    return this.i18n.t(key, params);
  }

  private performSearch(query: string): void {
    const q = query.trim();
    if (!q) {
      this.clearSearch();
      return;
    }

    this.isLoading.set(true);
    this.saveRecentSearch(q);

    this.productService.getProducts({ query: q, limit: 10 }).subscribe({
      next: (res) => this.products.set(res.products),
      error: () => this.products.set([]),
    });

    this.storeService.getNearbyStores({ query: q, limit: 6 }).subscribe({
      next: (res) => this.stores.set(res.stores),
      error: () => this.stores.set([]),
    });

    this.poolService.getPools({ query: q, limit: 6 }).subscribe({
      next: (res) => {
        this.pools.set(res.pools);
        this.isLoading.set(false);
      },
      error: () => {
        this.pools.set([]);
        this.isLoading.set(false);
      },
    });
  }

  private saveRecentSearch(term: string): void {
    this.recentSearches.update((list) => {
      const filtered = list.filter((t) => t.toLowerCase() !== term.toLowerCase());
      const updated = [term, ...filtered].slice(0, 8);
      try {
        localStorage.setItem('bm_recent_searches', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  }

  private getRecentSearches(): string[] {
    try {
      const s = localStorage.getItem('bm_recent_searches');
      return s ? JSON.parse(s) : ['Punch', 'Swift', 'Classic 350', 'Activa 6G', 'Ather 450X', 'Creta'];
    } catch {
      return ['Punch', 'Swift', 'Classic 350', 'Activa 6G'];
    }
  }
}
