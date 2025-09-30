import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { BehaviorSubject, Observable, Subject, tap } from 'rxjs';
import { environment } from '../environments/environment';

declare const google: any;

export interface JwtPayload {
  unique_name: string; // userName
  email: string;
  role: string | string[]; // could be string or array
  exp: number;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // For google one-tap
  private clientId = environment.googleClientId;
  // My .NET API
  private apiUrl = environment.apiUrl;

  private googleResponseSubject = new Subject<any>();
  googleResponse$ = this.googleResponseSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: {
    email: string | null;
    password: string | null;
  }): Observable<any> {
    return this.http
      .post<{ token: string }>(`${this.apiUrl}/auth/signin`, credentials)
      .pipe(
        tap((response) => {
          if (response && response.token) {
            this.saveToken(response.token); // ✅ store token
            this.authStatus$.next(true); // notify logged in
          }
        })
      );
  }

  signup(data: {
    fullname: string | null;
    phoneNumber: string | null;
    email: string | null;
    password: string | null;
  }): Observable<any> {
    return this.http
      .post<{ token: string }>(`${this.apiUrl}/auth/signup`, data)
      .pipe(
        tap((response) => {
          this.saveToken(response.token);
          this.authStatus$.next(true);
        })
      );
  }

  // For google one-tap
  init() {
    google.accounts.id.initialize({
      client_id: this.clientId,
      callback: (response: any) => {
        this.googleResponseSubject.next(response);
      },
    });
  }

  loginWithGoogle(idToken: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/google`, { idToken }).pipe(
      tap((response) => {
        this.saveToken(response.token);
        this.authStatus$.next(true);
      })
    );
  }

  prompt() {
    console.log('Prompting Google One Tap');
    google.accounts.id.prompt(); // show the popup
  }

  // Store JWT
  saveToken(token: string) {
    localStorage.setItem('jwt', token);
    if (!token) return;
    const decoded: any = jwtDecode(token);
    const role =
      decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    localStorage.setItem('role', role);
  }

  // Get JWT
  getToken(): string | null {
    return localStorage.getItem('jwt');
  }

  // Logout
  authStatus$ = new BehaviorSubject<boolean>(!!localStorage.getItem('jwt'));

  logout() {
    localStorage.removeItem('jwt');
    localStorage.removeItem('role');
    this.authStatus$.next(false);
  }
}
