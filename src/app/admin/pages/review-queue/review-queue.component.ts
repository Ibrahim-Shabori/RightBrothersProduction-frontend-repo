import {
  RequestPageItemDto,
  RequestStatus,
  RequestType,
} from './../../../shared/models/request.model';
import { ReviewRequestDto } from './../../../shared/models/request.model';
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// --- PrimeNG Imports ---
import { TableModule, TableLazyLoadEvent } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService, MessageService } from 'primeng/api';
import { MultiSelect } from 'primeng/multiselect';
import { RequestQueryParameters } from '../../../shared/models/period.model';

import { RequestService } from '../../../services/request.service';
import { CategoryService } from '../../../services/category.service';
import { RequestLogService } from '../../../services/request-log.service';
import { Category } from '../../../shared/models/request.model';
import { Pagination } from '../../../shared/models/pagination.model';

@Component({
  selector: 'app-review-queue',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    DialogModule,
    TextareaModule,
    ToastModule,
    ConfirmDialogModule,
    TooltipModule,
    MultiSelect,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './review-queue.component.html',
  styleUrl: './review-queue.component.css',
})
export class ReviewQueueComponent implements OnInit {
  // --- Table State ---
  pagination: Pagination | undefined;
  totalRecords: number = 0;
  requests: RequestPageItemDto[] = [];
  loading: boolean = true;
  expandedRows: { [s: string]: boolean } = {}; // Tracks which rows are open

  // Default Query Params (Tracks pagination state)
  queryParams: RequestQueryParameters = {
    pageNumber: 1,
    pageSize: 10,
    sortField: 'createdAt' as string | null | string[] | undefined,
    sortOrder: -1 as number | null | undefined, // -1 for Descending
    filter: '',
    types: [] as number[] | null,
  };

  // --- Review Dialog State ---
  displayReviewDialog: boolean = false;
  selectedRequest: RequestPageItemDto | null = null;
  reviewComment: string = '';
  currentAction: 'approve' | 'reject' | null = null;
  isSubmittingReview: boolean = false;
  categories: Category[] = [];

  constructor(
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private requestService: RequestService,
    private categoryService: CategoryService,
    private requestLogService: RequestLogService
  ) {}

  ngOnInit() {
    this.categoryService.getAllCategoriesOrderedByType().subscribe((data) => {
      this.categories = data;
    });
  }

  /**
   * CORE METHOD: Called by PrimeNG Table whenever page, sort, or filter changes.
   * Currently mocks the API call with server-side logic simulation.
   */
  loadRequests(event: TableLazyLoadEvent) {
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

    const typeFilter = event.filters?.['type'];
    let selectedTypes: number[] = [];
    if (typeFilter) {
      // It comes as an array or a single object depending on if multiple constraints exist
      // Since we turned off match modes, it usually comes as a single FilterMetadata object
      const filterMeta = Array.isArray(typeFilter) ? typeFilter[0] : typeFilter;
      selectedTypes = filterMeta.value || [];

      if (filterMeta.value) {
        selectedTypes = filterMeta.value.map((cat: any) => cat.id);
      }
    }

    this.queryParams.types = selectedTypes.length > 0 ? selectedTypes : null;

    this.requestService.getToReviewRequests(this.queryParams).subscribe({
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

  // --- Actions ---

  /**
   * Opens the Approve/Reject Modal
   */
  openReviewAction(request: RequestPageItemDto, action: 'approve' | 'reject') {
    this.selectedRequest = request;
    this.currentAction = action;
    this.reviewComment = ''; // Reset comment
    this.displayReviewDialog = true;
  }

  /**
   * Submits the review (API Call Wrapper)
   */
  submitReview() {
    if (!this.selectedRequest || !this.currentAction) return;

    this.isSubmittingReview = true;
    const isApprove = this.currentAction === 'approve';

    var logMessage: ReviewRequestDto = {
      newStatus: isApprove ? RequestStatus.Published : RequestStatus.Rejected,
      comment: this.reviewComment,
      isPublic: true,
    };
    this.requestService
      .reviewRequest(this.selectedRequest.id, logMessage)
      .subscribe({
        next: (response) => {
          this.requests = this.requests.filter(
            (r) => r.id !== this.selectedRequest?.id
          );
          this.totalRecords--;

          // 2. Show Success Toast
          this.messageService.add({
            severity: isApprove ? 'success' : 'info',
            summary: isApprove ? 'تم قبول الطلب' : 'تم رفض الطلب',
            detail: `تمت العملية بنجاح للطلب رقم #${this.selectedRequest?.id}`,
          });

          // 3. Close & Reset
          this.displayReviewDialog = false;
          this.isSubmittingReview = false;
          this.selectedRequest = null;
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'خطأ في العملية',
            detail: `حدث خطأ أثناء العملية للطلب رقم #${this.selectedRequest?.id}`,
          });
        },
      });
  }

  confirmDelete(request: RequestPageItemDto) {
    // Show a confirmation dialog to the user before deleting the request
    this.confirmationService.confirm({
      // The message to be displayed to the user
      message:
        'هل أنت متأكد من حذف هذا الطلب نهائياً؟ لا يمكن التراجع عن هذا الإجراء.',
      // The header of the confirmation dialog
      header: 'تأكيد الحذف',
      // The icon to be displayed in the confirmation dialog
      icon: 'pi pi-exclamation-triangle',
      // The label of the accept button
      acceptLabel: 'نعم، احذف',
      // The label of the reject button
      rejectLabel: 'تراجع',
      // The class of the accept button
      acceptButtonStyleClass: 'p-button-danger p-button-text',
      // The class of the reject button
      rejectButtonStyleClass: 'p-button-text p-button-secondary',
      // The function to be executed when the accept button is clicked
      accept: () => {
        // Simulate Delete API
        // Filter out the request from the list
        this.requestService.deleteRequest(request.id).subscribe({
          next: () => {
            this.requests = this.requests.filter((r) => r.id !== request.id);
            // Show a success toast to the user
            this.messageService.add({
              severity: 'warn',
              summary: 'تم الحذف',
              detail: 'تم حذف الطلب بنجاح',
            });
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'خطأ في الحذف',
              detail: 'حدث خطأ أثناء حذف الطلب. الرجاء المحاولة مرة أخرى.',
            });
          },
        });
      },
    });
  }

  viewRequestDetails(id: number) {
    // Navigate to the separate details page
    this.router.navigate(['/admin/requests', id]);
  }

  // --- Helpers ---

  getSeverity(type: RequestType): 'success' | 'info' | 'danger' {
    switch (type) {
      case RequestType.Regular:
        return 'success'; // Green
      case RequestType.Bug:
        return 'danger'; // Red
      default:
        return 'info';
    }
  }

  // Add this inside your class

  getCategoryName(item: Category) {
    return item.name;
  }

  getCategoryNameById(id: number) {
    const category = this.categories.find((c) => c.id === id);
    return category ? category.name : '';
  }

  getCategoryColor(item: Category) {
    return item.color;
  }

  getCategoryColorById(id: number) {
    const category = this.categories.find((c) => c.id === id);
    return category ? category.color : '';
  }

  getRequestTypeName(type: RequestType): string {
    switch (type) {
      case RequestType.Regular:
      case RequestType.Detailed:
        return 'ميزة جديدة';
      case RequestType.Bug:
      case RequestType.DetailedBug:
        return 'إبلاغ عن خطأ';
      default:
        return 'غير محدد';
    }
  }
}
