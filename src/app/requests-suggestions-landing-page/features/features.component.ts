import { Component, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormsModule, // Needed for ngModel in search bar
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
import { AutoCompleteModule } from 'primeng/autocomplete'; // 👈 NEW

// Validators
import { fileValidators } from '../../shared/validators/file.validators';
import { noWhitespaceValidator } from '../../shared/validators/common.validator';

@Component({
  selector: 'app-features',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    InputTextModule,
    TextareaModule,
    FloatLabelModule,
    AutoCompleteModule, // 👈 ADDED
    ButtonModule,
    IconFieldModule,
    InputIconModule,
    SelectButtonModule,
    TagModule,
  ],
  templateUrl: './features.component.html',
  styleUrl: './features.component.css',
})
export class FeaturesComponent implements OnInit {
  submitted = signal<boolean>(false);

  searchQuery = signal('');
  currentSort = signal<'newest' | 'mostVoted'>('newest');

  sortOptions = [
    { label: 'الأحدث', value: 'newest' },
    { label: 'الأكثر تصويتاً', value: 'mostVoted' },
  ];

  // 1. Define Categories Object
  categories = [
    { label: 'تحسين واجهة المستخدم', value: 'ui' },
    { label: 'تحسين تجربة المستخدم', value: 'ux' },
    { label: 'تحسينات أخرى', value: 'enhancement' },
  ];

  // 2. Holds the results for AutoComplete
  filteredCategories: any[] = [];

  form = new FormGroup({
    title: new FormControl('', [Validators.required, noWhitespaceValidator()]),
    description: new FormControl('', [
      Validators.required,
      noWhitespaceValidator(),
    ]),
    // 3. Initialize with the OBJECT, not string 'ui'
    category: new FormControl<any>(this.categories[0], [Validators.required]),
    files: new FormControl<FileList | null>(null, [
      fileValidators(5, 20, ['image/png', 'image/jpeg', 'video/mp4']),
    ]),
  });

  ngOnInit() {
    this.form.valueChanges.pipe(debounceTime(300)).subscribe((val) => {
      const text = (val.title || '') + ' ' + (val.description || '');
      if (text.length > 2) {
        this.searchQuery.set(val.title || '');
      } else if (text.length === 0) {
        this.searchQuery.set('');
      }
    });
  }

  // 4. Filter Logic for AutoComplete
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
      // 5. Extract the Value for backend (since form holds object now)
      const rawValue = this.form.getRawValue();
      const payload = {
        ...rawValue,
        category: rawValue.category?.value, // Get 'ui' from {label:..., value: 'ui'}
      };

      console.log('Form Submitted Payload:', payload);
      this.searchQuery.set('');
    } else {
      this.form.markAllAsTouched();
    }
  }

  reset() {
    this.submitted.set(false);
    // 6. Reset to the first category object
    this.form.reset({ category: this.categories[0] });
    this.searchQuery.set('');
  }

  // --- List Logic ---
  allProducts = signal<any[]>([
    {
      votesCount: '345',
      requestTitle: 'إضافة الوضع الليلي للنظام كاملاً',
      createdAt: new Date('2024-06-10'),
      requestType: 'اقتراح إضافة',
      category: 'ui',
    },
    {
      votesCount: '123',
      requestTitle: 'تحسين سرعة تصدير التقارير PDF',
      createdAt: new Date('2024-06-12'),
      requestType: 'إبلاغ عن خطأ',
      category: 'enhancement',
    },
    {
      votesCount: '567',
      requestTitle: 'سماح للمستخدمين بتغيير الصورة الشخصية',
      createdAt: new Date('2024-06-11'),
      requestType: 'اقتراح إضافة',
      category: 'ux',
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
