import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

// PrimeNG Imports
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { RippleModule } from 'primeng/ripple';

@Component({
  selector: 'app-download-landing-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ButtonModule,
    CardModule,
    TagModule,
    RippleModule,
  ],
  templateUrl: './download-landing-page.component.html',
  styleUrl: './download-landing-page.component.css',
})
export class DownloadLandingPageComponent {
  // Optional: Store version info here to make it dynamic later
  appVersion = 'v2.1.1';
}
