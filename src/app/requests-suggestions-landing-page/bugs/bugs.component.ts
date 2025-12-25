import { Component, computed, signal, OnInit, effect } from '@angular/core';
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
import { ToastModule } from 'primeng/toast';
import { InputNumberModule } from 'primeng/inputnumber';
import { RequestService } from '../../services/request.service';
import { MessageService } from 'primeng/api';
import { CategoryService } from '../../services/category.service';
import { VoteService } from '../../services/vote.service';
import { ProfileService } from '../../services/profile.service';
// Validators
import { fileValidators } from '../../shared/validators/file.validators';
import { noWhitespaceValidator } from '../../shared/validators/common.validator';
import {
  Category,
  RequestResponseDto,
  RequestType,
} from '../../shared/models/request.model';
import { RequestCardComponent } from '../../request-card/request-card.component';

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
    ToastModule,
    RequestCardComponent,
    InputNumberModule,
  ],
  templateUrl: './bugs.component.html',
  styleUrl: './bugs.component.css',
  providers: [RequestService, MessageService],
})
export class BugsComponent implements OnInit {
  constructor(
    private requestService: RequestService,
    private messageService: MessageService,
    private categoryService: CategoryService,
    private voteService: VoteService,
    private profileService: ProfileService
  ) {
    effect(() => {
      // This runs automatically whenever userEmail() or userPhoneNumber() changes
      const email = this.userEmail();
      const phone = this.userPhoneNumber();

      // Only patch if we actually have data (prevents overwriting user edits with empty strings)
      if (email) {
        this.form.patchValue({ contributerEmail: email });
      }

      if (phone) {
        this.form.patchValue({ contributerPhoneNumber: phone });
      }
      return;
    });
  }

  submitted = signal<boolean>(false);
  isDetailedMode = signal<boolean>(false);
  searchQuery = signal('');
  currentSort = signal<'newest' | 'mostVoted'>('newest');

  sortOptions = [
    { label: 'الأحدث', value: 'newest' },
    { label: 'الأكثر تصويتاً', value: 'mostVoted' },
  ];

  categories: Category[] = [];
  filteredCategories: Category[] = [];
  requests = signal<any[]>([]);
  filesArray: File[] = [];
  userEmail = signal<string>('');
  userPhoneNumber = signal<string>('');

  form = new FormGroup({
    // 1. Base Request Fields (Simple)
    title: new FormControl('', [Validators.required, Validators.maxLength(40)]),
    description: new FormControl('', [
      Validators.required,
      Validators.maxLength(300),
    ]),
    category: new FormControl<any>(null, [Validators.required]),
    files: new FormControl(null),

    // 2. Detailed Request Fields (Initially Disabled)
    detailedDescription: new FormControl('', [
      Validators.required,
      Validators.maxLength(4000),
    ]),
    usageDurationInMonths: new FormControl<number | null>(null),
    urgencyCause: new FormControl('', [Validators.maxLength(500)]),
    additionalNotes: new FormControl('', [Validators.maxLength(2000)]),
    contributerPhoneNumber: new FormControl('', [
      Validators.minLength(11),
      Validators.maxLength(15),
      Validators.pattern(/^[0-9+]+$/),
    ]),
    contributerEmail: new FormControl('', [
      Validators.email,
      Validators.maxLength(255),
    ]),
  });

