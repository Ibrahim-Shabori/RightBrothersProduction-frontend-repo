import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function droplistValidator(ignoredValue: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    console.log('Droplist Validator:', { value, ignoredValue });
    if (!value || value === ignoredValue) {
      return { droplistInvalid: true };
    }
    return null;
  };
}
