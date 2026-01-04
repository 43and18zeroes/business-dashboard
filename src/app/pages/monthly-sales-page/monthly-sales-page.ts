import { Component, inject } from '@angular/core';
import { BarChart } from '../../components/charts/bar-chart/bar-chart';
import { ChartDataService } from '../../services/chart-data-service';
import { ChartConfiguration } from '../../models/chart.model';

@Component({
  selector: 'app-monthly-sales-page',
  imports: [BarChart],
  templateUrl: './monthly-sales-page.html',
  styleUrl: './monthly-sales-page.scss',
})
export class MonthlySalesPage {
  protected chartService = inject(ChartDataService);

  myChartConfig = new ChartConfiguration({
    title: 'Monthly Sales',
    showLegend: true,
  });
}
