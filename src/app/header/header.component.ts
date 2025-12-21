import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MenuItem } from 'primeng/api';

// Services
import { AuthService } from '../services/auth.service';
import { ProfileService, UserProfileDto } from '../services/profile.service'; // 👈 Import ProfileService

// PrimeNG Modules
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { TagModule } from 'primeng/tag';
import { MenuModule } from 'primeng/menu';

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
    MenuModule,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  host: {
    class: 'block fixed top-5 z-50 w-full',
  },
})
export class HeaderComponent implements OnInit {
  items: MenuItem[] | undefined;
  userMenuItems: MenuItem[] | undefined;
  isLoggedIn: boolean = false;

  // 1. Data for the Avatar
  currentUser: UserProfileDto | null = null;
  userInitials: string = '';
  userProfilePic: string | undefined;

  constructor(
    public auth: AuthService,
    public profileService: ProfileService, // 👈 Inject Profile Service
    private router: Router
  ) {}

  ngOnInit() {
    // 2. Auth Status Listener
    this.auth.authStatus$.subscribe((status) => {
      this.isLoggedIn = status;
      this.updateMenu();
      this.updateUserMenu();

      if (status) {
        this.loadUserData(); // Load avatar/name when logged in
      } else {
        this.currentUser = null; // Clear data when logged out
        this.userProfilePic = undefined;
      }
    });

    // 3. Profile Update Listener (Radio Station)
    // If user changes pic in Settings, Header updates immediately
    this.profileService.profileRefresh$.subscribe(() => {
      if (this.isLoggedIn) {
        this.loadUserData();
      }
    });
  }

  // 4. Fetch User Data (Name & Picture)
  loadUserData() {
    this.profileService.getMyProfile().subscribe({
      next: (data) => {
        this.currentUser = data;

        // Calculate Initials
        this.userInitials = this.getInitials(data.fullName);

        // Calculate Picture URL (with Cache Buster)
        const rawUrl = this.profileService.getProfilePictureUrl(
          data.profilePictureUrl
        );
        if (rawUrl) {
          this.userProfilePic = `${rawUrl}?t=${new Date().getTime()}`;
        } else {
          this.userProfilePic = undefined;
        }
      },
      error: (err) => console.error('Header failed to load profile', err),
    });
  }

  getInitials(name: string | undefined): string {
    if (!name) return '';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  get role() {
    return this.auth.getUserRole();
  }

  getShortName(fullName: string | undefined): string {
    if (!fullName) return 'حسابي';

    return fullName.trim().split(' ').slice(0, 2).join(' ');
  }

  updateMenu() {
    this.items = [
      {
        label: 'الرئيسية',
        icon: 'pi pi-home',
        routerLink: '/',
        routerLinkActiveOptions: { exact: true },
      },
      {
        label: 'تحميل المنتج',
        icon: 'pi pi-download',
        routerLink: '/download',
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
            routerLink: '/requests-suggestions/bugs',
          },
          {
            label: 'اقتراح ميزة',
            icon: 'pi pi-star',
            routerLink: '/requests-suggestions/features',
          },
        ],
      },
      {
        label: 'عن الفريق',
        icon: 'pi pi-users',
        items: [
          { label: 'من نحن', icon: 'pi pi-info-circle', routerLink: '/about' },
          {
            label: 'تواصل معنا',
            icon: 'pi pi-envelope',
            routerLink: '/contact',
          },
        ],
      },
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

  updateUserMenu() {
    this.userMenuItems = [
      {
        label: 'حسابي',
        items: [
          {
            label: 'الملف الشخصي',
            icon: 'pi pi-user',
            routerLink: '/profile',
          },
          {
            label: 'طلباتي ونشاطي',
            icon: 'pi pi-history',
            routerLink: '/profile/contributions', // Updated to match your route
          },
          { separator: true },
          {
            label: 'خروج',
            icon: 'pi pi-power-off',
            command: () => this.logout(),
            styleClass: 'font-bold text-red-500',
          },
        ],
      },
    ];
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/auth/signin']);
  }
}
