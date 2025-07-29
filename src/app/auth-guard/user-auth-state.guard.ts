import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { UserService } from '../services/common/user.service';
import { environment } from '../../environments/environment';

export const userAuthStateGuard = (
  next: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree => {
  const userService = inject(UserService);
  const router = inject(Router);

  if (!userService.isUser) {
    return true;
  }
  return router.navigate([environment.userBaseUrl]);
};
