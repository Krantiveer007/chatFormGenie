import { Directive, Input, OnDestroy } from '@angular/core';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';

@Directive({
  selector: '[autocompletePosition]',
  standalone: true,
})
export class AutocompletePositionDirective implements OnDestroy {
  private matAutocompleteTrigger: MatAutocompleteTrigger;

  @Input() set autocompletePosition(value: MatAutocompleteTrigger) {
    this.matAutocompleteTrigger = value;
    window.addEventListener('scroll', this.scrollEvent, true);
  }

  private scrollEvent = (): void => {
    if (this.matAutocompleteTrigger && this.matAutocompleteTrigger.panelOpen) {
      this.matAutocompleteTrigger.updatePosition();
    } else {
      return;
    }
  };

  ngOnDestroy() {
    window.removeEventListener('scroll', this.scrollEvent, true);
  }
}
