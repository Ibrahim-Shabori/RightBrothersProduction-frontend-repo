import { voterDto } from './../../shared/models/user.model';
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

// PrimeNG Imports
import { MessageService, ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';

// Child Components
import { RequestInfoCardComponent } from './../../components/request-details/request-info-card/request-info-card.component';
import { VotersCardComponent } from './../../components/request-details/voters-card/voters-card.component';
import { ActivityTimelineComponent } from './../../components/request-details/activity-timeline/activity-timeline.component';
import {
  StatusUpdateDialogComponent,
  StatusUpdateEvent,
} from './../../components/request-details/status-update-dialog/status-update-dialog.component';
import {
  CreateRequestLogDto,
  RequestDetailsDto,
  RequestLogDetailsDto,
  RequestStatus,
} from '../../shared/models/request.model';

import { RequestService } from '../../services/request.service';
import { RequestLogService } from '../../services/request-log.service';
import { VoteService } from '../../services/vote.service';
import { AuthService } from '../../services/auth.service';
import { RequestStatusDialogComponent } from '../../admin/components/request-status-dialog/request-status-dialog.component';
import { ProfileService } from '../../services/profile.service';
import { environment } from '../../../environments/environment';
import { FileService } from '../../services/file.service';
@Component({
  selector: 'app-request-details',
  standalone: true,
  imports: [
    CommonModule,
    RequestInfoCardComponent,
    VotersCardComponent,
    ActivityTimelineComponent,
    RequestStatusDialogComponent,
    ConfirmDialogModule,
    ToastModule,
    ButtonModule,
    SkeletonModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './request-details.component.html',
})
export class RequestDetailsComponent implements OnInit {
  // --- Data State ---
  requestId!: number;
  request: RequestDetailsDto | null = null;
  requestVoters: voterDto[] = [];
  requestLogs: RequestLogDetailsDto[] = [];
  loading: boolean = true;

  // --- UI State ---
  isStatusDialogVisible: boolean = false;
  isNewStatus = signal<boolean>(false);

  // --- Permissions State ---
  isAdmin: boolean = false;
  isOwner: boolean = false;
  hasVoted: boolean = false;
  currentUserId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private requestService: RequestService,
    private requestLogService: RequestLogService,
    private voteService: VoteService,
    private authService: AuthService,
    private profileService: ProfileService,
    private fileService: FileService
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.authService.getCurrentUserId();
    this.route.paramMap.subscribe((params) => {
      this.requestId = Number(params.get('id')) || 1;
      this.loadData();
    });
  }

  loadData() {
    this.loading = true;

    if (
      this.authService.getUserRole() === 'Admin' ||
      this.authService.getUserRole() === 'SuperAdmin'
    ) {
      this.isAdmin = true;
    }

    this.requestService.getRequestDetails(this.requestId).subscribe({
      next: (response) => {
        this.request = response;
        this.isOwner = this.request?.createdById === this.currentUserId;
        this.request.createdByPictureUrl =
          this.profileService.getProfilePictureUrl(
            this.request?.createdByPictureUrl
          ) ?? '';
      },
      error: (err) => {},
    });
    this.voteService.getRequestVoters(this.requestId).subscribe({
      next: (response) => {
        this.requestVoters = response;
      },
    });

    this.requestLogService
      .getRequestLogsDetailedByRequestId(this.requestId)
      .subscribe({
        next: (response) => {
          this.requestLogs = response;
          this.loading = false;
        },
      });

    this.voteService.checkVoted(this.requestId).subscribe({
      next: (response) => {
        this.hasVoted = response;
      },
    });
  }

  downloadFile(fileName: string) {
    return this.fileService.downloadFile(this.requestId, fileName);
  }

  openStatusDialog(newStatus: boolean = false) {
    this.isNewStatus.set(newStatus);
    this.isStatusDialogVisible = true;
  }

  statusOptions = [
    { label: 'منشور', value: RequestStatus.Published },
    { label: 'قيد النظر', value: RequestStatus.InConsideration },
    { label: 'قيد العمل', value: RequestStatus.InProgress },
    { label: 'مكتمل', value: RequestStatus.Done },
    { label: 'مرفوض', value: RequestStatus.Rejected },
  ];

  confirmStatusUpdate(data: {
    message: string;
    notify: boolean;
    isInternal: boolean;
    newStatus: RequestStatus;
  }) {
    this.loading = true; // Optional UI loading state

    let requestLogDto: CreateRequestLogDto = {
      requestId: this.request?.id!,
      newStatus: data.newStatus,
      comment: data.message,
      isPublic: !data.isInternal,
    };

    this.requestLogService.createRequestLog(requestLogDto).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'تم التحديث',
          detail: 'تم تغيير الحالة وإشعار المستخدمين بنجاح.',
        });
        this.loading = false;
      },
      error: (err) => console.log(err),
    });
  }

  handleDelete(id: number) {
    this.confirmationService.confirm({
      message: 'هل أنت متأكد من حذف هذا الطلب نهائياً؟ (Mock Action)',
      header: 'تأكيد الحذف',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'نعم، احذف',
      rejectLabel: 'إلغاء',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'تم الحذف',
          detail: 'Mock Delete Successful',
        });
        // Navigate back
        setTimeout(() => this.router.navigate(['/']), 1000);
      },
    });
  }

  handleEdit(id: number) {
    this.router.navigate(['/requests/edit', id]);
  }

  handleVote(id: number) {
    this.voteService.createRequestVote({ requestId: id }).subscribe({
      next: (actualNewCountFromServer) => {
        this.request!.votesCount = actualNewCountFromServer;
        this.hasVoted = !this.hasVoted;
        if (this.hasVoted == true) {
          this.requestVoters.push({
            id: this.currentUserId!,
            name: this.authService.getCurrentUserName()!,
            pictureUrl: this.authService.getCurrentUserProfilePictureUrl(),
          });
        } else {
          this.requestVoters.pop();
        }
      },
      error: (err) => {},
    });
  }
}
