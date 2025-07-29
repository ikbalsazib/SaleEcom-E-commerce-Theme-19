import {inject, Injectable} from '@angular/core';
import {DOCUMENT} from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class ScriptLoaderService {

  // Inject
  private readonly document = inject(DOCUMENT);

  /**
   * Google Script
   * loadGoogleGsiScript()
   */
  loadGoogleGsiScript(src: string, id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if the script is already loaded
      if (this.document.getElementById(id)) {
        resolve();
        return;
      }

      const script = this.document.createElement('script');
      script.src = src;
      script.id = id;
      script.async = true;
      script.defer = true;

      script.onload = () => resolve();
      script.onerror = (error) => reject(error);

      this.document.body.appendChild(script);
    });
  }

  /**
   * Facebook Script
   * loadPixelScript()
   * loadFacebookPixelNoScript()
   */
  loadPixelScript(pixelId: string): void {
    if ((window as any).fbq) {
      return;
    }

    (window as any).fbq = function () {
      (window as any).fbq.callMethod
        ? (window as any).fbq.callMethod.apply((window as any).fbq, arguments)
        : (window as any).fbq.queue.push(arguments);
    };

    (window as any).fbq.queue = [];
    (window as any).fbq.loaded = true;
    (window as any).fbq.version = '2.0';
    (window as any).fbq.push = (window as any).fbq;

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    script.onload = () => {
      (window as any).fbq('init', pixelId, {
        autoConfig: 'false',
        allowAutomaticEvents: false, // ✅ Add this line
      });
      // NO fbq('track', 'PageView') here
    };

    document.head.appendChild(script);
  }

  // loadPixelScript(pixelId: string): void {
  //   console.log('hereeeeeee')
  //   // ✅ Check if Facebook Pixel is already loaded
  //   if ((window as any).fbq) {
  //     return;
  //   }
  //
  //   (window as any).fbq = function () {
  //     (window as any).fbq.callMethod
  //       ? (window as any).fbq.callMethod.apply((window as any).fbq, arguments)
  //       : (window as any).fbq.queue.push(arguments);
  //   };
  //
  //   (window as any).fbq.queue = [];
  //   (window as any).fbq.loaded = true;
  //   (window as any).fbq.version = '2.0';
  //   (window as any).fbq.push = (window as any).fbq;
  //
  //   const script = document.createElement('script');
  //   script.async = true;
  //   script.src = 'https://connect.facebook.net/en_US/fbevents.js';
  //   script.onload = () => {
  //     (window as any).fbq('init', pixelId, { autoConfig: 'false' });
  //     // (window as any).fbq('track', 'PageView');
  //   };
  //
  //   document.head.appendChild(script);
  // }


  loadFacebookPixelNoScript(pixelId: string): void {
    // Prevent duplicate <noscript> elements
    if (this.document.getElementById('facebook-pixel-noscript')) {
      console.warn('Facebook Pixel <noscript> is already added.');
      return;
    }

    // Create the <noscript> tag with the Pixel ID
    const noscript = this.document.createElement('noscript');
    noscript.id = 'facebook-pixel-noscript'; // Unique ID to prevent duplication

    const img = this.document.createElement('img');
    img.height = 1;
    img.width = 1;
    img.style.display = 'none';
    img.src = `https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`;

    noscript.appendChild(img);
    this.document.body.appendChild(noscript);

  }


  // loadGtmScript(gtmId: string): void {
  //   // Create the Google Tag Manager script element
  //   const script = this.document.createElement('script');
  //   script.innerHTML = `
  //   (function(w,d,s,l,i) {
  //     w[l]=w[l]||[];
  //     w[l].push({'gtm.start': new Date().getTime(), event: 'gtm.js'});
  //     var f = d.getElementsByTagName(s)[0],
  //         j = d.createElement(s),
  //         dl = l != 'dataLayer' ? '&l=' + l : '';
  //     j.async = true;
  //     j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
  //     f.parentNode.insertBefore(j, f);
  //   })(window, document, 'script', 'dataLayer', '${gtmId}');
  // `;
  //   script.type = 'text/javascript';
  //   this.document.head.appendChild(script);
  // }

  loadGtmScript(gtmId: string): void {
    // Prevent duplicate GTM script
    if (this.document.getElementById('gtm-script')) return;

    const script = this.document.createElement('script');
    script.id = 'gtm-script';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;
    this.document.head.appendChild(script);

    // Initialize dataLayer if not exists
    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).dataLayer.push({'gtm.start': new Date().getTime(), event: 'gtm.js'});
  }



  // loadGtmNoScript(gtmId: string): void {
  //   // Create the <noscript> tag for Google Tag Manager
  //   const noscript = this.document.createElement('noscript');
  //   const iframe = this.document.createElement('iframe');
  //   iframe.src = `https://www.googletagmanager.com/ns.html?id=${gtmId}`;
  //   iframe.height = '0';  // Assign as a string
  //   iframe.width = '0';   // Assign as a string
  //   iframe.style.display = 'none';
  //   iframe.style.visibility = 'hidden';
  //
  //   noscript.appendChild(iframe);
  //   this.document.body.appendChild(noscript); // Append it to the body
  // }

  loadGtmNoScript(gtmId: string): void {
    if (this.document.getElementById('gtm-noscript')) return;

    const noscript = this.document.createElement('noscript');
    noscript.id = 'gtm-noscript';
    const iframe = this.document.createElement('iframe');
    iframe.src = `https://www.googletagmanager.com/ns.html?id=${gtmId}`;
    iframe.height = '0';
    iframe.width = '0';
    iframe.style.display = 'none';
    iframe.style.visibility = 'hidden';
    noscript.appendChild(iframe);

    // Insert at the top of the body
    this.document.body.insertBefore(noscript, this.document.body.firstChild);
  }



}
