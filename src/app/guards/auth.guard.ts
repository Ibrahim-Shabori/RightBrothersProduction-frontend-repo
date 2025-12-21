import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
  UrlTree,
  RouterStateSnapshot,
  ActivatedRouteSnapshot,
} from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    return this.authService.authStatus$.pipe(
      map((isLoggedIn) => {
        if (!isLoggedIn) {
          return this.router.createUrlTree(['/auth/signin'], {
            queryParams: { returnUrl: state.url },
          });
        }
        return true;
      })
    );
  }
}
