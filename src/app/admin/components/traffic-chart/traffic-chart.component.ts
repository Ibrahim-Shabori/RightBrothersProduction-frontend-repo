import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';

// PrimeNG Imports
import { ChartModule } from 'primeng/chart';

@Component({
  selector: 'app-traffic-chart',
  standalone: true,
  imports: [CommonModule, ChartModule],
  templateUrl: './traffic-chart.component.html',
  styleUrl: './traffic-chart.component.css',
})
export class TrafficChartComponent implements OnInit, OnChanges {
  // --- Inputs ---
  @Input() title: string = 'Traffic Overview';

  // The raw data points (e.g., [10, 25, 40...])
  @Input() newRequestsData: number[] = [];
  @Input() solvedRequestsData: number[] = [];

  // The X-Axis Labels (e.g., ['1 Jan', '2 Jan'...])
  @Input() labels: string[] = [];

  // --- Internal State for PrimeNG ---
  data: any;
  chartOptions: any;

  ngOnInit() {
    this.initChartOptions();
    this.updateChartData();
  }

  // Detect changes if the parent passes new numbers (e.g. after filtering)
  ngOnChanges(changes: SimpleChanges) {
    if (
      changes['newRequestsData'] ||
      changes['solvedRequestsData'] ||
      changes['labels']
    ) {
      this.updateChartData();
    }
  }

  /**
   * 1. Constructs the Data Object required by Chart.js
   * We map your simple inputs into the complex object Chart.js needs.
   */
  updateChartData() {
    // Get theme colors from CSS variables (optional, fallback provided)
    const documentStyle = getComputedStyle(document.documentElement);
    const primaryColor =
      documentStyle.getPropertyValue('--primary-600') || '#4f46e5'; // Fallback to Indigo-600
    // const primaryLight = documentStyle.getPropertyValue('--primary-100') || '#e0e7ff';
    const successColor = '#22c55e'; // Green-500

    this.data = {
      labels: this.labels,
      datasets: [
        {
          label: 'New Requests',
          data: this.newRequestsData,
          fill: true,
          borderColor: primaryColor,
          backgroundColor: 'rgba(79, 70, 229, 0.1)', // Low opacity primary
          tension: 0.4, // Makes the line smooth (curved)
          borderWidth: 2,
        },
        {
          label: 'Solved/Done',
          data: this.solvedRequestsData,
          fill: false,
          borderColor: successColor,
          tension: 0.4,
          borderDash: [5, 5], // Dashed line for contrast
          borderWidth: 2,
        },
      ],
    };
  }

  /**
   * 2. Sets the visual configuration (Grid lines, Fonts, Colors)
   * Matches your 'Slate' theme.
   */
  initChartOptions() {
    // const documentStyle = getComputedStyle(document.documentElement);
    const textColor = '#64748b'; // Slate-500
    const textColorSecondary = '#94a3b8'; // Slate-400
    const surfaceBorder = '#e2e8f0'; // Slate-200

    this.chartOptions = {
      maintainAspectRatio: false,
      aspectRatio: 0.6,
      plugins: {
        legend: {
          labels: {
            color: textColor,
            font: {
              family: 'system-ui, sans-serif', // Use your app font
              weight: 'bold',
            },
          },
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          titleColor: '#1e293b', // Slate-800
          bodyColor: '#475569', // Slate-600
          borderColor: '#e2e8f0',
          borderWidth: 1,
          padding: 10,
          displayColors: true,
        },
      },
      scales: {
        x: {
          ticks: {
            color: textColorSecondary,
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false,
          },
        },
        y: {
          ticks: {
            color: textColorSecondary,
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false,
          },
        },
      },
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false,
      },
    };
  }
}
