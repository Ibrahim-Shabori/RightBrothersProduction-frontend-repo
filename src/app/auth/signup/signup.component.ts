import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  matchPasswordValidator,
  passwordValidator,
} from '../../shared/validators/password.validators';
import { AuthService } from '../../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  imports: [ReactiveFormsModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css',
})
export class SignupComponent {
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
      // Mark all controls so errors become visible
      this.form.markAllAsTouched();

      this.errorMessage = 'يرجى تصحيح الأخطاء في النموذج قبل الإرسال.';
      return; // 🚫 Do not call the backend
    }

    const { email, password, fullname, phoneNumber } = this.form.getRawValue()!;

    this.auth.signup({ email, password, fullname, phoneNumber }).subscribe({
      next: (res) => this.router.navigate(['']),
      error: (err) => {
        // handle backend errors
        if (err.error?.errors) {
          // .NET validation errors come as dictionary
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
          // handle backend errors
          if (err.error?.errors) {
            // .NET validation errors come as dictionary
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
