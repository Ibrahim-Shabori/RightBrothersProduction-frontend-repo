import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

// PrimeNG Imports
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea'; // 👈 FIX: Updated Module Name
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { FileUploadModule } from 'primeng/fileupload';

// Services & Models
import { ProfileService, UpdateProfileDto } from '../../services/profile.service';

@Component({
  selector: 'app-profile-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    TextareaModule, // 👈 Updated here
    PasswordModule,
    ButtonModule,
    DividerModule,
    MessageModule,
    ToastModule,
    FileUploadModule
  ],
  providers: [MessageService],
  templateUrl: './profile-settings.component.html',
  styleUrls: ['./profile-settings.component.css'],
})
export class ProfileSettingsComponent implements OnInit {
  
  isLoading = signal<boolean>(true);
  isSaving = signal<boolean>(false);

  // Define Form Structure
  settingsForm = new FormGroup({
    fullName: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
    ]),
    email: new FormControl({ value: '', disabled: true }, [
      Validators.required,
      Validators.email,
    ]),
    phoneNumber: new FormControl(''),
    
    // Bio Field
    bio: new FormControl('', [Validators.maxLength(500)]), 

    // Password Section
    currentPassword: new FormControl(''),
    newPassword: new FormControl('', [
        Validators.minLength(8) 
    ]), 
  });

  constructor(
    private profileService: ProfileService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.loadUserData();
  }

  loadUserData() {
    this.isLoading.set(true);
    
    this.profileService.getMyProfile().subscribe({
      next: (profile) => {
        this.settingsForm.patchValue({
          fullName: profile.fullName,
          email: profile.email || '', 
          phoneNumber: profile.phoneNumber || '',
          bio: profile.bio || ''
        });
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load profile', err);
        this.messageService.add({ 
            severity: 'error', 
            summary: 'خطأ', 
            detail: 'فشل تحميل بيانات المستخدم' 
        });
        this.isLoading.set(false);
      }
    });
  }

  // --- Profile Picture Upload Logic ---
  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.profileService.uploadProfilePicture(file).subscribe({
        next: (res) => {
          this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم تحديث الصورة الشخصية' });
        },
        error: (err) => {
             this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل رفع الصورة' });
        }
      });
    }
  }

  onSubmit() {
    if (this.settingsForm.invalid) {
      this.settingsForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);

    const formValues = this.settingsForm.getRawValue();

    // Construct DTO
    const dto: UpdateProfileDto = {
        fullName: formValues.fullName!,
        phoneNumber: formValues.phoneNumber!,
        bio: formValues.bio || '',
        // Only include passwords if the user is trying to change them
        ...(formValues.newPassword ? {
            currentPassword: formValues.currentPassword!,
            newPassword: formValues.newPassword
        } : {})
    };

    this.profileService.updateProfile(dto).subscribe({
      next: (res) => {
        this.isSaving.set(false);
        this.messageService.add({ 
            severity: 'success', 
            summary: 'تم الحفظ', 
            detail: 'تم تحديث البيانات بنجاح' 
        });
        
        // Reset password fields for security
        this.settingsForm.patchValue({
            currentPassword: '',
            newPassword: ''
        });
        this.settingsForm.get('currentPassword')?.setErrors(null);
        this.settingsForm.get('newPassword')?.setErrors(null);
      },
      error: (error: HttpErrorResponse) => {
        this.isSaving.set(false);
        const errorMsg = error.error?.message || 'حدث خطأ أثناء الحفظ';
        this.messageService.add({ 
            severity: 'error', 
            summary: 'فشل الحفظ', 
            detail: errorMsg 
        });
      }
    });
  }
}