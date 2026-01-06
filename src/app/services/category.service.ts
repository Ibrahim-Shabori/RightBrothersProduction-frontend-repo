import { Category } from './../shared/models/request.model';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { from, map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { RequestType } from '../shared/models/request.model';
import { CreateCategoryDto } from '../shared/models/category.model';

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

  getAllCategoriesOrderedByType(): Observable<Category[]> {
    return this.http.get<Category[]>(this.apiUrl + '/orderedbytype');
  }

  // Helper: Fetch only Feature categories
  getFeatureCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.apiUrl + '/requests');
  }

  // Helper: Fetch only Bug categories
  getBugCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.apiUrl + '/bugs');
  }

  createCategory(category: CreateCategoryDto): Observable<Category> {
    return this.http.post<Category>(this.apiUrl, category);
  }

  updateCategory(id: number, category: CreateCategoryDto) {
    return this.http.put(this.apiUrl + `/${id}`, category);
  }

  deleteCategory(id: number) {
    return this.http.delete(this.apiUrl + `/${id}`);
  }

  reorderCategories(ids: number[]) {
    return this.http.post(this.apiUrl + '/reorder', ids);
  }
}
