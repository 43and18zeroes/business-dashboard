import { Component } from '@angular/core';
import { ChartConfiguration, ChartData } from '../../../models/chart.model';
import { ChartDataset, ChartOptions } from 'chart.js';
import { BaseChartComponent } from '../base-chart-component/base-chart-component';

type ProjectProgress = {
  completed: number;
  inProgress: number;
};

@Component({
  selector: 'app-ring-chart-component',
  imports: [],
  templateUrl: '../base-chart-component/base-chart-component.html',
  styleUrl: './ring-chart-component.scss',
})
export class RingChartComponent extends BaseChartComponent<'doughnut'> {
  protected override readonly chartType = 'doughnut' as const;

  private getProgress(data: ChartData[]): ProjectProgress {
    const item = data[0];
    const overall = Math.max(0, item?.value ?? 0);
    const completedRaw = Math.max(0, item?.secondaryValue ?? 0);
    const completed = Math.min(completedRaw, overall);
    const inProgress = Math.max(0, overall - completed);

    return { completed, inProgress };
  }

  protected override buildLabels(data: ChartData[]): string[] {
    const { completed, inProgress } = this.getProgress(data);

    return [
      `Projects Completed – ${this.numberFormatter.format(completed)}`,
      `Projects in Progress – ${this.numberFormatter.format(inProgress)}`,
    ];
  }

  protected override buildDatasets(data: ChartData[]): ChartDataset<'doughnut'>[] {
    const item = data[0];
    const { completed, inProgress } = this.getProgress(data);

    return [
      {
        label: 'Projects',
        data: [completed, inProgress],
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
      resizeDelay: 120,

      animation: {
        duration: 700,
        animateRotate: true,
        animateScale: true,
      },

      cutout: '70%',
      plugins: {
        legend: { display: config.showLegend },
        tooltip: {
          callbacks: {
            label: (ctx) => ctx.label ?? '',
          },
        },
      },
    };
  }
};