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

  private readonly containerReady = signal(false);
  private didFirstResizeAfterRender = false;
  private readonly viewReady = signal(false);

  private nextStableFrame(cb: () => void): void {
    requestAnimationFrame(() => requestAnimationFrame(cb));
  }

  @ViewChild('chartCanvas', { static: false })
  canvas!: ElementRef<HTMLCanvasElement>;

  @ViewChild('chartRoot', { static: false })
  root!: ElementRef<HTMLElement>;

  data = input.required<ChartData[]>();
  config = input<ChartConfiguration>(new ChartConfiguration());

  protected chartInstance?: Chart<TType>;
  protected abstract readonly chartType: TType;
  protected abstract buildDatasets(data: ChartData[]): ChartDataset<TType>[];
  protected readonly numberFormatter = new Intl.NumberFormat('en-US');

  protected buildLabels(data: ChartData[]): string[] {
    return data.map((d) => d.label);
  }

  protected buildOptions(config: ChartConfiguration): ChartOptions<TType> {
    const base: ChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      resizeDelay: 120,
      animation: { duration: 700 },
      plugins: { legend: { display: config.showLegend } },
    };

    return base as ChartOptions<TType>;
  }

  constructor() {
    effect(() => {
      const isDark = this.themeService.darkMode();
      this.updateGlobalChartDefaults(isDark);
      this.chartInstance?.update();
    });

    effect(() => {
      const ready = this.viewReady();
      const hasSize = this.containerReady();
      const data = this.data();
      const config = this.config();

      if (!ready || !hasSize) return;
      if (!data?.length) return;

      this.nextStableFrame(() => this.renderChart(data, config));
    });

    this.destroyRef.onDestroy(() => this.destroyChart());
  }


  ngAfterViewInit(): void {
    this.viewReady.set(true);

    const ro = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect;
      if (!rect) return;

      const ok = rect.width > 0 && rect.height > 0;
      if (this.containerReady() !== ok) this.containerReady.set(ok);

      if (ok && this.chartInstance && !this.didFirstResizeAfterRender) {
        this.didFirstResizeAfterRender = true;

        this.nextStableFrame(() => {
          this.renderChart(this.data(), this.config());
        });
      }
    });

    ro.observe(this.root.nativeElement);
    this.destroyRef.onDestroy(() => ro.disconnect());
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
    this.didFirstResizeAfterRender = false;
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
