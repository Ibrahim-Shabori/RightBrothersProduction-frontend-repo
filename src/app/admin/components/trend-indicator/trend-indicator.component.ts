import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TooltipModule } from 'primeng/tooltip';

// Import the Enum
import { QueryPeriod } from '../../../shared/models/period.model'; // Adjust path

@Component({
  selector: 'app-trend-indicator',
  standalone: true,
  imports: [CommonModule, TooltipModule],
  templateUrl: './trend-indicator.component.html',
})
export class TrendIndicatorComponent {
  @Input() value: number = 0;
  @Input() period: QueryPeriod = QueryPeriod.LastWeek;

  // Helpers for Template Logic

  get colorClass(): string {
    if (this.value > 0) return 'text-green-600 bg-green-50';
    if (this.value < 0) return 'text-red-600 bg-red-50';
    return 'text-gray-600 bg-gray-50';
  }

  get iconClass(): string {
    if (this.value > 0) return 'pi pi-arrow-up text-xs';
    if (this.value < 0) return 'pi pi-arrow-down text-xs';
    return 'pi pi-minus text-xs';
  }

  get formattedValue(): string {
    // Adds a '+' sign for positive numbers, keeps '-' for negative
    return this.value > 0 ? `+${this.value}` : `${this.value}`;
  }

  get periodLabel(): string {
    switch (this.period) {
      case QueryPeriod.LastDay:
        return 'منذ أمس';
      case QueryPeriod.LastWeek:
        return 'آخر أسبوع';
      case QueryPeriod.LastMonth:
        return 'آخر شهر';
      case QueryPeriod.Last6Months:
        return 'آخر 6 أشهر';
      case QueryPeriod.LastYear:
        return 'آخر سنة';
      case QueryPeriod.All:
        return 'الكل';
      default:
        return '';
    }
  }
}
