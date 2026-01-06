import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';

// PrimeNG Imports
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

// Child Components
import { UserActionDialogComponent } from '../user-action-dialog/user-action-dialog.component';
import { UserManagementPageItemDto } from '../../../shared/models/user.model';
import { Pagination } from '../../../shared/models/pagination.model';
import { UserManagementQueryParameters } from '../../../shared/models/period.model';

// Services
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';
import { ProfileService } from '../../../services/profile.service';
@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    AvatarModule,
    TagModule,
    TooltipModule,
    ToastModule,
    UserActionDialogComponent,
  ],
  templateUrl: './user-list.component.html',
  providers: [MessageService],
})
export class UserListComponent implements OnInit, OnChanges {
  constructor(
    private messageService: MessageService,
    private userService: UserService,
    private authService: AuthService,
    private profileService: ProfileService
  ) {}

  // Input from Parent (Search Header)
  @Input() searchTerm: string = '';

  // Data State
  pagination: Pagination | undefined;
  totalRecords: number = 0;
  users: UserManagementPageItemDto[] = [];
  loading: boolean = true;

  queryParams: UserManagementQueryParameters = {
    pageNumber: 1,
    pageSize: 10,
    sortField: 'performance',
    sortOrder: -1,
    filter: undefined,
    isActive: null,
    usersType: 'Users',
  };

  // Permissions (Mocked for UI visualization)
  get role() {
    return this.authService.getUserRole();
  }
  get isSuperAdmin(): boolean {
    return this.role === 'SuperAdmin';
  }

  getProfilePicturePath(url: string) {
    return this.profileService.getProfilePictureUrl(url);
  }

  getFirstChar(name: string): string {
    return name.charAt(0).toUpperCase();
  }

  // Dialog State
  displayDialog: boolean = false;
  selectedUser: UserManagementPageItemDto | null = null;
  dialogAction: 'promote' | 'ban' | 'demote' | 'unban' = 'ban';

  ngOnInit() {
    let role = this.authService.getUserRole();
    console.log('Current User Role:', role);
  }

  ngOnChanges(changes: SimpleChanges) {
    // Watch for search term changes from the parent
    if (changes['searchTerm']) {
      this.filterUsers();
    }
  }

  // Simple local filter for the mock data
  filterUsers() {
    this.queryParams.filter = this.searchTerm || undefined;
    this.loadUsers({ first: 0, rows: 10 });
  }

  loadUsers(event: TableLazyLoadEvent) {
    this.loading = true;

    // 1. Extract params from the event (Page 0 -> Page 1 for API)
    const page = (event.first || 0) / (event.rows || 10) + 1;
    const size = event.rows || 10;
    const sortField = event.sortField;
    const sortOrder = event.sortOrder; // 1 = Asc, -1 = Desc

    this.queryParams.pageNumber = page;
    this.queryParams.pageSize = size;
    this.queryParams.sortField = sortField;
    this.queryParams.sortOrder = sortOrder;

    this.userService.getUsersToManage(this.queryParams).subscribe({
      next: (response) => {
        // 1. Assign Data
        if (response.result) {
          this.users = response.result;
        }

        // 2. Assign Pagination Data
        if (response.pagination) {
          this.pagination = response.pagination;
          this.totalRecords = response.pagination.TotalCount;
        }
        this.loading = false;
      },
      error: (err) => console.log(err),
    });
  }

  // --- Actions ---

  openPromoteDialog(user: UserManagementPageItemDto) {
    this.selectedUser = user;
    this.dialogAction = 'promote';
    this.displayDialog = true;
  }

  openBanDialog(user: UserManagementPageItemDto) {
    this.selectedUser = user;
    this.dialogAction = 'ban';
    this.displayDialog = true;
  }

  openUnBanDialog(user: UserManagementPageItemDto) {
    this.selectedUser = user;
    this.dialogAction = 'unban';
    this.displayDialog = true;
  }

  handleDialogConfirm() {
    if (!this.selectedUser) return;

    this.loading = true;

    if (this.dialogAction === 'promote') {
      this.userService.promoteUserToAdmin(this.selectedUser.id).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'تمت الترقية',
            detail: `تم ترقية المستخدم إلى مسؤول بنجاح`,
          });
        },
        error: (err) => {
          this.loading = false;
        },
      });
    } else if (this.dialogAction === 'ban' && this.selectedUser.isActive) {
      this.userService
        .updateBanStatus(this.selectedUser.id, { isBanned: true })
        .subscribe({
          next: () => {
            this.messageService.add({
              severity: 'warn',
              summary: 'تم الحظر',
              detail: `تم حظر المستخدم بنجاح`,
            });
          },
          error: (err) => {
            console.log(err);
            this.loading = false;
          },
        });
    } else if (this.dialogAction === 'unban' && !this.selectedUser.isActive) {
      this.userService
        .updateBanStatus(this.selectedUser.id, { isBanned: false })
        .subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'تم الغاء الحظر',
              detail: `تم الغاء حظر المستخدم بنجاح`,
            });
          },
          error: (err) => {
            this.loading = false;
          },
        });
    }
    this.displayDialog = false;
    this.selectedUser = null;
    this.loading = false;
  }
}
