import { Component, inject } from '@angular/core';
import { BarChartComponent } from '../../components/charts/bar-chart-component/bar-chart-component';
import { MockDataService } from '../../services/mock-data-service';
import { LineChartComponent } from "../../components/charts/line-chart-component/line-chart-component";
import { RingChartComponent } from "../../components/charts/ring-chart-component/ring-chart-component";
import { DragableTableComponent } from "../../components/dragable-table-component/dragable-table-component";

@Component({
  selector: 'app-dashboard-page',
  imports: [BarChartComponent, LineChartComponent, RingChartComponent, DragableTableComponent],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.scss',
})
export class DashboardPage {
  protected chartService = inject(MockDataService);
}
