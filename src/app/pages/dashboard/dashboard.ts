import { Component, inject } from '@angular/core';
import { BarChart } from '../../components/charts/bar-chart/bar-chart';
import { ChartConfiguration } from '../../models/chart.model';
import { ChartDataService } from '../../services/chart-data-service';

@Component({
  selector: 'app-dashboard',
  imports: [BarChart],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  protected chartService = inject(ChartDataService);

  myChartConfig = new ChartConfiguration({
    title: 'Monthly Sales',
    showLegend: true,
  });
}
