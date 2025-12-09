import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth.service';
import { MenuItem } from 'primeng/api';

// PrimeNG Modules
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MenubarModule,
    ButtonModule,
    AvatarModule,
    BadgeModule,
    TagModule,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  // UPDATED HOST:
  // 1. top-0: Touches the top of the browser (no gap).
  // 2. w-full: Spans the entire width.
  // 3. z-50: Stays on top of content.
  host: {
    class: 'block fixed top-5 z-50 w-full',
  },
})
export class HeaderComponent implements OnInit {
  items: MenuItem[] | undefined;
  isLoggedIn: boolean = false;
  role: string | null = null;

  constructor(public auth: AuthService, private router: Router) {}

  ngOnInit() {
    this.auth.authStatus$.subscribe((status) => {
      this.isLoggedIn = status;
      this.role = localStorage.getItem('role');
      this.updateMenu();
    });
  }

  updateMenu() {
    this.items = [
      { label: 'الرئيسية', icon: 'pi pi-home', routerLink: '/' },
      {
        label: 'تحميل المنتج',
        icon: 'pi pi-download',
        routerLink: '/download',
        styleClass: 'font-bold text-primary-600',
      },
      {
        label: 'مركز التطوير',
        icon: 'pi pi-code',
        items: [
          {
            label: 'لوحة المتابعة',
            icon: 'pi pi-chart-bar',
            routerLink: '/requests',
          },
          { separator: true },
          {
            label: 'الإبلاغ عن مشكلة',
            icon: 'pi pi-exclamation-circle',
            routerLink: '',
          },
          {
            label: 'اقتراح ميزة',
            icon: 'pi pi-star',
            routerLink: '/requests/requests-suggestions',
          },
        ],
      },
      { label: 'من نحن', icon: 'pi pi-info-circle', routerLink: '/about' },
      { label: 'تواصل معنا', icon: 'pi pi-envelope', routerLink: '/contact' },
    ];

    if (this.role === 'Admin') {
      this.items.push({
        label: 'إدارة النظام',
        icon: 'pi pi-cog',
        styleClass: 'text-red-600 font-bold',
        items: [
          {
            label: 'المستخدمين',
            icon: 'pi pi-users',
            routerLink: '/admin/users',
          },
          {
            label: 'الطلبات',
            icon: 'pi pi-list',
            routerLink: '/admin/requests',
          },
        ],
      });
    }
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/auth/signin']);
  }
}
