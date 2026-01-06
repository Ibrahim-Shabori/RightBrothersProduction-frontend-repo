import { Routes } from '@angular/router';
import { DashboardHomeComponent } from './pages/dashboard-home/dashboard-home.component';
import { UserManagementComponent } from './pages/user-management/user-management.component';
import { RequestManagementComponent } from './pages/request-management/request-management.component';
import { ReviewQueueComponent } from './pages/review-queue/review-queue.component';
import { CategoryManagementComponent } from './pages/category-management/category-management.component';

export const ADMIN_ROUTES: Routes = [
  {
    // 1. THE SHELL
    // When the URL is '/admin', load the Layout (Sidebar + RouterOutlet)
    path: '',
    loadComponent: () =>
      import('./admin-layout/admin-layout.component').then(
        (m) => m.AdminLayoutComponent
      ),

    // 2. THE CHILDREN
    // These render INSIDE the <router-outlet> of the AdminLayout
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

      // Dashboard Home
      {
        path: 'dashboard',
        component: DashboardHomeComponent,
        title: 'لوحة التحكم',
      },

      // --- Placeholders for Future Pages ---
      // (We point them to DashboardHome temporarily so links don't break)

      // Users Management
      {
        path: 'users',
        component: UserManagementComponent,
        title: 'إدارة المستخدمين',
      },

      // Categories Management
      {
        path: 'categories',
        component: CategoryManagementComponent,
        title: 'إدارة أنواع المقترحات',
      },

      // Requests / Cafes
      {
        path: 'requests',
        component: RequestManagementComponent,
        title: 'إدارة المقترحات',
      },

      // Review Queue
      {
        path: 'review-queue',
        component: ReviewQueueComponent,
        title: 'قائمة المراجعة',
      },
    ],
  },
];
