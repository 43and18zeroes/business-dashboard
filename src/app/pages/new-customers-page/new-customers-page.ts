import { Component, inject } from '@angular/core';
import { LineChartComponent } from "../../components/charts/line-chart-component/line-chart-component";
import { ChartConfiguration } from '../../models/chart.model';
import { MockDataService } from '../../services/mock-data-service';

@Component({
  selector: 'app-new-customers-page',
  imports: [LineChartComponent],
  templateUrl: './new-customers-page.html',
  styleUrl: './new-customers-page.scss',
})
export class NewCustomersPage {
  protected chartService = inject(MockDataService);

  myChartConfig = new ChartConfiguration({
    title: 'Monthly Sales',
    showLegend: true,
  });
}
