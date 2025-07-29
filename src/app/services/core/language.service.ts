import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AppConfigService} from "./app-config.service";

@Injectable({
  providedIn: 'root'
})
export class LanguageService {

  // Inject
  private readonly appConfigService = inject(AppConfigService);
  private readonly httpClient = inject(HttpClient);

  private _currentLanguage: string = this.appConfigService.getSettingData('orderLanguage') ?? 'en';
  private translations: { [key: string]: string } = {};

  constructor() {
    this.loadTranslations(this._currentLanguage);
  }

  private loadTranslations(lang: string) {
    this.httpClient.get<{ [key: string]: string }>(`/i18n/${lang}.json?v=${new Date().getTime()}`)
      .subscribe({
        next: translations => {
          this.translations = translations;
        },
        error:  error => console.error(`Could not load ${lang} translations:`, error)
      });
  }

  translate(key: string): string {
    if (this.translations[key]) {
      return this.translations[key];
    } else {
      // console.warn(`Translation key '${key}' not found`);
      return key;
    }
  }


}
