import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

// Model
import {
  RequestPageItemDto,
  RequestType,
} from '../../../shared/models/request.model';

@Component({
  selector: 'app-request-summary',
  standalone: true,
  imports: [CommonModule, TagModule, TooltipModule],
  templateUrl: './request-summary.component.html',
})
export class RequestSummaryComponent {
  @Input() request!: RequestPageItemDto;

  // Logic to determine color based on category/type
  get titleColorClass(): string {
    if (this.isBug) {
      return 'text-red-600'; // Red for Bugs
    }
    return 'text-teal-600'; // Green/Teal for Features
  }

  get isBug(): boolean {
    // Simple heuristic: check if category implies a bug
    // You can replace this with `request.type === RequestType.Bug` if you have the Enum available here
    return (
      this.request.type == RequestType.Bug ||
      this.request.type == RequestType.DetailedBug
    );
  }

  // Logic to get only the first two names
  get shortAuthorName(): string {
    if (!this.request.createdBy) return 'مجهول';
    const parts = this.request.createdBy.trim().split(/\s+/); // Split by space
    return parts.slice(0, 2).join(' '); // Join first 2 words
  }
}