  ngOnInit() {
    this.profileService.getUserContactInfo().subscribe({
      next: (info) => {
        this.userEmail.set(info.email);
        this.userPhoneNumber.set(info.phoneNumber || '');
      },
    });
    this.updateControlsState();
    // Smart Search: Filters the list while user types the bug title
    this.form.valueChanges.pipe(debounceTime(300)).subscribe((val) => {
      const text = (val.title || '') + ' ' + (val.description || '');
      if (text.length > 2) {
        this.searchQuery.set(val.title || '');
      } else if (text.length === 0) {
        this.searchQuery.set('');
      }
    });

    this.categoryService.getBugCategories().subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: (err) => console.error('Failed to load categories', err),
    });

    this.requestService.getBugRequests().subscribe({
      next: (data) => {
        this.requests.set(data);
      },
      error: (err) => console.error(err),
    });
  }

  toggleDetailedMode() {
    this.isDetailedMode.update((v) => !v);
    this.updateControlsState();
  }

  private updateControlsState() {
    const detailedFields = [
      'detailedDescription',
      'usageDurationInMonths',
      'urgencyCause',
      'additionalNotes',
      'contributerPhoneNumber',
      'contributerEmail',
    ];

    if (this.isDetailedMode()) {
      detailedFields.forEach((f) => this.form.get(f)?.enable());
    } else {
      detailedFields.forEach((f) => this.form.get(f)?.disable());
    }
  }

  searchCategory(event: any) {
    const query = event.query.toLowerCase();
    this.filteredCategories = this.categories.filter((item) =>
      item.name.toLowerCase().includes(query)
    );
  }

  onFileChange(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      // Append new files to existing array
      this.filesArray = [
        ...this.filesArray,
        ...Array.from(event.target.files as FileList),
      ];
    }
  }

  removeFile(index: number) {
    this.filesArray.splice(index, 1);
  }

  onSubmit() {
    this.submitted.set(true);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.messageService.add({
        severity: 'error',
        summary: 'خطأ',
        detail: 'يرجى تعبئة الحقول المطلوبة',
      });
      return;
    }

    const formValue = this.form.getRawValue();

    // 1. Prepare Base Data (Common for both)
    const baseData = {
      title: formValue.title,
      description: formValue.description,
      category: formValue.category ? formValue.category : 0,
      type: this.isDetailedMode() ? RequestType.DetailedBug : RequestType.Bug,
    };

    if (this.isDetailedMode()) {
      // --- Detailed Mode ---
      const detailedData = {
        ...baseData,
        // Add detailed specific fields
        detailedDescription: formValue.detailedDescription,
        usageDurationInMonths: formValue.usageDurationInMonths,
        urgencyCause: formValue.urgencyCause,
        additionalNotes: formValue.additionalNotes,
        contributerPhoneNumber: formValue.contributerPhoneNumber,
        contributerEmail: formValue.contributerEmail,
      };

      // Call the specific Detailed method
      this.requestService
        .createDetailedRequest(detailedData, this.filesArray)
        .subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'تم الإرسال',
              detail: 'تم استلام مقترحك التفصيلي بنجاح',
            });
            this.reset();
          },
          error: (err) => {
            console.error(err);
            this.messageService.add({
              severity: 'error',
              summary: 'خطأ',
              detail: 'حدث خطأ أثناء إرسال الطلب',
            });
          },
        });
    } else {
      // --- Simple Mode ---
      // Call the existing simple method
      this.requestService.createRequest(baseData, this.filesArray).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'تم الإرسال',
            detail: 'تم استلام مقترحك بنجاح',
          });
          this.reset();
        },
        error: (err) => {
          console.error(err);
          this.messageService.add({
            severity: 'error',
            summary: 'خطأ',
            detail: 'حدث خطأ أثناء إرسال المقترح',
          });
        },
      });
    }
  }

  reset() {
    this.form.reset({ category: null });
    this.filesArray = [];
    this.submitted.set(false);

    if (this.isDetailedMode()) {
      this.toggleDetailedMode();
    }
  }

  displayedRequests = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    let filtered = this.requests();

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

  handleVote(request: RequestResponseDto) {
    // 1. Optimistic Update (Make UI instant)
    // We guess the new number so the user doesn't wait
    const previousCount = request.votesCount; // Backup in case of error
    request.votesCount += request.isVotedByCurrentUser ? -1 : 1;
    request.isVotedByCurrentUser = !request.isVotedByCurrentUser;

    // 2. Call API
    this.voteService.createRequestVote({ requestId: request.id }).subscribe({
      next: (actualNewCountFromServer) => {
        // 3. CORRECT ANSWER: Store the value directly!
        // This ensures your UI matches exactly what's in the DB
        request.votesCount = actualNewCountFromServer;
      },
      error: (err) => {
        // 4. Revert if it failed (Safety net)
        request.votesCount = previousCount;
        request.isVotedByCurrentUser = !request.isVotedByCurrentUser;
      },
    });
  }
}
