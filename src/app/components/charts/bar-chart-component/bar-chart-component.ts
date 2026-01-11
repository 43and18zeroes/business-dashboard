import { Component } from '@angular/core';
import { BaseChartComponent } from '../base-chart-component/base-chart-component';
import { ChartData } from '../../../models/chart.model';
import { ChartDataset } from 'chart.js/auto';

@Component({
  selector: 'app-bar-chart-component',
  imports: [],
  templateUrl: './bar-chart-component.html',
  styleUrl: './bar-chart-component.scss',
})
export class BarChartComponent extends BaseChartComponent<'bar'> {
  protected readonly chartType = 'bar' as const;

  protected buildDatasets(data: ChartData[]): ChartDataset<'bar'>[] {
    return [
      {
        label: 'Sales',
        data: data.map((d) => d.value),
        backgroundColor: data[0]?.color || '#007BFF',
      },
      {
        label: 'Costs',
        data: data.map((d) => d.secondaryValue ?? 0),
        backgroundColor: data[0]?.secondaryColor || '#00D4FF',
      },
    ];
  }
}