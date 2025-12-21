import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { from, map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Category, RequestType } from '../shared/models/request.model';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private apiUrl = `${environment.apiUrl}/category`;

  constructor(private http: HttpClient) {}

  // Fetch ALL categories
  getAllCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.apiUrl);
  }

  // Helper: Fetch only Feature categories
  getFeatureCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.apiUrl + '/requests');
  }

  // Helper: Fetch only Bug categories
  getBugCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.apiUrl + '/bugs');
  }
}
