import { Component, inject } from '@angular/core';
import { DragableTableComponent } from "../../components/dragable-table-component/dragable-table-component";
import { MockDataService } from '../../services/mock-data-service';

@Component({
  selector: 'app-transactions-page',
  imports: [DragableTableComponent],
  templateUrl: './transactions-page.html',
  styleUrl: './transactions-page.scss',
})
export class TransactionsPage {
  protected chartService = inject(MockDataService);
}
