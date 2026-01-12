import {
  RequestManagementQueryParameters,
  RequestQueryParameters,
} from './../shared/models/period.model';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  RequestResponseDto,
  NotAssignedRequestDto,
  ReviewRequestDto,
  RequestPageItemDto,
  RequestManagementPageItemDto,
  RequestDetailsDto,
} from '../shared/models/request.model';
import {
  QueryPeriod,
  StatDto,
  ChartDataPoint,
} from '../shared/models/period.model';
import { PaginatedResult } from '../shared/models/pagination.model';
@Injectable({
  providedIn: 'root',
})
export class RequestService {
  private apiUrl = `${environment.apiUrl}/request`;

  constructor(private http: HttpClient) {}

  createRequest(data: any, files: File[]): Observable<any> {
    const formData = new FormData();

    // 1. Append Simple Fields
    // Keys ('Title', 'Description') must match your C# DTO property names exactly
    formData.append('Title', data.title);
    formData.append('Description', data.description);

    // Convert numbers/enums to string for FormData
    // Note: Assuming Category is ID based on your DTO, if your form has object {label, value}, extract value
    formData.append('CategoryId', data.category.id);

    // Assuming RequestType is an Enum or Int in Backend
    // You might need to map 'feature' -> 0, 'bug' -> 1 depending on your Enum
    formData.append('Type', data.type); // Example: 0 for Feature, 1 for Bug

    // 2. Append Files
    // Key 'Attachments' matches public List<IFormFile>? Attachments { get; set; }
    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append('Attachments', file, file.name);
      });
    }

    // 3. Post
    // Angular automatically sets Content-Type to multipart/form-data
    return this.http.post(this.apiUrl, formData);
  }

  createDetailedRequest(data: any, files: File[]): Observable<any> {
    const formData = new FormData();

    // 1. Append Base Fields
    formData.append('Title', data.title);
    formData.append('Description', data.description);
    formData.append('CategoryId', data.category.id);
    formData.append('Type', data.type);

    // 2. Append Detailed Fields (Matching C# DTO names)
    formData.append('DetailedDescription', data.detailedDescription);

    if (data.usageDurationInMonths) {
      formData.append(
        'UsageDurationInMonths',
        data.usageDurationInMonths || '0'
      );
    }
    if (data.urgencyCause) {
      formData.append('UrgencyCause', data.urgencyCause);
    }
    if (data.additionalNotes) {
      formData.append('AdditionalNotes', data.additionalNotes);
    }
    if (data.contributerPhoneNumber) {
      formData.append('ContributerPhoneNumber', data.contributerPhoneNumber);
    }
    if (data.contributerEmail) {
      formData.append('ContributerEmail', data.contributerEmail);
    }

    // 3. Append Files
    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append('Attachments', file, file.name);
      });
    }

    // Change URL to your specific detailed endpoint
    return this.http.post(`${this.apiUrl}/detailed`, formData);
  }

  updateRequest(
    id: number,
    data: any,
    files: File[],
    oldFilesToDelete: number[]
  ): Observable<any> {
    const formData = new FormData();

    // 1. Append Simple Fields
    formData.append('Title', data.title);
    formData.append('Description', data.description);
    formData.append('CategoryId', data.category);

    // 2. Append Files
    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append('Attachments', file, file.name);
      });
    }

    // 3. Old Files To delete
    if (oldFilesToDelete && oldFilesToDelete.length > 0) {
      oldFilesToDelete.forEach((fileId) => {
        formData.append('OldFilesToDelete', fileId.toString());
      });
    }
    if (data.oldFilesToDelete) {
      formData.append('OldFilesToDelete', data.oldFilesToDelete);
    }

    // 4. If Detailed, append detailed fields
    if (data.detailedDescription) {
      formData.append('DetailedDescription', data.detailedDescription);
    }
    if (data.usageDurationInMonths) {
      formData.append(
        'UsageDurationInMonths',
        data.usageDurationInMonths || '0'
      );
    }
    if (data.urgencyCause) {
      formData.append('UrgencyCause', data.urgencyCause);
    }
    if (data.additionalNotes) {
      formData.append('AdditionalNotes', data.additionalNotes);
    }
    if (data.contributerPhoneNumber) {
      formData.append('ContributerPhoneNumber', data.contributerPhoneNumber);
    }
    if (data.contributerEmail) {
      formData.append('ContributerEmail', data.contributerEmail);
    }
    // 5. Post
    // Angular automatically sets Content-Type to multipart/form-data
    console.log(formData);
    return this.http.put(`${this.apiUrl}/${id}`, formData);
  }

  getRequests(): Observable<RequestResponseDto[]> {
    return this.http.get<RequestResponseDto[]>(this.apiUrl).pipe(
      map((requests) => {
        return requests.map((req) => ({
          ...req,
          createdAt: new Date(req.createdAt),
        }));
      })
    );
  }

  getFeatureRequests(): Observable<RequestResponseDto[]> {
    return this.http.get<RequestResponseDto[]>(`${this.apiUrl}/features`).pipe(
      map((requests) => {
        return requests.map((req) => ({
          ...req,
          createdAt: new Date(req.createdAt),
        }));
      })
    );
  }

  getBugRequests(): Observable<RequestResponseDto[]> {
    return this.http.get<RequestResponseDto[]>(`${this.apiUrl}/bugs`).pipe(
      map((requests) => {
        return requests.map((req) => ({
          ...req,
          createdAt: new Date(req.createdAt),
        }));
      })
    );
  }

  getToReviewRequests(
    queryParams: RequestQueryParameters
  ): Observable<PaginatedResult<RequestPageItemDto[]>> {
    let params = new HttpParams();

    for (const key in queryParams) {
      const value = queryParams[key as keyof RequestQueryParameters];

      if (value !== null && value !== undefined && value !== '') {
        if (Array.isArray(value)) {
          value.forEach((item) => {
            params = params.append(key, item.toString());
          });
        } else {
          params = params.append(key, value.toString());
        }
      }
    }
    return this.http
      .get<RequestPageItemDto[]>(`${this.apiUrl}/review/pages`, {
        observe: 'response', // Request full response
        params,
      })
      .pipe(
        map((response) => {
          const paginatedResult = new PaginatedResult<RequestPageItemDto[]>();
          if (response.body) {
            // Apply your mapping logic here (Date conversion, short description, etc.)
            paginatedResult.result = response.body.map((req) => ({
              ...req,
              createdAt: new Date(req.createdAt),
              shortDescription: this.truncate(req.description),
            }));
          }
          const paginationHeader = response.headers.get('X-Pagination');
          if (paginationHeader) {
            // Parse the JSON string into the object
            paginatedResult.pagination = JSON.parse(paginationHeader);
          }

          return paginatedResult;
        })
      );
  }

  getToManageRequests(
    queryParams: RequestManagementQueryParameters
  ): Observable<PaginatedResult<RequestManagementPageItemDto[]>> {
    let params = new HttpParams();

    for (const key in queryParams) {
      const value = queryParams[key as keyof RequestManagementQueryParameters];

      if (value !== null && value !== undefined && value !== '') {
        if (Array.isArray(value)) {
          value.forEach((item) => {
            params = params.append(key, item.toString());
          });
        } else {
          params = params.append(key, value.toString());
        }
      }
    }
    return this.http
      .get<RequestManagementPageItemDto[]>(`${this.apiUrl}/manage/pages`, {
        observe: 'response',
        params,
      })
      .pipe(
        map((response) => {
          const paginatedResult = new PaginatedResult<
            RequestManagementPageItemDto[]
          >();
          if (response.body) {
            // Apply your mapping logic here (Date conversion, short description, etc.)
            paginatedResult.result = response.body.map((req) => ({
              ...req,
              votesCount: req.votesCount,
              trendsCount: req.trendsCount,
              lastUpdatedAt: new Date(req.lastUpdatedAt),
              logs: req.logs.map((log) => ({
                ...log,
                createdAt: new Date(log.createdAt),
              })),
            }));
          }
          const paginationHeader = response.headers.get('X-Pagination');
          if (paginationHeader) {
            // Parse the JSON string into the object
            paginatedResult.pagination = JSON.parse(paginationHeader);
          }

          return paginatedResult;
        })
      );
  }

  getRequestsByUserId(userId: string): Observable<RequestResponseDto[]> {
    return this.http.get<RequestResponseDto[]>(`${this.apiUrl}/user/${userId}`);
  }

  getRequestDetails(id: number): Observable<RequestDetailsDto> {
    return this.http.get<RequestDetailsDto>(`${this.apiUrl}/request/${id}`);
  }

  getVotedRequests(): Observable<RequestResponseDto[]> {
    return this.http.get<RequestResponseDto[]>(`${this.apiUrl}/voted`);
  }

  getRequestsCountInAPeriod(period: QueryPeriod): Observable<StatDto> {
    return this.http.get<StatDto>(`${this.apiUrl}/stats/new/${period}`);
  }

  getDoneRequestsInAPeriod(period: QueryPeriod): Observable<StatDto> {
    return this.http.get<StatDto>(`${this.apiUrl}/stats/done/${period}`);
  }

  getActiveRequestsInAPeriod(period: QueryPeriod): Observable<StatDto> {
    return this.http.get<StatDto>(`${this.apiUrl}/stats/active/${period}`);
  }

  getNotAssignedRequests(
    numberOfRequests: number
  ): Observable<NotAssignedRequestDto[]> {
    return this.http.get<NotAssignedRequestDto[]>(
      `${this.apiUrl}/recent?numberOfRequests=${numberOfRequests}`
    );
  }

  getMadeRequestsCountVsDoneRequestsCountInAPeriod(period: QueryPeriod) {
    return this.http.get<ChartDataPoint[]>(
      `${this.apiUrl}/stats/chart/madevsdone/${period}`
    );
  }

  assignAdminToRequest(requestId: number) {
    return this.http.post(`${this.apiUrl}/assign/${requestId}`, {});
  }

  reviewRequest(requestId: number, review: ReviewRequestDto) {
    return this.http.post(`${this.apiUrl}/review/${requestId}`, review);
  }

  deleteRequest(requestId: number) {
    return this.http.delete(`${this.apiUrl}/${requestId}`);
  }

  // Helpers
  private truncate(text: string): string {
    if (!text) return '';
    return text.split(' ').length > 20
      ? text.split(' ').slice(0, 20).join(' ') + '...'
      : text;
  }
}
