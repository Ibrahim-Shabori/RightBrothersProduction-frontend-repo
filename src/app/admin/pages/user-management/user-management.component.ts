import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

// PrimeNG Imports (Updated)
import { TabsModule } from 'primeng/tabs';

// Child Components
import { UsersHeaderComponent } from '../../components/users-header/users-header.component';
import { UserListComponent } from '../../components/user-list/user-list.component';
import { AdminListComponent } from '../../components/admin-list/admin-list.component';

// Services
import { UserService } from '../../../services/user.service';
import { ProfileService } from '../../../services/profile.service';
import { UserManagementQueryParameters } from '../../../shared/models/period.model';
@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule,
    TabsModule, // <--- Replaced TabViewModule
    UsersHeaderComponent,
    UserListComponent,
    AdminListComponent,
  ],
  templateUrl: './user-management.component.html',
})
export class UserManagementComponent implements OnInit {
  // State for Search
  currentSearch: string = '';

  // Metrics
  totalUsersCount: number = 0;
  totalAdminsCount: number = 0;

  userParams: UserManagementQueryParameters = {
    pageNumber: 1,
    pageSize: 10,
    sortField: 'performance',
    sortOrder: -1,
    filter: undefined,
    isActive: true,
    usersType: 'Users',
  };

  constructor(
    private userService: UserService,
    private profileService: ProfileService
  ) {}

  ngOnInit() {
    this.loadStats();
  }

  loadUsers() {}

  handleSearch(term: string) {
    this.currentSearch = term;
  }

  private loadStats() {
    this.userService.getUsersCount().subscribe(
      {
        next: (count) => {
          this.totalUsersCount = count.regularUsersCount;
          this.totalAdminsCount = count.adminUsersCount;
        }
      }
    );
  }
}
