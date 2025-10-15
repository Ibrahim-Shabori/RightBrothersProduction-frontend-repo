import { Component } from '@angular/core';
import { AutoResizeDirective } from '../../auto-resize.directive';

@Component({
  selector: 'app-features',
  imports: [AutoResizeDirective],
  templateUrl: './features.component.html',
  styleUrl: './features.component.css',
})
export class FeaturesComponent {}
