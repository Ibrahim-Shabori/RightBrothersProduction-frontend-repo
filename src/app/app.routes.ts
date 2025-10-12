import { Routes } from '@angular/router';
import { DownloadLandingPageComponent } from './download-landing-page/download-landing-page.component';
import { AuthComponent } from './auth/auth.component';
import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component';
import { AuthGuard } from './guards/auth.guard';
import { RequestsLandingPageComponent } from './requests-landing-page/requests-landing-page.component';

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
