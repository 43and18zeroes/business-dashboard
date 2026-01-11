import { Component } from '@angular/core';
import { ChartConfiguration, ChartData } from '../../../models/chart.model';
import { ChartDataset, ChartOptions } from 'chart.js';
import { BaseChartComponent } from '../base-chart-component/base-chart-component';

@Component({
  selector: 'app-ring-chart-component',
  imports: [],
  templateUrl: './ring-chart-component.html',
  styleUrl: './ring-chart-component.scss',
})
export class RingChartComponent extends BaseChartComponent<'doughnut'> {
  protected override readonly chartType = 'doughnut' as const;

  protected override buildDatasets(data: ChartData[]): ChartDataset<'doughnut'>[] {
    const item = data[0];
    const overall = item?.value ?? 0;
    const completed = item?.secondaryValue ?? 0;

    const safeOverall = Math.max(0, overall);
    const safeCompleted = Math.min(Math.max(0, completed), safeOverall);
    const remaining = Math.max(0, safeOverall - safeCompleted);

    return [
      {
        label: 'Projects',
        data: [safeCompleted, remaining],
        backgroundColor: [
          item?.color ?? '#007BFF',
          item?.secondaryColor ?? '#00D4FF',
        ],
        borderWidth: 0,
      },
    ];
  }

  protected override buildOptions(
    config: ChartConfiguration
  ): ChartOptions<'doughnut'> {
    return {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '70%',
      plugins: {
        legend: { display: config.showLegend },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const label = ctx.dataIndex === 0 ? 'Completed' : 'Remaining';
              const value = Number(ctx.raw ?? 0).toLocaleString('en-US');

              const dataset = ctx.dataset.data as number[];
              const total = (dataset?.[0] ?? 0) + (dataset?.[1] ?? 0);
              const pct = total > 0 ? Math.round((Number(ctx.raw ?? 0) / total) * 100) : 0;

              return `${label}: ${value} (${pct}%)`;
            },
          },
        },
      },
    };
  }
}