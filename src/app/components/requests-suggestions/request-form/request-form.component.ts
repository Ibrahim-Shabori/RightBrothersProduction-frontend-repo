import { FileService } from './../../../services/file.service';
import { TextareaModule } from 'primeng/textarea';
import {
  Component,
  computed,
  effect,
  EventEmitter,
  Input,
  OnInit,
  Output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime } from 'rxjs';

// PrimeNG Imports
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { FloatLabelModule } from 'primeng/floatlabel';
import { MessageService } from 'primeng/api';
import { Tooltip } from 'primeng/tooltip';
// Services & Models (Assumed Paths)
import {
  Category,
  FileDto,
  RequestType,
} from './../../../shared/models/request.model';
import { ProfileService } from './../../../services/profile.service';
import { AuthService } from './../../../services/auth.service';
import { CategoryService } from './../../../services/category.service';
import { RequestService } from './../../../services/request.service';

export type FormContext = 'feature' | 'bug';

@Component({
  selector: 'app-request-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    InputNumberModule,
    AutoCompleteModule,
    FloatLabelModule,
    Tooltip,
  ],
  templateUrl: './request-form.component.html',
})
export class RequestFormComponent implements OnInit {
  // --- Inputs (Router can bind these if withComponentInputBinding is enabled) ---
  @Input() id?: string;
  // You can pass data: { context: 'bug' } in your route definition
  @Input() set context(val: FormContext) {
    // 1. Update the signal immediately
    this.formContext.set(val);

    // 2. IMPORTANT: Reload categories because Bugs use different categories than Features
    this.loadCategories();
  }

  @Output() onSuccess = new EventEmitter<void>();

  oldFilesToDelete: number[] = [];

  constructor(
    private requestService: RequestService,
    private messageService: MessageService,
    private categoryService: CategoryService,
    private profileService: ProfileService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private fileService: FileService
  ) {
    // Auto-fill contact info effect
    effect(() => {
      const email = this.userEmail();
      const phone = this.userPhoneNumber();

      // Only patch if form fields are empty or untouched to avoid overwriting user input
      if (email && !this.form.get('contributerEmail')?.dirty) {
        this.form.patchValue({ contributerEmail: email });
      }
      if (phone && !this.form.get('contributerPhoneNumber')?.dirty) {
        this.form.patchValue({ contributerPhoneNumber: phone });
      }
    });
  }

  // --- State Signals ---
  formContext = signal<FormContext>('feature'); // 'feature' or 'bug'
  isEditMode = signal<boolean>(false);
  isDetailedMode = signal<boolean>(false);
  submitted = signal<boolean>(false);
  loading = signal<boolean>(false);
  authStatus = signal<boolean>(false);

  // --- Data State ---
  categories: Category[] = [];
  filteredCategories: Category[] = [];
  filesArray: File[] = []; // New files to upload
  existingFiles: FileDto[] = []; // URLs of existing files (Edit mode)

  userEmail = signal<string>('');
  userPhoneNumber = signal<string>('');
  requestId: number | null = null;

