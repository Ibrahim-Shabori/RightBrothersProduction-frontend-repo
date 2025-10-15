import { Routes } from '@angular/router';
import { DownloadLandingPageComponent } from './download-landing-page/download-landing-page.component';
import { AuthComponent } from './auth/auth.component';
import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component';
import { AuthGuard } from './guards/auth.guard';
import { RequestsLandingPageComponent } from './requests-landing-page/requests-landing-page.component';
import { RequestsSuggestionsLandingPageComponent } from './requests-suggestions-landing-page/requests-suggestions-landing-page.component';
import { FeaturesComponent } from './requests-suggestions-landing-page/features/features.component';
import { BugsComponent } from './requests-suggestions-landing-page/bugs/bugs.component';

export const routes: Routes = [
  {
    path: '',
    component: DownloadLandingPageComponent,
  },
  {
    path: 'download',
    component: DownloadLandingPageComponent,
  },
  {
    path: 'requests',
    component: RequestsLandingPageComponent,
  },
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
        data: { type: 'features' },
      },
      {
        path: 'bugs',
        component: BugsComponent,
        data: { type: 'bugs' },
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
        redirectTo: 'login', // <-- relative to /auth
      },
      {
        path: 'login',
        component: LoginComponent,
        data: { mode: 'login' },
        canActivate: [AuthGuard],
      },
      {
        path: 'signup',
        component: SignupComponent,
        data: { mode: 'signup' },
        canActivate: [AuthGuard],
      },
    ],
  },
];
