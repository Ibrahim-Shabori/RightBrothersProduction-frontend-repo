import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
// PrimeNG Imports
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge'; // Useful for "Pending Requests" count
import { RippleModule } from 'primeng/ripple';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule,
    AvatarModule,
    BadgeModule,
    RippleModule,
  ],
  templateUrl: './admin-sidebar.component.html',
  styleUrl: './admin-sidebar.component.css',
})
export class AdminSidebarComponent {
  // --- Inputs & Outputs (For Mobile Responsiveness) ---
  @Input() isMobileOpen: boolean = false;
  @Output() closeSidebar = new EventEmitter<void>();

  // --- Dynamic Data (You could fetch these counts from a service) ---
  pendingRequestsCount = signal<number>(5); // Example: 5 requests waiting
  adminName = signal<string>('Admin User');
  adminRole = signal<string>('Super Admin');

  // --- Navigation Menu Configuration ---
  menuItems = [
    {
      label: 'لوحة التحكم', // Dashboard
      icon: 'pi pi-home',
      route: '/admin/dashboard',
      exact: true,
    },
    {
      label: 'إدارة أنواع المقترحات', // Dashboard
      icon: 'pi pi-tags',
      route: '/admin/categories',
      exact: true,
    },
    {
      label: 'إدارة المستخدمين', // User Management
      icon: 'pi pi-users',
      route: '/admin/users',
      exact: false,
    },
    {
      label: 'إدارة المقترحات', // Request Management
      icon: 'pi pi-list',
      route: '/admin/requests',
      exact: false,
    },
    {
      label: 'قائمة المراجعة', // Review Queue (Critical)
      icon: 'pi pi-inbox',
      route: '/admin/review-queue',
      exact: false,
      showBadge: true, // Flag to show the notification badge
    },
  ];

  constructor(private router: Router) {}

  onLinkClick() {
    if (window.innerWidth < 768) {
      this.closeSidebar.emit();
    }
  }

  logout() {
    this.router.navigate(['/login']);
  }
}
