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
import {
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  DoughnutController,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
  type ChartDataset,
  type ChartOptions,
  type ChartType,
} from 'chart.js';
import { ChartConfiguration, type ChartData } from '../../../models/chart.model';
import { ThemeService } from '../../../services/theme-service';
import { ChartsThemeService } from '../charts-theme-service';

Chart.register(
  CategoryScale,
  LinearScale,
  BarController,
  BarElement,
  LineController,
  LineElement,
  PointElement,
  DoughnutController,
  ArcElement,
  Tooltip,
  Legend
);

const RESIZE_DEBOUNCE_MS = 80;

@Component({
  selector: 'app-base-chart-component',
  templateUrl: './base-chart-component.html',
})
export abstract class BaseChartComponent<TType extends ChartType = ChartType>
  implements AfterViewInit
{
  private readonly themeService = inject(ThemeService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly chartsThemeService = inject(ChartsThemeService);

  private readonly isViewReady = signal(false);
  private readonly isContainerSized = signal(false);

  private rafFirst: number | null = null;
  private rafSecond: number | null = null;
  private resizeTimeout: number | null = null;
  private isInitialRenderDone = false;

  private static isLegendPatched = false;

  @ViewChild('chartCanvas', { static: false }) canvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('chartRoot', { static: false }) root!: ElementRef<HTMLElement>;

  data = input.required<ChartData[]>();
  config = input<ChartConfiguration>(new ChartConfiguration());

  protected chartInstance?: Chart<TType>;
  protected abstract readonly chartType: TType;
  protected abstract buildDatasets(data: ChartData[]): ChartDataset<TType>[];
  protected readonly numberFormatter = new Intl.NumberFormat('en-US');

  constructor() {
    effect(() => {
      const isDark = this.themeService.darkMode();
      const data = this.data();
      const config = this.config();
      const isReady = this.isViewReady() && this.isContainerSized();

      this.applyGlobalThemeDefaults(isDark);

      if (isReady && data?.length) {
        this.scheduleRender(() => this.renderChart(data, config));
      }
    });

    this.destroyRef.onDestroy(() => {
      this.cancelPendingFrames();
      this.destroyChart();
    });
  }

  ngAfterViewInit(): void {
    this.isViewReady.set(true);

    const observer = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect;
      if (!rect) return;

      const hasSize = rect.width > 0 && rect.height > 0;

      if (this.isContainerSized() !== hasSize) {
        this.isContainerSized.set(hasSize);
      }

      if (hasSize && this.chartInstance && this.isInitialRenderDone) {
        this.scheduleSoftResize();
      }
    });

    observer.observe(this.root.nativeElement);
    this.destroyRef.onDestroy(() => observer.disconnect());
  }

  protected buildLabels(data: ChartData[]): string[] {
    return data.map((d) => d.label);
  }

  protected buildOptions(config: ChartConfiguration, isDark: boolean): ChartOptions<TType> {
    const options: ChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      resizeDelay: 1,
      animation: { duration: 700 },
      plugins: {
        legend: {
          display: config.showLegend,
        },
      },
    };

    return options as ChartOptions<TType>;
  }

  protected destroyChart(): void {
    this.cancelPendingFrames();
    this.clearResizeTimeout();

    const instance = this.chartInstance;
    this.chartInstance = undefined;
    this.isInitialRenderDone = false;

    instance?.stop();
    instance?.destroy();
  }

  private renderChart(data: ChartData[], config: ChartConfiguration): void {
    this.destroyChart();

    const isDark = this.themeService.darkMode();

    this.chartInstance = new Chart<TType>(this.canvas.nativeElement, {
      type: this.chartType,
      data: {
        labels: this.buildLabels(data),
        datasets: this.buildDatasets(data),
      },
      options: this.buildOptions(config, isDark),
    });

    this.isInitialRenderDone = true;
  }

  private scheduleRender(cb: () => void): void {
    this.cancelPendingFrames();

    this.rafFirst = requestAnimationFrame(() => {
      this.rafSecond = requestAnimationFrame(() => {
        this.clearRafHandles();
        cb();
      });
    });
  }

  private scheduleSoftResize(): void {
    this.clearResizeTimeout();

    this.resizeTimeout = window.setTimeout(() => {
      const instance = this.chartInstance;
      if (!instance?.canvas?.isConnected) return;
      instance.resize();
      instance.update();
    }, RESIZE_DEBOUNCE_MS);
  }

  private cancelPendingFrames(): void {
    if (this.rafFirst !== null) cancelAnimationFrame(this.rafFirst);
    if (this.rafSecond !== null) cancelAnimationFrame(this.rafSecond);
    this.clearRafHandles();
  }

  private clearRafHandles(): void {
    this.rafFirst = null;
    this.rafSecond = null;
  }

  private clearResizeTimeout(): void {
    if (this.resizeTimeout === null) return;
    window.clearTimeout(this.resizeTimeout);
    this.resizeTimeout = null;
  }

  private applyGlobalThemeDefaults(isDark: boolean): void {
    this.applyColorDefaults(isDark);
    this.applyTooltipDefaults(isDark);
    this.patchLegendLabelsOnce();
  }

  private applyColorDefaults(isDark: boolean): void {
    const { textColor, axisColor, gridColor } = this.chartsThemeService.getTheme(isDark);

    Chart.defaults.color = textColor;
    Chart.defaults.borderColor = gridColor;

    Chart.defaults.set('scales.common', {
      grid: { color: gridColor, borderColor: axisColor, tickColor: axisColor },
      ticks: { color: textColor },
    });
  }

  private applyTooltipDefaults(isDark: boolean): void {
    const { textColor, axisColor, tooltipBg } = this.chartsThemeService.getTheme(isDark);
    const tooltipSpec = this.chartsThemeService.getTooltipsSpec();

    Chart.defaults.plugins.tooltip.titleFont = {
      family: tooltipSpec.ttTitleFont,
      size: tooltipSpec.ttTitleSize,
      weight: tooltipSpec.ttTitleWeight,
    };

    Chart.defaults.plugins.tooltip.bodyFont = {
      family: tooltipSpec.ttBodyFont,
      size: tooltipSpec.ttBodySize,
      weight: tooltipSpec.ttBodyWeight,
    };

    Chart.defaults.set('plugins.tooltip', {
      backgroundColor: tooltipBg,
      titleColor: textColor,
      bodyColor: textColor,
      borderColor: axisColor,
      borderWidth: tooltipSpec.ttBorderWidth,
      padding: tooltipSpec.ttPadding,
      cornerRadius: tooltipSpec.ttCornerRadius,
    });
  }

  private patchLegendLabelsOnce(): void {
    if (BaseChartComponent.isLegendPatched) return;

    const defaultGenerate = Chart.defaults.plugins.legend.labels.generateLabels;

    Chart.defaults.plugins.legend.labels.generateLabels = (chart) => {
      const items = defaultGenerate(chart);
      for (const item of items) {
        item.lineWidth = 0;
        item.strokeStyle = 'transparent';
      }
      return items;
    };

    BaseChartComponent.isLegendPatched = true;
  }
}