import {
  Component,
  effect,
  ElementRef,
  inject,
  input,
  ViewChild,
} from '@angular/core';
import { ChartConfiguration, ChartData } from '../../../models/chart.model';
import { Chart } from 'chart.js';
import { ThemeService } from '../../../services/theme-service';

@Component({
  selector: 'app-base-chart-component',
  imports: [],
  templateUrl: './base-chart-component.html',
  styleUrl: './base-chart-component.scss',
})
export abstract class BaseChartComponent {
  private themeService = inject(ThemeService);
  data = input.required<ChartData[]>();

  config = input<ChartConfiguration>(new ChartConfiguration());

  @ViewChild('chartCanvas', { static: true })
  canvas!: ElementRef<HTMLCanvasElement>;

  protected chartInstance: any;

  constructor() {
    effect(() => {
      const currentData = this.data();
      const currentConfig = this.config();
      const isDark = this.themeService.darkMode();
      this.updateGlobalChartDefaults(isDark);
      if (currentData && currentData.length > 0) {
        this.renderChart(currentData, currentConfig);
      }
    });
  }

  private updateGlobalChartDefaults(isDark: boolean): void {
    // 1. Textfarbe (on-surface-variant)
    // Light: #44474e, Dark: #e0e2ec
    const textColor = isDark ? '#e0e2ec' : '#44474e';

    // 2. Grid-Farbe (outline-variant)
    // Light: #c4c6d0, Dark: #44474e
    const axisColor = isDark ? '#8e9099' : '#74777f';

    // 3. Grid-Farbe (Mischung aus outline und Transparenz)
    // Wir nehmen outline, geben ihm aber 30% Deckkraft, damit es nicht vom Graphen ablenkt
    const gridColor = isDark ? '#8e90994D' : '#74777f4D';

    Chart.defaults.color = textColor;

    // Setzt die Standardfarbe für alle Linien (Borders)
    Chart.defaults.borderColor = gridColor;

    // Spezifische Konfiguration für das Grid und die Achsenstriche (Ticks)
    Chart.defaults.set('scales.common', {
      grid: {
        color: gridColor, // Die dünnen Hilfslinien
        borderColor: axisColor, // Die Linie direkt an der Achse
        tickColor: axisColor, // Die kleinen Striche bei den Zahlen
      },
      ticks: {
        color: textColor, // Die Zahlen selbst
      },
    });

    // Tooltip Styling (passend zu surface-container-high)
    const tooltipBg = isDark ? '#292a2c' : '#e9e7eb';
    Chart.defaults.set('plugins.tooltip', {
      backgroundColor: tooltipBg,
      titleColor: textColor,
      bodyColor: textColor,
      padding: 12,
      cornerRadius: 8, // M3 nutzt abgerundete Ecken
    });
  }

  protected abstract renderChart(
    data: ChartData[],
    config: ChartConfiguration
  ): void;

  ngOnDestroy(): void {
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }
  }
}
