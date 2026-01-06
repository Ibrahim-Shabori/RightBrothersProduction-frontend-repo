import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// PrimeNG Imports
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { SkeletonModule } from 'primeng/skeleton';
import { AvatarModule } from 'primeng/avatar';

@Component({
  selector: 'app-recent-actions-widget',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule,
    TagModule,
    TooltipModule,
    SkeletonModule,
    AvatarModule,
  ],
  templateUrl: './recent-actions-widget.component.html',
  styleUrl: './recent-actions-widget.component.css',
})
export class RecentActionsWidgetComponent {
  // --- Inputs ---
  @Input() requests: any[] = [];
  @Input() isLoading: boolean = false;

  // --- Outputs ---
  @Output() approve = new EventEmitter<number>(); // Emits Request ID
  @Output() reject = new EventEmitter<number>(); // Emits Request ID
  @Output() view = new EventEmitter<number>(); // Emits Request ID

  /**
   * Helper to determine Tag severity based on request type
   * 0 = Feature (Info/Blue), 2 = Bug (Danger/Red)
   */
  getSeverity(
    type: number
  ): 'info' | 'danger' | 'success' | 'warning' | undefined {
    // Assuming: 0=Feature, 1=DetailedFeature, 2=Bug, 3=DetailedBug
    if (type === 2 || type === 3) return 'danger';
    return 'info';
  }

  getLabel(type: number): string {
    if (type === 2 || type === 3) return 'بلاغ خطأ';
    return 'ميزة جديدة';
  }

  onApprove(id: number, event: Event) {
    event.stopPropagation(); // Prevent triggering row click
    this.approve.emit(id);
  }

  onReject(id: number, event: Event) {
    event.stopPropagation();
    this.reject.emit(id);
  }

  onView(id: number) {
    this.view.emit(id);
  }
}
