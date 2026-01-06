import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG Imports
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-request-management-header',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    ButtonModule,
  ],
  templateUrl: './request-management-header.component.html',
})
export class RequestManagementHeaderComponent {
  @Input() title: string = 'إدارة الطلبات';
  @Input() totalRecords: number = 0;

  // Triggers when user presses Enter or types
  @Output() onSearch = new EventEmitter<string>();

  searchTerm: string = '';

  triggerSearch() {
    this.onSearch.emit(this.searchTerm);
  }

  clearSearch() {
    this.searchTerm = '';
    this.triggerSearch();
  }
}
