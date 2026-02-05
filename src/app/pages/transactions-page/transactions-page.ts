import { Component, inject } from '@angular/core';
import { DragableTableComponent, ReorderEvent } from "../../components/dragable-table-component/dragable-table-component";
import { MockDataService } from '../../services/mock-data-service';
import { TRANSACTIONS } from '../../services/mock-data.constant';
import { TRANSACTION_TABLE_UTILS } from '../../shared/table-utils';

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

  cellFormatter = TRANSACTION_TABLE_UTILS.cellFormatter;

  onTransactionsReorder(ev: ReorderEvent<Transaction>) {
    TRANSACTION_TABLE_UTILS.persistOrder(ev);
  }

}
