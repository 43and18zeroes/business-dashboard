import { Component } from '@angular/core';
import { BaseChartComponent } from '../base-chart-component/base-chart-component';
import { ChartConfiguration, ChartData } from '../../../models/chart.model';
import { ChartDataset, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-line-chart-component',
  imports: [],
  templateUrl: '../base-chart-component/base-chart-component.html',
  styleUrl: './line-chart-component.scss',
})
export class LineChartComponent extends BaseChartComponent<'line'> {
  protected readonly chartType = 'line' as const;

  private getSeriesColors(data: ChartData[]) {
    return {
      primary: data[0]?.color || '#007BFF',
      secondary: data[0]?.secondaryColor || '#00D4FF',
    };
  }

  protected buildDatasets(data: ChartData[]): ChartDataset<'line'>[] {
    const { primary, secondary } = this.getSeriesColors(data);
    const primaryValues = data.map((d) => d.value);
    const secondaryValues = data.map((d) => d.secondaryValue ?? 0);

    return [
      {
        label: 'Current Year',
        data: primaryValues,
        backgroundColor: primary,
        tension: 0.3,
      },
      {
        label: 'Last Year',
        data: secondaryValues,
        backgroundColor: secondary,
        tension: 0.3,
      },
    ];
  }

  protected override buildOptions(config: ChartConfiguration, isDark: boolean): ChartOptions<'line'> {
    const baseOptions = super.buildOptions(config, isDark);

    return {
      ...baseOptions,
      scales: {
        ...baseOptions.scales,
        y: {
          ...baseOptions.scales?.['y'],
          beginAtZero: true,
          ticks: {
            ...baseOptions.scales?.['y']?.ticks,
            callback: (value) => this.numberFormatter.format(Number(value)),
          },
        },
      },
    };
  }
}