import {Inject, Injectable, PLATFORM_ID} from '@angular/core';
import {DOCUMENT, isPlatformBrowser} from '@angular/common';


@Injectable({providedIn: 'root'})
export class PixelService {

  private initialized = false;
  private currentId: string | null = null;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) private document: Document
  ) {
  }


  init(pixelId: string | null) {
    if (!this.isBrowser || !pixelId) return;
    if (this.initialized && this.currentId === pixelId) return;

    this.ensureFbqLoaded();

    try {
      const w: any = window;

      // ⛔ stop automatic PageView + SPA auto tracking
      // must be BEFORE init()
      w.fbq?.('set', 'autoConfig', false, pixelId);
      w.fbq && (w.fbq.disablePushState = true);

      // normal init (no auto PageView now)
      w.fbq?.('init', pixelId);

      w.fbq?.('set', 'allowAutomaticEvents', false);

      this.initialized = true;
      this.currentId = pixelId;
    } catch {
    }
  }


  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private ensureFbqLoaded() {
    if (!this.isBrowser) return;
    if ((window as any).fbq) return; // already loaded

    (function (f: any, b: Document, e: string, v: string, n?: any, t?: HTMLScriptElement, s?: Node) {
      if (f.fbq) return;
      n = function (this: any) {
        // @ts-ignore
        n.callMethod ? n.callMethod.apply(n, arguments) : (n.queue = n.queue || []).push(arguments);
      };
      f._fbq = f.fbq = n;
      n.push = n;
      n.loaded = true;
      n.version = '2.0';
      n.queue = [];
      t = b.createElement(e) as HTMLScriptElement;
      t.async = true;
      t.src = 'https://connect.facebook.net/en_US/fbevents.js';
      s = b.getElementsByTagName(e)[0];
      s?.parentNode?.insertBefore(t, s);
    })(window, this.document, 'script', ''); // v arg unused in snippet
  }

}
