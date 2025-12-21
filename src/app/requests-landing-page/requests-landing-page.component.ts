import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

// PrimeNG Imports
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { MultiSelectModule } from 'primeng/multiselect'; // <--- NEW for Dropdown List
import { RequestStatus, RequestType } from '../shared/models/request.model';
import { RequestCardComponent } from '../request-card/request-card.component';
import { RequestService } from '../services/request.service';

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
  constructor(private requestService: RequestService) {}

  selectedCategories: string[] = [];
  requests: any = null;
  ngOnInit() {
    this.requestService.getRequests().subscribe({
      next: (data) => {
        this.requests = {
          review: data.filter((r) => r.status === RequestStatus.UnderReview),
          inProgress: data.filter((r) => r.status === RequestStatus.InProgress),
          done: data.filter((r) => r.status === RequestStatus.Done),
        };
      },
      error: (err) => console.error(err),
    });
  }

  filterOptions = [
    { label: 'اقتراح إضافة', value: 'feature' },
    { label: 'خطأ مبلّغ', value: 'bug' },
    { label: 'سؤال', value: 'question' },
    { label: 'أخرى', value: 'other' },
  ];
}
