import { Component, inject } from '@angular/core';
import { BarChart } from '../../components/charts/bar-chart/bar-chart';
import { ChartConfiguration } from '../../models/chart.model';
import { ChartDataService } from '../../services/chart-data-service';

@Component({
  selector: 'app-start',
  imports: [BarChart],
  templateUrl: './start.html',
  styleUrl: './start.scss',
})
export class Start {
  protected chartService = inject(ChartDataService);

  // Konfiguration über deine Klasse erstellen
  myChartConfig = new ChartConfiguration({
    title: 'Monthly Sales',
    showLegend: true,
  });
}
