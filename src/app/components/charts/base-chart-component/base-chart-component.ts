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
import { ChartsThemeService } from '../charts-theme-service';

@Component({
  selector: 'app-base-chart-component',
  templateUrl: './base-chart-component.html',
  styleUrl: './base-chart-component.scss',
})
export abstract class BaseChartComponent<TType extends ChartType = ChartType>
  implements AfterViewInit {
  private readonly themeService = inject(ThemeService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly chartsThemeService = inject(ChartsThemeService);

  private readonly containerReady = signal(false);
  private didFirstResizeAfterRender = false;
  private readonly viewReady = signal(false);

  private pendingRaf1: number | null = null;
  private pendingRaf2: number | null = null;

  private initialRenderDone = false;

  private resizeTimeout: number | null = null;

  private static legendPatched = false;

  private scheduleSoftResize(): void {
    if (this.resizeTimeout !== null) window.clearTimeout(this.resizeTimeout);
    this.resizeTimeout = window.setTimeout(() => {
      const inst = this.chartInstance;
      if (!inst || !inst.canvas || !inst.canvas.isConnected) return;
      inst.resize();
      inst.update();
    }, 80);
  }

  private cancelStableFrame(): void {
    if (this.pendingRaf1 !== null) cancelAnimationFrame(this.pendingRaf1);
    if (this.pendingRaf2 !== null) cancelAnimationFrame(this.pendingRaf2);
    this.pendingRaf1 = this.pendingRaf2 = null;
  }

  private nextStableFrame(cb: () => void): void {
    this.cancelStableFrame();

    this.pendingRaf1 = requestAnimationFrame(() => {
      this.pendingRaf2 = requestAnimationFrame(() => {
        this.pendingRaf1 = this.pendingRaf2 = null;
        cb();
      });
    });
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

  protected buildOptions(config: ChartConfiguration, isDark: boolean): ChartOptions<TType> {
    const base: ChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      resizeDelay: 1,
      animation: { duration: 700 },
      plugins: {
        legend: {
          display: config.showLegend,
        }
      },
    };

    return base as ChartOptions<TType>;
  }

  constructor() {
    effect(() => {
      const isDark = this.themeService.darkMode();
      const data = this.data();
      const config = this.config();
      const ready = this.viewReady();
      const hasSize = this.containerReady();

      this.updateGlobalChartDefaults(isDark);

      if (ready && hasSize && data?.length) {
        this.nextStableFrame(() => this.renderChart(data, config));
      }
    });

    this.destroyRef.onDestroy(() => {
      this.cancelStableFrame();
      this.destroyChart();
    });
  }


  ngAfterViewInit(): void {
    this.viewReady.set(true);

    const ro = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect;
      if (!rect) return;

      const ok = rect.width > 0 && rect.height > 0;
      if (this.containerReady() !== ok) this.containerReady.set(ok);

      if (!ok) return;
      if (!this.chartInstance) return;
      if (!this.initialRenderDone) return;

      this.scheduleSoftResize();
    });

    ro.observe(this.root.nativeElement);
    this.destroyRef.onDestroy(() => ro.disconnect());
  }

  private renderChart(data: ChartData[], config: ChartConfiguration): void {
    this.destroyChart();
    const isDark = this.themeService.darkMode();

    this.chartInstance = new Chart(this.canvas.nativeElement, {
      type: this.chartType,
      data: {
        labels: this.buildLabels(data),
        datasets: this.buildDatasets(data),
      },
      options: this.buildOptions(config, isDark),
    }) as Chart<TType>;

    this.initialRenderDone = true;
  }

  protected destroyChart(): void {
    this.cancelStableFrame();

    if (this.resizeTimeout !== null) {
      window.clearTimeout(this.resizeTimeout);
      this.resizeTimeout = null;
    }

    const inst = this.chartInstance;
    this.chartInstance = undefined;
    this.didFirstResizeAfterRender = false;
    this.initialRenderDone = false;

    inst?.stop();
    inst?.destroy();
  }

  private updateGlobalChartDefaults(isDark: boolean): void {
    const { textColor, axisColor, gridColor, tooltipBg } =
      this.chartsThemeService.getTheme(isDark);

    const { ttBorderWidth, ttPadding, ttCornerRadius } =
      this.chartsThemeService.getTooltipsSpec();

    Chart.defaults.color = textColor;
    Chart.defaults.borderColor = gridColor;

    Chart.defaults.set('scales.common', {
      grid: { color: gridColor, borderColor: axisColor, tickColor: axisColor },
      ticks: { color: textColor },
    });

    Chart.defaults.plugins.tooltip.titleFont = {
      family: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
      size: 13,
      weight: 600,
    };

    Chart.defaults.plugins.tooltip.bodyFont = {
      family: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
      size: 12,
      weight: 500,
    };

    Chart.defaults.set('plugins.tooltip', {
      backgroundColor: tooltipBg,
      titleColor: textColor,
      bodyColor: textColor,
      borderColor: axisColor,
      borderWidth: ttBorderWidth,
      padding: ttPadding,
      cornerRadius: ttCornerRadius,
    });

    if (!BaseChartComponent.legendPatched) {
      BaseChartComponent.legendPatched = true;

      const defaultGenerate = Chart.defaults.plugins.legend.labels.generateLabels;
      Chart.defaults.plugins.legend.labels.generateLabels = (chart) => {
        const items = defaultGenerate(chart);
        for (const item of items) {
          item.lineWidth = 0;
          item.strokeStyle = 'transparent';
        }
        return items;
      };
    }
  }
}
