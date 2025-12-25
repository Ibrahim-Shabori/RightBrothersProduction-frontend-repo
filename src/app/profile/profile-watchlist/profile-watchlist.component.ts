import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RequestCardComponent } from '../../request-card/request-card.component';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  RequestResponseDto,
  RequestStatus,
  RequestType,
} from '../../shared/models/request.model';

// PrimeNG Imports
import { ButtonModule } from 'primeng/button';
import { RequestService } from '../../services/request.service';

import { VoteService } from '../../services/vote.service';
import { AuthService } from '../../services/auth.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-profile-watchlist',
  standalone: true,
  imports: [CommonModule, RequestCardComponent, ButtonModule, RouterLink],
  templateUrl: './profile-watchlist.component.html',
  styleUrls: ['./profile-watchlist.component.css'],
})
export class ProfileWatchlistComponent implements OnInit {
  votedRequests = signal<RequestResponseDto[]>([]);
  isLoading = signal<boolean>(true);
  error = signal<string | null>(null);

  constructor(
    private requestService: RequestService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private voteService: VoteService
  ) {}

  ngOnInit() {
    this.fetchData();
  }

  fetchData() {
    this.isLoading.set(true);

    // DETERMINING WHOSE DATA TO LOAD:
    // 1. Check if an Input was passed (e.g. from Public Profile HTML)
    let idToLoad = this.authService.getCurrentUserId();

    if (!idToLoad) {
      this.isLoading.set(false);
      return;
    }

    // API Call
    this.requestService
      .getVotedRequests()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (data) => {
          this.votedRequests.set(data);
        },
        error: (err) => {
          console.error('Error fetching contributions:', err);
          this.error.set('حدث خطأ أثناء تحميل قائمة المتابعة.');
        },
      });
  }

  handleVote(request: RequestResponseDto) {
    // 1. Optimistic Update (Make UI instant)
    // We guess the new number so the user doesn't wait
    const previousCount = request.votesCount; // Backup in case of error
    request.votesCount += request.isVotedByCurrentUser ? -1 : 1;
    request.isVotedByCurrentUser = !request.isVotedByCurrentUser;

    // 2. Call API
    this.voteService.createRequestVote({ requestId: request.id }).subscribe({
      next: (actualNewCountFromServer) => {
        // 3. CORRECT ANSWER: Store the value directly!
        // This ensures your UI matches exactly what's in the DB
        request.votesCount = actualNewCountFromServer;
      },
      error: (err) => {
        // 4. Revert if it failed (Safety net)
        request.votesCount = previousCount;
        request.isVotedByCurrentUser = !request.isVotedByCurrentUser;
      },
    });
  }
}
