import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Required for ngClass
import { AuthService } from '../../auth.service';
import { Router, RouterModule } from '@angular/router'; // RouterModule for routerLink
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

// Your Custom Validator
import { passwordValidator } from '../../shared/validators/password.validators';

@Component({
  selector: 'app-signin',
  standalone: true,
  // 👇 ADDED: PrimeNG Modules & CommonModule here
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    FloatLabelModule,
  ],
  templateUrl: './signin.component.html',
  styleUrl: './signin.component.css',
})
export class SigninComponent implements OnInit {
  errorMessage: string | null = null;

  constructor(private auth: AuthService, private router: Router) {}

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    // Note: Usually for Login, we only check Validators.required.
    // Strict complexity (passwordValidator) is often kept for Registration only,
    // but I have kept it here as per your original code.
    password: new FormControl('', [Validators.required, passwordValidator()]),
  });

  ngOnInit(): void {
    // subscribe to Google responses
    this.auth.googleResponse$.subscribe((res) => {
      const idToken = res.credential;

      this.auth.loginWithGoogle(idToken).subscribe({
        next: (result) => {
          localStorage.setItem('jwt', result.token);
          this.router.navigate(['/']);
        },
        error: (err) => {
          this.errorMessage = 'فشل تسجيل الدخول. حاول مرة أخرى.';
        },
      });
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      // 👇 ADDED: Mark all fields as touched to trigger the red validation borders
      this.form.markAllAsTouched();
      return;
    }

    // Cast to any or strict type depending on your AuthService signature
    this.auth.login(this.form.getRawValue() as any).subscribe({
      next: () => this.router.navigate(['/']),
      error: (err) => {
        this.errorMessage = 'البريد الإلكتروني أو كلمة المرور غير صحيحة.';
      },
    });
  }

  onGoogleClick() {
    this.auth.prompt();
  }
}
