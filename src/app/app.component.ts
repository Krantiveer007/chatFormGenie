import { Component } from '@angular/core';
import { ChatbotWidgetService } from './services/chatbot-widget.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'dpw-form-genie';
  metaDataContent: any[] = [];
  constructor(private chatbotService: ChatbotWidgetService) {
    this.chatbotService.signupMetaData.subscribe((instance: any) => {
      if (instance) {
        this.metaDataContent.push(instance);
      }
    });
  }
}
