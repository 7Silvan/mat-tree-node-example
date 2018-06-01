import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

// material2 modules
import { MatIconModule } from '@angular/material/icon';
import { MatTreeModule } from '@angular/material/tree';

import { AppComponent } from './app.component';
import { ExampleOneComponent } from './components/example-one/example-one.component';

@NgModule({
  declarations: [
    AppComponent,
    ExampleOneComponent
  ],
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    MatIconModule,
    MatTreeModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
