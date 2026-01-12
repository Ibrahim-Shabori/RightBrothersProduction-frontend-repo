import { AuthService } from './../../services/auth.service';
import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormsModule,
} from '@angular/forms';

// PrimeNG Imports
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { SelectButtonModule } from 'primeng/selectbutton';
import { InputNumberModule } from 'primeng/inputnumber'; // Required for the duration field
import { MessageService } from 'primeng/api';

// Services & Models (Assuming these exist based on your context)
import { RequestService } from '../../services/request.service';
import { CategoryService } from '../../services/category.service';
import { RequestCardComponent } from '../../request-card/request-card.component';
import {
  Category,
  RequestResponseDto,
  RequestType,
} from '../../shared/models/request.model';
import { RequestFormComponent } from '../../components/requests-suggestions/request-form/request-form.component';
import { transformToNumber } from 'primeng/utils';
import { VoteService } from '../../services/vote.service';
import { ProfileService } from '../../services/profile.service';
import { debounceTime } from 'rxjs';
import { effect } from '@angular/core';
@Component({
  selector: 'app-features',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    ToastModule,
    IconFieldModule,
    InputIconModule,
    SelectButtonModule,
    RequestCardComponent,
    RequestFormComponent,
  ],
  providers: [MessageService],
  templateUrl: './features.component.html',
})
export class FeaturesComponent implements OnInit {
  constructor(
    private requestService: RequestService,
    private messageService: MessageService,
    private voteService: VoteService,
    private categoryService: CategoryService,
    private profileService: ProfileService,
    private authService: AuthService
  ) {}

  // --- State Signals ---
  isDetailedMode = signal<boolean>(false);
  submitted = signal<boolean>(false);
  authStatus = signal<boolean>(false);

  // --- File Upload State ---
  filesArray: File[] = [];

  // --- Search & Sort State ---
  searchQuery = signal('');
  currentSort = signal<'newest' | 'mostVoted'>('newest');

  sortOptions = [
    { label: 'الأحدث', value: 'newest' },
    { label: 'الأكثر تصويتاً', value: 'mostVoted' },
  ];

  // --- Data Signals (Mocked/Empty for now) ---
  categories: Category[] = [];
  filteredCategories: Category[] = [];
  requests = signal<any[]>([]);
  userEmail = signal<string>('');
  userPhoneNumber = signal<string>('');

  ngOnInit() {
    this.authService.authStatus$.subscribe((val) => {
      this.authStatus.set(val);
    });

    this.categoryService.getFeatureCategories().subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: (err) => console.error('Failed to load categories', err),
    });

    this.loadRequests();
  }

  loadRequests() {
    this.requestService.getFeatureRequests().subscribe({
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
    return category?.color ?? '';
  }

  getCategoryColor(category: Category) {
    return category.color;
  }

  onFileChange(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      // Append new files to existing array
      this.filesArray = [
        ...this.filesArray,
        ...Array.from(event.target.files as FileList),
      ];
    }
  }

  // Optional: Method to remove a specific file before upload
  removeFile(index: number) {
    this.filesArray.splice(index, 1);
  }

  displayedRequests = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    let filtered = this.requests();

    if (query !== '') {
      filtered = filtered.filter((request) =>
        request.title?.toLowerCase().includes(query)
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

  onRequestCreated() {
    this.loadRequests(); // Refresh the list to show the new item
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
