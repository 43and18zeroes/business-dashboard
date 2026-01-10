import { Component, inject } from '@angular/core';
import { LineChartComponent } from "../../components/charts/line-chart-component/line-chart-component";
import { ChartConfiguration } from '../../models/chart.model';
import { ChartDataService } from '../../components/charts/chart-data-service';

@Component({
  selector: 'app-new-customers-page',
  imports: [LineChartComponent],
  templateUrl: './new-customers-page.html',
  styleUrl: './new-customers-page.scss',
})
export class NewCustomersPage {
  protected chartService = inject(ChartDataService);

  myChartConfig = new ChartConfiguration({
    title: 'Monthly Sales',
    showLegend: true,
  });
}
