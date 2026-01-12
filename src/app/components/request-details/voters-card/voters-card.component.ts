import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; // Import Router

// PrimeNG Imports
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { TooltipModule } from 'primeng/tooltip';
import { SkeletonModule } from 'primeng/skeleton';
import { DialogModule } from 'primeng/dialog'; // <--- NEW IMPORT
import { ButtonModule } from 'primeng/button'; // <--- NEW IMPORT
import { voterDto } from '../../../shared/models/user.model';
import { ProfileService } from '../../../services/profile.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-voters-card',
  standalone: true,
  imports: [
    CommonModule,
    AvatarModule,
    AvatarGroupModule,
    TooltipModule,
    SkeletonModule,
    DialogModule, // <--- Add to imports
    ButtonModule,
  ],
  templateUrl: './voters-card.component.html',
  styleUrl: './voters-card.component.css',
})
export class VotersCardComponent implements OnChanges, OnInit {
  @Input() voters: voterDto[] = [];
  @Input() totalVotesCount: number = 0;
  @Input() loading: boolean = false;
  @Input() displayLimit: number = 5; // Reduced default to 5 for the card

  currentUserId: string | null = null;

  // --- Computed Properties ---
  displayVoters: voterDto[] = [];
  remainingCount: number = 0;

  // --- UI State ---
  isDialogVisible: boolean = false; // <--- Controls the popup

  constructor(
    private router: Router,
    private profileService: ProfileService,
    private authService: AuthService
  ) {}
  ngOnInit(): void {
    this.currentUserId = this.authService.getCurrentUserId();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['voters'] || changes['totalVotesCount']) {
      this.calculateDisplayData();
    }
  }

  private calculateDisplayData() {
    if (!this.voters) {
      this.displayVoters = [];
      this.remainingCount = 0;
      return;
    }
    // Slice for the small card view
    this.displayVoters = this.voters.slice(0, this.displayLimit);

    // Calculate badge number
    if (this.voters.length === this.totalVotesCount) {
      this.remainingCount = Math.max(0, this.voters.length - this.displayLimit);
    } else {
      this.remainingCount = Math.max(
        0,
        this.totalVotesCount - this.displayVoters.length
      );
    }
  }

  getInitials(name: string): string {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  getPictureUrl(url: string) {
    return this.profileService.getProfilePictureUrl(url);
  }

  // --- Actions ---

  openVotersDialog() {
    // Only open if there are actually voters
    if (this.voters.length > 0) {
      this.isDialogVisible = true;
    }
  }

  navigateToProfile(userId: string) {
    this.isDialogVisible = false;
    if (this.currentUserId === userId) this.router.navigate(['/profile']);
    else this.router.navigate(['/profile', userId]);
  }
}
