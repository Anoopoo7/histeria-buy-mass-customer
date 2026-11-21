import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PageLoadingBarComponent } from './shared/ui/page-loading-bar/page-loading-bar.component';

@Component({
  selector: 'bm-root',
  standalone: true,
  imports: [RouterOutlet, PageLoadingBarComponent],
  template: `
    <bm-page-loading-bar></bm-page-loading-bar>
    <router-outlet></router-outlet>
  `,
})
export class AppComponent {}
