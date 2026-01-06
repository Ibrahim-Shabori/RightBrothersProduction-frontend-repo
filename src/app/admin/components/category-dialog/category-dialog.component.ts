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
import { InputTextModule } from 'primeng/inputtext';
import { ColorPickerModule } from 'primeng/colorpicker';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

// DTO Interface
export interface CategoryDto {
  id?: number;
  name: string;
  color: string;
  isActive: boolean;
  displayOrder: number;
  type?: number; // 0 (Feature) or 1 (Bug) - Optional here as Parent handles it
}

@Component({
  selector: 'app-category-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    ColorPickerModule,
    ToggleSwitchModule,
  ],
  templateUrl: './category-dialog.component.html',
  styleUrl: './category-dialog.component.css',
})
export class CategoryDialogComponent implements OnChanges {
  // 1. Controls Visibility
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  // 2. Data Input (Null = Create Mode)
  @Input() category: CategoryDto | null = null;

  // 3. Output Event (Returns the form data to the parent)
  @Output() onSave = new EventEmitter<CategoryDto>();

  // Form Models
  name: string = '';
  color: string = '#3B82F6'; // Default Blue
  isActive: boolean = true;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['visible'] && this.visible) {
      if (this.category) {
        // Edit Mode: Populate fields
        this.name = this.category.name;
        this.color = this.category.color;
        this.isActive = this.category.isActive;
      } else {
        // Create Mode: Reset fields
        this.resetForm();
      }
    }
  }

  resetForm() {
    this.name = '';
    this.color = '#3B82F6';
    this.isActive = true;
  }

  save() {
    if (!this.name.trim()) return;

    const result: CategoryDto = {
      id: this.category?.id, // Keep ID if editing
      displayOrder: this.category?.displayOrder ?? 0, // Keep order if editing
      type: this.category?.type, // Keep type if editing
      name: this.name,
      color: this.color,
      isActive: this.isActive,
    };

    this.onSave.emit(result);
    // Note: We don't close immediately here; the Parent component
    // usually closes the dialog after the API call succeeds.
  }

  close() {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  // --- Dynamic UI Helpers ---

  get headerTitle(): string {
    return this.category ? 'تعديل التصنيف' : 'إضافة تصنيف جديد';
  }

  get saveButtonLabel(): string {
    return this.category ? 'حفظ التعديلات' : 'إضافة';
  }

  get saveButtonIcon(): string {
    return this.category ? 'pi pi-check' : 'pi pi-plus';
  }
}
