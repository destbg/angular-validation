import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ValidationModule } from 'src/validation';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { InputControlComponent } from './input-control/input-control.component';
import { ValidationPageComponent } from './validation-page/validation-page.component';
import { ValidationSubClassComponent } from './validation-sub-class/validation-sub-class.component';

@NgModule({
    declarations: [AppComponent, ValidationPageComponent, ValidationSubClassComponent, InputControlComponent],
    imports: [BrowserModule, AppRoutingModule, ValidationModule],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule { }
