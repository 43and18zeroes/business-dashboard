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

  protected buildDatasets(data: ChartData[]): ChartDataset<'line'>[] {
    return [
      {
        label: 'Current Year',
        data: data.map((d) => d.value),
        backgroundColor: data[0]?.color || '#007BFF',
      },
      {
        label: 'Last Year',
        data: data.map((d) => d.secondaryValue ?? 0),
        backgroundColor: data[0]?.secondaryColor || '#00D4FF',
      },
    ];
  }
}