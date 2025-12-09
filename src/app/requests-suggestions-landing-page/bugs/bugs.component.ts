import { Component, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormsModule,
} from '@angular/forms';
import { transformToNumber } from 'primeng/utils';
import { debounceTime } from 'rxjs';

// PrimeNG Imports
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TagModule } from 'primeng/tag';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { TooltipModule } from 'primeng/tooltip';

// Validators
import { fileValidators } from '../../shared/validators/file.validators';
import { noWhitespaceValidator } from '../../shared/validators/common.validator';

@Component({
  selector: 'app-bugs',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    InputTextModule,
    TextareaModule,
    FloatLabelModule,
    AutoCompleteModule,
    ButtonModule,
    IconFieldModule,
    InputIconModule,
    SelectButtonModule,
    TagModule,
    TooltipModule,
  ],
  templateUrl: './bugs.component.html',
  styleUrl: './bugs.component.css',
})
export class BugsComponent implements OnInit {
  submitted = signal<boolean>(false);

  // Search & Sort Signals
  searchQuery = signal('');
  currentSort = signal<'newest' | 'mostVoted'>('newest');

  sortOptions = [
    { label: 'الأحدث', value: 'newest' },
    { label: 'الأكثر تصويتاً', value: 'mostVoted' },
  ];

  // 1. Bug Specific Categories
  categories = [
    { label: 'خطأ وظيفي (Functional)', value: 'functional' },
    { label: 'خطأ في العرض (Visual)', value: 'visual' },
    { label: 'مشكلة في الأداء (Performance)', value: 'performance' },
    { label: 'مشكلة أمنية (Security)', value: 'security' },
    { label: 'غير ذلك', value: 'other' },
  ];

  filteredCategories: any[] = [];

  form = new FormGroup({
    title: new FormControl('', [Validators.required, noWhitespaceValidator()]),
    description: new FormControl('', [
      Validators.required,
      noWhitespaceValidator(),
    ]),
    category: new FormControl<any>(this.categories[0], [Validators.required]),
    files: new FormControl<FileList | null>(null, [
      fileValidators(5, 20, ['image/png', 'image/jpeg', 'video/mp4']),
    ]),
  });

  ngOnInit() {
    // Smart Search: Filters the list while user types the bug title
    this.form.valueChanges.pipe(debounceTime(300)).subscribe((val) => {
      const text = (val.title || '') + ' ' + (val.description || '');
      if (text.length > 2) {
        this.searchQuery.set(val.title || '');
      } else if (text.length === 0) {
        this.searchQuery.set('');
      }
    });
  }

  searchCategory(event: any) {
    const query = event.query.toLowerCase();
    this.filteredCategories = this.categories.filter((item) =>
      item.label.toLowerCase().includes(query)
    );
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    this.form.patchValue({ files: input.files });
    this.form.get('files')?.updateValueAndValidity();
  }

  get filesArray(): File[] {
    const files = this.form.get('files')?.value as FileList;
    return files ? Array.from(files) : [];
  }

  onSubmit() {
    this.submitted.set(true);
    if (this.form.valid) {
      const rawValue = this.form.getRawValue();
      const payload = {
        ...rawValue,
        category: rawValue.category?.value,
      };
      console.log('Bug Report Submitted:', payload);
      this.searchQuery.set('');
    } else {
      this.form.markAllAsTouched();
    }
  }

  reset() {
    this.submitted.set(false);
    this.form.reset({ category: this.categories[0] });
    this.searchQuery.set('');
  }

  // Bug Severity Helper (Optional visual cue)
  getCategorySeverity(
    category: string
  ):
    | 'success'
    | 'info'
    | 'warn'
    | 'danger'
    | 'secondary'
    | 'contrast'
    | undefined {
    switch (category) {
      case 'security':
        return 'danger';
      case 'functional':
        return 'warn';
      case 'performance':
        return 'info';
      default:
        return 'secondary';
    }
  }

  // --- List Logic ---
  allProducts = signal<any[]>([
    {
      votesCount: '42',
      requestTitle: 'فشل تسجيل الدخول عند استخدام متصفح Safari',
      createdAt: new Date('2024-06-15'),
      requestType: 'إبلاغ عن خطأ',
      category: 'functional',
    },
    {
      votesCount: '15',
      requestTitle: 'الزر "حفظ" يختفي في شاشات الموبايل الصغيرة',
      createdAt: new Date('2024-06-14'),
      requestType: 'إبلاغ عن خطأ',
      category: 'visual',
    },
    {
      votesCount: '8',
      requestTitle: 'بطء شديد عند تحميل ملفات Excel الكبيرة',
      createdAt: new Date('2024-06-13'),
      requestType: 'إبلاغ عن خطأ',
      category: 'performance',
    },
  ]);

  displayedProducts = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    let filtered = this.allProducts();

    if (query) {
      filtered = filtered.filter((product) =>
        product.requestTitle?.toLowerCase().includes(query)
      );
    }

    return [...filtered].sort((a, b) => {
      if (this.currentSort() === 'mostVoted') {
        return (
          transformToNumber(b.votesCount!) - transformToNumber(a.votesCount!)
        );
      } else {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
    });
  });
}
