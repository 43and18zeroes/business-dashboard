import { Component } from '@angular/core';
import { BaseChartComponent } from '../../base-chart-component/base-chart-component';
import { ChartConfiguration, ChartData } from '../../../models/chart.model';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-bar-chart',
  imports: [],
  templateUrl: './bar-chart.html',
  styleUrl: './bar-chart.scss',
})
export class BarChart extends BaseChartComponent {
  
  protected renderChart(data: ChartData[], config: ChartConfiguration): void {
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    this.chartInstance = new Chart(this.canvas.nativeElement, {
      type: 'bar', 
      data: {
        labels: data.map(d => d.label),
        datasets: [{
          label: config.title,
          data: data.map(d => d.value),
          backgroundColor: data.map(d => d.color || '#42A5F5')
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: config.showLegend }
        }
      }
    });
  }
}
