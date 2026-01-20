import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, Input, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTable, MatTableModule } from '@angular/material/table';

type RowData = Record<string, unknown>;

@Component({
  selector: 'app-dragable-table-component',
  imports: [CdkDropList, CdkDrag, MatTableModule, MatIconModule],
  templateUrl: './dragable-table-component.html',
  styleUrl: './dragable-table-component.scss',
})
export class DragableTableComponent {
  @ViewChild('table', { static: true }) table!: MatTable<RowData>;

  displayedColumns: string[] = [];
  dataSource: RowData[] = [];

  @Input() cellFormatter?: (key: string, value: unknown, row: RowData) => string;

  @Input()
  set data(value: readonly RowData[] | null | undefined) {
    const rows = value ?? [];
    this.dataSource = [...rows];
    this.displayedColumns = this.computeColumns(this.dataSource);
    this.table?.renderRows();
  }

  drop(event: CdkDragDrop<RowData[]>) {
    const draggedRow = event.item.data as RowData;
    const previousIndex = this.dataSource.findIndex((d) => d === draggedRow);

    moveItemInArray(this.dataSource, previousIndex, event.currentIndex);
    this.table.renderRows();
  }

  private computeColumns(rows: RowData[]): string[] {
    const seen = new Set<string>();
    const cols: string[] = [];

    for (const row of rows) {
      for (const key of Object.keys(row)) {
        if (!seen.has(key)) {
          seen.add(key);
          cols.push(key);
        }
      }
    }

    return cols;
  }

  formatHeader(key: string): string {
    return key
      .replace(/_/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  formatCell(key: string, value: unknown, row: RowData): string {
    if (this.cellFormatter) {
      return this.cellFormatter(key, value, row);
    }

    if (value === null || value === undefined) return '';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  }
}