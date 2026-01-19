import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTable, MatTableModule } from '@angular/material/table';
import { TRANSACTIONS } from '../../services/mock-data.constant';

export interface Transaction {
  txId: string;
  user: string;
  date: string;
  cost: string;
}

@Component({
  selector: 'app-dragable-table-component',
  imports: [CdkDropList, CdkDrag, MatTableModule, MatIconModule],
  templateUrl: './dragable-table-component.html',
  styleUrl: './dragable-table-component.scss',
})
export class DragableTableComponent {
  @ViewChild('table', { static: true }) table!: MatTable<Transaction>;

  displayedColumns: string[] = ['txId', 'user', 'date', 'cost'];
  dataSource: Transaction[] = [...TRANSACTIONS];

  drop(event: CdkDragDrop<Transaction[]>) {
    const draggedRow = event.item.data as Transaction;
    const previousIndex = this.dataSource.findIndex(d => d === draggedRow);

    moveItemInArray(this.dataSource, previousIndex, event.currentIndex);
    this.table.renderRows();
  }
}
