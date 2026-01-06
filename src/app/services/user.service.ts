import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import {
  StatDto,
  QueryPeriod,
  UserManagementQueryParameters,
} from '../shared/models/period.model';
import {
  banStatusDto,
  UserCountStatDto,
  UserEffectDto,
  UserManagementPageItemDto,
} from '../shared/models/user.model';
import { map, Observable } from 'rxjs';
import { PaginatedResult } from '../shared/models/pagination.model';
@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/user`;

  constructor(private http: HttpClient) {}

  getUsersCountInAPeriod(period: QueryPeriod): Observable<StatDto> {
    return this.http.get<StatDto>(`${this.apiUrl}/stats/${period}`);
  }

  getUsersEffectInAPeriod(period: QueryPeriod): Observable<UserEffectDto[]> {
    return this.http.get<UserEffectDto[]>(
      `${this.apiUrl}/stats/effect/${period}`
    );
  }

  getUsersToManage(
    queryParams: UserManagementQueryParameters
  ): Observable<PaginatedResult<UserManagementPageItemDto[]>> {
    let params = new HttpParams();

    for (const key in queryParams) {
      const value = queryParams[key as keyof UserManagementQueryParameters];
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
      .get<UserManagementPageItemDto[]>(`${this.apiUrl}/manage/pages`, {
        observe: 'response',
        params,
      })
      .pipe(
        map((response) => {
          const paginatedResult = new PaginatedResult<
            UserManagementPageItemDto[]
          >();
          if (response.body) {
            // Apply your mapping logic here (Date conversion, short description, etc.)
            paginatedResult.result = response.body.map((req) => ({
              ...req,
              joinedAt: new Date(req.joinedAt),
              lastActivity: new Date(req.lastActivity),
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

  getUsersCount(): Observable<UserCountStatDto> {
    return this.http.get<UserCountStatDto>(`${this.apiUrl}/stats/count`);
  }

  promoteUserToAdmin(userId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${userId}/promote`, {});
  }

  demoteAdminToUser(userId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${userId}/demote`, {});
  }

  updateBanStatus(
    userId: string,
    banStatusDto: banStatusDto
  ): Observable<void> {
    return this.http.patch<void>(
      `${this.apiUrl}/${userId}/ban-status`,
      banStatusDto
    );
  }
}
