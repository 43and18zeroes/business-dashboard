import { Component, effect, ElementRef, input, ViewChild } from '@angular/core';
import { ChartConfiguration, ChartData } from '../../../models/chart.model';

@Component({
  selector: 'app-base-chart-component',
  imports: [],
  templateUrl: './base-chart-component.html',
  styleUrl: './base-chart-component.scss',
})
export abstract class BaseChartComponent {
  data = input.required<ChartData[]>();

  config = input<ChartConfiguration>(new ChartConfiguration());

  @ViewChild('chartCanvas', { static: true })
  canvas!: ElementRef<HTMLCanvasElement>;

  protected chartInstance: any;

  constructor() {
    effect(() => {
      const currentData = this.data();
      const currentConfig = this.config();

      if (currentData && currentData.length > 0) {
        this.renderChart(currentData, currentConfig);
      }
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
