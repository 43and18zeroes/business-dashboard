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
    const textColor = isDark ? '#e0e2ec' : '#44474e';
    const axisColor = isDark ? '#8e9099' : '#74777f';
    const gridColor = isDark ? '#8e90994D' : '#74777f4D';

    Chart.defaults.color = textColor;
    Chart.defaults.borderColor = gridColor;
    Chart.defaults.set('scales.common', {
      grid: {
        color: gridColor,
        borderColor: axisColor,
        tickColor: axisColor,
      },
      ticks: {
        color: textColor,
      },
    });

    const tooltipBg = isDark ? '#292a2c' : '#e9e7eb';
    Chart.defaults.set('plugins.tooltip', {
      backgroundColor: tooltipBg,
      titleColor: textColor,
      bodyColor: textColor,
      padding: 12,
      cornerRadius: 8,
    });
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
