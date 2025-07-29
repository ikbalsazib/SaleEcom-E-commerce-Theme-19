import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {FAQ} from '../../../interfaces/common/faq.interface';

@Component({
  selector: 'app-single-faq',
  standalone: true,
  imports: [],
  templateUrl: './single-faq.component.html',
  styleUrl: './single-faq.component.scss',
})
export class SingleFaqComponent implements OnChanges {

  @Input({required: true}) data: FAQ;
  @Input({required: true}) activeId: string;
  @Output() onItemToggle = new EventEmitter();

  isOpen: boolean = false;

  ngOnChanges(changes: SimpleChanges) {
    if (!this.activeId || (this.activeId && this.activeId !== this.data._id)) {
      this.isOpen = false;
    }
  }

  onToggle() {
    this.isOpen = !this.isOpen;
    this.onItemToggle.emit(this.data._id);
  }


}
