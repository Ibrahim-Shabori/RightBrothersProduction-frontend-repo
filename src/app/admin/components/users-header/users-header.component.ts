import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG Imports
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge'; // Used for nice count badges

@Component({
  selector: 'app-users-header',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    ButtonModule,
    BadgeModule,
  ],
  templateUrl: './users-header.component.html',
})
export class UsersHeaderComponent {
  // Inputs for the metrics (Counts)
  @Input() totalUsers: number = 0;
  @Input() totalAdmins: number = 0;

  // Output for the search logic
  // Parent component will handle the actual filtering
  @Output() onSearch = new EventEmitter<string>();

  searchTerm: string = '';

  // Trigger search on Enter or Button click
  triggerSearch() {
    this.onSearch.emit(this.searchTerm);
  }

  // Clear search and reset list
  clearSearch() {
    this.searchTerm = '';
    this.triggerSearch();
  }
}
