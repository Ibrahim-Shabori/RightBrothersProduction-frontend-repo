import { AuthService } from './../../auth.service';
import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { passwordValidator } from '../../shared/validators/password.validators';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  errorMessage: string | null = null;
  constructor(private auth: AuthService, private router: Router) {}

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, passwordValidator()]),
  });

  onSubmit() {
    if (this.form.invalid) return;

    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => this.router.navigate(['/']), // ✅ redirect
      error: (err) => {
        this.errorMessage = 'البريد الإلكتروني أو كلمة المرور غير صحيحة.';
      },
    });
  }

  ngOnInit(): void {
    // subscribe to Google responses
    this.auth.googleResponse$.subscribe((res) => {
      const idToken = res.credential;

      this.auth.loginWithGoogle(idToken).subscribe({
        next: (result) => {
          localStorage.setItem('jwt', result.token);
          this.router.navigate(['/']); // go to home/dashboard
        },
        error: (err) => {
          this.errorMessage = 'فشل تسجيل الدخول. حاول مرة أخرى.';
        },
      });
    });
  }

  onGoogleClick() {
    this.auth.prompt();
  }
}
