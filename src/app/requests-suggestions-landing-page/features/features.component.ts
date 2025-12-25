import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormsModule,
} from '@angular/forms';

// PrimeNG Imports
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { FloatLabelModule } from 'primeng/floatlabel';
import { FileUploadModule } from 'primeng/fileupload';
import { ToastModule } from 'primeng/toast';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { SelectButtonModule } from 'primeng/selectbutton';
import { InputNumberModule } from 'primeng/inputnumber'; // Required for the duration field
import { MessageService } from 'primeng/api';

// Services & Models (Assuming these exist based on your context)
import { RequestService } from '../../services/request.service';
import { CategoryService } from '../../services/category.service';
import { RequestCardComponent } from '../../request-card/request-card.component';
import {
  Category,
  RequestResponseDto,
  RequestType,
} from '../../shared/models/request.model';
import { transformToNumber } from 'primeng/utils';
import { VoteService } from '../../services/vote.service';
import { ProfileService } from '../../services/profile.service';
import { debounceTime } from 'rxjs';
import { effect } from '@angular/core';
@Component({
  selector: 'app-features',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    InputTextModule,
    TextareaModule,
    ButtonModule,
    AutoCompleteModule,
    FloatLabelModule,
    FileUploadModule,
    ToastModule,
    IconFieldModule,
    InputIconModule,
    SelectButtonModule,
    InputNumberModule,
    RequestCardComponent,
  ],
  providers: [MessageService],
  templateUrl: './features.component.html',
})
export class FeaturesComponent implements OnInit {
  constructor(
    private requestService: RequestService,
    private messageService: MessageService,
    private voteService: VoteService,
    private categoryService: CategoryService,
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

  // --- State Signals ---
  isDetailedMode = signal<boolean>(false);
  submitted = signal<boolean>(false);

  // --- File Upload State ---
  filesArray: File[] = [];

  // --- Search & Sort State ---
  searchQuery = signal('');
  currentSort = signal<'newest' | 'mostVoted'>('newest');

  sortOptions = [
    { label: 'الأحدث', value: 'newest' },
    { label: 'الأكثر تصويتاً', value: 'mostVoted' },
  ];

  // --- Data Signals (Mocked/Empty for now) ---
  categories: Category[] = [];
  filteredCategories: Category[] = [];
  requests = signal<any[]>([]);
  userEmail = signal<string>('');
  userPhoneNumber = signal<string>('');

  // --- Form Definition ---
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
    // Load user contact info to prefill email/phone in detailed form
    this.profileService.getUserContactInfo().subscribe({
      next: (info) => {
        this.userEmail.set(info.email);
        this.userPhoneNumber.set(info.phoneNumber || '');
      },
    });
    // Ensure the form starts in the correct state (Simple mode = detailed fields disabled)
    this.updateControlsState();
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

  // --- Mode Toggling ---
  toggleDetailedMode() {
    this.isDetailedMode.update((v) => !v);
    this.updateControlsState();
  }

  // Helper: Disables detailed validators when in simple mode so form is valid
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

  // --- Form Actions ---

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

  // Optional: Method to remove a specific file before upload
  removeFile(index: number) {
    this.filesArray.splice(index, 1);
  }

  displayedRequests = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    let filtered = this.requests();

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

  reset() {
    this.form.reset({ category: null });
    this.filesArray = [];
    this.submitted.set(false);

    // Reset back to simple mode if you want
    if (this.isDetailedMode()) {
      this.toggleDetailedMode();
    }
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
      type: this.isDetailedMode() ? RequestType.Detailed : RequestType.Regular,
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
}
