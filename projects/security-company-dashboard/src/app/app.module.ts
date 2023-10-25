import { ToastrModule } from 'ngx-toastr';
import { HttpClient } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {
  CoreModule,
  SecurityCompanyLoaderFactory,
} from './modules/core/core.module';
import { IonicModule } from '@ionic/angular';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
@NgModule({
  declarations: [AppComponent],

  imports: [
    BrowserModule,
    BrowserAnimationsModule, // required animations module
    ToastrModule.forRoot({
      closeButton: true,       // Tap to dismiss
      preventDuplicates: true, // Count duplicates
      resetTimeoutOnDuplicate: true, // Reset timeout on duplicate
      includeTitleDuplicates: true, // Include title in duplicate checks
      newestOnTop: true, // New toasts on top
      disableTimeOut: false, // disableTimeOut = false
      positionClass: 'toast-bottom-center'
    }),
    AppRoutingModule,
    InfiniteScrollModule,
    CoreModule,

    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: SecurityCompanyLoaderFactory,
        deps: [HttpClient],
      },
    }),
    IonicModule.forRoot(),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
