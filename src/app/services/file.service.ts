import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { saveAs } from 'file-saver';
@Injectable({
  providedIn: 'root',
})
export class FileService {
  private filesDownloadUrl = `${environment.apiUrl}/files/requests/download`;

  constructor(private http: HttpClient) {}

  downloadFile(requestId: number, fileName: string) {
    this.http
      .get(`${this.filesDownloadUrl}/${requestId}/${fileName}`, {
        responseType: 'blob',
        observe: 'response',
      })
      .subscribe({
        next: (response: HttpResponse<Blob>) => {
          const blob = response.body;

          if (blob) {
            saveAs(blob, fileName);
          }
        },
        error: (err) => console.error('Download failed', err),
      });
  }
}
