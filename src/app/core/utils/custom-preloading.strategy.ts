import { Injectable } from '@angular/core';
import { PreloadingStrategy, Route, Router } from '@angular/router';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CustomPreloadingStrategy implements PreloadingStrategy {
  private currentPath: string;

  constructor(private router: Router) {
    // Subscribe to router events to get the current URL path
    this.router.events.subscribe(() => {
      this.currentPath = this.router.url;
    });
  }

  preload(route: Route, load: () => Observable<any>): Observable<any> {
    // Check if the route has the 'preloadAfter' data property
    if (route.data && route.data['preloadAfter']) {
      const preloadAfterPaths = route.data['preloadAfter'];

      // If 'preloadAfter' is an array, check if it includes the current path
      if (Array.isArray(preloadAfterPaths) && preloadAfterPaths.includes(this.currentPath)) {
        return load();
      }

      // If 'preloadAfter' is a string, check if it matches the current path
      if (typeof preloadAfterPaths === 'string' && preloadAfterPaths === this.currentPath) {
        return load();
      }
    }

    // If the condition isn't met, do not preload the route
    return of(null);
  }
}
