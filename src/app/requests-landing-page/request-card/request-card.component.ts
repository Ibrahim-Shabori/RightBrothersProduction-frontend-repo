import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-request-card',
  imports: [NgClass],
  templateUrl: './request-card.component.html',
  styleUrl: './request-card.component.css',
})
export class RequestCardComponent {
  @Input() title = '';
  @Input() colorClass = '';
}
