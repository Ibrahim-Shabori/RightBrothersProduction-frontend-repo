import { RequestLogService } from './../../../services/request-log.service';
import { CreateRequestLogDto } from './../../../shared/models/request.model';
import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RequestDetailRowComponent } from '../../components/request-detail-row/request-detail-row.component';
import { RequestStatusDialogComponent } from '../../components/request-status-dialog/request-status-dialog.component';
// PrimeNG Imports
import { SelectModule } from 'primeng/select';
import { Table, TableModule, TableLazyLoadEvent } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { CheckboxModule } from 'primeng/checkbox';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { TimelineModule } from 'primeng/timeline';
import { InputTextModule } from 'primeng/inputtext';

// Models & Services (Adjust paths as needed)
import { RequestService } from '../../../services/request.service';
import {
  RequestManagementPageItemDto,
  RequestStatus,
} from '../../../shared/models/request.model';
import {
  QueryPeriod,
  RequestManagementQueryParameters,
  RequestQueryParameters,
} from '../../../shared/models/period.model';
import { Pagination } from '../../../shared/models/pagination.model';
import { RequestLogDto } from '../../../shared/models/request.model'; // Assuming you have this
import { RequestSummaryComponent } from '../../components/request-summary/request-summary.component';
import { RequestManagementHeaderComponent } from '../../components/request-management-header/request-management-header.component';
import { TrendIndicatorComponent } from '../../components/trend-indicator/trend-indicator.component';

@Component({
  selector: 'app-request-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    DialogModule,
    ButtonModule,
    TextareaModule,
    AutoCompleteModule,
    InputTextModule,
    CheckboxModule,
    TagModule,
    SelectModule,
    ToastModule,
    TooltipModule,
    TimelineModule,
    RequestStatusDialogComponent,
    RequestDetailRowComponent,
    RequestSummaryComponent,
    TrendIndicatorComponent,
  ],
  templateUrl: './request-management.component.html',
  styleUrl: './request-management.component.css',
  providers: [MessageService],
})
export class RequestManagementComponent implements OnInit {
  constructor(
    private requestService: RequestService,
    private messageService: MessageService,
    private requestLogService: RequestLogService
  ) {}

  // --- Data State ---
  expandedRows: { [s: string]: boolean } = {};
  requests: RequestManagementPageItemDto[] = [];
  loading: boolean = false;
  totalRecords: number = 0;

  // --- Filters & Pagination ---
  pagination: Pagination | undefined;
  queryParams: RequestManagementQueryParameters = {
    pageNumber: 1, // Current page
    pageSize: 10, // Items per page
    sortField: 'votes', // Default sort by votes, possible values: 'votes', 'updatedAt', 'trendValue'
    sortOrder: -1, // -1 for desc, 1 for asc
    filter: '', // the search term
    period: QueryPeriod.LastWeek, // determines trend calculation period
  };

  // --- Status Management (Arabic) ---
  statusOptions = [
    { label: 'منشور', value: RequestStatus.Published },
    { label: 'قيد الدراسة', value: RequestStatus.InConsideration },
    { label: 'جاري التنفيذ', value: RequestStatus.InProgress },
    { label: 'مكتمل', value: RequestStatus.Done },
    { label: 'مرفوض', value: RequestStatus.Rejected },
  ];

  // --- Dialog State ---
  displayStatusDialog: boolean = false;
  pendingRequest: RequestManagementPageItemDto | null = null;
  pendingNewStatus: RequestStatus | null = null;

  // Dialog Form Data
  updateMessage: string = '';
  notifyUsers: boolean = true;
  isInternalNote: boolean = false;

  ngOnInit(): void {
    // Initial load happens via lazyLoad event automatically
  }

