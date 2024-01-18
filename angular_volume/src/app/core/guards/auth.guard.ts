import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { UserService } from '../services/user.service';

export const authGuard: CanActivateFn = async () => {
  const router: Router = inject(Router);
  const userService: UserService = inject(UserService);

  try {
    await userService.getUserInfo();
    return true;
  } catch (error) {
    userService.deleteAllCookie();
    router.navigate(['/login']);
    return false;
  }
};
