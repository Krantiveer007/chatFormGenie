import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ChatbotWidgetComponent } from './components/chatbot-widget/chatbot-widget.component';
import { MaterialModule } from './modules/material.module';
import { HttpClientModule } from '@angular/common/http';
import { ViewSignUpComponent } from './components/view-sign-up/view-sign-up.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ChatbotWidgetComponent,
    MaterialModule,
    HttpClientModule,
    ViewSignUpComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
