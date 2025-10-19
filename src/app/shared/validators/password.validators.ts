// src/app/shared/validators/password.validators.ts
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function matchPasswordValidator(
  passwordControlName: string
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.parent) return null; // parent form group not ready yet

    const password = control.parent.get(passwordControlName)?.value;
    const confirm = control.value;

    return password && confirm && password !== confirm
      ? { mismatch: true }
      : null;
  };
}

export function passwordValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;

    const errors: string[] = [];

    if (value.length < 8) {
      errors.push('كلمة المرور يجب أن تكون 8 أحرف على الأقل.');
    }
    if (!/[A-Z]/.test(value)) {
      errors.push('كلمة المرور يجب أن تحتوي على حرف كبير واحد على الأقل.');
    }
    if (!/[a-z]/.test(value)) {
      errors.push('كلمة المرور يجب أن تحتوي على حرف صغير واحد على الأقل.');
    }
    if (!/[0-9]/.test(value)) {
      errors.push('كلمة المرور يجب أن تحتوي على رقم واحد على الأقل.');
    }

    return errors.length > 0 ? { passwordStrength: errors } : null;
  };
}
