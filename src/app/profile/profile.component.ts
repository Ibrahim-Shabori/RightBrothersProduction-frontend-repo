import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  RouterModule,
  Router,
  NavigationEnd,
  ActivatedRoute,
} from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { AvatarModule } from 'primeng/avatar';
import { TagModule } from 'primeng/tag';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs'; // 👈 Import Subscription

// Services & Models
import { ProfileService, UserProfileDto } from '../services/profile.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, TabsModule, AvatarModule, TagModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit, OnDestroy {
  // 1. UI State
  isCurrentUser = false;
  isLoading = true;
  resolvedPictureUrl = signal<string | undefined>(undefined);

  // 2. User Data
  user: UserProfileDto | null = null;

  // 3. Tabs Configuration
  tabs = [
    { label: 'مساهماتي', route: 'contributions', icon: 'pi pi-file-edit' },
    { label: 'متابعاتي', route: 'watchlist', icon: 'pi pi-heart' },
    { label: 'الإعدادات', route: 'settings', icon: 'pi pi-cog' },
  ];

  activeTabValue: string = 'contributions';

  // Keep track of subscription to unsubscribe later
  private refreshSubscription: Subscription | undefined;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public profileService: ProfileService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // 1. LISTEN FOR DATA CHANGES (The missing piece)
    this.refreshSubscription = this.profileService.profileRefresh$.subscribe(
      () => {
        // If I am viewing my own profile and something changed (like a pic upload), reload!
        if (this.isCurrentUser) {
          this.loadMyProfile();
        }
      }
    );

    // 2. Handle Route Parameters
    this.route.paramMap.subscribe((params) => {
      const viewedUserId = params.get('userId');

      if (viewedUserId) {
        // --- PUBLIC MODE ---
        const myId = this.authService.getCurrentUserId();
        if (viewedUserId === myId) {
          this.router.navigate(['/profile']);
        } else {
          this.isCurrentUser = false;
          this.tabs = [
            {
              label: 'المساهمات',
              route: 'contributions',
              icon: 'pi pi-file-edit',
            },
          ];
          this.loadPublicProfile(viewedUserId);
        }
      } else {
        // --- PRIVATE MODE ---
        this.isCurrentUser = true;
        this.tabs = [
          {
            label: 'مساهماتي',
            route: 'contributions',
            icon: 'pi pi-file-edit',
          },
          { label: 'متابعاتي', route: 'watchlist', icon: 'pi pi-heart' },
          { label: 'الإعدادات', route: 'settings', icon: 'pi pi-cog' },
        ];

        this.loadMyProfile();
        this.syncTabWithUrl();
      }
    });

    // 3. Sync Tabs on Navigation
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        if (this.isCurrentUser) {
          this.syncTabWithUrl();
        }
      });
  }

  // Cleanup to prevent memory leaks
  ngOnDestroy() {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  // --- Data Loading ---

  loadMyProfile() {
    // Note: Don't set isLoading=true here on refresh to avoid flickering
    this.profileService.getMyProfile().subscribe({
      next: (data) => {
        this.user = data;

        // 2. CALCULATE URL HERE (Only runs once per load)
        // We append a timestamp '?t=' to force the browser to ignore cache if the filename is the same
        const rawUrl = this.profileService.getProfilePictureUrl(
          data.profilePictureUrl
        );
        if (rawUrl) {
          this.resolvedPictureUrl.set(`${rawUrl}?t=${new Date().getTime()}`);
        } else {
          this.resolvedPictureUrl.set(undefined);
        }

        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
      },
    });
  }

  loadPublicProfile(userId: string) {
    this.isLoading = true;
    this.profileService.getUserProfile(userId).subscribe({
      next: (data) => {
        this.user = data;

        // 3. DO THE SAME FOR PUBLIC PROFILE
        this.resolvedPictureUrl.set(
          this.profileService.getProfilePictureUrl(data.profilePictureUrl)
        );

        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
      },
    });
  }

  // --- Helpers ---

  syncTabWithUrl() {
    const currentRoute = this.router.url.split('/').pop();
    if (currentRoute && this.tabs.find((t) => t.route === currentRoute)) {
      this.activeTabValue = currentRoute;
    }
  }

  getInitials(name: string | undefined): string {
    if (!name) return '';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  getUserRole(): string | string[] {
    return this.authService.getUserRole() || 'Member';
  }
}
