import {Directive, inject, Input, OnDestroy, OnInit} from '@angular/core';
import {NgControl} from '@angular/forms';
import {Subscription} from 'rxjs';
import {UtilsService} from '../../services/core/utils.service';

@Directive({
  selector: "[formControl][noWhiteSpace]",
  standalone: true
})
export class NoWhitespaceDirective implements OnInit, OnDestroy {
  valueSubscription: Subscription;
  @Input() enableNoWhitespace: boolean = false;

  // Inject
  private readonly ngControl = inject(NgControl);
  private readonly utilsService = inject(UtilsService);

  ngOnInit(): void {
    if (this.enableNoWhitespace) {
      this.valueSubscription = this.ngControl.control.valueChanges.subscribe(
        value => {
          const newVal = this.utilsService.stringToSlug(value);
          this.ngControl.control.setValue(newVal, {emitEvent: false});
        }
      );
    }

  }


  ngOnDestroy(): void {
    if (this.valueSubscription) {
      this.valueSubscription.unsubscribe();
    }

  }
}
