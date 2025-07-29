import {Component, EventEmitter, Input, Output} from '@angular/core';
import {FAQ} from '../../../interfaces/common/faq.interface';

@Component({
  selector: 'app-theme-card',
  standalone: true,
  imports: [],
  templateUrl: './theme-card.component.html',
  styleUrl: './theme-card.component.scss'
})
export class ThemeCardComponent {

  @Input({required: true}) data: FAQ;
  @Input({required: true}) activeId: string;
  @Output() onSelect = new EventEmitter();

  onSelectTheme() {
    this.onSelect.emit(this.data);
  }
}
