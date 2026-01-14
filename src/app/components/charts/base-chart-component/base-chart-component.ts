import {
  AfterViewInit,
  Component,
  DestroyRef,
  ElementRef,
  effect,
  inject,
  input,
  signal,
  ViewChild,
} from '@angular/core';
import { Chart, ChartDataset, ChartOptions, ChartType } from 'chart.js';
import { ChartConfiguration, ChartData } from '../../../models/chart.model';
import { ThemeService } from '../../../services/theme-service';

@Component({
  selector: 'app-base-chart-component',
  templateUrl: './base-chart-component.html',
  styleUrl: './base-chart-component.scss',
})
export abstract class BaseChartComponent<TType extends ChartType = ChartType>
  implements AfterViewInit {
  private readonly themeService = inject(ThemeService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly viewReady = signal(false);

  data = input.required<ChartData[]>();
  config = input<ChartConfiguration>(new ChartConfiguration());

  refreshTick = input<number>(0);

  @ViewChild('chartCanvas', { static: false })
  canvas!: ElementRef<HTMLCanvasElement>;

  protected chartInstance?: Chart<TType>;
  protected abstract readonly chartType: TType;
  protected abstract buildDatasets(data: ChartData[]): ChartDataset<TType>[];

  protected buildLabels(data: ChartData[]): string[] {
    return data.map((d) => d.label);
  }

  protected buildOptions(config: ChartConfiguration): ChartOptions<TType> {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: config.showLegend } },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { callback: (value) => Number(value).toLocaleString('en-US') },
        },
      },
    } as ChartOptions<TType>;
  }

  constructor() {
    effect(() => {
      const isDark = this.themeService.darkMode();
      this.updateGlobalChartDefaults(isDark);

      this.chartInstance?.update();
      this.chartInstance?.resize();
    });

    effect((onCleanup) => {
      const ready = this.viewReady();
      const data = this.data();
      const config = this.config();
      const _tick = this.refreshTick();

      if (!ready) return;
      if (!data?.length) return;

      const rafId = requestAnimationFrame(() => {
        this.renderChart(data, config);
      });

      onCleanup(() => {
        cancelAnimationFrame(rafId);
        this.destroyChart();
      });
    });

    this.destroyRef.onDestroy(() => this.destroyChart());
  }

  ngAfterViewInit(): void {
    this.viewReady.set(true);
  }

  private renderChart(data: ChartData[], config: ChartConfiguration): void {
    this.destroyChart();

    this.chartInstance = new Chart(this.canvas.nativeElement, {
      type: this.chartType,
      data: {
        labels: this.buildLabels(data),
        datasets: this.buildDatasets(data),
      },
      options: this.buildOptions(config),
    }) as Chart<TType>;
  }

  protected destroyChart(): void {
    this.chartInstance?.destroy();
    this.chartInstance = undefined;
  }

  private updateGlobalChartDefaults(isDark: boolean): void {
    const textColor = isDark ? '#e0e2ec' : '#44474e';
    const axisColor = isDark ? '#8e9099' : '#74777f';
    const gridColor = isDark ? '#8e90994D' : '#74777f4D';

    Chart.defaults.color = textColor;
    Chart.defaults.borderColor = gridColor;

    Chart.defaults.set('scales.common', {
      grid: { color: gridColor, borderColor: axisColor, tickColor: axisColor },
      ticks: { color: textColor },
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
}
