import { Component } from '@angular/core';
import { BaseChartComponent } from '../base-chart-component/base-chart-component';
import { ChartConfiguration, ChartData } from '../../../models/chart.model';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-bar-chart-component',
  imports: [],
  templateUrl: './bar-chart-component.html',
  styleUrl: './bar-chart-component.scss',
})
export class BarChartComponent extends BaseChartComponent {
  protected renderChart(data: ChartData[], config: ChartConfiguration): void {
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    this.chartInstance = new Chart(this.canvas.nativeElement, {
      type: 'bar',
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
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => {
                return Number(value).toLocaleString('en-US');
              },
            },
          },
        },
        plugins: {
          legend: { display: config.showLegend },
        },
      },

    });
  }
}
