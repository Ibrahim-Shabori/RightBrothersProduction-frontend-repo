import { SelectModule } from 'primeng/select';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG Imports
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { MessageModule } from 'primeng/message';

// DTO for the output event
export interface StatusUpdateEvent {
  newStatus: string;
  comment: string;
}

// Helper interface for the dropdown options
interface StatusOption {
  label: string;
  value: string;
  icon: string; // PrimeIcons class
  color: string; // Tailwind text color class for preview
}

@Component({
  selector: 'app-status-update-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    SelectModule,
    TextareaModule,
    MessageModule,
  ],
  templateUrl: './status-update-dialog.component.html',
  styleUrl: './status-update-dialog.component.css',
})
export class StatusUpdateDialogComponent implements OnChanges {
  // --- Inputs ---
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  // The current status of the request (to pre-select it)
  @Input() currentStatus: string = '';

  // --- Outputs ---
  @Output() onSave = new EventEmitter<StatusUpdateEvent>();

  // --- Form State ---
  selectedStatus: string | null = null;
  comment: string = '';
  submitted: boolean = false;

  // --- Configuration ---
  // You could move this to a shared constant or service later
  statuses: StatusOption[] = [
    {
      label: 'قيد المراجعة',
      value: 'Pending',
      icon: 'pi pi-clock',
      color: 'text-slate-500',
    },
    {
      label: '',
      value: 'Planned',
      icon: 'pi pi-calendar',
      color: 'text-blue-500',
    },
    {
      label: 'جاري التنفيذ (In Progress)',
      value: 'In Progress',
      icon: 'pi pi-spin pi-spinner',
      color: 'text-yellow-500',
    },
    {
      label: 'مكتمل (Completed)',
      value: 'Completed',
      icon: 'pi pi-check-circle',
      color: 'text-green-500',
    },
    {
      label: 'مغلق (Closed)',
      value: 'Closed',
      icon: 'pi pi-times-circle',
      color: 'text-red-500',
    },
  ];

  // --- Lifecycle Hooks ---

  ngOnChanges(changes: SimpleChanges) {
    // When the dialog opens, reset the form and set the current status
    if (changes['visible'] && this.visible) {
      this.resetForm();
    }
  }

  // --- Logic ---

  resetForm() {
    // Attempt to match the current status string to our dropdown values
    // Case-insensitive match is safer
    const match = this.statuses.find(
      (s) => s.value.toLowerCase() === this.currentStatus?.toLowerCase()
    );
    this.selectedStatus = match ? match.value : null;

    this.comment = '';
    this.submitted = false;
  }

  save() {
    this.submitted = true;

    // Validation: Status is required, Comment is required (usually good practice for logs)
    if (!this.selectedStatus || !this.comment.trim()) {
      return;
    }

    // Emit the result
    const result: StatusUpdateEvent = {
      newStatus: this.selectedStatus,
      comment: this.comment,
    };

    this.onSave.emit(result);
    this.close();
  }

  close() {
    this.visible = false;
    this.visibleChange.emit(false);
  }
}
