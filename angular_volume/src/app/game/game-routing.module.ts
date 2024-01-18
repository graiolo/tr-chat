import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PongComponent } from './components/pong/pong.component';

const routes: Routes = [
  {
    pathMatch: 'full',
    path: '',
    component: PongComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GameRoutingModule {}
