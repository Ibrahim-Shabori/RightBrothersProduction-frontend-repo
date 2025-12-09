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
            data: { type: 'features' },
          },
          {
            path: 'bugs',
            component: BugsComponent,
            data: { type: 'bugs' },
          },
        ],
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
        canActivate: [AuthGuard],
      },
      {
        path: 'signup',
        component: SignupComponent,
        canActivate: [AuthGuard],
      },
    ],
  },
];
