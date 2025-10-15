import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { ButtonComponent } from '../shared/button/button.component';
@Component({
  selector: 'app-header',
  imports: [RouterLink, AsyncPipe, ButtonComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  constructor(public auth: AuthService, private router: Router) {}
  isLoggedIn$!: Observable<boolean>;
  role = localStorage.getItem('role');

  ngOnInit() {
    this.isLoggedIn$ = this.auth.authStatus$;
  }
  logout() {
    this.auth.logout();
    this.router.navigate(['/auth/login']);
  }
  test() {
    console.log('clicked');
  }
}
