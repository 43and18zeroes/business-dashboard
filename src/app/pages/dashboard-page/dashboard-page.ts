import { Component, inject } from '@angular/core';
import { BarChartComponent } from '../../components/charts/bar-chart-component/bar-chart-component';
import { MockDataService } from '../../services/mock-data-service';
import { LineChartComponent } from "../../components/charts/line-chart-component/line-chart-component";
import { RingChartComponent } from "../../components/charts/ring-chart-component/ring-chart-component";
import { DragableTableComponent2, ReorderEvent } from "../../components/dragable-table-component/dragable-table-component";
import { TRANSACTIONS } from '../../services/mock-data.constant';

type Transaction = (typeof TRANSACTIONS)[number];

@Component({
  selector: 'app-dashboard-page',
  imports: [BarChartComponent, LineChartComponent, RingChartComponent, DragableTableComponent2],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.scss',
})
export class DashboardPage {
  protected chartService = inject(MockDataService);

  transactionColumns = ['txId', 'cost'] as const;

  onTransactionsReorder(ev: ReorderEvent<Transaction>) {
    console.log('[REORDER] Persist this order in backend:', {
      entity: 'transactions',
      idKey: 'txId',
      moved: { from: ev.previousIndex, to: ev.currentIndex },
      orderedIds: ev.orderedIds,
    });
  }

  cellFormatter = (col: string, value: unknown) => {
    if (col === 'cost' && typeof value === 'number') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(value);
    }
    return String(value ?? '');
  };
}
