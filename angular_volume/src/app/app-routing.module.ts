import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { loginGuard } from './core/guards/login.guard';

const routes: Routes = [
  {
    path: 'transcendence',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/features-routing.module').then(
        (mod) => mod.FeaturesRoutingModule
      ),
  },
  {
    path: '',
    canActivate: [loginGuard],
    loadChildren: () =>
      import('./shared/shared-routing.module').then(
        (mod) => mod.SharedRoutingModule
      ),
  },
  {
    path: '**',
    redirectTo: '',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
