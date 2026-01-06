import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

// PrimeNG Imports
import { TabsModule } from 'primeng/tabs';

// Child Component
import { CategoryListComponent } from '../../components/category-list/category-list.component';

@Component({
  selector: 'app-category-management',
  standalone: true,
  imports: [CommonModule, TabsModule, CategoryListComponent],
  templateUrl: './category-management.component.html',
})
export class CategoryManagementComponent {
  // Helper object to keep HTML clean and readable
  // Matches your backend Enum: 0 = Feature, 1 = Bug
  public RequestTypes = {
    Feature: 0,
    Bug: 1,
  };

  // Tracks the active tab (Optional, but good for control)
  currentTab: string = '0';
}
