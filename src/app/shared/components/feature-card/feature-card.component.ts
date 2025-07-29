import {Component, Input} from '@angular/core';
import {Feature} from '../../../interfaces/common/feature.interface';
import {SafeHtmlCustomPipe} from '../../pipes/safe-html.pipe';

@Component({
  selector: 'app-feature-card',
  standalone: true,
  imports: [
    SafeHtmlCustomPipe
  ],
  templateUrl: './feature-card.component.html',
  styleUrl: './feature-card.component.scss'
})
export class FeatureCardComponent {
  @Input({required: true}) data: Feature;
}
