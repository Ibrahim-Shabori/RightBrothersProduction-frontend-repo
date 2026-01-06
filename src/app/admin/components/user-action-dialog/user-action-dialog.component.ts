import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

// PrimeNG Imports
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';

// Models
import { UserManagementPageItemDto } from '../../../shared/models/user.model';

@Component({
  selector: 'app-user-action-dialog',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule],
  templateUrl: './user-action-dialog.component.html',
  styleUrl: './user-action-dialog.component.css',
})
export class UserActionDialogComponent {
  // 1. Controls visibility (Two-way binding support)
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  // 2. The User being acted upon
  @Input() user: UserManagementPageItemDto | null = null;

  // 3. The Type of Action
  @Input() action: 'promote' | 'demote' | 'ban' | 'unban' = 'ban';

  // 4. Events
  @Output() onConfirm = new EventEmitter<void>();

  close() {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  confirm() {
    this.onConfirm.emit();
    // We don't close immediately here; usually the parent closes
    // after the API call succeeds, or you can close here if preferred.
    // this.close();
  }

  // --- Dynamic Content Helpers ---

  get headerTitle(): string {
    switch (this.action) {
      case 'promote':
        return 'ترقية المستخدم';
      case 'demote':
        return 'تخفيض الصلاحيات';
      case 'ban':
        return 'حظر المستخدم';
      case 'unban':
        return 'الغاء حظر المستخدم';
      default:
        return 'تأكيد الإجراء';
    }
  }

  get iconClass(): string {
    switch (this.action) {
      case 'promote':
        return 'pi pi-shield text-green-500';
      case 'demote':
        return 'pi pi-arrow-down text-orange-500';
      case 'ban':
        return 'pi pi-ban text-red-500';
      case 'unban':
        return 'pi pi-check-circle text-blue-500';
      default:
        return 'pi pi-info-circle';
    }
  }

  get confirmButtonLabel(): string {
    switch (this.action) {
      case 'promote':
        return 'تأكيد الترقية';
      case 'demote':
        return 'تأكيد التخفيض';
      case 'ban':
        return 'حظر الحساب';
      case 'unban':
        return 'إلغاء الحظر';
      default:
        return 'تأكيد';
    }
  }

  get confirmButtonClass(): string {
    switch (this.action) {
      case 'promote':
        return 'p-button-success';
      case 'demote':
        return 'p-button-warning';
      case 'ban':
        return 'p-button-danger';
      case 'unban':
        return 'p-button-info';
      default:
        return 'p-button-primary';
    }
  }
}
