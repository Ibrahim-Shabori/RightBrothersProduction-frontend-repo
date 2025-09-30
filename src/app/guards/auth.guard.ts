import { AuthService } from './../auth.service';
import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.authService.authStatus$.pipe(
      map((isLoggedIn) => {
        if (isLoggedIn) {
          return this.router.createUrlTree(['/']); // redirect if logged in
        }
        return true; // allow if not logged in
      })
    );
  }
}
