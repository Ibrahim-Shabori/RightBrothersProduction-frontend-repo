import { Component, OnInit, signal, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router'; // 👈 To read URL params
import { finalize } from 'rxjs';
import { RouterLink } from '@angular/router';

// Components & Models
import { RequestCardComponent } from '../../request-card/request-card.component';
import { RequestResponseDto } from '../../shared/models/request.model';

// Services
import { RequestService } from '../../services/request.service'; // 👈 Your Request Service
import { AuthService } from '../../services/auth.service';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-profile-contributions',
  standalone: true,
  imports: [
    CommonModule,
    RequestCardComponent,
    ButtonModule,
    SkeletonModule,
    RouterLink,
  ],
  templateUrl: './profile-contributions.component.html',
  styleUrls: ['./profile-contributions.component.css'],
})
export class ProfileContributionsComponent implements OnInit {
  // Optional: Allow passing ID directly (useful for public profile embedding)
  @Input() targetUserId: string | null | undefined = null;

  myRequests = signal<RequestResponseDto[]>([]);
  isLoading = signal<boolean>(true);
  error = signal<string | null>(null);

  constructor(
    private requestService: RequestService,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.fetchData();
  }

  fetchData() {
    this.isLoading.set(true);

    // DETERMINING WHOSE DATA TO LOAD:
    // 1. Check if an Input was passed (e.g. from Public Profile HTML)
    let idToLoad = this.targetUserId;
    console.log('userId from d:', idToLoad);

    // 2. If no Input, check if we are in a Public Route "/profile/:userId"
    // We look at the PARENT route because this component is usually a child
    if (!idToLoad) {
      idToLoad = this.route.parent?.snapshot.paramMap.get('userId');
      console.log('userId from route:', idToLoad);
    }

    // 3. If still null, fallback to the Current Logged-in User (My Profile)
    if (!idToLoad) {
      idToLoad = this.authService.getCurrentUserId();
    }

    if (!idToLoad) {
      this.error.set('لم يتم العثور على معرف المستخدم');
      this.isLoading.set(false);
      return;
    }

    // API Call
    this.requestService
      .getRequestsByUserId(idToLoad)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (data) => {
          this.myRequests.set(data);
        },
        error: (err) => {
          console.error('Error fetching contributions:', err);
          this.error.set('حدث خطأ أثناء تحميل المساهمات.');
        },
      });
  }
}
