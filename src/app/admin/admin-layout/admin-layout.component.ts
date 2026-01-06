import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

// --- Imports ---
// Adjust this path if your folder structure is slightly different
import { AdminSidebarComponent } from './../components/admin-sidebar/admin-sidebar.component';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, AdminSidebarComponent, ButtonModule],
  templateUrl: './admin-layout.component.html',
})
export class AdminLayoutComponent {
  // Controls the visibility of the Sidebar on mobile screens
  isSidebarOpen = signal<boolean>(false);

  /**
   * Toggles the sidebar open/closed (for mobile hamburger button)
   */
  toggleSidebar() {
    this.isSidebarOpen.update((v) => !v);
  }

  /**
   * Forces the sidebar to close (used when clicking the overlay or a link)
   */
  closeSidebar() {
    this.isSidebarOpen.set(false);
  }
}
