import { Routes } from '@angular/router';
import { DownloadLandingPageComponent } from './download-landing-page/download-landing-page.component';
import { AuthComponent } from './auth/auth.component';
import { SigninComponent } from './auth/signin/signin.component';
import { SignupComponent } from './auth/signup/signup.component';
import { AuthGuard } from './guards/auth.guard';
import { RequestsLandingPageComponent } from './requests-landing-page/requests-landing-page.component';
import { RequestsSuggestionsLandingPageComponent } from './requests-suggestions-landing-page/requests-suggestions-landing-page.component';
import { FeaturesComponent } from './requests-suggestions-landing-page/features/features.component';
import { BugsComponent } from './requests-suggestions-landing-page/bugs/bugs.component';
import { MainLayoutComponent } from './main-layout/main-layout.component';
import { ProfileComponent } from './profile/profile.component';
import { ProfileContributionsComponent } from './profile/profile-contributions/profile-contributions.component';
import { ProfileWatchlistComponent } from './profile/profile-watchlist/profile-watchlist.component';
import { ProfileSettingsComponent } from './profile/profile-settings/profile-settings.component';
import { GuestGuard } from './guards/guest.guard';
import { RequestDetailsComponent } from './pages/request-details/request-details.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', component: DownloadLandingPageComponent },
      {
        path: 'download',
        component: DownloadLandingPageComponent,
      },
      { path: 'requests', component: RequestsLandingPageComponent },
      {
        path: 'requests-suggestions',
        component: RequestsSuggestionsLandingPageComponent,
        children: [
          {
            path: '',
            pathMatch: 'full',
            redirectTo: 'features',
          },
          {
            path: 'features',
            component: FeaturesComponent,
            data: { type: 'feature' },
          },
          {
            path: 'features/:id',
            component: FeaturesComponent,
            data: { context: 'feature' },
          },
          {
            path: 'bugs',
            component: BugsComponent,
            data: { context: 'bug' },
          },
          {
            path: 'bugs/:id',
            component: BugsComponent,
            data: { context: 'bug' },
          },
        ],
      },
      {
        path: 'profile',
        component: ProfileComponent,
        canActivate: [AuthGuard],
        children: [
          { path: '', redirectTo: 'contributions', pathMatch: 'full' },
          { path: 'contributions', component: ProfileContributionsComponent },
          { path: 'watchlist', component: ProfileWatchlistComponent },
          { path: 'settings', component: ProfileSettingsComponent },
        ],
      },
      {
        path: 'profile/:userId',
        component: ProfileComponent,
        children: [
          { path: '', redirectTo: 'contributions', pathMatch: 'full' },
          { path: 'contributions', component: ProfileContributionsComponent },
        ],
      },
      {
        path: 'request/:id',
        component: RequestDetailsComponent,
      },
    ],
  },
  {
    path: 'auth',
    component: AuthComponent,
    children: [
      {
        path: '',
        pathMatch: 'full', // <-- very important
        redirectTo: 'signin', // <-- relative to /auth
      },
      {
        path: 'signin',
        component: SigninComponent,
        canActivate: [GuestGuard],
      },
      {
        path: 'signup',
        component: SignupComponent,
        canActivate: [GuestGuard],
      },
    ],
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('./admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },
];
