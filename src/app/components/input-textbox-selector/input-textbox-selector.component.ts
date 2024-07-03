import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, Output, EventEmitter, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AddInputTextboxComponent } from '../add-input-textbox/add-input-textbox.component';
import { MaterialModule } from 'app/modules/material.module';
import { ChatbotWidgetService } from 'app/services/chatbot-widget.service';
import { FlexLayoutModule } from '@angular/flex-layout';

@Component({
  selector: 'app-input-textbox-selector',
  standalone: true,
  imports: [
    MaterialModule,
    ReactiveFormsModule,
    CommonModule,
    AddInputTextboxComponent,
    FlexLayoutModule
  ],
  templateUrl: './input-textbox-selector.component.html',
  styleUrls: ['./input-textbox-selector.component.scss']
})
export class InputTextboxSelectorComponent implements OnInit, AfterViewChecked {

  @Input() inputSectionDetails: any = null;
  @Input() inputConditionDetails: any = null;
  @Input() followNewStyling = false;
  @Output() callBack = new EventEmitter<any>();

  constructor(private chatbotService: ChatbotWidgetService,
    private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
  }

  callBackMethod(event, indexes: [], parentFormControlName?: string): void {
    event['indexes'] = indexes;
    if (parentFormControlName) event['parentFormControlName'] = parentFormControlName;
    this.callBack.emit(event);
  }

  hasSubFields(field): boolean {
    return field.content ? true : false;
  }

  deleteSection(index: number): void {
    const deletedParams = [];
    this.inputSectionDetails[index].content?.forEach((field) => {
      deletedParams.push(field.formControlName);
    });
    this.inputSectionDetails.splice(index, 1);
    this.callBack.emit({ deletedParams: deletedParams, actionType: 'delete' });
  }

  checkValue(type, field, indexes?: any[], parentFormControlName?: string): any {
    if (field[type] === undefined || field[type] === null) return '';
    if (typeof field[type] !== 'object') return field[type];
    if (this.inputConditionDetails && this.inputConditionDetails[field[type].variableName] !== undefined) {
      if (this.inputConditionDetails[field[type].variableName] === null && type === 'isActive') return false;
      const val = this.inputConditionDetails[field[type].variableName];
      return (field.isDisabled && type === 'value' && !val)
        ? '--'
        : (this.isNotANumber(val) ? val : this.getCommifiedValue(val, field.inputCondition, field));
    }
    if (field[type].variableName && (!this.inputConditionDetails || this.inputConditionDetails[field[type].variableName] === undefined)) return '--';
    if (field[type].methodCall) {
      this.callBack.emit({ inputField: field, actionType: type, indexes: indexes, parentFormControlName: parentFormControlName });
      const val = this.chatbotService.latestValueSubject.getValue();
      return (field.isDisabled && type === 'value' && (val !== false && !val))
        ? '--'
        : ((field.fieldType === 'radioType' && type === 'value')
          ? this.getValuesFromOptions(val)
          : (this.isNotANumber(val) ? val : this.getCommifiedValue(val, field.inputCondition, field)));
    }
    if (typeof field[type] === 'object') return field[type];
    return '';
  }

  getCommifiedValue(value, inputCondition?: string, inputData?: any) {
    let decimalPoints = 2;
    if (inputData?.isDisabled && inputData?.inputType?.toString().split('_')?.length > 1) {

      decimalPoints = Number(inputData?.inputType.split('_')[1]);
    }
    const isNumber = Number(value) > 0;
    const isDecimalNumber = (isNumber && typeof (value) === 'string') ? value.includes('.') : false
    if (isDecimalNumber || inputCondition?.length) {
      const converToNum = inputData?.noDecimalChange ? value : Number(value);
      let fixingDigit = inputData?.noDecimalChange ? converToNum : (inputCondition === 'restrictDecimal' ? converToNum.toFixed(0) : converToNum.toFixed(decimalPoints));
      const parts = fixingDigit.toString().split('.');
      if (parts.length) {
        const formattedValue = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        parts[0] = formattedValue;
        fixingDigit = parts.join('.');
      }
      return fixingDigit;
    }
    return value;
  }

  getValuesFromOptions(val) {
    if (val && typeof (val) === 'string') {
      const convertToLowercase = val.toLowerCase();
      return convertToLowercase.includes('yes') ? 'Yes' : 'No';
    }
    return (val) ? 'Yes' : 'No';
  }

  getFlexSize(field): string | number {
    if (field.width) return field.width;
    return 100;
  }

  isNotANumber(val): boolean {
    return typeof (val) !== 'boolean' && (typeof (val) === 'number' || (!isNaN(Number(val)) && typeof (Number(val)) === 'number')) ? false : true;
  }

  getDisplayValue(type, field, indexes?: any[], parentFormControlName?: string): any {
    const retVal = this.checkValue(type,field, indexes, parentFormControlName);
    if(retVal.value) return retVal.value
    return retVal;
  }

  ngAfterViewChecked() {
    this.cdr.detectChanges();
  }

  // format of creating inputSectionDetails data: 
  // [{
  //   content: [ //section
  //     {
  //       label: 'section',
  //       isDisabled: true,
  //       value: 'Yes',
  //     },
  //     {
  //       content: [ //field
  //         {
  //           content: [ //subFieldArray
  //             {
  //               label: 'subFieldArray',
  //               isDisabled: true,
  //               value: 'Yes',
  //             },
  //             {
  //               content: [ // subField
  //                 {
  //                   label: 'subField',
  //                   isDisabled: true,
  //                   value: 'Yes',
  //                 },
  //                 {
  //                   content: [// protonLevel
  //                     {
  //                       label: 'protonLevel',
  //                       isDisabled: true,
  //                       value: 'Yes',
  //                     }
  //                   ]
  //                 }
  //               ]
  //             }
  //           ]
  //         }
  //       ]
  //     }
  //   ]
  // }]

}
