import { TestBed } from '@angular/core/testing';

import { ChatbotWidgetService } from './chatbot-widget.service';

describe('ChatbotWidgetService', () => {
  let service: ChatbotWidgetService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChatbotWidgetService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
