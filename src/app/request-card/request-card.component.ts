import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  RequestResponseDto,
  RequestStatus,
  RequestType,
} from '../shared/models/request.model';

// PrimeNG
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-request-card',
  standalone: true,
  imports: [CommonModule, TooltipModule, TagModule],
  templateUrl: './request-card.component.html',
  styleUrls: ['./request-card.component.css'],
})
export class RequestCardComponent {
  @Input({ required: true }) request!: RequestResponseDto;

  // Configuration inputs to control visibility
  @Input() showDescription: boolean = true;
  @Input() showStatus: boolean = true;
  @Input() showCategory: boolean = true;
  @Input() clickable: boolean = true;

  // Enums for template usage
  RequestType = RequestType;
  RequestStatus = RequestStatus;

  // --- Helpers ---

  get isBug(): boolean {
    return this.request.type === RequestType.Bug;
  }

  // Status Dot Color
  getStatusColor(status: RequestStatus): string {
    switch (status) {
      case RequestStatus.UnderReview:
        return 'bg-blue-500';
      case RequestStatus.InProgress:
        return 'bg-yellow-500';
      case RequestStatus.Done:
        return 'bg-green-500';
      case RequestStatus.InConsideration:
        return 'bg-brown-500';
      default:
        return 'bg-gray-300';
    }
  }

  // Status Tooltip Text (Arabic)
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
      default:
        return 'منشور';
    }
  }

  // Type Icon/Color helpers
  get typeIcon(): string {
    return this.isBug ? 'pi pi-exclamation-circle' : 'pi pi-star';
  }

  get typeColorClass(): string {
    return this.isBug ? 'text-red-600' : 'text-primary-600';
  }
}
