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

// Reused Dialog
import { UserActionDialogComponent } from '../user-action-dialog/user-action-dialog.component';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';
import { ProfileService } from '../../../services/profile.service';
import { Pagination } from '../../../shared/models/pagination.model';
import { UserManagementPageItemDto } from '../../../shared/models/user.model';
import { UserManagementQueryParameters } from '../../../shared/models/period.model';

@Component({
  selector: 'app-admin-list',
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
  templateUrl: './admin-list.component.html',
  providers: [MessageService],
})
export class AdminListComponent implements OnInit, OnChanges {
  constructor(
    private messageService: MessageService,
    private userService: UserService,
    private authService: AuthService,
    private profileService: ProfileService
  ) {}

  @Input() searchTerm: string = '';

  // Data State
  pagination: Pagination | undefined;
  totalRecords: number = 0;
  admins: UserManagementPageItemDto[] = [];
  loading: boolean = true;

  queryParams: UserManagementQueryParameters = {
    pageNumber: 1,
    pageSize: 10,
    sortField: 'performance',
    sortOrder: -1,
    filter: undefined,
    isActive: null,
    usersType: 'Admins',
  };

  // Permissions (Mocked for UI visualization)
  get role() {
    return this.authService.getUserRole();
  }

  get isSuperAdmin(): boolean {
    return this.role === 'SuperAdmin';
  }

  getCurrentUserId() {
    return this.authService.getCurrentUserId();
  }
  getProfilePicturePath(url: string) {
    return this.profileService.getProfilePictureUrl(url);
  }

  getFirstChar(name: string): string {
    return name.charAt(0).toUpperCase();
  }

  // Dialog State
  displayDialog: boolean = false;
  selectedAdmin: UserManagementPageItemDto | null = null;

  ngOnInit() {}

  filterAdmins() {
    this.queryParams.filter = this.searchTerm || undefined;
    this.loadAdmins({ first: 0, rows: 10 });
  }

  loadAdmins(event: TableLazyLoadEvent) {
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
          this.admins = response.result;
        }

        // 2. Assign Pagination Data
        if (response.pagination) {
          this.pagination = response.pagination;
          this.totalRecords = response.pagination.TotalCount;
        }
        this.loading = false;
      },
      error: (err) => {},
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['searchTerm']) {
      this.filterAdmins();
    }
  }

  // --- Actions ---

  openDemoteDialog(admin: UserManagementPageItemDto) {
    this.selectedAdmin = admin;
    this.displayDialog = true;
  }

  handleDemoteConfirm() {
    if (!this.selectedAdmin) return;
    this.loading = true;
    this.userService.demoteAdminToUser(this.selectedAdmin.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'نجاح',
          detail: 'تم تخفيض صلاحيات المسؤول بنجاح.',
        });
        this.admins = this.admins.filter(
          (a) => a.id !== this.selectedAdmin!.id
        );
        this.loading = false;
        this.displayDialog = false;
      },
      error: (err) => {
        this.loading = false;
      },
    });

    this.displayDialog = false;
    this.selectedAdmin = null;
    this.loadAdmins({ first: 0, rows: 10 });
  }

  // Helper to check if we can act on a specific row
  canDemote(targetAdmin: UserManagementPageItemDto): boolean {
    // 1. Only SuperAdmins can demote
    if (this.isSuperAdmin !== true) return false;

    // 2. You cannot demote yourself
    if (targetAdmin.id === this.authService.getCurrentUserId()) return false;
    // 3. You cannot demote another SuperAdmin (usually)
    if (targetAdmin.role === 'SuperAdmin') return false;

    return true;
  }
}
