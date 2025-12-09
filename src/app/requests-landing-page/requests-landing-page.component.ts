import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

// PrimeNG Imports
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { MultiSelectModule } from 'primeng/multiselect'; // <--- NEW for Dropdown List

@Component({
  selector: 'app-requests-landing-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    ButtonModule,
    TagModule,
    MultiSelectModule,
  ],
  templateUrl: './requests-landing-page.component.html',
  styleUrl: './requests-landing-page.component.css',
})
export class RequestsLandingPageComponent {
  // Filter Data
  // Empty array [] means "All" in our logic
  selectedCategories: string[] = [];

  filterOptions = [
    { label: 'اقتراح إضافة', value: 'feature' },
    { label: 'خطأ مبلّغ', value: 'bug' },
    { label: 'سؤال', value: 'question' },
    { label: 'أخرى', value: 'other' },
  ];

  // Dummy Data
  requests = {
    review: [
      { id: 1, title: 'إضافة الوضع الليلي', type: 'feature', votes: 341 },
      { id: 2, title: 'تحسين سرعة التحميل', type: 'feature', votes: 120 },
    ],
    inProgress: [
      { id: 3, title: 'إصلاح خطأ تسجيل الدخول', type: 'bug', votes: 85 },
      { id: 4, title: 'صلاحيات المشرفين', type: 'feature', votes: 500 },
    ],
    done: [
      { id: 5, title: 'إطلاق النسخة التجريبية', type: 'news', votes: 1000 },
      { id: 6, title: 'تصدير PDF', type: 'feature', votes: 230 },
      { id: 7, title: 'تصدير PDF', type: 'feature', votes: 230 },
      { id: 8, title: 'تصدير PDF', type: 'feature', votes: 230 },
      { id: 9, title: 'تصدير PDF', type: 'feature', votes: 230 },
      { id: 10, title: 'تصدير PDF', type: 'feature', votes: 230 },
    ],
  };

  getTypeSeverity(
    type: string
  ):
    | 'success'
    | 'info'
    | 'warn'
    | 'danger'
    | 'secondary'
    | 'contrast'
    | undefined {
    switch (type) {
      case 'feature':
        return 'info';
      case 'bug':
        return 'danger';
      case 'news':
        return 'success';
      default:
        return 'secondary';
    }
  }

  getTypeLabel(type: string): string {
    switch (type) {
      case 'feature':
        return 'اقتراح';
      case 'bug':
        return 'خطأ';
      case 'news':
        return 'خبر';
      default:
        return 'عام';
    }
  }
}
