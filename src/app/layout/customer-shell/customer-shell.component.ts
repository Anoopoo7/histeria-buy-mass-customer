import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs';
import { ToastContainerComponent } from '../../shared/ui/toast/toast-container.component';
import { BottomNavComponent } from '../bottom-nav/bottom-nav.component';
import { TopHeaderComponent } from '../top-header/top-header.component';

@Component({
  selector: 'bm-customer-shell',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TopHeaderComponent,
    BottomNavComponent,
    ToastContainerComponent,
  ],
  template: `
    <div class="bm-customer-app-layout">
      <!-- Global Top Header -->
      @if (showTopHeader) {
        <bm-top-header></bm-top-header>
      }

      <!-- Main Viewport Router Outlet -->
      <main class="bm-main-content" [class.has-bottom-nav]="showBottomNav">
        <router-outlet></router-outlet>
      </main>

      <!-- Fixed Mobile Bottom Navigation -->
      @if (showBottomNav) {
        <bm-bottom-nav></bm-bottom-nav>
      }

      <!-- Global Notifications -->
      <bm-toast-container></bm-toast-container>
    </div>
  `,
  styles: [`
    .bm-customer-app-layout {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background-color: var(--bm-color-bg);
      position: relative;
    }

    .bm-main-content {
      flex: 1;
      width: 100%;
      max-width: var(--bm-max-mobile-width);
      margin: 0 auto;
      display: flex;
      flex-direction: column;

      &.has-bottom-nav {
        padding-bottom: calc(var(--bm-bottom-nav-height) + var(--bm-safe-bottom) + 12px);
      }
    }
  `],
})
export class CustomerShellComponent {
  private readonly router = inject(Router);

  showTopHeader = true;
  showBottomNav = true;

  constructor() {
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe((event: any) => {
      const url = event.urlAfterRedirects || event.url;
      // Hide top header on location onboarding and auth pages for clean focus
      this.showTopHeader = !url.startsWith('/location') && !url.startsWith('/auth');
      // Hide bottom nav on location onboarding, checkout, and auth pages
      this.showBottomNav =
        !url.startsWith('/location') &&
        !url.startsWith('/checkout') &&
        !url.startsWith('/auth');
    });
  }
}
