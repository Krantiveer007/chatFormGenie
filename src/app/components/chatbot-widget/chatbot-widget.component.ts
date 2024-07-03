import { ChangeDetectorRef, Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';

import { MetaData, PredictionPayload, PredictionResponseDraftPayload, QueryPayload, QueryResponse } from '../../models/chatbot-widget.model';
import { ChatbotWidgetService } from '../../services/chatbot-widget.service';

import { CommonModule } from '@angular/common';
import { InputTextboxSelectorComponent } from '../input-textbox-selector/input-textbox-selector.component';
import { MaterialModule } from 'app/modules/material.module';
import { UiService } from 'app/services/ui.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

interface ContentProps {
  audioUrl?: string;
  customContent?: any;
}

interface Message {
  content: string | Blob;
  fromUser: boolean;
  timestamp: Date;
  contentProps?: ContentProps;
}

@Component({
  selector: 'app-chatbot-widget',
  standalone: true,
  imports: [
    MaterialModule,
    ReactiveFormsModule,
    CommonModule,
    InputTextboxSelectorComponent,
    BrowserAnimationsModule
  ],
  templateUrl: './chatbot-widget.component.html',
  styleUrls: ['./chatbot-widget.component.scss']
})
export class ChatbotWidgetComponent {
  messages: Message[] = [
    {
      content: `Hello! I'm DPW, here to assist you.`,
      fromUser: false,
      timestamp: new Date(),
    },
    {
      content: `Feel free to ask me any questions you have...`,
      fromUser: false,
      timestamp: new Date(),
    }
  ];
  audioUrl: string = ''

  private shouldScrollToBottom: boolean = true;
  targetLanguage = 'en';

  chatForm: UntypedFormGroup; // Remove initialization here

  isChatOpen: boolean = false;
  isWidgetAnimated: boolean = true;
  mediaRecorder: MediaRecorder | null = null;
  chunks: Blob[] = [];
  isRecording: boolean = false;

  @ViewChild('messageContainer') private messageContainerRef: ElementRef<HTMLElement>;

  constructor(private fb: UntypedFormBuilder,
    private renderer: Renderer2,
    private cdr: ChangeDetectorRef,
    private chatbotService: ChatbotWidgetService,
    private uiService: UiService) { }

  ngOnInit() {
    this.chatForm = this.fb.group({
      userInput: ['']
    });
  }

  getQueries(params?: QueryPayload): void {
    this.chatbotService.getQueries(params).subscribe({
      next: (response: QueryResponse) => {
        if (response.meta) {
          response.meta.forEach((meta: MetaData) => {
            let botResponse: Message = { content: meta.label, fromUser: false, timestamp: new Date() };
            if (meta.fieldType !== 'text') {
              botResponse.content = meta.fieldType;
              botResponse.contentProps = this.getMetaData(meta);
            } else {
              this.setupPostParams(meta.category_id, meta.category_type);
            }
            this.messages.push(botResponse);
          });
          this.shouldScrollToBottom = true;
          this.scrollToBottom();
        }
      },
      error: (error) => {
        this.uiService.snackbar('API is failing')
        console.log('Chatbot push API failure: ', error);
      }
    });
  }

  ngAfterViewChecked() {
    if (this.messages.length > 0) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  toggleChat() {
    this.isChatOpen = !this.isChatOpen;
    this.isWidgetAnimated = !this.isChatOpen;
    if (this.isChatOpen) {
      this.getQueries();
    }
  }

  sendMessage(customEventVal?: any) {
    if (this.chatForm.valid) {
      const userInput = customEventVal
        ? customEventVal
        : this.chatForm.get('userInput')?.value.trim();
      if (userInput) {
        const userMessage: Message = { content: userInput, fromUser: true, timestamp: new Date() };
        this.messages.push(userMessage);
        this.chatForm.patchValue({ userInput: '' });
        // Simulate bot response (replace with actual backend integration)
        this.shouldScrollToBottom = true;
        this.scrollToBottom();
        const { category_id, category_type } = this.chatForm.get('postParams').value;
        const params: PredictionPayload = {
          category_id,
          category_type,
          message: userMessage.content
        }
        const formData = new FormData();
        for (let param in params) {
          formData.append(param, params[param]);
        }
        // formData.append('target_language', this.targetLanguage);
        this.postMessages(formData);
      }
    }
  }

  saveAsDraft(params: PredictionResponseDraftPayload, calledFrom?: string): void {
    if (params) {
      const formData = new FormData();
      for (const param in params) {
        formData.append(param, params[param]);
      }

      // formData.append('answer', JSON.stringify(customEvent));
      this.chatForm.patchValue({ userInput: '' });
      // const customEventVal: any = Object.values(customEvent).length
      //   ? Object.values(customEvent)[0]
      //   : '';
      const userMessage: Message = { content: params.predictedMessage, fromUser: true, timestamp: new Date() };
      if (calledFrom === 'queryResponse') {
        userMessage.content = 'Yes';
      }
      this.messages.push(userMessage);
      this.shouldScrollToBottom = true;
      this.scrollToBottom();
      this.chatbotService.saveAsDraft(formData).subscribe({
        next: (response: any) => {
          if (response) {
            this.shouldScrollToBottom = true;
            this.scrollToBottom();
          }
        },
        error: (error) => {
          this.uiService.snackbar('API is failing')
          console.log('Chatbot push API failure: ', error);
        }
      });
      this.getQueries({
        category_id: params.category_id,
        category_type: params.category_type
      });
    }
  }

  record() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error('getUserMedia not supported on your browser!');
      return;
    }

    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        this.mediaRecorder = new MediaRecorder(stream);
        this.mediaRecorder.ondataavailable = (event) => {
          this.chunks.push(event.data);
        };
        this.mediaRecorder.onstop = () => {
          const blob = new Blob(this.chunks, { type: 'audio/wav' });
          const audioUrl = this.createBlobUrl(blob);
          const audioMessage: Message = { content: blob, fromUser: true, timestamp: new Date(), contentProps: { audioUrl } };
          this.messages.push(audioMessage);
          const { category_id, category_type } = this.chatForm.get('postParams').value;
          const params: PredictionPayload = {
            category_id,
            category_type,
            file: new File([blob], 'audio.wav', { type: 'audio/wav' })
          }
          const formData = new FormData();
          for (let param in params) {
            formData.append(param, JSON.stringify(params[param]));
          }
          // formData.append('target_language', this.targetLanguage);
          this.postMessages(formData);
          // Do something with the recorded audio blob (e.g., upload to server, play, etc.)
          this.chunks = []; // Clear chunks for next recording
          this.cdr.detectChanges();
        };
        this.mediaRecorder.start();
        this.cdr.detectChanges();
        this.isRecording = true;
      })
      .catch((err) => {
        console.error('Error accessing microphone:', err);
      });
  }

  postMessages(params: any) {
    this.chatbotService.postMessages(params).subscribe({
      next: (response: PredictionResponseDraftPayload) => {
        if (response) {
          let botResponse: Message = { content: response.predictedMessage, fromUser: false, timestamp: new Date() };
          this.messages.push(botResponse);
          if (response.command) {
            const radioProps: MetaData = {
              category_id: response.category_id,
              category_type: 'queryResponse',
              fieldType: 'radioType',
              label: 'Please select',
              queryResponse: response
            };
            let botResponse: Message = { content: radioProps.label, fromUser: false, timestamp: new Date() };
            botResponse.content = radioProps.fieldType;
            botResponse.contentProps = this.getMetaData(radioProps);
            this.messages.push(botResponse);
            this.chatForm.get('userInput').disable();
          }
          this.shouldScrollToBottom = true;
          this.scrollToBottom();
        }
      },
      error: (error) => {
        this.uiService.snackbar('API is failing')
        console.log('Chatbot push API failure: ', error);
      }
    })
  }

  actionOnPredictionConfirmation(prediction: PredictionResponseDraftPayload): void {
    switch (prediction.command) {
      case 'success':
        this.saveAsDraft(prediction, 'queryResponse');
        break;
      case 'reset':
        this.getQueries();
        break;
      case 'exit':
        const userMessage: Message = { content: 'Yes', fromUser: true, timestamp: new Date() };
        this.messages.push(userMessage);
        const botMessage: Message = { content: 'Exiting the session in 5 seconds...', fromUser: false, timestamp: new Date() };
        this.messages.push(botMessage);

        let count = 5;
        const countdownInterval = setInterval(() => {
          count--;
          if (count >= 0) {
            botMessage.content = `Exiting the session in ${count} seconds...`;
            this.scrollToBottom();
          } else {
            clearInterval(countdownInterval);
            botMessage.content = 'Exiting the session...';
            setTimeout(() => {
              this.messages = [];
              this.chatForm.reset();
              this.isChatOpen = false;
            }, 1000); // Delay clearing for 1 second after countdown finishes
          }
        }, 1000); // Repeat every second (1000 ms)
        this.chatForm.get('userInput').disable();
        this.shouldScrollToBottom = true;
        this.scrollToBottom();
        break;
      case 'save':
      case 'submit':
      case 'questionAnswers':
        this.saveAsDraft(prediction);
        break;
      case 'languageChange':
      case 'goBack':
      case 'unknown':
        this.getQueries({
          category_id: prediction.category_id,
          category_type: prediction.category_type,
          command: prediction.command
        });
        break;
      default:
        console.log('unknown options');
    }
  }

  private createBlobUrl(blob: Blob): string {
    return URL.createObjectURL(blob);
  }

  private getMetaData(rawMetaData: MetaData): any {
    const { category_id, category_type, fieldType, label, options, queryResponse } = rawMetaData;
    const uniqueNameForOptions = category_type + '_' + fieldType + '_' + label;
    const metaForFieldType = this.getMetaForFieldType(fieldType, label, category_type, uniqueNameForOptions, queryResponse);
    if (this.chatForm.controls[category_type]) {
      this.chatForm.get(category_type).setValue('');
    } else {
      this.chatForm.addControl(category_type, new UntypedFormControl(''));
    }
    this.setupPostParams(category_id, category_type);
    const metaData = {
      customContent: {
        meta: [{
          content: [metaForFieldType]
        }],
        conditions: {
          chatForm: this.chatForm
        }
      }
    }
    if (options) {
      if (fieldType === 'multiSelectType') {
        const multiSelectOptions = options.map((item) => ({
          selected: false,
          value: item.key,
          viewValue: item.value
        }));
        metaData.customContent.conditions[uniqueNameForOptions] = options;
        metaData.customContent.conditions[`${uniqueNameForOptions}_all`] = JSON.parse(JSON.stringify(multiSelectOptions));
        metaData.customContent.conditions[`${uniqueNameForOptions}_selected`] = [];
      } else if (fieldType === 'checkboxBtn') {
        const checkboxOptions = options.map((item) => ({
          checked: false,
          name: item.value
        }));
        metaData.customContent.conditions[uniqueNameForOptions] = checkboxOptions;
      } else {
        metaData.customContent.conditions[uniqueNameForOptions] = options;
      }
    }
    // if (fieldType === 'fileSelector') {
    //   metaData.customContent.conditions['documentClassification'] = {
    //     ALLOWED_DOCUMENT_EXTENSIONS: [
    //       'pdf', 'png', 'doc', 'docx', 'jpg', 'jpeg', 'csv', 'xls', 'xlsx', 'ppt', 'pptx', 'zip'
    //     ],
    //     ALLOWED_DOCUMENT_SIZE_MBS: 10,
    //     message: 'Only pdf, png, doc, docx, jpg, jpeg, csv, xls, xlsx, ppt, pptx and zip files of up to 10MB accepted.'
    //   };
    // }
    return metaData;
  }

  setupPostParams(category_id: number, category_type: string): void {
    if (this.chatForm.controls['postParams']) {
      this.chatForm.get('postParams').setValue({
        category_id,
        category_type
      });
    } else {
      this.chatForm.addControl('postParams', new UntypedFormControl({
        category_id,
        category_type
      }));
    }
  }

  private getMetaForFieldType(fieldType: string, label: string, key: string, optionVariableName?: string, defaultValue?: any): any {
    switch (fieldType) {
      case 'selectType': {
        return {
          dropDownValues: { variableName: optionVariableName },
          fieldType: 'selectType',
          focusout: { methodCall: 'conditionCheck' },
          label: label,
          value: { methodCall: 'conditionCheck' },
          formControlName: key,
          selectionChange: { methodCall: 'conditionCheck' },
          required: false,
          showError: { methodCall: 'conditionCheck' },
          width: 100,
          appearance: 'outline',
          class1: 'chat-widget-form-fields'
        }
      }
      case 'dateType': {
        return {
          fieldType: 'dateType',
          focusout: { methodCall: 'conditionCheck' },
          label: label,
          min: { methodCall: 'conditionCheck' },
          max: { methodCall: 'conditionCheck' },
          blur: { methodCall: 'conditionCheck' },
          value: { methodCall: 'conditionCheck' },
          dateChange: { methodCall: 'conditionCheck' },
          formControlName: key,
          selectionChange: { methodCall: 'conditionCheck' },
          required: false,
          showError: { methodCall: 'conditionCheck' },
          width: 100,
          appearance: 'outline',
          class1: 'chat-widget-form-fields'
        }
      }
      case 'checkboxBtn': {
        return {
          fieldType: 'checkboxBtn',
          label: label,
          formControlName: key,
          checkboxOptions: { variableName: optionVariableName },
          click: { methodCall: 'conditionCheck' },
          required: true,
          width: 100,
        }
      }
      case 'radioType': {
        return {
          fieldType: 'radioType',
          isActive: { methodCall: 'conditionCheck' },
          label: label,
          value: { methodCall: 'conditionCheck' },
          formControlName: key,
          required: false,
          showError: { methodCall: 'conditionCheck' },
          change: { methodCall: 'conditionCheck' },
          radioOptions: ['Yes', 'No'],
          radioValues: [true, false],
          width: 100,
          appearance: 'outline',
          class: 'bold-value',
          class1: 'chat-widget-form-fields',
          defaultValue: defaultValue
        }
      }
      case 'keyValueSelectType': {
        return {
          dropDownValues: { variableName: optionVariableName },
          fieldType: 'keyValueSelectType',
          selectionChange: { methodCall: 'conditionCheck' },
          showError: { methodCall: 'conditionCheck' },
          label: label,
          formControlName: key,
          width: 100,
          appearance: 'outline',
          class1: 'chat-widget-form-fields'
        }
      }
      case 'multiSelectType': {
        return {
          dropDownValues: { variableName: optionVariableName },
          fieldType: 'multiSelectType',
          focusout: { methodCall: 'conditionCheck' },
          label: label,
          value: { methodCall: 'conditionCheck' },
          form: { variableName: 'chatForm' },
          formControlName: key,
          isActive: true,
          onBlurEmit: { methodCall: 'conditionCheck' },
          required: false,
          allOptions: { variableName: `${optionVariableName}_all` },
          selectedOptions: { variableName: `${optionVariableName}_selected` },
          showError: { methodCall: 'conditionCheck' },
          width: 100,
          appearance: 'outline',
          class: 'bold-value',
          class1: 'chat-widget-form-fields'
        }
      }
      // case 'fileSelector': {
      //   return {
      //     fieldType: 'fileSelector',
      //     label: label,
      //     documentClassification: { variableName: 'documentClassification' },
      //     documentDetails: { methodCall: 'conditionCheck' },
      //     showUploadMessage: true,
      //     fileUploaded: { methodCall: 'conditionCheck' },
      //     fileAction: { methodCall: 'conditionCheck' },
      //     width: 100,
      //     formControlName: key,
      //   }
      // }
      default: {
        return {
          fieldType: 'inputType',
          focusout: { methodCall: 'conditionCheck' },
          type: 'text',
          min: 0,
          isActive: { methodCall: 'conditionCheck' },
          label: label,
          value: { methodCall: 'conditionCheck' },
          formControlName: key,
          change: { methodCall: 'conditionCheck' },
          input: { methodCall: 'conditionCheck' },
          autocomplete: "off",
          required: false,
          inputType: "number",
          showHint: false,
          showError: { methodCall: 'conditionCheck' },
          width: 100,
          appearance: 'outline',
          class1: 'chat-widget-form-fields'
        }
      }
    }
  }

  handleInputFieldsEmitEvent(event): any {
    switch (event.actionType) {
      case 'value': {
        return this.chatbotService.latestValueSubject.next(this.chatForm.get(event.inputField.formControlName)?.value);
      }
      case 'click':
      case 'selectionChange':
      case 'dateChange':
      case 'change': {
        this.setFieldValue(event, this.chatForm);
        if (event.inputField.formControlName === 'queryResponse') {
          if (event.value) {
            // const allQueries = this.messages.filter((item) => item.contentProps);
            // if (allQueries.length > 1) {
            //   const lastUnAnsweredQuery = allQueries[allQueries.length - 2];
            //   const contentKey: any = lastUnAnsweredQuery.content;
            //   this.saveAsDraft({
            //     [contentKey]: event.inputField.defaultValue
            //   }, 'queryResponse');
            // }
            this.actionOnPredictionConfirmation(event.inputField.defaultValue);
          } else {
            this.chatForm.patchValue({ userInput: '' });
            const userMessage: Message = { content: 'No', fromUser: true, timestamp: new Date() };
            this.messages.push(userMessage);
            this.shouldScrollToBottom = true;
            this.scrollToBottom();
            const { category_id, category_type } = this.chatForm.get('postParams').value;
            this.getQueries({
              command: 'unknown',
              category_id,
              category_type
            });
          }
          // const value = (typeof (event.value) === 'boolean' || event.value === 0) ? event.value.toString() : event.value;
          this.chatForm.get('userInput').enable();
        } else {
          const value = (typeof (event.value) === 'boolean' || event.value === 0) ? event.value.toString() : event.value;
          const { category_id, category_type } = this.chatForm.get('postParams').value;
          this.saveAsDraft({
            category_id: category_id,
            category_type: category_type,
            command: 'save',
            predictedMessage: value,
          });
          // this.saveAsDraft({
          //   [event.inputField.formControlName]: value
          // });
        }
        break;
      }
      case 'focusout': {
        return this.chatForm.get(event.inputField.formControlName).markAsTouched();
      }
      case 'showError': {
        return this.checkFieldError(event, this.chatForm);
      }
      // case 'optionSelected': {
      //   const selectedValues = this.chatForm.get(event.inputField.formControlName).value.map(item => item.viewValue);
      //   this.sendMessage(selectedValues.join(', '));
      // }
      case 'blur':
      case 'onBlurEmit': {
        if (event.inputField.fieldType === 'multiSelectType') {
          const selectedValues = this.chatForm.get(event.inputField.formControlName).value.map(item => item.value);
          const { category_id, category_type } = this.chatForm.get('postParams').value;
          this.saveAsDraft({
            category_id: category_id,
            category_type: category_type,
            command: 'save',
            predictedMessage: selectedValues.join(', '),
          });
          // this.saveAsDraft({
          //   [event.inputField.formControlName]: selectedValues.join(', ')
          // });
        }
        return this.chatForm.get(event.inputField.formControlName).markAsTouched();
      }
      case 'min': {
        const expiryDate = new Date();
        return this.chatbotService.latestValueSubject.next(expiryDate);
      }
      case 'max': {
        const sixtyDaysAhead = new Date();
        sixtyDaysAhead.setDate(sixtyDaysAhead.getDate() + 60);
        return this.chatbotService.latestValueSubject.next(sixtyDaysAhead);
      }
      case 'isActive': {
        const formValue = this.chatForm.get(event.inputField.formControlName)?.value;
        const value = event.inputField.fieldType === 'radioType'
          ? formValue ? 'true' : 'false'
          : formValue;
        return this.chatbotService.latestValueSubject.next(value);
      }
      // case 'documentDetails': {
      //   const documentId = this.chatForm.get(event.inputField.formControlName).value;
      //   if (!documentId) {
      //     event.inputField['isActive'] = false;
      //     return;
      //   }
      //   if (documentId) {
      //     const ind = this.allDocuments['purchase_invoice'].findIndex((doc) => doc.documentId === documentId);
      //     return this.authService.latestValueSubject.next(this.allDocuments['purchase_invoice'][ind]);
      //   }
      //   return;
      // }
      // case 'fileUploaded': {
      //   return this.uploadDocument(event.value, 'purchase_invoice', control, event.inputField.formControlName);
      // }
      // case 'fileAction': {
      //   if (event.value?.actionType && event.value?.actionType !== 'delete') {
      //     return this.bhsService.viewOrDownloadDoc(event.value.element, event.value.actionType);
      //   }
      //   const ind = this.allDocuments['purchase_invoice'].findIndex(doc => doc.documentId === control.get(event.inputField.formControlName).value);
      //   return this.deleteDocument('purchase_invoice', ind);
      // }
    }
  }

  setFieldValue(event, control: any): void {
    if (event?.inputField?.commifiedInput) {
      event.value = event.value.replaceAll(',', '');
    }
    control.get(event.inputField.formControlName)?.setValue(event.value);
    control.get(event.inputField.formControlName)?.markAsTouched();
  }

  checkFieldError(event, control?: any): boolean {
    const val = control.get(event.inputField.formControlName)?.touched && (control.get(event.inputField.formControlName)?.status === 'INVALID');
    this.chatbotService.latestValueSubject.next(val);
    return val;
  }

  stopRecording() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
      this.cdr.detectChanges();
    }
  }

  adjustTextareaHeight(event: Event) {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    const maxHeight = 100; // Set your desired max height
    textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
  }

  onScroll(event: Event): void {
    const element = event.target as HTMLElement;
    const atBottom = element.scrollHeight - element.scrollTop === element.clientHeight;
    this.shouldScrollToBottom = atBottom;
  }

  scrollToBottom(): void {
    try {
      if (this.shouldScrollToBottom) {
        this.renderer.setProperty(this.messageContainerRef.nativeElement, 'scrollTop', this.messageContainerRef.nativeElement.scrollHeight);
      }
    } catch (err) { }
  }

  fetchSubmittedDetails(): void {
    this.chatbotService.getSubmittedForm().subscribe({
      next: (response) => {
        if (response) {
          this.chatbotService.signupMetaData.next(response);
        }
      },
      error: (error) => {
        this.uiService.snackbar('API is failing')
        console.log('Chatbot push API failure: ', error);
      }
    });
  }

  // ngAfterViewInit() {
  //   this.initDrag();
  // }

  // initDrag() {
  //   const widgetButton = this.widgetButton.nativeElement;
  //   let shiftX: number;
  //   let shiftY: number;

  //   const onDragStart = (event: MouseEvent) => {
  //     shiftX = event.clientX - widgetButton.getBoundingClientRect().left;
  //     shiftY = event.clientY - widgetButton.getBoundingClientRect().top;

  //     this.renderer.listen('document', 'mousemove', onDragMove);
  //     this.renderer.listen('document', 'mouseup', onDragEnd);
  //   };

  //   const onDragMove = (event: MouseEvent) => {
  //     widgetButton.style.left = event.clientX - shiftX + 'px';
  //     widgetButton.style.top = event.clientY - shiftY + 'px';
  //   };

  //   const onDragEnd = () => {
  //     this.renderer.listen('document', 'mousemove', onDragMove);
  //     this.renderer.listen('document', 'mouseup', onDragEnd);
  //   };

  //   this.renderer.listen(widgetButton, 'mousedown', onDragStart);
  // }
}
