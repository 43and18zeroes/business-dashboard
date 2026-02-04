import { Component, computed, inject } from '@angular/core';
import { BarChartComponent } from '../../components/charts/bar-chart-component/bar-chart-component';
import { MockDataService } from '../../services/mock-data-service';
import { transactionCellFormatter } from '../../shared/table-formatters';
import { LineChartComponent } from "../../components/charts/line-chart-component/line-chart-component";
import { RingChartComponent } from "../../components/charts/ring-chart-component/ring-chart-component";
import { DragableTableComponent2 } from "../../components/dragable-table-component-2/dragable-table-component-2";

@Component({
  selector: 'app-dashboard-page',
  imports: [BarChartComponent, LineChartComponent, RingChartComponent, DragableTableComponent2],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.scss',
})
export class DashboardPage {
  protected chartService = inject(MockDataService);

  transactionCellFormatter = transactionCellFormatter;
  transactionColumns = ['txId', 'cost'] as const;

  readonly transactions = computed(() => this.chartService.transactions());
}
