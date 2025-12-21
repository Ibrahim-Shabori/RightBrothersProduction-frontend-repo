import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service'; // Import your service

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService); // Inject your existing service

  // 1. Get token from your service (Assuming you have a method/getter for it)
  // If your token is private in AuthService, make a getter: get token() { ... }
  const myToken = authService.getToken();

  // 2. Attach Token
  if (myToken) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${myToken}`,
      },
    });
  }

  // 3. Handle Errors
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // CRITICAL: Call your service's logout method.
        // This ensures your authStatus$ is updated to false,
        // and your specific logout logic (redirects, cleaning user data) runs.
        authService.logout();
      }
      return throwError(() => error);
    })
  );
};
