import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

// PrimeNG Imports
import { TimelineModule } from 'primeng/timeline';
import { CardModule } from 'primeng/card';
import { AvatarModule } from 'primeng/avatar';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import {
  RequestLogDetailsDto,
  RequestStatus,
} from '../../../shared/models/request.model';
import { ProfileService } from '../../../services/profile.service';

@Component({
  selector: 'app-activity-timeline',
  standalone: true,
  imports: [
    CommonModule,
    TimelineModule,
    CardModule,
    AvatarModule,
    TagModule,
    TooltipModule,
  ],
  templateUrl: './activity-timeline.component.html',
  styleUrl: './activity-timeline.component.css',
})
export class ActivityTimelineComponent {
  // --- Inputs ---
  @Input() logs: RequestLogDetailsDto[] = [];

  // --- Helpers for UI Logic ---

  constructor(private profileService: ProfileService) {}
  getActionIcon(action: string): string {
    switch (action) {
      case 'StatusChange':
        return 'pi pi-sync';
      case 'Created':
        return 'pi pi-plus-circle';
      case 'Closed':
        return 'pi pi-lock';
      case 'Comment':
      default:
        return 'pi pi-comment';
    }
  }

  /**
   * Returns a color class for the action text
   */
  getActionColor(action: string): string {
    switch (action) {
      case 'StatusChange':
        return 'text-blue-600';
      case 'Created':
        return 'text-green-600';
      case 'Closed':
        return 'text-red-600';
      case 'Comment':
      default:
        return 'text-slate-500';
    }
  }

  /**
   * Returns the "Severity" for the status tag (e.g., Pending -> info)
   */
  getStatusSeverity(
    status: RequestStatus
  ):
    | 'success'
    | 'info'
    | 'warn'
    | 'danger'
    | 'secondary'
    | 'contrast'
    | undefined {
    switch (status) {
      case RequestStatus.Rejected:
        return 'danger';
      case RequestStatus.InProgress:
        return 'warn';
      case RequestStatus.Done:
        return 'success';
      case RequestStatus.InConsideration:
        return 'info';
      case RequestStatus.UnderReview:
        return 'contrast';
      default:
        return 'secondary';
    }
  }

  getStatusLabel(status: RequestStatus): string {
    switch (status) {
      case RequestStatus.Rejected:
        return 'مرفوض';
      case RequestStatus.InProgress:
        return 'قيد العمل';
      case RequestStatus.Done:
        return 'تم التنفيذ';
      case RequestStatus.InConsideration:
        return 'قيد النظر';
      case RequestStatus.UnderReview:
        return 'قيد المراجعة';
      default:
        return 'منشور';
    }
  }

  getPictureUrl(url: string) {
    return this.profileService.getProfilePictureUrl(url);
  }

  /**
   * Generates initials if avatar is missing
   */
  getInitials(name: string): string {
    if (!name) return '?';
    return name.substring(0, 2).toUpperCase();
  }
}
