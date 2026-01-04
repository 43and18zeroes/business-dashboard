import { Component, inject } from '@angular/core';
import { BarChartComponent } from '../../components/charts/bar-chart-component/bar-chart-component';
import { ChartConfiguration } from '../../models/chart.model';
import { ChartDataService } from '../../components/charts/chart-data-service';

@Component({
  selector: 'app-dashboard',
  imports: [BarChartComponent],
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
