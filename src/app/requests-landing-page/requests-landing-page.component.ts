import { Component } from '@angular/core';
import { RequestCardComponent } from './request-card/request-card.component';
import { RequestItemComponent } from './request-item/request-item.component';

@Component({
  selector: 'app-requests-landing-page',
  imports: [RequestCardComponent, RequestItemComponent],
  templateUrl: './requests-landing-page.component.html',
  styleUrl: './requests-landing-page.component.css',
})
export class RequestsLandingPageComponent {}
