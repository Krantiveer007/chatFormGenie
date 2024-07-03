import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { PredictionResponseDraftPayload, QueryPayload, QueryResponse } from '../models/chatbot-widget.model';

@Injectable({
  providedIn: 'root'
})
export class ChatbotWidgetService {

  latestValueSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  signupMetaData: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  rootUrl = 'http://127.0.0.1:5000'
  predictionMock = {
    select: {
      fieldType: 'selectType',
      label: 'Product Type',
      key: 'productType',
      options: ['test 1', 'test 2', 'test 3']
    },
    selectWithKeyValue: {
      fieldType: 'keyValueSelectType',
      label: 'Product Type',
      key: 'productType',
      options: [
        {
          key: 'test1',
          value: 'test 1'
        },
        {
          key: 'test2',
          value: 'test 2'
        },
        {
          key: 'test3',
          value: 'test 3'
        }
      ]
    },
    date: {
      fieldType: 'dateType',
      label: 'Date',
      key: 'dateType'
    },
    radio: {
      fieldType: 'radioType',
      label: 'Product Type',
      key: 'productType',
    },
    input: {
      fieldType: 'inputType',
      label: 'Product Type',
      key: 'productType',
    },
    checkbox: {
      fieldType: 'checkboxBtn',
      label: 'Product Type',
      key: 'productType',
      options: [
        {
          checked: false,
          name: 'test 1'
        },
        {
          checked: false,
          name: 'test 2'
        },
        {
          checked: false,
          name: 'test 3'
        }
      ]
    },
    multiselect: {
      fieldType: 'multiSelectType',
      label: 'Product Type',
      key: 'productType',
      options: [
        {
          selected: false,
          value: 'test1',
          viewValue: 'test 1'
        },
        {
          selected: false,
          value: 'test2',
          viewValue: 'test 2'
        },
        {
          selected: false,
          value: 'test3',
          viewValue: 'test 3'
        }
      ]
    }
  }
  constructor(private httpClient: HttpClient) {
  }

  getQueries(params: QueryPayload): Observable<QueryResponse> {
    const url: string = `${this.rootUrl}/metadata`;
    let httpParams = new HttpParams();
    if (params) {
      httpParams = Object.keys(params).reduce((acc, key) => {
        const paramKey = key as keyof QueryPayload;
        return acc.set(paramKey as string, params[paramKey] as any);
      }, httpParams);
    }
    // return this.httpClient.get<QueryResponse>(url, { params: httpParams });
    return of({
      meta: [
        {
          category_id: 123,
          category_type: 'general',
          fieldType: 'text',
          label: 'Please choose the module type you want to proceed with',
        },
        {
          category_id: 123,
          category_type: 'general',
          fieldType: 'text',
          label: 'You can either select from below drop down or type in the input field below',
        },
        {
          category_id: 123,
          category_type: 'module',
          fieldType: 'selectType',
          label: 'Module Type',
          options: ['Apply Finance', 'Credit Facility']
        }
      ]
    });
  }


  // in case of text typed, with response select
  postMessages(params: FormData): Observable<PredictionResponseDraftPayload> {
    const url: string = `${this.rootUrl}/predict`;
    // return this.httpClient.post<PredictionResponseDraftPayload>(url, params);
    return of({
      predictedMessage: 'save the message',
      command: 'save',
      predictedMessageId: 12323,
      category_id: 123,
      category_type: 'exit'
    });
    // for user confirmation if, always ask for Yes/No
    /*
      if (success) {
          predictedMessage: 'AA'
          category_id
          predictedMessageId
      } else if (languageChange) {
          predictedMessage: 'Generic message',
        // API for language -> this.getQueries with Language Param
      } else if (goBack) {
          predictedMessage: 'Generic message',
        // API for language -> this.getQueries with command, category_type, category_id
        // 
      } else if (reset) {
          predictedMessage: 'Generic message',
        // API for language -> this.getQueries without anything
      } else if (exit) {
          predictedMessage: 'Generic message',
        // API for language -> this.getQueries with Language Param
        // Chat bot close and clear everything, 5 second
      } else if (save/submit) {
          predictedMessage: 'Generic message',
        // API for language -> call save as draft api, with command
        //
      } else if (unknown) {
          predictedMessage: 'Generic message',
        // API for language -> this.getQueries with command, category_type, category_id
        //
      }
    */
  }

  saveAsDraft(params: FormData): Observable<any> {
    const url: string = `${this.rootUrl}/metadata/save`;
    return this.httpClient.post(url, params);
  }

  getSubmittedForm(): Observable<any> {
    const url: string = `${this.rootUrl}/metadata/submittedForm`;
    return this.httpClient.get<any>(url);
  }

  // Get to get respnse from backend for questions


  // Predict api for response (chat bot input via user)
  // Response, input, prediction,
  // patch value


  // Save as draft - incase user selects from field types, after every post call.
}
