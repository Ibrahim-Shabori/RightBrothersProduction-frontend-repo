import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Required for ngClass
import { Router, RouterModule } from '@angular/router';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

// PrimeNG Imports
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { FloatLabelModule } from 'primeng/floatlabel';

// Services & Validators
import { AuthService } from '../../auth.service';
import {
  matchPasswordValidator,
  passwordValidator,
} from '../../shared/validators/password.validators';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    FloatLabelModule,
  ],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css',
})
export class SignupComponent implements OnInit {
  errorMessage: string | null = null;

  constructor(private auth: AuthService, private router: Router) {}

  form = new FormGroup({
    fullname: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
    ]),
    phoneNumber: new FormControl('', [
      Validators.required,
      Validators.minLength(10),
      Validators.maxLength(15),
    ]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, passwordValidator()]),
    confirmPassword: new FormControl('', [
      Validators.required,
      matchPasswordValidator('password'),
    ]),
  });

  onSubmit() {
    if (this.form.invalid) {
      // Mark all controls so errors become visible in the UI
      this.form.markAllAsTouched();
      this.errorMessage = 'يرجى تصحيح الأخطاء في النموذج قبل الإرسال.';
      return;
    }

    // Use Safe navigation or type assertion if strict mode complains
    const rawValue = this.form.getRawValue();
    const payload = {
      email: rawValue.email!,
      password: rawValue.password!,
      fullname: rawValue.fullname!,
      phoneNumber: rawValue.phoneNumber!,
    };

    this.auth.signup(payload).subscribe({
      next: (res) => this.router.navigate(['']),
      error: (err) => {
        // Handle .NET backend errors
        if (err.error?.errors) {
          // Flatten the dictionary of errors
          this.errorMessage = Object.values(err.error.errors).flat().join('، ');
        } else {
          this.errorMessage = err.error || 'فشل التسجيل. حاول مرة أخرى.';
        }
      },
    });
  }

  ngOnInit(): void {
    this.auth.googleResponse$.subscribe((res) => {
      const idToken = res.credential;

      this.auth.loginWithGoogle(idToken).subscribe({
        next: (result) => {
          localStorage.setItem('jwt', result.token);
          this.router.navigate(['/']);
        },
        error: (err) => {
          if (err.error?.errors) {
            this.errorMessage = Object.values(err.error.errors)
              .flat()
              .join(', ');
          } else {
            this.errorMessage = err.error || 'فشل التسجيل. حاول مرة أخرى.';
          }
        },
      });
    });
  }

  onGoogleClick() {
    this.auth.prompt();
  }
}
