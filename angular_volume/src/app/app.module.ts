import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SharedModule } from './shared/shared.module';
import { FeaturesModule } from './features/features.module';

import { CoreModule } from './core/core.module';
import { HeaderInterceptor } from './core/interceptors/header.interceptor';
import { RedirectionGateway } from './core/services/redirection.gateway';
import { GameModule } from './game/game.module';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    CoreModule,
    SharedModule,
    FeaturesModule,
    GameModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HeaderInterceptor,
      multi: true,
    },
    RedirectionGateway,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
