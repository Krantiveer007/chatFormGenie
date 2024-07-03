import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { ReactiveFormsModule, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { Observable, of } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { AutocompletePositionDirective } from 'app/directives/auto-complete-position.directive';
import { MaterialModule } from 'app/modules/material.module';
import { UiService } from 'app/services/ui.service';

@Component({
  selector: 'app-multi-select-autocomplete',
  standalone: true,
  imports: [
    MaterialModule,
    ReactiveFormsModule,
    CommonModule,
    AutocompletePositionDirective,
    FlexLayoutModule
  ],
  templateUrl: './multi-select-autocomplete.component.html',
  styleUrls: ['./multi-select-autocomplete.component.scss']
})
export class MultiSelectAutocompleteComponent implements OnInit, OnChanges, OnDestroy {

  selectable = true;
  removable = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  filteredOptions: Observable<any[]>;
  searchInputControl: UntypedFormControl = new UntypedFormControl();
  matInputId: string;
  matChipId: string;
  isPanelOpen = false;
  closeBtn: HTMLElement;
  allOptionCheck = false;
  uniqueId;

  @Input() form: UntypedFormGroup = null;
  @Input() isMandatory = true;
  @Input() matInputAndChipIds: any[] = [];
  @Input() controlName = '';
  @Input() selectedOptions: any[] = [];
  @Input() label = '';
  @Input() allOptions: any[] = [];
  @Input() tooltipText = '';
  @Input() isMultiSelectInputVisible = true;
  @Input() isKycPage;
  @Input() calledFrom;
  @Input() enableAllSelection = '';
  @Input() appearance = 'outline';
  @Input() checkDuplicateSelection = false;
  @Input() compareKey;
  @Input() showLabel = true;

  @ViewChild('searchInput') searchInput: ElementRef<HTMLInputElement>;
  @ViewChild(MatAutocompleteTrigger) inputAutoComplete: MatAutocompleteTrigger;
  @Output() othersOptionSelected = new EventEmitter<boolean>();
  @Output() multiSelectInputEvent = new EventEmitter<string>();
  @Output() requiredDocSelected = new EventEmitter<any>();
  @Output() optionSelected = new EventEmitter<any>();
  @Output() onKeyupEvent = new EventEmitter<any>();
  @Output() onBlurEmit = new EventEmitter<any>();

  constructor(
    private cdr: ChangeDetectorRef,
    private ui: UiService
  ) { }

  ngOnInit() {
    if (this.form && this.form.get(this.controlName) && this.form.get(this.controlName).disabled) {
      this.searchInputControl.disable();
    }
    this.uniqueId = (this.controlName ? this.controlName : '') + Math.random();
    if (this.uniqueId) {
      this.matInputId = 'mat-input-' + this.uniqueId;
      this.matChipId = 'mat-chip-' + this.uniqueId;
      this.matInputAndChipIds.push(this.matInputId);
      this.matInputAndChipIds.push(this.matChipId);
    }
    if (!this.allOptions) return;
    setTimeout(() => {
      this.filteredOptions = this.searchInputControl.valueChanges.pipe(
        startWith(null),
        map((option: any | null) => {
          return option ? this._filterOptions(option) : this.allOptions.slice()
        }));
    }, 1000);
  }

  ngOnChanges(simpleChange: SimpleChanges) {
    if ((this.filteredOptions && simpleChange['selectedOptions'] && simpleChange['selectedOptions'].currentValue && this.controlName === 'financeTypes') || this.controlName === 'supportedCurrencies' || this.controlName === 'excBCOs') {
      const optionKey = this.controlName === 'excBCOs' ? 'full_name' : 'viewValue';
      this.filteredOptions = of(this.allOptions).pipe(map((options: any[]) => {
        options.forEach(option => {
          this.selectedOptions.forEach((selectedInstance) => {
            if (option[optionKey] === selectedInstance[optionKey]) {
              option['selected'] = selectedInstance.selected;
            }
          });
        });
        return options;
      }));
    }
    if (simpleChange['allOptions']) {
      this.filteredOptions = this.searchInputControl.valueChanges.pipe(
        startWith(null),
        map((option: any | null) => {
          return option ? this._filterOptions(option) : this.allOptions.slice()
        }));
    }
  }

  onInputClick(event): void {
    event.stopPropagation();
    this.closePanel();
    if (!this.inputAutoComplete.panelOpen) {
      this.searchInputControl.setValue(' ');
    }
  }

  autoSelectOpenedOrClosed(actionType: string): void {
    const elementRef = document.getElementsByClassName('cdk-overlay-pane');
    if (elementRef && elementRef.length > 0) {
      for (let i = 0; i < elementRef.length; i++) {
        if (elementRef.item(i)
          && elementRef.item(i).childNodes
          && elementRef.item(i).childNodes.length > 0
          && elementRef.item(i).childNodes[0]['id']
          && elementRef.item(i).childNodes[0]['id'] === this.inputAutoComplete.autocomplete.id) {
          this.addOrCloseBtn(elementRef.item(i), actionType);
        }
      }
    }
  }

  private addOrCloseBtn(element, actionType: string): void {
    if (actionType === 'open' && this.inputAutoComplete.panelOpen) {
      const existingClose = document.getElementById('multi-select-close-btn');
      if (existingClose) {
        this.onBlurEmit.emit(true);
        existingClose.remove();
      }
      this.closeBtn = document.createElement('button');
      this.closeBtn.id = 'multi-select-close-btn';
      const closeIcon = document.createElement('mat-icon');
      closeIcon.classList.add('material-icons');
      closeIcon.classList.add('mat-icon');
      closeIcon.innerText = 'close';
      this.closeBtn.appendChild(closeIcon);
      this.closeBtn.classList.add('mat-mini-fab');
      this.closeBtn.classList.add('mini-close-btn');
      this.closeBtn.setAttribute('mat-step-fab', '');
      // closeBtn.setAttribute('style', '')
      this.closeBtn.addEventListener('click', (ev) => {
        this.isPanelOpen = true;
        this.closePanel();
      }, false);
      element.appendChild(this.closeBtn);
    } else {
      let closeIconNode: any;
      if (element) {
        element.childNodes.forEach(childEle => {
          if (childEle?.innerText && childEle?.innerText?.includes('close')) {
            closeIconNode = childEle;
          }
        });
        this.onBlurEmit.emit(true);
        element.removeChild(closeIconNode);
      }
    }
  }

  closePanel(): void {
    this.isPanelOpen = !this.isPanelOpen;
    if (this.isPanelOpen) {
      this.inputAutoComplete.openPanel();
    } else {
      this.onBlurEmit.emit(true);
      this.inputAutoComplete.closePanel();
    }
  }

  optionRowClicked(event, value): void {
    event.stopPropagation();
    this.toggleSelection(value);
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.toggleSelection(event.option.value);
  }

  toggleSelection(option: any): void {
    if (this.checkDuplicateSelection && !option.selected) {
      const index = this.selectedOptions.findIndex((selectedOption) => {
        return selectedOption.value === option.value;
      });
      if (index > -1) {
        this.ui.snackbar('This option is already selected');
        this.searchInput.nativeElement.value = '';
        return;
      }
    }
    if (option === this.enableAllSelection) {
      this.allOptionCheck = !this.allOptionCheck;
      if (this.allOptionCheck) {
        for (let i = 0; i < this.allOptions.length; i++) {
          this.allOptions[i].selected = true;
        }
        this.selectedOptions = JSON.parse(JSON.stringify(this.allOptions));
      } else {
        for (let i = 0; i < this.allOptions.length; i++) {
          this.allOptions[i].selected = false;
        }
        this.selectedOptions = [];
      }
    } else {
      option.selected = !option.selected;
      if (option.selected) {
        this.selectedOptions.push(option);
      } else {
        const i = this.selectedOptions.findIndex(instance => {
          if (this.calledFrom === 'inputSelector') {
            if (this.compareKey) {
              if (instance[this.compareKey] === option[this.compareKey]) return true;
            } else if (instance.value === option.value && instance.key === option.key) {
              return true;
            }
          } else if (this.isKycPage && instance.code === option.code) {
            return true;
          } else if ((this.label.includes('Finance') || this.label.includes('Currencies')) && !this.label.includes('Client Incorporation')) {
            if (instance['viewValue'].toLowerCase() === option['viewValue'].toLowerCase()) {
              return true;
            }
          } else if (this.label.includes('Client Incorporation') || this.label.includes('Importer (Counter Party) Incorporation') || this.label.includes('Countries')) {
            if (instance.country_name === option['country_name'] && instance.country_code === option['country_code']) {
              return true;
            }
          } else if (this.label.includes('Document')) {
            if (instance.value === option.value && instance.key === option.key) {
              return true;
            }
          } else if (this.label.includes('BCO')) {
            if (instance.value === option.value) {
              return true;
            }
          } else if (this.label.includes('Seller, Buyer, Exporter, or Importer') && !this.label.includes('Client Incorporation')) {
            if (instance.full_name === option.full_name) {
              return true;
            }
          } else if (this.label.includes('Commodities') || this.label.includes('Application No.') || this.label.includes('Program No.') || this.label.includes('Applicant ID') || this.label.includes('Signed Agreements') || this.label.includes('Sectors')
            || this.label.includes('Companies') || this.label.includes('Regions') || this.label.includes('Company Reference') || this.label.includes('Product')) {
            if (instance.name === option.name) {
              return true;
            }
          }
          return false;
        });
        this.selectedOptions.splice(i, 1);
        if (this.calledFrom !== 'inputSelector') {
          if (this.label.includes('Finance') || this.label.includes('Currencies')) {
            this.allOptions.forEach((allOptionInstance) => {
              if (allOptionInstance['viewValue'] === option['viewValue']) {
                allOptionInstance.selected = option.selected;
              }
            });
          } else if (this.label.includes('Product')) {
            this.allOptions.forEach((allOptionInstance) => {
              if (allOptionInstance['name'] === option['name']) {
                allOptionInstance.selected = option.selected;
              }
            });
          }
        }
      }
    }
    this.searchInput.nativeElement.value = '';
    this.searchInputControl.setValue(null);
    this.form.patchValue({
      [this.controlName]: this.selectedOptions
    });
    if ((this.label.includes('Commodities') || this.label.includes('Commodity') || this.label.includes('Sector') || this.label.includes('Companies') || this.label.includes('Regions')) && (option.name === 'Other' || option.value === 'Other')) {
      this.othersOptionSelected.emit(option.selected);
    }
    if (this.label === 'Documents needed for Term-Sheet' || this.label === 'Additional Documents') {
      const obj = {
        control: this.controlName,
        option
      }
      this.requiredDocSelected.emit(obj);
    }
    setTimeout(() => {
      this.inputAutoComplete.updatePosition();
    }, 0)
    this.searchInput.nativeElement.focus();
    this.optionSelected.emit(option);
  }

  private _filterOptions(value: string): any[] {
    if (value) {
      let filterValue = '';
      if (this.calledFrom === 'inputSelector') {
        const key = this.compareKey ? this.compareKey : 'value';
        filterValue = value[key] ? value[key].toLowerCase() : value.toLowerCase();
      } else if ((this.label.includes('Finance') || this.label.includes('Currencies')) && !this.label.includes('Client Incorporation')) {
        filterValue = value['viewValue'] ? value['viewValue'].toLowerCase() : value.toLowerCase();
      } else if (this.label.includes('Client Incorporation') || this.label.includes('Importer (Counter Party) Incorporation') || this.label.includes('Countries')) {
        filterValue = value['country_name'] ? value['country_name'].toLowerCase() : value.toLowerCase();
      } else if (this.label.includes('Document') || this.label.includes('BCO')) {
        filterValue = value['value'] ? value['value'].toLowerCase() : value.toLowerCase();
      } else if (this.label.includes('Seller, Buyer, Exporter, or Importer') && !this.label.includes('Client Incorporation')) {
        filterValue = value['full_name'] ? value['full_name'].toLowerCase() : value.toLowerCase();
      } else if (this.label.includes('Application No.') || this.label.includes('Program No.') || this.label.includes('Applicant ID') || this.label.includes('Signed Agreements') || this.label.includes('Company Reference') || this.label.includes('Product')) {
        filterValue = value;
      } else {
        filterValue = value && value.toLowerCase ? value.toLowerCase() : value;
      }
      const result = this.allOptions?.filter(instance => {
        if (this.calledFrom === 'inputSelector' || this.isKycPage) {
          if (this.compareKey) return instance[this.compareKey].toLowerCase().includes(filterValue);
          return instance.value.toLowerCase().includes(filterValue);
        } else if ((this.label.includes('Finance') || this.label.includes('Currencies')) && !this.label.includes('Client Incorporation')) {
          return instance.viewValue.toLowerCase().includes(filterValue);
        } else if (this.label.includes('Client Incorporation') || this.label.includes('Importer (Counter Party) Incorporation') || this.label.includes('Countries')) {
          return instance.country_name.toLowerCase().indexOf(filterValue) === 0;
        } else if (this.label.includes('Document') || this.label.includes('BCO')) {
          return instance.value.toLowerCase().includes(filterValue);
        } else if (this.label.includes('Seller, Buyer, Exporter, or Importer') && !this.label.includes('Client Incorporation')) {
          return instance.full_name.toLowerCase().includes(filterValue);
        } else if (this.label.includes('Commodities') || this.label.includes('Sectors') || this.label.includes('Companies') || this.label.includes('Regions')) {
          return instance.name.toLowerCase().includes(filterValue);
        } else if (this.label.includes('Application No.') || this.label.includes('Program No.') || this.label.includes('Applicant ID') || this.label.includes('Signed Agreements') || this.label.includes('Company Reference')) {
          return instance.name.includes(filterValue);
        }
        return false;
      });
      return result;
    }
    return [];
  }

  displaySelectedOptions(option: any): string {
    if (option) {
      if (this.calledFrom === 'inputSelector' || this.isKycPage) {
        if (this.compareKey) return option[this.compareKey];
        return option.value;
      } else if ((this.label.includes('Finance') || this.label.includes('Currencies')) && !this.label.includes('Client Incorporation')) {
        return option.viewValue;
      } else if (this.label.includes('Client Incorporation') || this.label.includes('Importer (Counter Party) Incorporation') || this.label.includes('Countries') || this.label.includes('countries')) {
        return option.country_name;
      } else if (this.label.includes('Document') || this.label.includes('BCO')) {
        return option.value;
      } else if (this.label.includes('Seller, Buyer, Exporter, or Importer') && !this.label.includes('Client Incorporation')) {
        return option.full_name;
      } else if (this.label.includes('Commodities') || this.label.includes('Sectors of Business') || this.label.includes('Direct ShareHolders') || this.label.includes('Companies')
        || this.label.includes('Director Details') || this.label.includes('Senior Management') || this.label.includes('Authorised Signatory Details') || this.label.includes('Sectors')
        || this.label.includes('Beneficial Owner(s) Details') || this.label.includes('Application No.') || this.label.includes('Program No.') || this.label.includes('Signed Agreements') || this.label.includes('Regions')
        || this.label.includes('Company Reference') || this.label.includes('Product') || this.label.includes('Applicant ID')) {
        return option.name;
      }
    }
    return '';
  }

  remove(option: string): void {
    this.toggleSelection(option);
    this.cdr.detectChanges();
    setTimeout(() => {
      if (this.closeBtn) {
        this.isPanelOpen = false;
        this.closeBtn.click();
        this.closePanel();
      }
    }, 0);
  }

  onBlur(element) {
    if (element.relatedTarget && element.relatedTarget.id) {
      if (this.matInputAndChipIds.includes(element.relatedTarget.id)) {
        const currentChipId = 'mat-chip-' + this.uniqueId;
        const currentMatInputId = 'mat-input-' + this.uniqueId;
        if (element.relatedTarget.id.includes('chip') && element.relatedTarget.id !== currentChipId) {
          if (this.closeBtn) {
            this.closeBtn.click();
          }
          this.inputAutoComplete.closePanel();
        } else if (element.relatedTarget.id.includes('input') && element.relatedTarget.id !== currentMatInputId) {
          if (this.closeBtn) {
            this.closeBtn.click();
          }
          this.inputAutoComplete.closePanel();
        }
      }
    }
    this.isPanelOpen = false;
    if (!this.searchInputControl.value) {
      return;
    }
    const filterValue = this.searchInputControl.value.toLowerCase();

    if (!this.allOptions) {
      return;
    }
    const found = this.allOptions.find((instance) => {
      if (this.calledFrom === 'inputSelector' || this.isKycPage) {
        if (this.compareKey) return instance[this.compareKey].toLowerCase().includes(filterValue);
        return instance.value.toLowerCase().includes(filterValue);
      } else if ((this.label.includes('Finance') || this.label.includes('Currencies')) && !this.label.includes('Client Incorporation')) {
        return instance.viewValue.toLowerCase().includes(filterValue);
      } else if (this.label.includes('Client Incorporation') || this.label.includes('Importer (Counter Party) Incorporation') || this.label.includes('Countries')) {
        return instance.country_name.toLowerCase().indexOf(filterValue) === 0;
      } else if (this.label.includes('Document') || this.label.includes('BCO')) {
        return instance.value.toLowerCase().includes(filterValue);
      } else if (this.label.includes('Seller, Buyer, Exporter, or Importer') && !this.label.includes('Client Incorporation')) {
        return instance.full_name.toLowerCase().includes(filterValue);
      } else if (this.label.includes('Commodities') || this.label.includes('Sectors') || this.label.includes('Companies') || this.label.includes('Regions')) {
        return instance.name.toLowerCase().includes(filterValue);
      } else if (this.label.includes('Application No.') || this.label.includes('Program No.') || this.label.includes('Applicant ID') || this.label.includes('Signed Agreements') || this.label.includes('Company Reference') || this.label.includes('Product')) {
        return instance.name.toLowerCase().includes(filterValue);
      }
      return false;
    });

    if (!found) {
      console.log('blur; this isn\'t a valid value, we we\'re removing it: ' + this.searchInputControl.value);
      this.searchInput.nativeElement.value = '';
      this.searchInputControl.setValue(null);
    }
    this.onBlurEmit.emit(true);
  }

  getPlaceholderVal(): string {
    if (this.searchInputControl && this.searchInputControl.disabled || (this.selectedOptions?.length === this.allOptions?.length)) {
      return '';
    }
    if (this.selectedOptions?.length) {
      return this.selectedOptions.length + ' selected, select more';
    }
    return 'Select';
  }

  onMultiSelectInput(): void {
    if (this.label.includes('Seller, Buyer, Exporter, or Importer') && !this.label.includes('Client Incorporation')) {
      if (this.searchInputControl.value) {
        this.multiSelectInputEvent.emit(this.searchInputControl.value);
      } else {
        this.closeBtn.click();
      }
    }
  }

  onKeyup(event): void {
    this.onKeyupEvent.emit(event);
  }

  ngOnDestroy() {
    this.selectedOptions = [];
    this.searchInputControl.setValue(null);
    if (this.isMultiSelectInputVisible && this.searchInput) {
      this.searchInput.nativeElement.value = '';
    }
    this.filteredOptions = of([]);
  }
}
