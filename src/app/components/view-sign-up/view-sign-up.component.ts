import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, UntypedFormGroup } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from 'app/modules/material.module';
import { InputTextboxSelectorComponent } from '../input-textbox-selector/input-textbox-selector.component';
import { ChatbotWidgetService } from 'app/services/chatbot-widget.service';

@Component({
  selector: 'app-view-sign-up',
  standalone: true,
  imports: [
    InputTextboxSelectorComponent,
    BrowserAnimationsModule,
    MaterialModule,
  ],
  templateUrl: './view-sign-up.component.html',
  styleUrls: ['./view-sign-up.component.scss']
})
export class ViewSignUpComponent {
  formGroup: UntypedFormGroup = this.fb.group({});
  inProgress = false;
  metaData: any[] = [];
  // [
  //   {
  //     heading: 'Sign Up Details',
  //     isActive: true,
  //     content: [
  //       {
  //         isDisabled: true,
  //         label: 'First Name',
  //         value: 'DPW'
  //       },
  //       {
  //         isDisabled: true,
  //         label: 'Last Name',
  //         value: 'Form Genie'
  //       },
  //       {
  //         isDisabled: true,
  //         label: 'Email',
  //         value: 'dpwFormGenie@gmail.com'
  //       },
  //       {
  //         isDisabled: true,
  //         label: 'Contact Code',
  //         value: '+91'
  //       },
  //       {
  //         isDisabled: true,
  //         label: 'Phone number',
  //         value: '9139213922'
  //       },
  //       {
  //         isDisabled: true,
  //         label: 'Expected Annual Transaction Volumes / Annual Turnover',
  //         value: 'Up to $10M'
  //       },
  //     ]
  //   }
  // ];
  constructor(private fb: FormBuilder,
    private chatbotService: ChatbotWidgetService) {
    this.chatbotService.signupMetaData.subscribe((instance: any) => {
      if (instance) {
        const content = this.metaData[0].content;
        if (content?.length) {
          this.metaData[0].content.push(instance);
        } else {
          this.metaData[0]['content'] = [instance];
        }
      }
    });
  }
}
