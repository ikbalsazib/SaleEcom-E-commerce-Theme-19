import {inject, Injectable, PLATFORM_ID} from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import {isPlatformBrowser} from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  // Store Data
  private history: string[] = [];

  // Inject
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router);

  constructor() {
    this.loadHistory();
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.history.push(event.urlAfterRedirects);
        this.saveHistory();
      }
    });
  }


  /**
   * saveHistory()
   * loadHistory()
   * back()
   * resetHistory()
   */
  private saveHistory(): void {
    if(isPlatformBrowser(this.platformId)) {
      sessionStorage.setItem('navigationHistory', JSON.stringify(this.history));
    }
  }

  private loadHistory(): void {
    if(isPlatformBrowser(this.platformId)) {
      const history = sessionStorage.getItem('navigationHistory');
      if (history) {
        this.history = JSON.parse(history);
      }
    }
  }

  public back(): void {
    this.history.pop();
    const previousUrl = this.history.pop();
    this.saveHistory();

    if (previousUrl) {
      this.router.navigateByUrl(previousUrl).then();
      if (previousUrl === '/') {
        this.resetHistory();
      }
    } else {
      this.router.navigateByUrl('/').then();
      this.resetHistory();
    }
  }

  public resetHistory(): void {
    this.history = [];
    if(isPlatformBrowser(this.platformId)) {
      sessionStorage.removeItem('navigationHistory');
    }
  }

}
