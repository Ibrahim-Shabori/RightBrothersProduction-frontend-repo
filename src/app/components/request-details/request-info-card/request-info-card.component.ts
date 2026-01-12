import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

// PrimeNG Imports
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ImageModule } from 'primeng/image';
import { ChipModule } from 'primeng/chip';
import { AvatarModule } from 'primeng/avatar';
import {
  RequestDetailsDto,
  RequestStatus,
  RequestType,
} from '../../../shared/models/request.model';

@Component({
  selector: 'app-request-info-card',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    TagModule,
    TooltipModule,
    ImageModule,
    ChipModule,
    AvatarModule,
  ],
  templateUrl: './request-info-card.component.html',
  styleUrl: './request-info-card.component.css',
})
export class RequestInfoCardComponent {
  // --- Inputs ---
  @Input() request!: RequestDetailsDto;
  @Input() isOwner: boolean = false;
  @Input() isAdmin: boolean = false;

  // --- Outputs ---
  @Output() onEdit = new EventEmitter<number>();
  @Output() onDelete = new EventEmitter<number>();
  // 1. NEW INPUT: Tracks if the user has voted (default from parent)
  @Input() hasVoted: boolean = false;

  // 2. NEW OUTPUT: Emits when the arrow is clicked
  @Output() onVote = new EventEmitter<void>();
  @Output() onDownloadFile = new EventEmitter<string>();
  // --- State ---
  isExpanded: boolean = false; // Tracks if the "Chevron" details are open

  // --- Logic Helpers ---

  /**
   * Determines if the "Show More" chevron should appear.
   * Logic: Only show if there is actually hidden data (System Info, Steps, etc.)
   */
  get hasHiddenDetails(): boolean {
    if (!this.request) return false;

    // Check if any of the "advanced" fields have content
    return !!(
      (this.request.detailedDescription &&
        this.request.detailedDescription.trim().length > 0) ||
      (this.request.additionalNotes &&
        this.request.additionalNotes.trim().length > 0) ||
      (this.request.urgencyCause && this.request.urgencyCause.trim().length > 0)
    );
  }

  /**
   * Permissions Logic for Delete Button
   * Admin: Always True
   * Owner: Only if votes < 10 (Business Rule)
   */
  get showDeleteButton(): boolean {
    if (this.isAdmin) return true;
    if (this.isOwner) {
      return (this.request.votesCount || 0) < 10;
    }
    return false;
  }

  /**
   * Permissions Logic for Edit Button
   */
  get showEditButton(): boolean {
    return this.isOwner || this.isAdmin;
  }

  /**
   * Returns severity color based on status text
   */
  get statusSeverity():
    | 'success'
    | 'info'
    | 'warn'
    | 'danger'
    | 'secondary'
    | 'contrast'
    | undefined {
    if (!this.request?.status) return 'secondary';

    switch (this.request.status) {
      case RequestStatus.InConsideration:
        return 'info'; // Blue
      case RequestStatus.InProgress:
        return 'warn'; // Yellow
      case RequestStatus.Done:
        return 'success'; // Green
      case RequestStatus.UnderReview:
        return 'contrast'; // Red
      case RequestStatus.Published:
        return 'secondary';
      default:
        return 'secondary'; // Grey
    }
  }

  getStatusLabel(status: RequestStatus): string {
    switch (status) {
      case RequestStatus.UnderReview:
        return 'قيد المراجعة';
      case RequestStatus.InProgress:
        return 'قيد العمل';
      case RequestStatus.Done:
        return 'تم التنفيذ';
      case RequestStatus.InConsideration:
        return 'قيد النظر';
      case RequestStatus.Rejected:
        return 'مرفوض';
      default:
        return 'منشور';
    }
  }

  // 4. STYLE HELPER: Returns the correct class for the vote button
  get voteButtonClass(): string {
    // Base class for the button
    const base =
      'p-button-rounded p-button-sm font-bold border transition-all ';

    if (!this.hasVoted) {
      return (
        base +
        'p-button-outlined p-button-secondary text-slate-400 border-slate-200 hover:border-slate-400 hover:text-slate-600'
      );
    }

    // Voted: Color depends on Type
    if (this.request.type === RequestType.Bug) {
      // Bug + Voted = RED
      return (
        base + 'bg-red-50! text-red-600! border-red-200! hover:bg-red-100!'
      );
    } else {
      // Feature + Voted = GREEN
      return (
        base +
        'bg-green-50! text-green-600! border-green-200! hover:bg-green-100!'
      );
    }
  }

  // --- Actions ---

  toggleExpand() {
    this.isExpanded = !this.isExpanded;
  }

  handleEdit() {
    this.onEdit.emit(this.request.id);
  }

  handleDelete() {
    this.onDelete.emit(this.request.id);
  }

  handleVote() {
    this.onVote.emit();
    this.hasVoted = !this.hasVoted;
  }

  handleDownload(fileUrl: string) {
    this.onDownloadFile.emit(fileUrl);
  }

  getStatusBackgroundColor(status: RequestStatus) {
    switch (status) {
      case RequestStatus.Rejected:
        return 'bg-red-500';
      case RequestStatus.InProgress:
        return 'bg-yellow-500';
      case RequestStatus.Done:
        return 'bg-green-500';
      case RequestStatus.InConsideration:
        return 'bg-violet-500';
      case RequestStatus.Published:
        return 'bg-slate-500';
      default:
        return 'bg-gray-300';
    }
  }

  isItsTypeABug(type: RequestType) {
    return type === RequestType.Bug;
  }

  isItsStatusInProgress(status: RequestStatus) {
    return status === RequestStatus.InProgress;
  }

  getInitials(name: string): string {
    if (!name) return '?';
    return name.substring(0, 2).toUpperCase();
  }

  // Add this to your component class
  getFileNameFromUrl(url: string): string {
    if (!url) return 'Unknown File';

    try {
      // 1. If it's a clean URL like "http://site.com/image.png"
      const lastSegment = url.split('/').pop();

      // 2. If it has query params like "?file=image.png&token=123"
      // We clean off the query params to just get the name if possible
      if (lastSegment) {
        // Simple clean: remove query string if present
        const cleanName = lastSegment.split('?')[0];
        return decodeURIComponent(cleanName);
      }

      return 'ملف مرفق'; // Fallback Arabic "Attached File"
    } catch (e) {
      return 'ملف مرفق';
    }
  }
}
