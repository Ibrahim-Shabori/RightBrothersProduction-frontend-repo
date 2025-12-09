import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { RouterOutlet, RouterModule } from '@angular/router';
import { SelectButtonModule } from 'primeng/selectbutton'; // or import { SelectButton } in v19+ standalone
import { CardModule } from 'primeng/card';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-auth',
  imports: [
    CommonModule,
    RouterOutlet,
    SelectButtonModule,
    CardModule,
    RouterModule,
    FormsModule,
  ],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css',
})
export class AuthComponent implements OnInit {
  navOptions = [
    { label: 'دخول', value: 'signin' },
    { label: 'إنشاء حساب', value: 'signup' },
  ];

  currentRoute: string = 'signin';

  constructor(private router: Router) {}

  ngOnInit() {
    this.syncButtonWithUrl(this.router.url);

    // Keep button synced if user uses browser "Back" button
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.syncButtonWithUrl(event.urlAfterRedirects);
      }
    });
  }

  syncButtonWithUrl(url: string) {
    this.currentRoute = url.includes('signup') ? 'signup' : 'signin';
  }

  onRouteSwitch(event: any) {
    if (event.value) {
      this.router.navigate(['auth', event.value]);
    }
  }
}
