import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Subject, tap, Observable } from 'rxjs';
import { voterDto } from '../shared/models/user.model';

export interface CreateVoteDto {
  requestId: number;
}

@Injectable({
  providedIn: 'root',
})
export class VoteService {
  private apiUrl = `${environment.apiUrl}/vote`;

  private _profileRefresh$ = new Subject<void>();

  // Expose as public Observable (Listeners tune in here)
  get profileRefresh$() {
    return this._profileRefresh$.asObservable();
  }

  constructor(private http: HttpClient) {}

  createRequestVote(dto: CreateVoteDto) {
    return this.http.post<number>(`${this.apiUrl}`, dto);
  }

  getRequestVoters(requestId: number): Observable<voterDto[]> {
    return this.http.get<voterDto[]>(`${this.apiUrl}/request/${requestId}`);
  }

  checkVoted(requestId: number) {
    return this.http.get<boolean>(`${this.apiUrl}/checkvoted/${requestId}`);
  }
}
