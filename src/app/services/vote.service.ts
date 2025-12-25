import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Subject, tap, Observable } from 'rxjs';

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
}
