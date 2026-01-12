import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import {
  RequestLogDto,
  CreateRequestLogDto,
  RequestLogDetailsDto,
} from '../shared/models/request.model';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class RequestLogService {
  private apiUrl = `${environment.apiUrl}/requestLog`;

  constructor(private http: HttpClient) {}

  createRequestLog(data: CreateRequestLogDto) {
    return this.http.post(this.apiUrl, data);
  }

  getRequestLogsByRequestId(requestId: number): Observable<RequestLogDto[]> {
    return this.http.get<RequestLogDto[]>(`${this.apiUrl}/${requestId}`);
  }

  getRequestLogsDetailedByRequestId(
    requestId: number
  ): Observable<RequestLogDetailsDto[]> {
    return this.http.get<RequestLogDetailsDto[]>(
      `${this.apiUrl}/request/${requestId}`
    );
  }
}
