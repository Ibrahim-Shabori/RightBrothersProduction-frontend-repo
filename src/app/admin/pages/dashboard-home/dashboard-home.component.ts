import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';

// --- Services & Models ---
// Make sure these paths match your project structure
import { RequestService } from '../../../services/request.service';
import { UserService } from '../../../services/user.service';
import { RequestLogService } from '../../../services/request-log.service';
import { QueryPeriod } from '../../../shared/models/period.model'; // Ensure you have this enum file
import {
  RequestStatus,
  ReviewRequestDto,
} from '../../../shared/models/request.model';
// --- Widget Imports ---
import { StatCardComponent } from '../../components/stat-card/stat-card.component';
import { TrafficChartComponent } from '../../components/traffic-chart/traffic-chart.component';
import { RecentActionsWidgetComponent } from '../../components/recent-actions-widget/recent-actions-widget.component';
import { TopContributorsWidgetComponent } from '../../components/top-contributors-widget/top-contributors-widget.component';

// --- PrimeNG Imports ---
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    // Widgets
    StatCardComponent,
    TrafficChartComponent,
    RecentActionsWidgetComponent,
    TopContributorsWidgetComponent,
    // PrimeNG
    ButtonModule,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './dashboard-home.component.html',
})
export class DashboardHomeComponent implements OnInit {
  // --- 1. KPI Stats State ---
  stats = {
    users: { value: 0, trend: 0 },
    activeRequests: { value: 0, trend: 0 },
    pendingReview: { value: 0, trend: 0 },
    solved: { value: 0, trend: 0 },
  };

  // --- 2. Chart State ---
  chartData = {
    labels: [] as string[],
    new: [] as number[],
    solved: [] as number[],
  };

  // --- 3. Widget Lists State ---
  recentRequests: any[] = [];
  topUsers: any[] = [];

  isLoadingWidgets = true;

  constructor(
    private messageService: MessageService,
    private requestService: RequestService,
    private userService: UserService,
    private requestLogService: RequestLogService
  ) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  /**
   * Fetches all dashboard data in parallel using forkJoin
   */
  loadDashboardData() {
    this.isLoadingWidgets = true;

    forkJoin({
      // A. Stats (KPIs)
      usersStat: this.userService.getUsersCountInAPeriod(QueryPeriod.LastMonth),
      activeStat: this.requestService.getActiveRequestsInAPeriod(
        QueryPeriod.LastWeek
      ),
      solvedStat: this.requestService.getDoneRequestsInAPeriod(
        QueryPeriod.LastWeek
      ),
      newRequestsStat: this.requestService.getRequestsCountInAPeriod(
        QueryPeriod.LastWeek
      ), // Used for "Pending Review" trend

      // B. Chart
      chartPoints:
        this.requestService.getMadeRequestsCountVsDoneRequestsCountInAPeriod(
          QueryPeriod.LastWeek
        ),
      // C. Widgets Lists
      notAssigned: this.requestService.getNotAssignedRequests(5), // Get top 5 pending
      topContributors: this.userService.getUsersEffectInAPeriod(
        QueryPeriod.LastWeek
      ),
    }).subscribe({
      next: (res) => {
        // 1. Map KPIs
        this.stats.users = {
          value: res.usersStat.count,
          trend: res.usersStat.changePercentage,
        };
        this.stats.activeRequests = {
          value: res.activeStat.count,
          trend: res.activeStat.changePercentage,
        };
        this.stats.solved = {
          value: res.solvedStat.count,
          trend: res.solvedStat.changePercentage,
        };
        // We use the count of the actual list for "Pending", but the trend from "New Requests"
        this.stats.pendingReview = {
          value: res.newRequestsStat.count, // Or use a specific 'total pending' endpoint if available
          trend: res.newRequestsStat.changePercentage,
        };

        // 2. Map Chart Data
        this.chartData = {
          labels: res.chartPoints.map((p) => p.label),
          new: res.chartPoints.map((p) => p.madeValue),
          solved: res.chartPoints.map((p) => p.doneValue),
        };

        // 3. Map Recent Actions (Review Queue)
        // DTO: { requestId, title, type, createdBy, createdAt }
        // Widget Expects: { id, title, type, user: { name }, createdAt }
        this.recentRequests = res.notAssigned.map((item) => ({
          id: item.requestId,
          title: item.title,
          type: item.type,
          createdAt: item.createdAt,
          user: { name: item.createdBy }, // Mapping string to object
        }));

        // 4. Map Top Contributors
        // DTO: { userId, userName, imageUrl, requestsGotVotes, receivedVotesCount }
        // Widget Expects: { id, name, avatar, requestsCount, impactScore }
        this.topUsers = res.topContributors;

        this.isLoadingWidgets = false;
      },
      error: (err) => {
        console.error('Dashboard Load Error:', err);
        this.isLoadingWidgets = false;
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: 'فشل تحميل البيانات',
        });
      },
    });
  }

  // --- Actions ---

  onQuickApprove(id: number) {
    // We assume "Quick Approve" moves the request to "Approved" or "In Progress"
    // Adjust 'RequestStatus.Approved' to whatever your Enum value is (e.g., 1 or 2)
    const reviewDto: ReviewRequestDto = {
      newStatus: RequestStatus.Published,
      comment: 'تم القبول السريع من لوحة التحكم',
      isPublic: true,
    };

    this.requestService.reviewRequest(id, reviewDto).subscribe({
      next: () => {
        // Optimistic UI Update
        this.recentRequests = this.recentRequests.filter((r) => r.id !== id);
        this.messageService.add({
          severity: 'success',
          summary: 'تم',
          detail: 'تم قبول الطلب بنجاح',
        });

        // Update local stats slightly to reflect change
        this.stats.pendingReview.value = Math.max(
          0,
          this.stats.pendingReview.value - 1
        );
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: 'فشل تنفيذ الإجراء',
        });
      },
    });
  }

  onQuickReject(id: number) {
    const reviewDto: ReviewRequestDto = {
      newStatus: RequestStatus.Rejected,
      comment: 'تم الرفض من لوحة التحكم',
      isPublic: true,
    };

    this.requestService.reviewRequest(id, reviewDto).subscribe({
      next: () => {
        this.recentRequests = this.recentRequests.filter((r) => r.id !== id);
        this.messageService.add({
          severity: 'info',
          summary: 'تم الرفض',
          detail: 'تم رفض الطلب',
        });
        this.stats.pendingReview.value = Math.max(
          0,
          this.stats.pendingReview.value - 1
        );
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: 'فشل تنفيذ الإجراء',
        });
      },
    });
  }

  navigateToRequest(id: number) {
    // this.router.navigate(['/admin/requests', id]);
  }

  refreshData() {
    this.messageService.add({
      severity: 'info',
      summary: 'تحديث',
      detail: 'جاري جلب أحدث البيانات...',
    });
    this.loadDashboardData();
  }
}
