import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function fileValidators(
  maxFileMB: number,
  maxTotalMB: number,
  allowedTypes: string[] = []
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const files = control.value as FileList;
    if (!files || files.length === 0) return null;

    let totalSize = 0;
    for (const file of Array.from(files)) {
      const sizeMB = file.size / (1024 * 1024);
      totalSize += sizeMB;

      // Check single file size
      if (sizeMB > maxFileMB) {
        return { maxFileSize: true };
      }

      // Check allowed types (optional)
      if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
        return { invalidFileType: true };
      }
    }

    // Check total size
    if (totalSize > maxTotalMB) {
      return { maxTotalFileSize: true };
    }

    return null;
  };
}