  // --- Form Definition ---
  form = new FormGroup({
    // 1. Base Fields
    title: new FormControl('', [Validators.required, Validators.maxLength(40)]),
    description: new FormControl('', [
      Validators.required,
      Validators.maxLength(300),
    ]),
    category: new FormControl<Category | null>(null, [Validators.required]),
    files: new FormControl(null),

    // 2. Detailed Fields
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
    // 1. Determine Context (Bug vs Feature)
    // Check Route Data first (set in app.routes.ts), fallback to Input
    this.route.data.subscribe((data) => {
      if (data['context']) {
        this.formContext.set(data['context']);
        this.context = data['context'];
      }
    });

    // 2. Load Categories based on Context
    this.loadCategories();

    // 3. Check for Edit Mode
    if (this.id || this.route.snapshot.paramMap.get('id')) {
      this.requestId = Number(
        this.id || this.route.snapshot.paramMap.get('id')
      );
      this.isEditMode.set(true);
      this.loadRequestData(this.requestId);
    }

    // 4. Load User Info (for auto-fill)
    this.authService.authStatus$.subscribe((val) => this.authStatus.set(val));
    if (this.authStatus()) {
      this.profileService.getUserContactInfo().subscribe({
        next: (info) => {
          this.userEmail.set(info.email);
          this.userPhoneNumber.set(info.phoneNumber || '');
        },
      });
    }

    // 5. Initialize Form State
    this.updateControlsState();
  }

  // --- Data Loading ---

  loadCategories() {
    const apiCall =
      this.formContext() === 'bug'
        ? this.categoryService.getBugCategories()
        : this.categoryService.getFeatureCategories();

    apiCall.subscribe({
      next: (data) => (this.categories = data),
      error: () =>
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load categories',
        }),
    });
  }

  loadRequestData(id: number) {
    this.loading.set(true);
    this.requestService.getRequestDetails(id).subscribe({
      next: (data) => {
        // get category id
        let categoryId = 0;
        this.isDetailedMode.set(data.isDetailed);
        this.updateControlsState();

        if (data.categoryName) {
          for (let i = 0; i < this.categories.length; i++) {
            if (this.categories[i].name === data.categoryName) {
              categoryId = this.categories[i].id;
              break;
            }
          }
        }
        // Patch Basic Fields
        this.form.patchValue({
          title: data.title,
          description: data.description,
          category: data.categoryName
            ? ({
                name: data.categoryName,
                color: data.categoryColor,
                id: categoryId,
              } as Category)
            : null,
        });
        // Patch Detailed Fields (if they exist)
        if (data.detailedDescription) {
          this.isDetailedMode.set(true);
          this.form.patchValue({
            detailedDescription: data.detailedDescription, // Map backend field names
            usageDurationInMonths: data.usageDuration,
            urgencyCause: data.urgencyCause,
            additionalNotes: data.additionalNotes,
            contributerEmail: data.contributorEmail,
            contributerPhoneNumber: data.contributorPhoneNumber,
          });
          this.updateControlsState();
        }
        // Handle Existing Files (Store URLs separately as they aren't File objects)
        if (data.files) {
          this.existingFiles = data.files;
        }
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Could not load request data',
        });
      },
    });
  }

  // --- Mode Toggling ---
  toggleDetailedMode() {
    if (!this.isEditMode()) {
      this.isDetailedMode.update((v) => !v);
      this.updateControlsState();
    }
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

  // --- Form Actions ---

  searchCategory(event: any) {
    const query = event.query.toLowerCase();
    this.filteredCategories = this.categories.filter((item) =>
      item.name.toLowerCase().includes(query)
    );
  }

  getCategoryColor(category: Category) {
    return category?.color || '#ccc';
  }

  // --- File Handling ---

  onFileChange(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.filesArray = [
        ...this.filesArray,
        ...Array.from(event.target.files as FileList),
      ];
    }
  }

  removeNewFile(index: number) {
    this.filesArray.splice(index, 1);
  }

  // Optional: Logic to remove existing files (requires API support)
  removeExistingFile(file: FileDto) {
    this.existingFiles = this.existingFiles.filter((f) => f.link !== file.link);
    this.oldFilesToDelete.push(file.id);
  }

  downloadFile(fileName: string) {
    if (this.requestId) {
      return this.fileService.downloadFile(this.requestId, fileName);
    }
  }

  // --- Submission ---

  reset() {
    this.form.reset({ category: null });
    this.filesArray = [];
    this.submitted.set(false);
    this.isEditMode.set(false);

    // Reset contact info
    if (this.userEmail())
      this.form.patchValue({ contributerEmail: this.userEmail() });
    if (this.userPhoneNumber())
      this.form.patchValue({ contributerPhoneNumber: this.userPhoneNumber() });

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
    this.loading.set(true);

    // 1. Prepare Payload
    // Map the Type correctly based on Context + Mode
    const requestType = this.calculateRequestType();

    const payload = {
      ...formValue,
      category: formValue.category ? formValue.category.id : 1, // Ensure we send ID
    };

    // 2. Determine Action (Create vs Update)
    if (this.isEditMode() && this.requestId) {
      // === UPDATE ===
      this.requestService
        .updateRequest(
          this.requestId,
          payload,
          this.filesArray,
          this.oldFilesToDelete
        )
        .subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Updated',
              detail: 'Request updated successfully',
            });
            this.router.navigate(['/request', this.requestId]); // Go back to details
          },
          error: (err) => {
            this.loading.set(false);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: err.message,
            });
          },
        });
    } else {
      // === CREATE ===
      // Logic: You had separate methods for Detailed vs Regular.
      // We can check isDetailedMode() to decide which Service method to call.

      let requestObservable;

      if (this.isDetailedMode()) {
        requestObservable = this.requestService.createDetailedRequest(
          payload,
          this.filesArray
        );
      } else {
        requestObservable = this.requestService.createRequest(
          payload,
          this.filesArray
        );
      }

      requestObservable.subscribe({
        next: (res) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Sent',
            detail: 'Request submitted successfully',
          });
          this.reset();
          this.loading.set(false);
          this.onSuccess.emit();
          // Optional: Redirect
          // this.router.navigate(['/requests']);
        },
        error: (err) => {
          console.error(err);
          this.loading.set(false);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Submission failed',
          });
        },
      });
    }
  }

  private calculateRequestType(): RequestType {
    const isBug = this.formContext() === 'bug';
    const isDetailed = this.isDetailedMode();

    if (isBug) {
      return isDetailed ? RequestType.DetailedBug : RequestType.Bug;
    } else {
      return isDetailed ? RequestType.Detailed : RequestType.Regular;
    }
  }
}
