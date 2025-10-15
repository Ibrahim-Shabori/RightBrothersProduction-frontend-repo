import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';
@Component({
  selector: 'app-button',
  imports: [NgClass],
  templateUrl: './button.component.html',
  styleUrl: './button.component.css',
})
export class ButtonComponent {
  @Input() bgColor: string = 'bg-brownBlue';
  @Input() textColor: string = 'text-white';
  @Input() borderColor: string = 'border-brownBlue';
}
