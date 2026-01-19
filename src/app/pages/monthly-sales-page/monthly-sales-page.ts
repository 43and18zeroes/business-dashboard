import { Component, inject } from '@angular/core';
import { BarChartComponent } from '../../components/charts/bar-chart-component/bar-chart-component';
import { ChartDataService } from '../../services/mock-data-service';
import { ChartConfiguration } from '../../models/chart.model';

@Component({
  selector: 'app-monthly-sales-page',
  imports: [BarChartComponent],
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
