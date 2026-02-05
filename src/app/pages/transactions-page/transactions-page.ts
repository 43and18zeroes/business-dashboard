import { Component, inject } from '@angular/core';
import { DragableTableComponent, ReorderEvent } from "../../components/dragable-table-component/dragable-table-component";
import { MockDataService } from '../../services/mock-data-service';
import { TRANSACTIONS } from '../../services/mock-data.constant';

type Transaction = (typeof TRANSACTIONS)[number];

@Component({
  selector: 'app-transactions-page',
  imports: [DragableTableComponent],
  templateUrl: './transactions-page.html',
  styleUrl: './transactions-page.scss',
})
export class TransactionsPage {

  protected chartService = inject(MockDataService);

  transactionColumns = ['txId', 'user', 'date', 'cost'] as const;

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
