import { AuthService } from './auth.service';
import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { AsyncPipe } from '@angular/common';
import { BehaviorSubject, filter, map, Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  imports: [RouterOutlet, HeaderComponent, AsyncPipe],
})
export class AppComponent {
  private showHeader = new BehaviorSubject<boolean>(true); // 👈 initial value
  showHeader$ = this.showHeader.asObservable();
  firstTime = true;

  constructor(private router: Router, private auth: AuthService) {}

  ngOnInit() {
    this.firstTime = false;
    this.showHeader$ = this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map(() => {
        const url = this.router.url;
        return !(
          url.startsWith('/auth/login') || url.startsWith('/auth/signup')
        );
      })
    );

    this.auth.init();
  }
}
