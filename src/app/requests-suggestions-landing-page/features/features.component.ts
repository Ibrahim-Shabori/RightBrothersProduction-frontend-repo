import { Component, input, signal } from '@angular/core';
import { AutoResizeDirective } from '../../auto-resize.directive';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { fileValidators } from '../../shared/validators/file.validators';
import { droplistValidator } from '../../shared/validators/droplist.validator';
import { noWhitespaceValidator } from '../../shared/validators/common.validator';

@Component({
  selector: 'app-features',
  imports: [AutoResizeDirective, ReactiveFormsModule],
  templateUrl: './features.component.html',
  styleUrl: './features.component.css',
})
export class FeaturesComponent {
  submitted = signal<boolean>(false);
  form = new FormGroup({
    title: new FormControl('', [Validators.required, noWhitespaceValidator()]),
    description: new FormControl('', [
      Validators.required,
      noWhitespaceValidator(),
    ]),
    category: new FormControl('', [Validators.required]),
    files: new FormControl<FileList | null>(null, [
      fileValidators(5, 20, ['image/png', 'image/jpeg', 'video/mp4']),
    ]),
  });

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
    // make submitted true to show validation errors
    this.submitted.set(true);
    if (this.form.valid) {
      console.log('Form Submitted', this.form.value);
    } else {
      console.log('Form Invalid');
    }
  }

  reset() {
    this.submitted.set(false);
    this.form.reset();
  }
}
