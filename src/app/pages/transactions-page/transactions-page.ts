import { Component, inject } from '@angular/core';
import { DragableTableComponent, ReorderEvent } from "../../components/dragable-table-component/dragable-table-component";
import { MockDataService } from '../../services/mock-data-service';
import { TRANSACTIONS } from '../../services/mock-data.constant';
import { TRANSACTION_TABLE_UTILS } from '../../shared/table-utils';
import { Subject, takeUntil } from 'rxjs';
import { BreakpointObserver } from '@angular/cdk/layout';

type Transaction = (typeof TRANSACTIONS)[number];
type TransactionColumn = 'txId' | 'user' | 'date' | 'cost';

@Component({
  selector: 'app-transactions-page',
  imports: [DragableTableComponent],
  templateUrl: './transactions-page.html',
  styleUrl: './transactions-page.scss',
})
export class TransactionsPage {

  protected chartService = inject(MockDataService);

  private breakpointObserver = inject(BreakpointObserver);
  private destroy$ = new Subject<void>();

  private readonly desktopColumns: readonly TransactionColumn[] = ['txId', 'user', 'date', 'cost'];
  private readonly mobileColumns: readonly TransactionColumn[] = ['txId', 'cost'];

  transactionColumns: readonly TransactionColumn[] = this.desktopColumns;

  cellFormatter = TRANSACTION_TABLE_UTILS.cellFormatter;

  constructor() {
    this.breakpointObserver
      .observe(['(max-width: 991.98px)'])
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        this.transactionColumns = res.matches ? this.mobileColumns : this.desktopColumns;
      });
  }

  onTransactionsReorder(ev: ReorderEvent<Transaction>) {
    TRANSACTION_TABLE_UTILS.persistOrder(ev);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}