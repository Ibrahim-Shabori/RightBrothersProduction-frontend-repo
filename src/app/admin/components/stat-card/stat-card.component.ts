import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

// PrimeNG is not strictly needed here if we use Tailwind,
// but we keep CommonModule for ngClass.

type CardColor = 'primary' | 'success' | 'warning' | 'danger' | 'info';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stat-card.component.html',
  // No specific CSS needed if we use Tailwind
})
export class StatCardComponent {
  // --- Main Data ---
  @Input() label: string = ''; // e.g. "إجمالي المستخدمين"
  @Input() value: number | string = 0; // e.g. 1,250 or "15k"
  @Input() icon: string = 'pi pi-info-circle';

  // --- Styling ---
  @Input() color: CardColor = 'primary'; // Controls the icon bg color

  // --- Trend Data (Optional) ---
  @Input() trendPercentage: number = 0; // e.g. 5.2
  @Input() trendLabel: string = 'منذ الشهر الماضي'; // Context text

  /**
   * Returns the Tailwind classes for the icon container
   * based on the selected 'color' input.
   */
  get iconContainerClass(): string {
    const colorMap: Record<CardColor, string> = {
      primary: 'bg-indigo-50 text-indigo-600',
      success: 'bg-emerald-50 text-emerald-600',
      warning: 'bg-amber-50 text-amber-600',
      danger: 'bg-rose-50 text-rose-600',
      info: 'bg-sky-50 text-sky-600',
    };
    return colorMap[this.color] || colorMap.primary;
  }

  /**
   * Returns green text for positive trends, red for negative.
   */
  get trendColorClass(): string {
    if (this.trendPercentage > 0) return 'text-emerald-600';
    if (this.trendPercentage < 0) return 'text-rose-600';
    return 'text-slate-500';
  }

  get trendIcon(): string {
    if (this.trendPercentage > 0) return 'pi pi-arrow-up';
    if (this.trendPercentage < 0) return 'pi pi-arrow-down';
    return 'pi pi-minus';
  }
}
