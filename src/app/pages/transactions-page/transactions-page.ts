import { Component, inject } from '@angular/core';
import { DragableTableComponent } from "../../components/dragable-table-component/dragable-table-component";
import { MockDataService } from '../../services/mock-data-service';
import { transactionCellFormatter } from '../../shared/table-formatters';

@Component({
  selector: 'app-transactions-page',
  imports: [DragableTableComponent],
  templateUrl: './transactions-page.html',
  styleUrl: './transactions-page.scss',
})
export class TransactionsPage {
  protected chartService = inject(MockDataService);

  transactionCellFormatter = transactionCellFormatter;

  transactionColumns: string[] = [];

  private mediaQuery = window.matchMedia('(min-width: 600px)');
  private mediaListener = (e: MediaQueryListEvent) =>
    this.updateColumns(e.matches);

  constructor() {
    this.updateColumns(this.mediaQuery.matches);
    this.mediaQuery.addEventListener('change', this.mediaListener);
  }

  ngOnDestroy() {
    this.mediaQuery.removeEventListener('change', this.mediaListener);
  }

  private updateColumns(isWide: boolean) {
    this.transactionColumns = isWide
      ? ['txId', 'user', 'cost', 'date']
      : ['txId', 'user'];
  }
}
