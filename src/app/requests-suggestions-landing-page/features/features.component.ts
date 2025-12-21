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

import { RequestCardComponent } from '../../request-card/request-card.component';

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
import { ToastModule } from 'primeng/toast';
import { RequestService } from '../../services/request.service';
import { MessageService } from 'primeng/api';
import { CategoryService } from '../../services/category.service';
import { Category, RequestType } from '../../shared/models/request.model';
// Validators
import { fileValidators } from '../../shared/validators/file.validators';
import { noWhitespaceValidator } from '../../shared/validators/common.validator';

@Component({
  selector: 'app-features',
  standalone: true,
  imports: [
    RequestCardComponent,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    InputTextModule,
    ToastModule,
    TextareaModule,
    FloatLabelModule,
    AutoCompleteModule,
    ButtonModule,
    IconFieldModule,
    InputIconModule,
    SelectButtonModule,
    TagModule,
  ],
  providers: [RequestService, MessageService],
  templateUrl: './features.component.html',
  styleUrl: './features.component.css',
})
export class FeaturesComponent implements OnInit {
  constructor(
    private requestService: RequestService,
    private messageService: MessageService,
    private categoryService: CategoryService
  ) {}
  submitted = signal<boolean>(false);

  searchQuery = signal('');
  currentSort = signal<'newest' | 'mostVoted'>('newest');

  sortOptions = [
    { label: 'الأحدث', value: 'newest' },
    { label: 'الأكثر تصويتاً', value: 'mostVoted' },
  ];

  // 1. Define Categories Object
  // 1. Change type to your real Interface
  categories: Category[] = [];
  filteredCategories: Category[] = [];
  requests = signal<any[]>([]);

  form = new FormGroup({
    title: new FormControl('', [Validators.required, noWhitespaceValidator()]),
    description: new FormControl('', [
      Validators.required,
      noWhitespaceValidator(),
    ]),
    category: new FormControl<any>(null, [Validators.required]),
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

    this.categoryService.getFeatureCategories().subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: (err) => console.error('Failed to load categories', err),
    });

    this.requestService.getFeatureRequests().subscribe({
      next: (data) => {
        this.requests.set(data);
      },
      error: (err) => console.error(err),
    });
  }

  searchCategory(event: any) {
    const query = event.query.toLowerCase();
    this.filteredCategories = this.categories.filter((item) =>
      item.name.toLowerCase().includes(query)
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
      // 1. Prepare Data
      const formValue = this.form.getRawValue();

      const categoryId = formValue.category || 0;

      // 2. Call Service
      const requestData = {
        title: formValue.title,
        description: formValue.description,
        category: categoryId,
        type: RequestType.Regular, // Adjust as needed
      };

      // 3. Send
      this.requestService
        .createRequest(requestData, this.filesArray)
        .subscribe({
          next: (res) => {
            // 3. Trigger Success Message
            this.messageService.add({
              severity: 'success',
              summary: 'تم الإرسال',
              detail: 'تم استلام اقتراحك بنجاح وسنراجعه قريباً',
              life: 3000, // Disappears after 3s
            });
            this.reset(); // Clear form
          },
          error: (err) => {
            // 4. Trigger Error Message
            this.messageService.add({
              severity: 'error',
              summary: 'خطأ',
              detail: 'حدث خطأ أثناء إرسال البيانات، يرجى المحاولة لاحقاً',
            });
          },
        });
    } else {
      this.form.markAllAsTouched();
    }
  }

  reset() {
    this.submitted.set(false);
    this.form.reset({ category: null });
    this.searchQuery.set('');
  }

  displayedRequests = computed(() => {
    console.log('Filtered Requests:');
    const query = this.searchQuery().toLowerCase().trim();
    let filtered = this.requests();
    console.log('Filtered Requests:', filtered);

    if (query !== '') {
      filtered = filtered.filter((request) =>
        request.title?.toLowerCase().includes(query)
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
