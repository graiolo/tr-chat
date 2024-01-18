import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { inject } from '@angular/core';

export const loginGuard: CanActivateFn = () => {
  const auth: AuthService = inject(AuthService);
  const router: Router = inject(Router);

  if (auth.getToken() === '') {
    return true;
  } else {
    router.navigate(['/trascendence/home/']);
    return false;
  }
};
