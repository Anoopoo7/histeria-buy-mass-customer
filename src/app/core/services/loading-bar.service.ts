import { Injectable, inject, signal } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class LoadingBarService {
  private readonly router = inject(Router);

  readonly isNavigating = signal<boolean>(false);
  readonly progress = signal<number>(0);

  private timer: any = null;

  constructor() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.start();
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        this.complete();
      }
    });
  }

  start(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }

    this.isNavigating.set(true);
    this.progress.set(15);

    // Trickle progress to simulate natural loading
    this.timer = setInterval(() => {
      const current = this.progress();
      if (current < 50) {
        this.progress.set(current + 15);
      } else if (current < 80) {
        this.progress.set(current + 6);
      } else if (current < 92) {
        this.progress.set(current + 2);
      }
    }, 120);
  }

  complete(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }

    this.progress.set(100);

    setTimeout(() => {
      this.isNavigating.set(false);
      setTimeout(() => {
        this.progress.set(0);
      }, 200);
    }, 200);

    // Ensure window scrolls to top on navigation completed
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }
}
