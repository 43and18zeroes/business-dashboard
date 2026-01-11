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

  // ✅ Segment Labels (statt "Projects")
  protected override buildLabels(_: ChartData[]): string[] {
    return ['Total projects', 'Completed projects'];
  }

  protected override buildDatasets(data: ChartData[]): ChartDataset<'doughnut'>[] {
    // value = overall, secondaryValue = completed
    const item = data[0];

    const overall = item?.value ?? 0;
    const completed = item?.secondaryValue ?? 0;

    const safeOverall = Math.max(0, overall);
    const safeCompleted = Math.min(Math.max(0, completed), safeOverall);

    // Damit "Completed" ein Anteil ist, muss der Rest aufgefüllt werden:
    const remaining = Math.max(0, safeOverall - safeCompleted);

    // ⚠️ Reihenfolge muss zu buildLabels passen!
    // buildLabels: ['Total projects', 'Completed projects']
    // Du wolltest "Completed" als Teil darstellen -> Completed muss 1 Segment sein
    // Ich mappe:
    //   Total projects (Rest-Anteil) = remaining
    //   Completed projects = completed
    return [
      {
        label: 'Projects',
        data: [remaining, safeCompleted],
        backgroundColor: [
          item?.secondaryColor ?? '#00D4FF', // Total projects (Rest)
          item?.color ?? '#007BFF',          // Completed projects
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
              const label = ctx.label ?? '';
              const value = Number(ctx.raw ?? 0).toLocaleString('en-US');

              const dataset = ctx.dataset.data as number[];
              const total = (dataset?.[0] ?? 0) + (dataset?.[1] ?? 0);
              const pct =
                total > 0
                  ? Math.round((Number(ctx.raw ?? 0) / total) * 100)
                  : 0;

              return `${label}: ${value} (${pct}%)`;
            },
          },
        },
      },
    };
  }
}