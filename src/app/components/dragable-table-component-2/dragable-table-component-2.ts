import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTable, MatTableModule } from '@angular/material/table';

export type ReorderEvent<T> = {
  previousIndex: number;
  currentIndex: number;
  items: readonly T[];
  orderedIds?: readonly unknown[];
};

@Component({
  selector: 'app-dragable-table-component-2',
  imports: [CdkDropList, CdkDrag, MatTableModule, MatIconModule, CdkScrollable],
  templateUrl: './dragable-table-component-2.html',
  styleUrl: './dragable-table-component-2.scss',
})
export class DragableTableComponent2<T extends Record<string, any> = any> {
  @ViewChild('table', { static: true }) table!: MatTable<T>;

  @Input({ required: true }) data: readonly T[] = [];
  @Input() displayedColumns: readonly (keyof T & string)[] = [];
  @Input() idKey?: keyof T & string;

  @Output() reorder = new EventEmitter<ReorderEvent<T>>();

  dataSource: T[] = [];

  ngOnChanges() {
    this.dataSource = [...this.data];
    this.table?.renderRows();
  }

  drop(event: CdkDragDrop<T[]>) {
    moveItemInArray(this.dataSource, event.previousIndex, event.currentIndex);
    this.table.renderRows();

    this.reorder.emit({
      previousIndex: event.previousIndex,
      currentIndex: event.currentIndex,
      items: [...this.dataSource],
      orderedIds: this.idKey ? this.dataSource.map(x => x[this.idKey!]) : undefined,
    });
  }

  formatHeader(col: string): string {
    return col
      .replace(/_/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/\b\w/g, c => c.toUpperCase());
  }
}
