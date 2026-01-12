import { Component, computed, signal, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormsModule,
} from '@angular/forms';
import { transformToNumber } from 'primeng/utils';
import { debounceTime } from 'rxjs';

// PrimeNG Imports
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { SelectButtonModule } from 'primeng/selectbutton';
import { ToastModule } from 'primeng/toast';
import { InputNumberModule } from 'primeng/inputnumber';
import { RequestService } from '../../services/request.service';
import { MessageService } from 'primeng/api';
import { CategoryService } from '../../services/category.service';
import { VoteService } from '../../services/vote.service';
import { ProfileService } from '../../services/profile.service';

import {
  Category,
  RequestResponseDto,
  RequestType,
} from '../../shared/models/request.model';
import { RequestCardComponent } from '../../request-card/request-card.component';
import { RequestFormComponent } from '../../components/requests-suggestions/request-form/request-form.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-bugs',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IconFieldModule,
    InputIconModule,
    SelectButtonModule,
    ToastModule,
    RequestCardComponent,
    RequestFormComponent,
    InputNumberModule,
    InputTextModule,
  ],
  templateUrl: './bugs.component.html',
  styleUrl: './bugs.component.css',
  providers: [RequestService, MessageService],
})
export class BugsComponent implements OnInit {
  constructor(
    private requestService: RequestService,
    private messageService: MessageService,
    private categoryService: CategoryService,
    private voteService: VoteService,
    private profileService: ProfileService,
    private authService: AuthService
  ) {}

  submitted = signal<boolean>(false);
  isDetailedMode = signal<boolean>(false);
  authStatus = signal<boolean>(false);
  searchQuery = signal('');
  currentSort = signal<'newest' | 'mostVoted'>('newest');

  sortOptions = [
    { label: 'الأحدث', value: 'newest' },
    { label: 'الأكثر تصويتاً', value: 'mostVoted' },
  ];

  categories: Category[] = [];
  filteredCategories: Category[] = [];
  requests = signal<RequestResponseDto[]>([]);
  filesArray: File[] = [];

  ngOnInit() {
    this.categoryService.getBugCategories().subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: (err) => {},
    });

    this.loadRequests();
  }

  loadRequests() {
    this.requestService.getBugRequests().subscribe({
      next: (data) => {
        this.requests.set(data);
      },
      error: (err) => console.error(err),
    });
  }

  searchCategory(event: any) {
    const query = event.query.toLowerCase();
    this.filteredCategories = this.categories.filter((item) =>
      item.name.toLowerCase().includes(query)
    );
  }

  getCategoryColorById(id: number) {
    const category = this.categories.find((c) => c.id === id);
    return category!.color;
  }

  getCategoryColor(category: Category) {
    return category.color;
  }

  onRequestCreated() {
    this.loadRequests(); // Refresh the list to show the new item
  }

  displayedRequests = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    let filtered = this.requests();

    if (query) {
      filtered = filtered.filter((product) =>
        product.title?.toLowerCase().includes(query)
      );
    }

    return [...filtered].sort((a, b) => {
      if (this.currentSort() === 'mostVoted') {
        return (
          transformToNumber(b.votesCount!) - transformToNumber(a.votesCount!)
        );
      } else {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
    });
  });

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
