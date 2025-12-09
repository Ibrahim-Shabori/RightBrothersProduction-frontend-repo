import { Component, input, output, signal, effect, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-bar',
  imports: [CommonModule, FormsModule],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.css',
})
export class SearchBarComponent {
  // Inputs with default values
  placeholder = input<string>('بحث...'); // 'Search...' in Arabic
  width = input<string>('100%');
  showIcon = input<boolean>(true);
  showClearButton = input<boolean>(true);
  showSortButtons = input<boolean>(true);
  disabled = input<boolean>(false);
  loading = input<boolean>(false);
  debounceTime = input<number>(300);

  // Two-way binding for search value and sort
  searchValue = model<string>('');
  sortBy = model<'newest' | 'mostVoted'>('newest');

  // Outputs
  searchChange = output<string>();
  sortChange = output<'newest' | 'mostVoted'>();
  focused = output<boolean>();

  // Internal state
  isFocused = signal(false);
  private debounceTimer: any;

  constructor() {
    // Effect to emit search changes with debounce
    effect(() => {
      const value = this.searchValue();

      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        this.searchChange.emit(value);
      }, this.debounceTime());
    });
  }

  onFocus(): void {
    this.isFocused.set(true);
    this.focused.emit(true);
  }

  onBlur(): void {
    this.isFocused.set(false);
    this.focused.emit(false);
  }

  onInput(): void {
    // Handled by effect
  }

  clearSearch(): void {
    this.searchValue.set('');
  }

  setSortBy(sort: 'newest' | 'mostVoted'): void {
    this.sortBy.set(sort);
    this.sortChange.emit(sort);
  }
}
