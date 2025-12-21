import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { BehaviorSubject, Observable, Subject, tap } from 'rxjs';
import { environment } from '../../environments/environment';

declare const google: any;

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private clientId = environment.googleClientId;
  private apiUrl = environment.apiUrl;

  private googleResponseSubject = new Subject<any>();
  googleResponse$ = this.googleResponseSubject.asObservable();

  // Initialize status by checking validity, not just existence
  authStatus$ = new BehaviorSubject<boolean>(this.isTokenValid());

  constructor(private http: HttpClient, private router: Router) {}

  // --- 1. Login Logic ---
  login(credentials: {
    email: string | null;
    password: string | null;
  }): Observable<any> {
    return this.http
      .post<{ token: string }>(`${this.apiUrl}/auth/signin`, credentials)
      .pipe(
        tap((response) => {
          this.handleLoginSuccess(response.token);
        })
      );
  }

  // --- 2. Google Logic ---
  loginWithGoogle(idToken: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/google`, { idToken }).pipe(
      tap((response) => {
        this.handleLoginSuccess(response.token);
      })
    );
  }

  private handleLoginSuccess(token: string) {
    localStorage.setItem('jwt', token);
    this.authStatus$.next(true);
  }

  // --- 3. Role Management (The Fix) ---
  // Don't store role separately. Extract it when asked.
  getUserRole(): string | string[] | null {
    const token = localStorage.getItem('jwt');
    if (!token) return null;

    try {
      const decoded: any = jwtDecode(token);
      return decoded['role'] || null;
    } catch (e) {
      return null;
    }
  }

  getCurrentUserId(): string | null {
    const token = localStorage.getItem('jwt');
    if (!token) return null;
    try {
      const decoded: any = jwtDecode(token);
      return decoded['sub'] || null;
    } catch (e) {
      return null;
    }
  }

  // --- 4. Token Validity Check ---
  private isTokenValid(): boolean {
    const token = localStorage.getItem('jwt');
    if (!token) return false;

    try {
      const decoded: any = jwtDecode(token);
      const isExpired = decoded.exp * 1000 < Date.now(); // Check expiration
      if (isExpired) {
        this.logout(); // Clean up if expired
        return false;
      }
      return true;
    } catch (e) {
      return false; // Invalid token format
    }
  }

  // --- 5. Logout ---
  logout() {
    localStorage.removeItem('jwt');
    this.authStatus$.next(false);
    this.router.navigate(['/auth/signin']);
  }

  getToken(): string | null {
    return localStorage.getItem('jwt');
  }

  init() {
    google.accounts.id.initialize({
      client_id: this.clientId,
      callback: (response: any) => {
        this.googleResponseSubject.next(response);
      },
    });
  }

  prompt() {
    google.accounts.id.prompt();
  }

  // Helper for signup if needed
  signup(data: any): Observable<any> {
    return this.http
      .post<{ token: string }>(`${this.apiUrl}/auth/signup`, data)
      .pipe(tap((res) => this.handleLoginSuccess(res.token)));
  }
}
