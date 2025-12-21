import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { RequestResponseDto } from '../shared/models/request.model';

@Injectable({
  providedIn: 'root',
})
export class RequestService {
  private apiUrl = `${environment.apiUrl}/request`; // Adjust path as needed

  constructor(private http: HttpClient) {}

  createRequest(data: any, files: File[]): Observable<any> {
    const formData = new FormData();

    // 1. Append Simple Fields
    // Keys ('Title', 'Description') must match your C# DTO property names exactly
    formData.append('Title', data.title);
    formData.append('Description', data.description);

    // Convert numbers/enums to string for FormData
    // Note: Assuming Category is ID based on your DTO, if your form has object {label, value}, extract value
    formData.append('CategoryId', data.category);
    console.log(typeof data.category);
    console.log(data.category);

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

  // inside RequestService class
  getRequestsByUserId(userId: string): Observable<RequestResponseDto[]> {
    return this.http.get<RequestResponseDto[]>(
      `${this.apiUrl}/user/${userId}`
    );
  }
}
