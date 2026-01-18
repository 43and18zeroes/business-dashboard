import { Component } from '@angular/core';
import { BaseChartComponent } from '../base-chart-component/base-chart-component';
import { ChartConfiguration, ChartData } from '../../../models/chart.model';
import { ChartDataset, ChartOptions } from 'chart.js/auto';

@Component({
  selector: 'app-bar-chart-component',
  imports: [],
  templateUrl: '../base-chart-component/base-chart-component.html',
  styleUrl: './bar-chart-component.scss',
})
export class BarChartComponent extends BaseChartComponent<'bar'> {
  protected readonly chartType = 'bar' as const;

  private getSeriesColors(data: ChartData[]) {
    return {
      primary: data[0]?.color || '#007BFF',
      secondary: data[0]?.secondaryColor || '#00D4FF',
    };
  }

  protected buildDatasets(data: ChartData[]): ChartDataset<'bar'>[] {
    const { primary, secondary } = this.getSeriesColors(data);
    const primaryValues = data.map((d) => d.value);
    const secondaryValues = data.map((d) => d.secondaryValue ?? 0);

    return [
      {
        label: 'Sales',
        data: primaryValues,
        backgroundColor: primary,
      },
      {
        label: 'Costs',
        data: secondaryValues,
        backgroundColor: secondary,
      },
    ];
  }

  protected override buildOptions(config: ChartConfiguration, isDark: boolean): ChartOptions<'bar'> {
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