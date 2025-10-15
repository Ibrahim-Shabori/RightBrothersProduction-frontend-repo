import { Component, HostListener } from '@angular/core';
import { RequestCardComponent } from './request-card/request-card.component';
import { RequestItemComponent } from './request-item/request-item.component';
import { ButtonComponent } from '../shared/button/button.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-requests-landing-page',
  imports: [
    RequestCardComponent,
    RequestItemComponent,
    ButtonComponent,
    RouterLink,
  ],
  templateUrl: './requests-landing-page.component.html',
  styleUrl: './requests-landing-page.component.css',
})
export class RequestsLandingPageComponent {
  isOpen = false;

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown-container') && this.isOpen) {
      this.isOpen = false;
    }
  }
}
