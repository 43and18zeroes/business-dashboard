import { Component } from '@angular/core';
import { BaseChartComponent } from '../base-chart-component/base-chart-component';
import { ChartData } from '../../../models/chart.model';
import { ChartDataset } from 'chart.js';

@Component({
  selector: 'app-line-chart-component',
  imports: [],
  templateUrl: './line-chart-component.html',
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
      },
      {
        label: 'Last Year',
        data: secondaryValues,
        backgroundColor: secondary,
      },
    ];
  }
}