import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TimelineModule } from 'primeng/timeline';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';

// Models
import {
  RequestManagementPageItemDto,
  RequestStatus,
  RequestLogDto,
  RequestLogForAdminsDto,
} from '../../../shared/models/request.model';

@Component({
  selector: 'app-request-detail-row',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    TimelineModule,
    TooltipModule,
    TagModule,
  ],
  templateUrl: './request-detail-row.component.html',
  styleUrl: './request-detail-row.component.css',
})
export class RequestDetailRowComponent {
  @Input() request!: RequestManagementPageItemDto;
  @Input() loading: boolean = false;

  // Output: We tell the parent "Please open the dialog with these settings"
  @Output() onAction = new EventEmitter<{
    type: 'internal' | 'update';
    request: RequestManagementPageItemDto;
  }>();

  // Helper: Truncate Description (approx 200 words)
  get truncatedDescription(): string {
    if (!this.request?.description) return '';
    const words = this.request.description.split(' ');
    if (words.length <= 200) return this.request.description;
    return words.slice(0, 200).join(' ') + '...';
  }

  // Action: Add Internal Note
  addInternalNote() {
    this.onAction.emit({ type: 'internal', request: this.request });
  }

  // Action: Add Public Update (Same Status)
  addPublicUpdate() {
    this.onAction.emit({ type: 'update', request: this.request });
  }

  // --- Visual Helpers for Timeline ---

  getEventColor(status: RequestStatus): string {
    // We map the status string (or id) to a hex color
    // You might need to adjust logic if 'statusName' is Arabic or English in your DB
    // Assuming we check against the Enum or mapped string
    // Example logic - adjust matching based on your actual Log Status Names
    if (status == RequestStatus.Published) return '#3B82F6'; // Blue
    if (status == RequestStatus.InConsideration) return '#F59E0B'; // Orange
    if (status == RequestStatus.InProgress) return '#A855F7'; // Purple
    if (status == RequestStatus.Done) return '#22C55E'; // Green
    if (status == RequestStatus.Rejected) return '#EF4444'; // Red
    return '#64748b'; // Slate default
  }

  getEventIcon(status: RequestStatus): string {
    // Return standard icons regardless of private/public
    if (status == RequestStatus.Published) return 'pi pi-send';
    if (status == RequestStatus.InConsideration) return 'pi pi-hourglass';
    if (status == RequestStatus.InProgress) return 'pi pi-cog';
    if (status == RequestStatus.Done) return 'pi pi-check';
    if (status == RequestStatus.Rejected) return 'pi pi-times';
    return 'pi pi-info-circle';
  }

  getEventLabel(log: RequestLogForAdminsDto): string {
    // We map the status to a user-friendly label
    if (log.isPublic === false) return 'ملاحظة داخلية';
    let status = log.newStatus;
    if (status == RequestStatus.Published) return 'تم النشر';
    if (status == RequestStatus.InConsideration) return 'قيد الدراسة';
    if (status == RequestStatus.InProgress) return 'قيد التنفيذ';
    if (status == RequestStatus.Done) return 'مكتمل';
    if (status == RequestStatus.Rejected) return 'مرفوض';
    return 'تحديث عام';
  }
}
