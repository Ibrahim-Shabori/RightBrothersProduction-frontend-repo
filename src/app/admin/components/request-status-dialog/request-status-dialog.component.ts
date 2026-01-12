import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnChanges,
  SimpleChanges,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG Imports
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { CheckboxModule } from 'primeng/checkbox';
import { TagModule } from 'primeng/tag';

import {
  RequestManagementPageItemDto,
  RequestStatus,
} from '../../../shared/models/request.model';

@Component({
  selector: 'app-request-status-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    TextareaModule,
    CheckboxModule,
    TagModule,
  ],
  templateUrl: './request-status-dialog.component.html',
  styleUrl: './request-status-dialog.component.css',
})
export class RequestStatusDialogComponent implements OnChanges, OnInit {
  @Input() visible: boolean = false;
  @Input() newStatus: RequestStatus | null = null;
  @Input() isInternal: boolean = false;
  @Input() notifyUsers: boolean = true;
  @Input() statusOptions: any[] = [];
  @Input() updateMessage: string = '';
  @Input() nextStatus: boolean = false;

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() onConfirm = new EventEmitter<{
    message: string;
    notify: boolean;
    isInternal: boolean;
    newStatus: RequestStatus;
  }>();

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && this.visible) {
      this.updateMessage = this.getDefaultMessage(
        this.newStatus! + (this.nextStatus ? 1 : 0)
      );
    }
  }

  close() {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  confirm() {
    this.onConfirm.emit({
      message: this.updateMessage,
      notify: this.notifyUsers,
      isInternal: this.isInternal,
      newStatus: this.newStatus! + (this.nextStatus ? 1 : 0),
    });
    this.close(); // Close immediately on confirm
  }

  // --- Helpers ---
  getEnumLabel(status: RequestStatus | null): string {
    const option = this.statusOptions.find((opt) => opt.value === status);
    return option ? option.label : 'تحديث عام';
  }

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
        return 'info';
      case RequestStatus.InProgress:
        return 'warn';
      case RequestStatus.Done:
        return 'success';
      case RequestStatus.Rejected:
        return 'danger';
      default:
        return 'info';
    }
  }

  private getDefaultMessage(status: RequestStatus | null): string {
    // If the status is null/undefined, it means we are just adding a comment/update without changing status
    if (!status && status !== 0) return '';

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
}
