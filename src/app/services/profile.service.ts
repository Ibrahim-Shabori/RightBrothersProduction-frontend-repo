import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, Subject, tap } from 'rxjs';
import { environment } from '../../environments/environment';

// 1. The DTO matching your C# "UserProfileForAViewerDto"
export interface UserProfileDto {
  fullName: string;
  bio?: string;
  profilePictureUrl?: string;
  dateJoined: Date;
  email: string;
  phoneNumber?: string;

  // Stats
  totalRequests: number;
  totalVotesReceived: number;
  implementedRequests: number;
}

// 2. DTO for Updating (Matches Backend Update DTO)
export interface UpdateProfileDto {
  fullName: string;
  phoneNumber?: string;
  bio?: string; // 👈 Added Bio here
  currentPassword?: string;
  newPassword?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  // Base URLs
  private apiUrl = `${environment.apiUrl}/profile`;
  private filesUrl = `${environment.apiUrl}/files`;

  // 🔴 1. The Notification System (Radio Station)
  private _profileRefresh$ = new Subject<void>();

  // Expose as public Observable (Listeners tune in here)
  get profileRefresh$() {
    return this._profileRefresh$.asObservable();
  }

  constructor(private http: HttpClient) {}

  // ==========================================================
  // 1. GET METHODS
  // ==========================================================

  /**
   * Get the current logged-in user's profile
   */
  getMyProfile(): Observable<UserProfileDto> {
    return this.http.get<UserProfileDto>(this.apiUrl).pipe(
      map((profile) => ({
        ...profile,
        dateJoined: new Date(profile.dateJoined),
      }))
    );
  }

  /**
   * Get any user's profile by ID (Public View)
   */
  getUserProfile(userId: string): Observable<UserProfileDto> {
    return this.http.get<UserProfileDto>(`${this.apiUrl}/${userId}`).pipe(
      map((profile) => ({
        ...profile,
        dateJoined: new Date(profile.dateJoined),
      }))
    );
  }

  // ==========================================================
  // 2. UPDATE METHODS (With Auto-Refresh)
  // ==========================================================

  /**
   * Update Profile Info (Name, Bio, Password, etc)
   */
  updateProfile(dto: UpdateProfileDto): Observable<any> {
    return this.http.put(this.apiUrl, dto).pipe(
      // 🔴 Notify listeners that data changed (e.g., Header needs to update Name/Bio)
      tap(() => this._profileRefresh$.next())
    );
  }

  /**
   * Upload a new Profile Picture
   */
  uploadProfilePicture(file: File): Observable<{ profilePictureUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http
      .post<{ profilePictureUrl: string }>(
        `${this.filesUrl}/profile-picture`,
        formData
      )
      .pipe(
        // 🔴 Notify listeners that picture changed
        tap(() => this._profileRefresh$.next())
      );
  }

  /**
   * Remove Profile Picture
   */
  removeProfilePicture(): Observable<any> {
    return this.http.delete(`${this.filesUrl}/profile-picture`).pipe(
      // 🔴 Notify listeners that picture was removed
      tap(() => this._profileRefresh$.next())
    );
  }

  // ==========================================================
  // 3. HELPER METHODS (UI Logic)
  // ==========================================================

  /**
   * Constructs the full URL for a profile picture.
   * Returns undefined if no file exists (allowing PrimeNG to show Initials).
   */
  getProfilePictureUrl(
    fileName: string | null | undefined
  ): string | undefined {
    if (!fileName) {
      return undefined;
    }

    // Check if it's already a full URL (e.g. from Google Auth)
    if (fileName.startsWith('http')) {
      return fileName;
    }

    // Append your backend static files path (wwwroot)
    console.log('Constructing profile picture URL for:', fileName);
    return `${environment.baseUrl}/uploads/profiles/${fileName}`;
  }
}
