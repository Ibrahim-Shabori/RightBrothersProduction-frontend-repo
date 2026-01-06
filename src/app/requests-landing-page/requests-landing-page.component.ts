import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

// PrimeNG Imports
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { MultiSelectModule } from 'primeng/multiselect'; // <--- NEW for Dropdown List
import {
  Category,
  RequestResponseDto,
  RequestStatus,
} from '../shared/models/request.model';
import { RequestCardComponent } from '../request-card/request-card.component';
import { RequestService } from '../services/request.service';
import { VoteService } from '../services/vote.service';
import { CategoryService } from '../services/category.service';
@Component({
  selector: 'app-requests-landing-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    ButtonModule,
    TagModule,
    MultiSelectModule,
    RequestCardComponent,
  ],
  templateUrl: './requests-landing-page.component.html',
  styleUrl: './requests-landing-page.component.css',
})
export class RequestsLandingPageComponent {
  constructor(
    private requestService: RequestService,
    private voteService: VoteService,
    private categoryService: CategoryService
  ) {}

  selectedCategories: string[] = [];
  requests: any = null;
  categories: Category[] = [];
  ngOnInit() {
    this.requestService.getRequests().subscribe({
      next: (data) => {
        this.requests = {
          inConsideration: data.filter(
            (r) => r.status === RequestStatus.InConsideration
          ),
          inProgress: data.filter((r) => r.status === RequestStatus.InProgress),
          done: data.filter((r) => r.status === RequestStatus.Done),
        };
      },
      error: (err) => console.error(err),
    });

    this.categoryService.getAllCategories().subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: (err) => {},
    });
  }

  filterOptions = [
    { label: 'اقتراح إضافة', value: 'feature' },
    { label: 'خطأ مبلّغ', value: 'bug' },
    { label: 'سؤال', value: 'question' },
    { label: 'أخرى', value: 'other' },
  ];

  getCategoryColor(id: number) {
    const category = this.categories.find((c) => c.id === id);
    return category ? category.color : '';
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
