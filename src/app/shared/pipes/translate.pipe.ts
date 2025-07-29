import {Pipe, PipeTransform} from '@angular/core';
import {LanguageService} from '../../services/core/language.service';


@Pipe({
  name: 'translate',
  standalone: true,
  pure: false,
})
export class TranslatePipe implements PipeTransform {
  constructor(private languageService: LanguageService) {
  }

  transform(value: string): string {
    return this.languageService.translate(value);
  }
}
