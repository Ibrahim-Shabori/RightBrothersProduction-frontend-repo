import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// PrimeNG Imports
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';
import { BadgeModule } from 'primeng/badge';
import { UserEffectDto } from '../../../shared/models/user.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-top-contributors-widget',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    AvatarModule,
    ButtonModule,
    SkeletonModule,
    TooltipModule,
    BadgeModule,
  ],
  templateUrl: './top-contributors-widget.component.html',
  styleUrl: './top-contributors-widget.component.css',
})
export class TopContributorsWidgetComponent {
  /**
   * Expected Data Structure for 'users':
   * {
   * id: number,
   * name: string,
   * email: string,
   * avatar?: string,     // Optional URL
   * impactScore: number, // Calculated by backend (Requests + Votes)
   * requestsCount: number
   * }
   */
  @Input() users: UserEffectDto[] = [];
  @Input() isLoading: boolean = false;

  // Emits the User ID when clicked
  @Output() viewUser = new EventEmitter<string>();

  onViewUser(id: string) {
    this.viewUser.emit(id);
  }

  getTime() {
    return new Date().getTime();
  }

  constructImageUrl(url: string) {
    return `${environment.baseUrl}/uploads/profiles/${url}`;
  }

  getFirstChar(name: string) {
    return name.charAt(0);
  }

  /**
   * Helper to return styles for the Top 3 Ranks
   */
  getRankStyles(index: number): { container: string; icon: string } {
    switch (index) {
      case 0: // 1st Place (Gold)
        return {
          container: 'bg-yellow-50 border-yellow-100',
          icon: 'text-yellow-600 pi pi-crown',
        };
      case 1: // 2nd Place (Silver)
        return {
          container: 'bg-slate-50 border-slate-200',
          icon: 'text-slate-500 pi pi-star',
        };
      case 2: // 3rd Place (Bronze)
        return {
          container: 'bg-orange-50 border-orange-100',
          icon: 'text-orange-600 pi pi-star',
        };
      default: // Others
        return {
          container: 'bg-transparent border-transparent',
          icon: 'text-slate-300',
        };
    }
  }
}
