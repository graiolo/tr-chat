import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GameRoutingModule } from './game-routing.module';
import { PongComponent } from './components/pong/pong.component';
import { SharedModule } from '../shared/shared.module';
import { FeaturesModule } from '../features/features.module';


@NgModule({
  declarations: [PongComponent],
  imports: [CommonModule, SharedModule, GameRoutingModule, FeaturesModule],
})
export class GameModule {}