  // 1. Main Data Loader (Mock Data)
  loadRequests(event: TableLazyLoadEvent) {
    const page = (event.first || 0) / (event.rows || 10) + 1;
    const size = event.rows || 10;
    const sortField = event.sortField;
    const sortOrder = event.sortOrder;
    this.queryParams.pageNumber = page;
    this.queryParams.pageSize = size;
    this.queryParams.sortField = sortField;
    this.queryParams.sortOrder = sortOrder;
    this.loading = true;

    this.requestService.getToManageRequests(this.queryParams).subscribe({
      next: (response) => {
        // 1. Assign Data
        if (response.result) {
          this.requests = response.result;
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

  // 3. The Interception Logic
  onStatusChange(
    request: RequestManagementPageItemDto,
    newStatus: RequestStatus
  ) {
    this.pendingRequest = request;
    this.pendingNewStatus = newStatus;

    this.updateMessage = this.getDefaultMessage(newStatus);
    this.notifyUsers = true;
    this.isInternalNote = false;

    this.displayStatusDialog = true;
  }

  // 4. Confirm & Save (Mock Logic)
  confirmStatusUpdate(data: {
    message: string;
    notify: boolean;
    isInternal: boolean;
  }) {
    if (!this.pendingRequest || this.pendingNewStatus === null) return;

    // Use data passed from the dialog component
    this.updateMessage = data.message;
    this.notifyUsers = data.notify;
    this.isInternalNote = data.isInternal;

    this.loading = true; // Optional UI loading state

    let requestLogDto: CreateRequestLogDto = {
      requestId: this.pendingRequest.id,
      newStatus: this.pendingNewStatus,
      comment: this.updateMessage,
      isPublic: !this.isInternalNote,
    };

    this.requestLogService.createRequestLog(requestLogDto).subscribe({
      next: (response) => {
        this.pendingRequest!.status = this.pendingNewStatus!;
        this.pendingRequest!.lastUpdatedAt = new Date();
        this.messageService.add({
          severity: 'success',
          summary: 'تم التحديث',
          detail: 'تم تغيير الحالة وإشعار المستخدمين بنجاح.',
        });
        this.displayStatusDialog = false;
        this.pendingRequest = null;
        this.loading = false;
      },
      error: (err) => console.log(err),
    });
  }

  handleRowAction(event: {
    type: 'internal' | 'update';
    request: RequestManagementPageItemDto;
  }) {
    // Set the request being edited
    this.pendingRequest = event.request;
    this.pendingNewStatus = event.request.status;

    if (event.type === 'internal') {
      // Configure for Internal Note
      this.isInternalNote = true;
      this.notifyUsers = false;
      this.updateMessage = '';
    } else {
      // Configure for Public Update
      this.isInternalNote = false;
      this.notifyUsers = true; // Default to notifying users for updates
      this.updateMessage = '';
    }

    // Open the Dialog
    this.displayStatusDialog = true;
  }

  handleSearch(term: string) {
    this.queryParams.filter = term;

    // Reset to page 1 for new searches
    this.loadRequests({ first: 0, rows: this.queryParams.pageSize });
  }

  // Helper: Auto-generate nice template messages (Arabic)
  private getDefaultMessage(status: RequestStatus): string {
    switch (status) {
      case RequestStatus.InConsideration:
        return 'نحن ننظر في هذا الأمر! تمت إضافته إلى خطة العمل المحتملة.';
      case RequestStatus.InProgress:
        return 'أخبار رائعة! بدأ التطوير في هذه الميزة.';
      case RequestStatus.Done:
        return 'هذه الميزة متاحة الآن! قم بتحديث تطبيقك لرؤيتها.';
      case RequestStatus.Rejected:
        return 'شكراً لاقتراحك. لسوء الحظ، لن نتمكن من المضي قدماً في هذا الوقت بسبب...';
      default:
        return '';
    }
  }

  // UI Helpers
  getSeverity(
    status: RequestStatus | null
  ):
    | 'success'
    | 'info'
    | 'warn'
    | 'danger'
    | 'secondary'
    | 'contrast'
    | undefined {
    switch (status) {
      case RequestStatus.Published:
        return 'secondary';
      case RequestStatus.InConsideration:
        return 'warn';
      case RequestStatus.InProgress:
        return 'info';
      case RequestStatus.Done:
        return 'success';
      case RequestStatus.Rejected:
        return 'danger';
      default:
        return 'info';
    }
  }
}
