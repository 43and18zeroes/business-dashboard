import { Component } from '@angular/core';
import { BaseChartComponent } from '../base-chart-component/base-chart-component';
import { ChartConfiguration, ChartData } from '../../../models/chart.model';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-line-chart-component',
  imports: [],
  templateUrl: './line-chart-component.html',
  styleUrl: './line-chart-component.scss',
})
export class LineChartComponent extends BaseChartComponent {
  protected renderChart(data: ChartData[], config: ChartConfiguration): void {
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    this.chartInstance = new Chart(this.canvas.nativeElement, {
      type: 'line',
      data: {
        labels: data.map((d) => d.label),
        datasets: [
          {
            label: 'Sales',
            data: data.map((d) => d.value),
            backgroundColor: data[0]?.color || '#007BFF',
          },
          {
            label: 'Costs',
            data: data.map((d) => d.secondaryValue || 0),
            backgroundColor: data[0]?.secondaryColor || '#00D4FF',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true },
        },
        plugins: {
          legend: { display: config.showLegend },
        },
      },
    });
  }
}
