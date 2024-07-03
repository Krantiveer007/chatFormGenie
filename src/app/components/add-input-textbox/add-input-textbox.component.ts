import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { MultiSelectAutocompleteComponent } from '../multi-select-autocomplete/multi-select-autocomplete.component';
import { MaterialModule } from 'app/modules/material.module';
import { ChatbotWidgetService } from 'app/services/chatbot-widget.service';
import { FlexLayoutModule } from '@angular/flex-layout';

@Component({
  selector: 'app-add-input-textbox',
  standalone: true,
  imports: [
    MaterialModule,
    ReactiveFormsModule,
    CommonModule,
    MultiSelectAutocompleteComponent,
    FlexLayoutModule
  ],
  templateUrl: './add-input-textbox.component.html',
  styleUrls: ['./add-input-textbox.component.scss']
})
export class AddInputTextboxComponent {

  @Input() inputField: any = null;
  @Input() inputConditionDetails: any = {}
  @Output() callBack = new EventEmitter<any>();
  matInputAndChipIds: any[] = [];
  constructor(private chatbotService: ChatbotWidgetService) { }


  checkValue(type: any): any {
    if (this.inputField[type] === undefined || this.inputField[type] === null) return '';
    if (typeof this.inputField[type] !== 'object') return this.inputField[type];
    if (this.inputConditionDetails && this.inputConditionDetails[this.inputField[type].variableName] !== undefined) return this.inputConditionDetails[this.inputField[type].variableName];
    if (this.inputField[type].methodCall) {
      this.callBack.emit({ inputField: this.inputField, actionType: type, fieldId: this.inputField[type]?.methodId });
      let val = this.chatbotService.latestValueSubject.getValue();
      if (val && typeof (val) === 'string' && this.inputField?.fieldType === 'radioType' && !this.inputField.doNotChangeOutputvalue) {
        val = val.toLowerCase() === 'no' ? false : true;
      }
      return (val === null) ? '' : val;
    }
    if ((type.includes('Form') && this.inputField['fieldType'] === 'multiSelectType') || this.inputField['fieldType'] === 'keyValueSelectType') {
      return this.inputField[type];
    }
    return '';
  }
  checkboxValueChecked(ind: number): boolean {
    const products = this.checkValue('checkboxOptions');
    return (products && products[ind]?.checked) ? true : false;
  }

  methodCall(value: any, type: string, event?: any): void {
    this.callBack.emit({ inputField: this.inputField, actionType: type, value: value, event: event });
  }

  alphanumericCheck(value: any): boolean {
    const code = value.keyCode;
    return ((code > 64 && code < 91) || (code > 96 && code < 123) || (code >= 48 && code <= 57));
  }
}
