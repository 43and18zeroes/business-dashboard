import {
  Component,
  effect,
  ElementRef,
  inject,
  input,
  ViewChild,
} from '@angular/core';
import { ChartConfiguration, ChartData } from '../../../models/chart.model';
import { Chart } from 'chart.js';
import { ThemeService } from '../../../services/theme-service';

@Component({
  selector: 'app-base-chart-component',
  imports: [],
  templateUrl: './base-chart-component.html',
  styleUrl: './base-chart-component.scss',
})
export abstract class BaseChartComponent {
  private themeService = inject(ThemeService);
  data = input.required<ChartData[]>();

  config = input<ChartConfiguration>(new ChartConfiguration());

  @ViewChild('chartCanvas', { static: true })
  canvas!: ElementRef<HTMLCanvasElement>;

  protected chartInstance: any;

  constructor() {
    effect(() => {
      const currentData = this.data();
      const currentConfig = this.config();
      const isDark = this.themeService.darkMode();
      this.updateGlobalChartDefaults(isDark);
      if (currentData && currentData.length > 0) {
        this.renderChart(currentData, currentConfig);
      }
    });
  }

  private updateGlobalChartDefaults(isDark: boolean): void {
    const textColor = isDark ? '#e3e2e6' : '#1a1b1f';
    const gridColor = isDark
      ? 'rgba(255, 255, 255, 0.1)'
      : 'rgba(0, 0, 0, 0.1)';

    Chart.defaults.color = textColor;
    Chart.defaults.font.family = 'Roboto, Arial, sans-serif';

    // if (Chart.defaults.scale) {
    //   Chart.defaults.scales.linear.grid.color = gridColor;
    // }
  }

  protected abstract renderChart(
    data: ChartData[],
    config: ChartConfiguration
  ): void;

  ngOnDestroy(): void {
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }
  }
}
