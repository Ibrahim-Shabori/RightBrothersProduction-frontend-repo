import { CreateCategoryDto } from './../../../shared/models/category.model';
import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

// PrimeNG Imports
import { TableModule, TableRowReorderEvent } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';

// Child Component & Model
import {
  CategoryDialogComponent,
  CategoryDto,
} from '../category-dialog/category-dialog.component';
import { CategoryService } from '../../../services/category.service';
import { RequestType } from '../../../shared/models/request.model';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    TagModule,
    ToastModule,
    TooltipModule,
    CategoryDialogComponent,
  ],
  templateUrl: './category-list.component.html',
  providers: [MessageService, CategoryService], // Local provider ensures toasts don't conflict globally if needed
})
export class CategoryListComponent implements OnInit {
  // 1. The Critical Input: Determines if we show 'Features' (0) or 'Bugs' (1)
  @Input() requestType!: RequestType;

  // Data State
  categories: CategoryDto[] = [];
  loading: boolean = true;

  // Dialog State
  showDialog: boolean = false;
  selectedCategory: CategoryDto | null = null; // null = Create Mode

  constructor(
    private messageService: MessageService,
    private categoryService: CategoryService
  ) {}

  ngOnInit() {
    this.loadCategories();
  }

  // --- Data Loading (Mocked) ---
  loadCategories() {
    this.loading = true;

    if (this.requestType == RequestType.Regular) {
      this.categoryService.getFeatureCategories().subscribe({
        next: (categories) => {
          this.categories = categories;
          this.loading = false;
        },
        error: (err) => {
          this.loading = false;
        },
      });
    } else {
      this.categoryService.getBugCategories().subscribe({
        next: (categories) => {
          this.categories = categories;
          this.loading = false;
        },
        error: (err) => {
          this.loading = false;
        },
      });
    }
  }

  // --- Dialog Actions ---

  openCreateDialog() {
    this.selectedCategory = null; // Switches Dialog to "Create Mode"
    this.showDialog = true;
  }

  openEditDialog(category: CategoryDto) {
    // Clone the object to prevent live-editing in the table before saving
    this.selectedCategory = { ...category };
    this.showDialog = true;
  }

  // --- Save Logic (Create & Update) ---

  handleSave(category: CategoryDto) {
    // 1. Ensure the Type is set correctly (Backend safety)
    category.type = this.requestType;

    if (category.id) {
      // A. Update Existing Logic
      const index = this.categories.findIndex((c) => c.id === category.id);
      this.categories[index] = category;
      if (index !== -1) {
        let updateCategoryDto: CreateCategoryDto = {
          name: category.name,
          color: category.color,
          type: category.type,
        };
        this.categoryService
          .updateCategory(category.id!, updateCategoryDto)
          .subscribe();
        this.messageService.add({
          severity: 'success',
          summary: 'تم التحديث',
          detail: 'تم تعديل التصنيف بنجاح',
        });
      }
    } else {
      // B. Create New Logic
      // In a real app, the API returns the new ID. Here we mock it.
      let createCategoryDto: CreateCategoryDto = {
        name: category.name,
        color: category.color,
        type: category.type,
      };

      this.categoryService.createCategory(createCategoryDto).subscribe({
        next: (category) => {
          this.categories.push(category);
          this.messageService.add({
            severity: 'success',
            summary: 'تم الإضافة',
            detail: 'تم إضافة التصنيف بنجاح',
          });
        },
      });
    }

    // Close dialog
    this.showDialog = false;
  }

  // --- Reordering Logic ---

  onRowReorder(event: TableRowReorderEvent) {
    // 1. Extract IDs in their new order
    const sortedIds = this.categories.map((c) => c.id!);

    // 2. Debug Log (Replace with API call)
    this.categoryService.reorderCategories(sortedIds).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'تم الترتيب',
          detail: 'تم ترتيب التصنيفات بنجاح',
        });
      },
    });
  }
}
